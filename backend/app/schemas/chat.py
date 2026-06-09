from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class AttachmentSchema(BaseModel):
    name: str
    size: str
    type: str
    status: str = "ready"

class MessageCreate(BaseModel):
    id: Optional[str] = None
    text: str
    attachments: Optional[List[AttachmentSchema]] = []

class MessageFeedback(BaseModel):
    feedback: Optional[str] = None  # "like", "dislike", or null

class MessageReaction(BaseModel):
    emoji: str

class MessageResponse(BaseModel):
    id: str
    chat_id: str
    sender: str  # "user" or "assistant"
    text: str
    timestamp: str
    reactions: List[str] = []
    feedback: Optional[str] = None
    is_mermaid: bool = False
    mermaid_code: Optional[str] = None
    is_chart: bool = False
    chart_type: Optional[str] = None
    tokens_used: int = 0
    cost: float = 0.0
    latency_ms: int = 0

    class Config:
        from_attributes = True

class FolderCreate(BaseModel):
    id: Optional[str] = None
    name: str
    color: Optional[str] = "#8B5CF6"

class FolderResponse(BaseModel):
    id: str
    name: str
    color: str

    class Config:
        from_attributes = True

class ChatCreate(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = "New Workspace Chat"
    folder_id: Optional[str] = None
    model_id: Optional[str] = "gemini-2-5"

class ChatRename(BaseModel):
    title: str

class ChatMove(BaseModel):
    folder_id: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    title: str
    folder_id: Optional[str] = None
    model_id: str
    pinned: bool
    last_updated: str
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
