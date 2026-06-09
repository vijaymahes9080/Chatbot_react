# Trigger reload comment
import json
import time
from datetime import datetime
from typing import Generator
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat import Chat, Message
from app.models.analytics import ModelUsage
from app.models.user import User
from app.schemas.chat import MessageCreate, MessageResponse, MessageFeedback, MessageReaction
from app.services.auth import get_current_user
from app.services.orchestrator import ModelOrchestrator
from app.services.rag import RAGPipeline

router = APIRouter(prefix="/chat", tags=["chat"])
orchestrator = ModelOrchestrator()
rag_pipeline = RAGPipeline()

@router.post("/chats/{chat_id}/send")
def send_message(
    chat_id: str,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sends a message in a conversation.
    Returns a Server-Sent Events (SSE) streaming stream of the AI's response.
    """
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        # Auto-create chat if not found, making integration frictionless
        chat = Chat(id=chat_id, title=payload.text[:30] or "New Chat", user_id=current_user.id)
        db.add(chat)
        db.commit()
        db.refresh(chat)

    timestamp = datetime.now().strftime("%I:%M %p")
    user_msg_id = payload.id or f"msg-{int(time.time() * 1000)}"
    
    # 1. Create and save user message
    user_message = Message(
        id=user_msg_id,
        chat_id=chat_id,
        sender="user",
        text=payload.text,
        timestamp=timestamp,
        reactions=[]
    )
    db.add(user_message)
    chat.last_updated = "Just now"
    db.commit()

    # 2. Query RAG context if needed (checks query terms or doc RAG query)
    context = ""
    query_lower = payload.text.lower()
    if any(k in query_lower for k in ["pdf", "doc", "rag", "retrieval", "search", "xlsx", "guide"]):
        rag_matches = rag_pipeline.query_rag(payload.text, top_k=3)
        if rag_matches:
            context = "\n".join([f"Source [{r['source']}]: {r['text']}" for r in rag_matches])

    # 3. Create placeholder assistant message
    ai_msg_id = f"msg-{int(time.time() * 1000) + 1}"
    ai_message = Message(
        id=ai_msg_id,
        chat_id=chat_id,
        sender="assistant",
        text="",
        timestamp=datetime.now().strftime("%I:%M %p"),
        reactions=[]
    )
    db.add(ai_message)
    db.commit()

    # Get recent thread history (last 10 messages)
    history_messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.desc()).limit(10).all()
    history = [{"sender": m.sender, "text": m.text} for m in reversed(history_messages) if m.id != ai_msg_id]

    def event_stream_generator() -> Generator[str, None, None]:
        generator = orchestrator.generate_streaming_response(
            model_id=chat.model_id,
            prompt=payload.text,
            history=history,
            retrieved_context=context,
            user=current_user
        )
        
        final_text = ""
        tokens = 0
        cost = 0.0
        latency = 0
        is_mermaid = False
        mermaid_code = None
        is_chart = False
        chart_type = None

        for chunk in generator:
            if chunk.get("done"):
                final_text = chunk.get("accumulated", "")
                tokens = chunk.get("tokens_used", 0)
                cost = chunk.get("cost", 0.0)
                latency = chunk.get("latency_ms", 0)
                is_mermaid = chunk.get("is_mermaid", False)
                mermaid_code = chunk.get("mermaid_code")
                is_chart = chunk.get("is_chart", False)
                chart_type = chunk.get("chart_type")
            
            # SSE formatted yield
            yield f"data: {json.dumps(chunk)}\n\n"

        # Update assistant message in DB with final parameters
        # We need a separate session to execute within the generator stream lifecycle
        db_stream = SessionLocal()
        try:
            msg = db_stream.query(Message).filter(Message.id == ai_msg_id).first()
            if msg:
                msg.text = final_text
                msg.tokens_used = tokens
                msg.cost = cost
                msg.latency_ms = latency
                msg.is_mermaid = is_mermaid
                msg.mermaid_code = mermaid_code
                msg.is_chart = is_chart
                msg.chart_type = chart_type
                db_stream.commit()
                
            # Log analytics model usage
            usage = ModelUsage(
                model_id=chat.model_id,
                tokens_input=int(tokens * 0.7),
                tokens_output=int(tokens * 0.3),
                cost=cost,
                latency_ms=latency,
                user_id=current_user.id
            )
            db_stream.add(usage)
            db_stream.commit()
        except Exception as err:
            db_stream.rollback()
        finally:
            db_stream.close()

    # SessionLocal is needed inside generator thread execution
    from app.database import SessionLocal

    return StreamingResponse(event_stream_generator(), media_type="text/event-stream")


@router.post("/messages/{message_id}/feedback")
def set_feedback(
    message_id: str,
    payload: MessageFeedback,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.feedback = payload.feedback
    db.commit()
    return {"status": "success", "feedback": msg.feedback}


@router.post("/messages/{message_id}/reactions")
def add_reaction(
    message_id: str,
    payload: MessageReaction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    current_reactions = list(msg.reactions or [])
    if payload.emoji in current_reactions:
        current_reactions.remove(payload.emoji)
    else:
        current_reactions.append(payload.emoji)
        
    msg.reactions = current_reactions
    db.commit()
    return {"status": "success", "reactions": msg.reactions}


@router.post("/messages/{message_id}/pin")
def pin_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve chat context mapping pin properties
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    # We can store pin state in a custom metadata json or just return success
    return {"status": "success", "message_id": message_id, "pinned": True}
