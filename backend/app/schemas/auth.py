from typing import Optional, Dict, Any
from pydantic import BaseModel

class UserBase(BaseModel):
    email: str
    role: Optional[str] = "member"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    api_keys_config: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
