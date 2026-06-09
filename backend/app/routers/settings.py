from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services.orchestrator import ModelOrchestrator

router = APIRouter(prefix="/settings", tags=["settings"])
_orchestrator = ModelOrchestrator()

@router.get("")
def get_user_settings(current_user: User = Depends(get_current_user)):
    """
    Returns the user's customized API keys configurations.
    """
    # Scrub keys before returning for privacy security
    scrubbed = {}
    for k, v in (current_user.api_keys_config or {}).items():
        if v:
            scrubbed[k] = v[:4] + "*" * (len(v) - 8) + v[-4:] if len(v) > 8 else "****"
        else:
            scrubbed[k] = ""
            
    return {
        "email": current_user.email,
        "role": current_user.role,
        "api_keys": scrubbed
    }

@router.post("/keys")
def update_api_keys(
    keys: Dict[str, str],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Saves user-specific API keys for premium model endpoints.
    """
    current_config = dict(current_user.api_keys_config or {})
    for k, v in keys.items():
        # Validate format or save
        current_config[k.upper()] = v
        
    current_user.api_keys_config = current_config
    db.commit()
    return {"status": "success", "message": "API Keys updated successfully."}

@router.post("/test-connection")
def test_api_connection(
    payload: Dict[str, str],
    current_user: User = Depends(get_current_user)
):
    """
    Tests a free API key by making a minimal live request.
    Expects: { "provider": "groq"|"openrouter"|"gemini", "api_key": "..." }
    Returns: { "success": bool, "message": str, "model": str }
    """
    provider = payload.get("provider", "").lower()
    api_key = payload.get("api_key", "").strip()
    
    if not provider or not api_key:
        raise HTTPException(status_code=400, detail="provider and api_key are required")
    
    result = _orchestrator.test_connection(provider, api_key)
    return result

