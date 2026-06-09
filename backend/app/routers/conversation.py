from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat import Folder, Chat
from app.models.user import User
from app.schemas.chat import FolderCreate, FolderResponse, ChatCreate, ChatResponse, ChatRename, ChatMove
from app.services.auth import get_current_user

router = APIRouter(prefix="/conversation", tags=["conversations"])

# Folder Management
@router.get("/folders", response_model=List[FolderResponse])
def get_folders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Folder).filter(Folder.user_id == current_user.id).all()

@router.post("/folders", response_model=FolderResponse)
def create_folder(folder_in: FolderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fid = folder_in.id or f"folder-{int(datetime.utcnow().timestamp())}"
    new_folder = Folder(
        id=fid,
        name=folder_in.name,
        color=folder_in.color,
        user_id=current_user.id
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    return new_folder

# Conversation Chat Thread Management
@router.get("/chats", response_model=List[ChatResponse])
def get_chats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Retrieve all chats with their messages
    return db.query(Chat).filter(Chat.user_id == current_user.id).all()

@router.post("/chats", response_model=ChatResponse)
def create_chat(chat_in: ChatCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cid = chat_in.id or f"chat-{int(datetime.utcnow().timestamp())}"
    new_chat = Chat(
        id=cid,
        title=chat_in.title or "New Workspace Chat",
        folder_id=chat_in.folder_id,
        user_id=current_user.id,
        model_id=chat_in.model_id or "gemini-2-5"
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat

@router.patch("/chats/{chat_id}/rename", response_model=ChatResponse)
def rename_chat(chat_id: str, payload: ChatRename, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat.title = payload.title
    chat.last_updated = "Just now"
    db.commit()
    db.refresh(chat)
    return chat

@router.patch("/chats/{chat_id}/move", response_model=ChatResponse)
def move_chat(chat_id: str, payload: ChatMove, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat.folder_id = payload.folder_id
    db.commit()
    db.refresh(chat)
    return chat

@router.delete("/chats/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(chat_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return
