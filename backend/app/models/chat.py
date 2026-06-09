from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, JSON, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Folder(Base):
    __tablename__ = "folders"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    color = Column(String, default="#8B5CF6")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    chats = relationship("Chat", back_populates="folder")


class Chat(Base):
    __tablename__ = "chats"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, default="New Workspace Chat")
    folder_id = Column(String, ForeignKey("folders.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model_id = Column(String, default="gemini-2-5")
    pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(String, default="Just now")

    folder = relationship("Folder", back_populates="chats")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    chat_id = Column(String, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String, nullable=False)  # "user" or "assistant"
    text = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)  # e.g., "10:24 AM"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Reactions and feedback
    reactions = Column(JSON, default=list)  # e.g., ["🧠", "🔥"]
    feedback = Column(String, nullable=True)  # "like", "dislike", or null
    
    # Advanced visualization settings
    is_mermaid = Column(Boolean, default=False)
    mermaid_code = Column(String, nullable=True)
    is_chart = Column(Boolean, default=False)
    chart_type = Column(String, nullable=True)
    
    # Usage details
    tokens_used = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    latency_ms = Column(Integer, default=0)

    chat = relationship("Chat", back_populates="messages")
