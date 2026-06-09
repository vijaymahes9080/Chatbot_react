import json
import httpx
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.utils.logger import logger

class MCPClientManager:
    """
    Manages connections to external MCP servers (via SSE or local stdio processes).
    Registers tools, resources, and executes operations.
    """
    def __init__(self):
        # Local state storage mapping connected server details
        self.connected_servers: Dict[str, Dict[str, Any]] = {}
        self._initialize_mock_servers()

    def _initialize_mock_servers(self):
        # Pre-register default servers to match front-end mock data immediately
        self.connected_servers["postgres-db"] = {
            "id": "s-pg",
            "name": "postgres-db",
            "status": "healthy",
            "version": "1.0.4",
            "capabilities": ["resources", "tools"],
            "registered_at": datetime.utcnow(),
            "tools": [
                {
                    "name": "query_db",
                    "desc": "Execute read-only SQL queries on the postgres database",
                    "schema": "SELECT * FROM users LIMIT 10"
                }
            ]
        }
        self.connected_servers["filesystem-local"] = {
            "id": "s-fs",
            "name": "filesystem-local",
            "status": "healthy",
            "version": "1.1.0",
            "capabilities": ["resources", "tools", "prompts"],
            "registered_at": datetime.utcnow(),
            "tools": [
                {
                    "name": "read_file",
                    "desc": "Read file contents from local absolute paths",
                    "schema": "path: string"
                }
            ]
        }
        self.connected_servers["github-agent"] = {
            "id": "s-git",
            "name": "github-agent",
            "status": "healthy",
            "version": "0.9.3",
            "capabilities": ["tools"],
            "registered_at": datetime.utcnow(),
            "tools": [
                {
                    "name": "create_pr",
                    "desc": "Create branch and pull request with code delta",
                    "schema": "repo: string, branch: string, title: string"
                }
            ]
        }
        self.connected_servers["slack-connector"] = {
            "id": "s-slack",
            "name": "slack-connector",
            "status": "offline",
            "version": "0.8.0",
            "capabilities": ["tools"],
            "registered_at": datetime.utcnow(),
            "tools": []
        }

    def register_server(self, name: str, url: Optional[str] = None, command: Optional[str] = None, args: List[str] = None) -> Dict[str, Any]:
        """
        Registers a new server in the active registry and probes its capabilities.
        """
        logger.info(f"[MCP] Registering new server: {name}")
        server_info = {
            "id": f"s-{int(datetime.utcnow().timestamp())}",
            "name": name,
            "url": url,
            "command": command,
            "args": args or [],
            "status": "offline",
            "version": "1.0.0",
            "capabilities": ["tools"],
            "tools": []
        }
        
        # Verify connection health
        if url:
            try:
                # Synchronous probe check
                with httpx.Client(timeout=3.0) as client:
                    resp = client.get(f"{url}/tools")
                if resp.status_code == 200:
                    server_info["status"] = "healthy"
                    server_info["tools"] = resp.json().get("tools", [])
                    server_info["capabilities"] = resp.json().get("capabilities", ["tools"])
            except Exception as e:
                logger.warning(f"[MCP] HTTP handshake failed for server '{name}' at {url}: {e}")
                server_info["status"] = "warning"
        else:
            # Stdio local execution registration
            if command:
                server_info["status"] = "healthy" # Registered command setup
                server_info["tools"] = [
                    {"name": f"{name}_execute", "desc": f"Custom task executor from local {command}", "schema": "args: string"}
                ]
            else:
                server_info["status"] = "offline"

        self.connected_servers[name] = server_info
        return server_info

    def get_all_servers(self) -> List[Dict[str, Any]]:
        return list(self.connected_servers.values())

    def get_all_tools(self) -> List[Dict[str, Any]]:
        tools = []
        for server_name, info in self.connected_servers.items():
            if info["status"] == "healthy":
                for t in info["tools"]:
                    tools.append({
                        "server": server_name,
                        "name": t["name"],
                        "desc": t["desc"],
                        "schema": t.get("schema", "")
                    })
        return tools

    def execute_mcp_tool(self, server_name: str, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a tool on a connected MCP server.
        """
        logger.info(f"[MCP] Requesting execution: Server={server_name}, Tool={tool_name}")
        server = self.connected_servers.get(server_name)
        
        if not server:
            raise ValueError(f"MCP Server '{server_name}' is not registered.")
            
        if server["status"] != "healthy":
            raise ConnectionError(f"MCP Server '{server_name}' is currently offline.")

        # If it's an SSE server, make HTTP call
        if server.get("url"):
            try:
                url = f"{server['url']}/tools/{tool_name}/execute"
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(url, json={"arguments": arguments})
                if resp.status_code == 200:
                    return resp.json().get("result", {})
                else:
                    raise RuntimeError(f"Server returned status code {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"[MCP] Failed to run tool '{tool_name}' on server '{server_name}': {e}")
                raise

        # Fallback local runner
        logger.info(f"[MCP] Executing local mock action for '{tool_name}'")
        time.sleep(0.5)
        if tool_name == "query_db":
            return {"columns": ["id", "email", "role"], "rows": [[1, "admin@aethermind.ai", "admin"], [2, "member@aethermind.ai", "member"]]}
        elif tool_name == "read_file":
            return {"content": "[Local MCP Mock Content: Successfully read file details]"}
        elif tool_name == "create_pr":
            return {"pr_number": 42, "url": "https://github.com/aethermind/repo/pull/42", "status": "PR successfully generated!"}
            
        return {"status": "success", "info": f"Executed local {tool_name} successfully"}
