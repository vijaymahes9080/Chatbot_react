from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    chat_id = Column(String, ForeignKey("chats.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_size = Column(String, nullable=False)  # e.g., "2.4 MB"
    file_type = Column(String, nullable=False)  # e.g., "pdf"
    status = Column(String, default="parsing")  # "uploading", "parsing", "embedded", "ready", "error"
    chunks_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    content = Column(String, nullable=False)
    page_number = Column(Integer, nullable=True)
    token_count = Column(Integer, default=0)
    similarity_score = Column(Float, nullable=True)  # Populated during retrieval phases

    document = relationship("Document", back_populates="chunks")
