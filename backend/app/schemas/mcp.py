from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class MCPServerCreate(BaseModel):
    name: str
    url: Optional[str] = None
    command: Optional[str] = None
    args: Optional[List[str]] = []

class MCPServerResponse(BaseModel):
    id: str
    name: str
    url: Optional[str] = None
    command: Optional[str] = None
    args: List[str] = []
    status: str
    capabilities: List[str] = []
    version: str
    registered_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MCPToolResponse(BaseModel):
    server: str
    name: str
    desc: str
    schema: Optional[str] = None
