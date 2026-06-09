from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.vector import CollectionCreate, VectorUpsertRequest, VectorSearchRequest, VectorSearchResponse
from app.services.vector_db import VectorDBManager
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/vector", tags=["vector"])
vector_manager = VectorDBManager()

@router.post("/collections", status_code=status.HTTP_201_CREATED)
def create_new_collection(payload: CollectionCreate, current_user: User = Depends(get_current_user)):
    success = vector_manager.create_collection(payload.name, payload.dimension, payload.metric)
    if not success:
        raise HTTPException(status_code=500, detail=f"Failed to create collection '{payload.name}'")
    return {"status": "success", "message": f"Collection '{payload.name}' successfully initialized."}

@router.delete("/collections/{name}")
def delete_collection(name: str, current_user: User = Depends(get_current_user)):
    success = vector_manager.delete_collection(name)
    if not success:
        raise HTTPException(status_code=500, detail=f"Failed to delete collection '{name}'")
    return {"status": "success", "message": f"Collection '{name}' deleted."}

@router.post("/collections/{name}/upsert")
def upsert_vectors(name: str, payload: List[VectorUpsertRequest], current_user: User = Depends(get_current_user)):
    # Convert schema payloads to simple dictionary records
    vectors = []
    for p in payload:
        vectors.append({
            "id": p.id,
            "values": p.values,
            "metadata": p.metadata
        })
    success = vector_manager.upsert_vectors(name, vectors)
    if not success:
        raise HTTPException(status_code=500, detail="Upsert operation failed")
    return {"status": "success", "upserted_count": len(payload)}

@router.post("/collections/{name}/search", response_model=VectorSearchResponse)
def search_vectors(name: str, payload: VectorSearchRequest, current_user: User = Depends(get_current_user)):
    results = vector_manager.query_similarity(
        collection_name=name,
        vector=payload.vector,
        top_k=payload.top_k,
        filter_dict=payload.filter
    )
    return {
        "matches": [
            {"id": r["id"], "score": r["score"], "metadata": r["metadata"]}
            for r in results
        ],
        "namespace": name
    }
