from sqlalchemy import Column, String, Integer, DateTime, Float
from datetime import datetime
from app.database import Base

class LongTermMemory(Base):
    __tablename__ = "long_term_memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    fact = Column(String, nullable=False)
    importance = Column(Float, default=1.0)  # Relevancy rating weight (0.0 to 1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
