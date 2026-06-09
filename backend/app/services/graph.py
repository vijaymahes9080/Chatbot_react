from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from app.services.orchestrator import ModelOrchestrator
from app.utils.logger import logger

# Define state structure for the chatbot orchestrator agent
class AgentState(TypedDict):
    chat_id: str
    user_id: int
    query: str
    messages: List[Dict[str, Any]]
    model_id: str
    retrieved_context: str
    tool_requests: List[Dict[str, Any]]
    tool_outputs: List[Dict[str, Any]]
    final_response: str
    next_node: str

class LangGraphOrchestrator:
    def __init__(self):
        self.orchestrator = ModelOrchestrator()
        
        # Initialize LangGraph StateGraph
        workflow = StateGraph(AgentState)
        
        # Add processing nodes
        workflow.add_node("router", self.router_node)
        workflow.add_node("tool_executor", self.tool_executor_node)
        workflow.add_node("generator", self.generator_node)
        
        # Configure edges
        workflow.set_entry_point("router")
        
        workflow.add_conditional_edges(
            "router",
            self.route_decision,
            {
                "tools": "tool_executor",
                "generate": "generator"
            }
        )
        
        workflow.add_edge("tool_executor", "generator")
        workflow.add_edge("generator", END)
        
        self.app = workflow.compile()

    def router_node(self, state: AgentState) -> Dict[str, Any]:
        """
        Analyzes the query and history to determine if tools (e.g. search, files, RAG) are required.
        """
        query = state["query"].lower()
        logger.info(f"[NODE: ROUTER] Evaluating routing path for query: '{query}'")
        
        # Simple routing heuristics
        tool_requests = []
        next_node = "generate"
        
        if "search" in query or "crawling" in query or "find" in query or "web" in query:
            tool_requests.append({"tool_name": "browser_tool", "arguments": {"query": state["query"]}})
            next_node = "tools"
        elif "retrieve" in query or "document" in query or "pdf" in query or "excel" in query or "rag" in query:
            tool_requests.append({"tool_name": "rag_tool", "arguments": {"query": state["query"]}})
            next_node = "tools"
        elif "calc" in query or "sum" in query or "math" in query:
            tool_requests.append({"tool_name": "calculator_tool", "arguments": {"expression": state["query"]}})
            next_node = "tools"
            
        return {
            "tool_requests": tool_requests,
            "next_node": next_node
        }

    def route_decision(self, state: AgentState) -> str:
        """
        Conditional edge decider.
        """
        return state["next_node"]

    def tool_executor_node(self, state: AgentState) -> Dict[str, Any]:
        """
        Executes requested tools (mock implementation or direct tool manager calls).
        """
        logger.info(f"[NODE: TOOL EXECUTOR] Executing: {state['tool_requests']}")
        outputs = []
        context_parts = []
        
        for req in state["tool_requests"]:
            tool_name = req["tool_name"]
            args = req["arguments"]
            
            # Simulated execution output mapping
            if tool_name == "browser_tool":
                result = f"[Browser Agent Web Search: Found citations for '{args.get('query')}']"
            elif tool_name == "rag_tool":
                result = "[RAG Retriever: Found 2 matching text chunks inside 'vector_indexing_guide.pdf']"
            elif tool_name == "calculator_tool":
                result = "[Calculator Tool: Solved equation = 843,204.12]"
            else:
                result = f"[{tool_name} successfully executed]"
                
            outputs.append({"tool_name": tool_name, "result": result})
            context_parts.append(result)
            
        return {
            "tool_outputs": outputs,
            "retrieved_context": "\n".join(context_parts)
        }

    def generator_node(self, state: AgentState) -> Dict[str, Any]:
        """
        Executes model selection and generates the final token stream metadata.
        """
        logger.info(f"[NODE: GENERATOR] Initiating LLM generation node")
        # In a full streaming context, this node is triggered prior to the SSE stream.
        # We perform a quick non-streaming check or return the predicted final text
        # for database logging persistence.
        generator = self.orchestrator.generate_streaming_response(
            model_id=state["model_id"],
            prompt=state["query"],
            retrieved_context=state.get("retrieved_context", "")
        )
        
        final_text = ""
        for chunk in generator:
            if chunk.get("done"):
                final_text = chunk.get("accumulated", "")
                
        return {
            "final_response": final_text
        }

    def execute_flow(self, chat_id: str, user_id: int, query: str, model_id: str, history: list) -> Dict[str, Any]:
        """
        Runs the compiled LangGraph workflow synchronously.
        """
        initial_state = {
            "chat_id": chat_id,
            "user_id": user_id,
            "query": query,
            "messages": history,
            "model_id": model_id,
            "retrieved_context": "",
            "tool_requests": [],
            "tool_outputs": [],
            "final_response": "",
            "next_node": "generate"
        }
        
        result = self.app.invoke(initial_state)
        return result
