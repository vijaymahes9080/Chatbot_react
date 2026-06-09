from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class CollectionCreate(BaseModel):
    name: str
    dimension: int = 1536  # Default dimension for OpenAI/BGE
    metric: str = "cosine"  # cosine, dotproduct, euclidean

class VectorUpsertRequest(BaseModel):
    id: str
    values: List[float]
    metadata: Dict[str, Any]

class VectorSearchRequest(BaseModel):
    vector: List[float]
    top_k: int = 5
    filter: Optional[Dict[str, Any]] = None

class VectorSearchMatch(BaseModel):
    id: str
    score: float
    metadata: Dict[str, Any]

class VectorSearchResponse(BaseModel):
    matches: List[VectorSearchMatch]
    namespace: Optional[str] = None
