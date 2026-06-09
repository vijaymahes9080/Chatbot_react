from sqlalchemy import Column, String, Integer, DateTime, Float
from datetime import datetime
from app.database import Base

class ModelUsage(Base):
    __tablename__ = "model_usages"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String, nullable=False, index=True)
    tokens_input = Column(Integer, default=0)
    tokens_output = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    latency_ms = Column(Integer, default=0)
    user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
