from typing import List, Optional
from pydantic import BaseModel

class RAGChunkResponse(BaseModel):
    id: str
    text: str
    score: float
    source: str

class RAGRetrieveRequest(BaseModel):
    query: str
    collection_name: Optional[str] = "research-base"
    top_k: int = 5
    rerank: bool = True

class RAGRetrieveResponse(BaseModel):
    query: str
    chunks: List[RAGChunkResponse]
    tokens_used: int = 0
