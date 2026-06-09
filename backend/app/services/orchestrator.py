import time
import re
import random
from typing import Dict, Any, Generator, Tuple, Optional
from app.config import settings
from app.utils.logger import logger

class ModelOrchestrator:
    def __init__(self):
        # Configure model cost tables (per 1,000 tokens)
        self.pricing = {
            "gpt-5": {"input": 0.015, "output": 0.060},
            "claude-3-7": {"input": 0.003, "output": 0.015},
            "gemini-2-5": {"input": 0.000125, "output": 0.000375},
            "deepseek-r1": {"input": 0.00055, "output": 0.00219},
            "llama-3-3": {"input": 0.0, "output": 0.0},
            "mistral-large": {"input": 0.0025, "output": 0.0075},
            # Free API models (zero cost)
            "groq-llama": {"input": 0.0, "output": 0.0},
            "groq-deepseek": {"input": 0.0, "output": 0.0},
            "or-deepseek": {"input": 0.0, "output": 0.0},
            "or-mistral": {"input": 0.0, "output": 0.0},
            "or-qwen": {"input": 0.0, "output": 0.0},
        }

    def select_model(self, model_id: str, query: str, user: Optional[Any] = None) -> Tuple[str, bool]:
        """
        Dynamically routes the query to the correct LLM endpoint based on key availability and falls back.
        Returns (resolved_model_id, is_mock_fallback).
        """
        # Lowercase for uniform key mapping
        mid = model_id.lower()
        
        # Helper to check key in user settings database config or app env settings
        def get_key(key_name: str) -> Optional[str]:
            if user and hasattr(user, "api_keys_config") and user.api_keys_config:
                val = user.api_keys_config.get(key_name.upper()) or user.api_keys_config.get(key_name.lower())
                if val:
                    return val
            return getattr(settings, key_name, None)

        # Check API key configuration — premium providers first
        if "gpt" in mid and get_key("OPENAI_API_KEY"):
            return model_id, False
        elif "claude" in mid and get_key("ANTHROPIC_API_KEY"):
            return model_id, False
        elif "gemini" in mid and get_key("GEMINI_API_KEY"):
            return model_id, False
        elif "deepseek" in mid and get_key("DEEPSEEK_API_KEY"):
            return model_id, False
        elif "mistral" in mid and get_key("MISTRAL_API_KEY"):
            return model_id, False

        # Free API providers — Groq (ultra-fast, no credit card)
        elif "groq" in mid and get_key("GROQ_API_KEY"):
            return model_id, False

        # Free API providers — OpenRouter :free models (no credit card, no credits needed)
        elif mid.startswith("or-") and get_key("OPENROUTER_API_KEY"):
            return model_id, False

        # Auto-upgrade: if any free API key is available and model is simulated, route there
        elif get_key("GROQ_API_KEY"):
            # Use Groq as a universal free fallback
            return "groq-llama", False
        elif get_key("OPENROUTER_API_KEY"):
            # Use OpenRouter DeepSeek as universal free fallback
            return "or-deepseek", False
        elif get_key("GEMINI_API_KEY"):
            # Gemini free fallback
            return "gemini-2-5", False
            
        # Fallback to local Ollama if configured
        elif settings.OLLAMA_BASE_URL and settings.OLLAMA_BASE_URL != "http://localhost:11434":
            return f"ollama-{settings.DEFAULT_OPEN_SOURCE_MODEL}", False
            
        # If no key matches, route to zero-dependency Mock Open Source Simulator
        return model_id, True

    def calculate_cost(self, model_id: str, input_tokens: int, output_tokens: int) -> float:
        rate = self.pricing.get(model_id.lower(), {"input": 0.0, "output": 0.0})
        return (input_tokens / 1000 * rate["input"]) + (output_tokens / 1000 * rate["output"])

    def test_connection(self, provider: str, api_key: str) -> dict:
        """
        Tests whether an API key is valid by making a minimal completion request.
        Returns {"success": bool, "message": str, "model": str}
        """
        try:
            if provider == "groq":
                from groq import Groq
                client = Groq(api_key=api_key)
                resp = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": "Say 'OK' in one word."}],
                    max_tokens=5
                )
                return {"success": True, "message": "Groq connected! Llama 3.3 70B ready.", "model": "llama-3.3-70b-versatile"}
            elif provider == "openrouter":
                import httpx
                r = httpx.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={"model": "deepseek/deepseek-r1:free", "messages": [{"role": "user", "content": "Say OK"}], "max_tokens": 5},
                    timeout=15
                )
                if r.status_code == 200:
                    return {"success": True, "message": "OpenRouter connected! Free models active.", "model": "deepseek/deepseek-r1:free"}
                else:
                    return {"success": False, "message": f"OpenRouter error: {r.status_code} - {r.text[:100]}"}
            elif provider == "gemini":
                import httpx
                r = httpx.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}",
                    json={"contents": [{"parts": [{"text": "Say OK"}]}]},
                    timeout=15
                )
                if r.status_code == 200:
                    return {"success": True, "message": "Gemini 1.5 Flash connected! Free tier active.", "model": "gemini-1.5-flash"}
                else:
                    return {"success": False, "message": f"Gemini error: {r.status_code}"}
            else:
                return {"success": False, "message": f"Unknown provider: {provider}"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def generate_streaming_response(
        self, 
        model_id: str, 
        prompt: str, 
        history: list = None,
        retrieved_context: str = "",
        user: Optional[Any] = None
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Generates chunked responses to stream back to the client via SSE.
        Includes token counts, cost calculation, and latency tracking.
        """
        start_time = time.time()
        
        # Helper to check key in user settings database config or app env settings
        def get_key(key_name: str) -> Optional[str]:
            if user and hasattr(user, "api_keys_config") and user.api_keys_config:
                val = user.api_keys_config.get(key_name.upper()) or user.api_keys_config.get(key_name.lower())
                if val:
                    return val
            return getattr(settings, key_name, None)
            
        resolved_model, is_mock = self.select_model(model_id, prompt, user=user)
        
        logger.info(f"Routing query to Model: {resolved_model} (Is Mock Fallback: {is_mock})")
        
        # Simulate / Estimate input tokens based on string lengths
        input_tokens = len(prompt.split()) + len(retrieved_context.split()) + 50
        
        if is_mock:
            # Zero-dependency premium response simulation (extremely detailed to match the React app)
            response_text = self._get_simulated_text(resolved_model, prompt, retrieved_context)
            words = re.split(r"(\s+)", response_text) if hasattr(response_text, "split") else response_text.split(" ")
            
            accumulated_text = ""
            for i, word in enumerate(words):
                time.sleep(0.01)  # Smooth simulation streaming interval
                accumulated_text += word
                
                # Check for intermediate structures
                yield {
                    "text": word,
                    "accumulated": accumulated_text,
                    "done": False,
                    "tokens_used": input_tokens + len(accumulated_text.split()),
                    "latency_ms": int((time.time() - start_time) * 1000)
                }
            
            # Final token/cost telemetry
            output_tokens = len(accumulated_text.split())
            cost = self.calculate_cost(resolved_model, input_tokens, output_tokens)
            latency_ms = int((time.time() - start_time) * 1000)
            
            # Determine visualization states
            is_mermaid = "graph " in accumulated_text or "sequenceDiagram" in accumulated_text
            is_chart = "| Latency |" in accumulated_text or "rag-match" in prompt
            
            yield {
                "text": "",
                "accumulated": accumulated_text,
                "done": True,
                "tokens_used": input_tokens + output_tokens,
                "cost": cost,
                "latency_ms": latency_ms,
                "is_mermaid": is_mermaid,
                "mermaid_code": self._extract_mermaid(accumulated_text) if is_mermaid else None,
                "is_chart": is_chart,
                "chart_type": "rag-match" if is_chart else None
            }
        else:
            # If live API integration is enabled, write standard LangChain streaming call
            # We provide a clean streaming generator from standard libraries
            try:
                # We will import LangChain models dynamically based on availability
                if "gemini" in resolved_model.lower():
                    from langchain_google_genai import ChatGoogleGenerativeAI
                    # Use gemini-1.5-flash — fully free with AI Studio key
                    llm = ChatGoogleGenerativeAI(
                        model="gemini-1.5-flash",
                        google_api_key=get_key("GEMINI_API_KEY"),
                        streaming=True
                    )
                elif "groq" in resolved_model.lower():
                    # Groq — ultra-fast LPU inference, completely free tier
                    # Models: llama-3.3-70b-versatile, llama-4-scout-17b, deepseek-r1-distill-llama-70b
                    from langchain_groq import ChatGroq
                    groq_model_map = {
                        "groq-llama": "llama-3.3-70b-versatile",
                        "groq-deepseek": "deepseek-r1-distill-llama-70b",
                        "groq-llama4": "meta-llama/llama-4-scout-17b-16e-instruct",
                    }
                    groq_model = groq_model_map.get(resolved_model.lower(), "llama-3.3-70b-versatile")
                    llm = ChatGroq(
                        model=groq_model,
                        groq_api_key=get_key("GROQ_API_KEY"),
                        streaming=True
                    )
                elif resolved_model.lower().startswith("or-"):
                    # OpenRouter — free :free model endpoints (no credits needed)
                    from langchain_openai import ChatOpenAI
                    or_model_map = {
                        "or-deepseek": "deepseek/deepseek-r1:free",
                        "or-mistral": "mistralai/mistral-7b-instruct:free",
                        "or-qwen": "qwen/qwen3-8b:free",
                        "or-llama": "meta-llama/llama-3.2-3b-instruct:free",
                    }
                    or_model = or_model_map.get(resolved_model.lower(), "deepseek/deepseek-r1:free")
                    llm = ChatOpenAI(
                        model=or_model,
                        openai_api_key=get_key("OPENROUTER_API_KEY"),
                        openai_api_base="https://openrouter.ai/api/v1",
                        default_headers={
                            "HTTP-Referer": "http://localhost:5173",
                            "X-Title": "AetherMind AI"
                        }
                    )
                elif "gpt" in resolved_model.lower():
                    from langchain_openai import ChatOpenAI
                    llm = ChatOpenAI(model="gpt-4-turbo", openai_api_key=get_key("OPENAI_API_KEY"))
                elif "claude" in resolved_model.lower():
                    from langchain_anthropic import ChatAnthropic
                    llm = ChatAnthropic(model="claude-3-5-sonnet", anthropic_api_key=get_key("ANTHROPIC_API_KEY"))
                elif "deepseek" in resolved_model.lower():
                    key = get_key("DEEPSEEK_API_KEY")
                    if key and key.startswith("sk-or-"):
                        from langchain_openai import ChatOpenAI
                        llm = ChatOpenAI(
                            model="deepseek/deepseek-r1:free",
                            openai_api_key=key,
                            openai_api_base="https://openrouter.ai/api/v1"
                        )
                    else:
                        from langchain_openai import ChatOpenAI
                        llm = ChatOpenAI(
                            model="deepseek-reasoner",
                            openai_api_key=key,
                            openai_api_base="https://api.deepseek.com"
                        )
                elif "mistral" in resolved_model.lower():
                    from langchain_openai import ChatOpenAI
                    llm = ChatOpenAI(
                        model="mistral-large-latest",
                        openai_api_key=get_key("MISTRAL_API_KEY"),
                        openai_api_base="https://api.mistral.ai/v1"
                    )
                else:
                    # Generic local Ollama connector
                    from langchain_community.llms import Ollama
                    llm = Ollama(base_url=settings.OLLAMA_BASE_URL, model=settings.DEFAULT_OPEN_SOURCE_MODEL)
                
                accumulated_text = ""
                # Call LangChain stream
                for chunk in llm.stream(prompt):
                    text_chunk = chunk.content if hasattr(chunk, "content") else str(chunk)
                    accumulated_text += text_chunk
                    yield {
                        "text": text_chunk,
                        "accumulated": accumulated_text,
                        "done": False,
                        "tokens_used": input_tokens + len(accumulated_text.split()),
                        "latency_ms": int((time.time() - start_time) * 1000)
                    }
                
                output_tokens = len(accumulated_text.split())
                yield {
                    "text": "",
                    "accumulated": accumulated_text,
                    "done": True,
                    "tokens_used": input_tokens + output_tokens,
                    "cost": self.calculate_cost(resolved_model, input_tokens, output_tokens),
                    "latency_ms": int((time.time() - start_time) * 1000)
                }
            except Exception as e:
                logger.error(f"Error calling live LLM model: {e}. Falling back to simulator.")
                # Recursively generate with fallback mock if live API breaks
                yield from self.generate_streaming_response("gemini-2-5", prompt, history, retrieved_context, user=user)

    def _get_simulated_text(self, model: str, prompt: str, context: str) -> str:
        prompt_lower = prompt.lower()
        
        # Check if RAG or context exists to give context-aware responses
        if context:
            return f"""As the **{model.upper()}** engine, I have read the active document contexts retrieved from our RAG database.

Based on the retrieved snippets, here is the answer:
1. **Source Context**: {context[:200]}...
2. **Analysis**: The documents provide core configurations matching your search.

Here is a visual performance analysis:
| Dimension | Retrieval Score | Latency | Status |
| :--- | :--- | :--- | :--- |
| Semantic | 0.942 | 12ms | Highly Relevant |
| Keyword | 0.810 | 8ms | Validated |

Would you like me to compile a Python sandbox script to calculate vector similarity density for this document?"""

        # Check if prompt requests code or charts
        if "code" in prompt_lower or "script" in prompt_lower or "python" in prompt_lower:
            return f"""Here is a secure local python sandbox calculation script:

```python
# System script verifying token usage costs
def calculate_cost(tokens, rate_in=0.00015, rate_out=0.00035):
    input_tokens = int(tokens * 0.7)
    output_tokens = int(tokens * 0.3)
    total_cost = (input_tokens / 1000 * rate_in) + (output_tokens / 1000 * rate_out)
    return total_cost

print(f"Estimated Cost: ${calculate_cost(125000):.4f}")
```

This script evaluates dynamic input-to-output ratios. Running it in the calculator tool takes **4ms**."""

        # Check if flowchart or diagram is requested
        if "graph" in prompt_lower or "flow" in prompt_lower or "diagram" in prompt_lower or "mermaid" in prompt_lower:
            return """Here is a Mermaid flowchart demonstrating the RAG agent retrieval workflow:

```mermaid
graph TD
    UserQuery[User Query Input] --> VectorQuery[Vector Similarity Match]
    VectorQuery --> Reranker[Cohere Rerank Optimization]
    Reranker -->|Top Matching Chunks| ContextJoin[Context Assembler]
    ContextJoin --> GeneratorNode[AI Generation Layer]
    GeneratorNode --> UserDisplay[Stream Output UI]
```
Let me know if you would like me to adjust this workflow structure."""

        # Standard Conversational Text
        return f"""Greetings! I am **{model.upper()}**, your advanced AI assistant. How can I help you write code, query databases, search the web, or index documents today?"""

    def _extract_mermaid(self, text: str) -> Optional[str]:
        # Simple extractor helper
        if "```mermaid" in text:
            start = text.find("```mermaid") + len("```mermaid\n")
            end = text.find("```", start)
            return text[start:end].strip()
        return None
