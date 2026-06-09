from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.mcp import MCPServerCreate, MCPServerResponse, MCPToolResponse
from app.services.mcp import MCPClientManager
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/mcp", tags=["mcp"])
mcp_manager = MCPClientManager()

@router.get("/servers", response_model=List[MCPServerResponse])
def get_mcp_servers(current_user: User = Depends(get_current_user)):
    return mcp_manager.get_all_servers()

@router.post("/servers", response_model=MCPServerResponse)
def register_mcp_server(payload: MCPServerCreate, current_user: User = Depends(get_current_user)):
    try:
        return mcp_manager.register_server(
            name=payload.name,
            url=payload.url,
            command=payload.command,
            args=payload.args
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/tools", response_model=List[MCPToolResponse])
def get_mcp_tools(current_user: User = Depends(get_current_user)):
    return mcp_manager.get_all_tools()
