from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.memory import LongTermMemory
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/memory", tags=["memory"])

@router.get("", response_model=List[Dict[str, Any]])
def list_memory_facts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns the list of persistent long-term memory facts extracted for the user.
    """
    memories = db.query(LongTermMemory).filter(LongTermMemory.user_id == current_user.id).all()
    return [
        {
            "id": m.id,
            "fact": m.fact,
            "importance": m.importance,
            "created_at": m.created_at.strftime("%Y-%m-%d %H:%M")
        }
        for m in memories
    ]

@router.post("")
def add_memory_fact(fact: str, importance: float = 1.0, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_mem = LongTermMemory(
        user_id=current_user.id,
        fact=fact,
        importance=importance
    )
    db.add(new_mem)
    db.commit()
    db.refresh(new_mem)
    return {"status": "success", "id": new_mem.id, "fact": new_mem.fact}

@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memory_fact(memory_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    mem = db.query(LongTermMemory).filter(LongTermMemory.id == memory_id, LongTermMemory.user_id == current_user.id).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory fact not found")
    db.delete(mem)
    db.commit()
    return
