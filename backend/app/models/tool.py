from sqlalchemy import Column, String, Integer, DateTime, JSON
from datetime import datetime
from app.database import Base

class ToolLog(Base):
    __tablename__ = "tool_logs"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String, nullable=True, index=True)
    tool_name = Column(String, nullable=False, index=True)
    input_params = Column(JSON, default=dict)
    output_results = Column(JSON, default=dict)
    status = Column(String, default="success")  # "success", "error", "running"
    duration_ms = Column(Integer, default=0)
    logs = Column(JSON, default=list)  # Captured console logs / warnings
    created_at = Column(DateTime, default=datetime.utcnow)
