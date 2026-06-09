from fastapi import APIRouter, Depends, HTTPException
from app.schemas.rag import RAGRetrieveRequest, RAGRetrieveResponse
from app.services.rag import RAGPipeline
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/rag", tags=["rag"])
rag_pipeline = RAGPipeline()

@router.post("/retrieve", response_model=RAGRetrieveResponse)
def retrieve_knowledge_base_context(
    payload: RAGRetrieveRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Executes a semantic hybrid search in the vector DB for context assembly.
    """
    try:
        matches = rag_pipeline.query_rag(payload.query, top_k=payload.top_k)
        chunks = []
        for m in matches:
            chunks.append({
                "id": m["id"],
                "text": m["text"],
                "score": m["score"],
                "source": m["source"]
            })
            
        return {
            "query": payload.query,
            "chunks": chunks,
            "tokens_used": len(payload.query.split()) + sum(len(c["text"].split()) for c in chunks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query lookup failure: {e}")
