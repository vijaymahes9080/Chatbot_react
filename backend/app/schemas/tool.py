from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class ToolExecuteRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    message_id: Optional[str] = None

class ToolExecuteResponse(BaseModel):
    tool_name: str
    status: str  # "success" or "error"
    execution_time: str
    result: Any
    error: Optional[str] = None

class ToolStatusDetail(BaseModel):
    id: str
    name: str
    status: str
    duration: str
    result: str
    icon: str
    type: str  # "system", "local", "sandbox", "mcp"
