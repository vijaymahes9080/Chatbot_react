from sqlalchemy import Column, String, JSON, DateTime
from datetime import datetime
from app.database import Base

class MCPServer(Base):
    __tablename__ = "mcp_servers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    url = Column(String, nullable=True)  # Set if using SSE transport
    command = Column(String, nullable=True)  # Set if using stdio execution
    args = Column(JSON, default=list)  # Set if command has args
    status = Column(String, default="offline")  # "healthy", "warning", "offline"
    capabilities = Column(JSON, default=list)  # e.g., ["resources", "tools", "prompts"]
    version = Column(String, default="1.0.0")
    registered_at = Column(DateTime, default=datetime.utcnow)
