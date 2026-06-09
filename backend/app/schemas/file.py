from typing import Optional
from pydantic import BaseModel

class DocumentResponse(BaseModel):
    id: str
    chat_id: Optional[str] = None
    file_name: str
    file_size: str
    file_type: str
    status: str
    chunks_count: int

    class Config:
        from_attributes = True

class FileUploadResponse(BaseModel):
    id: str
    name: str
    size: str
    type: str
    status: str
    progress: int
    uploadedAt: str
