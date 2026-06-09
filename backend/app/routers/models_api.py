from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.analytics import ModelUsage
from app.schemas.model import ModelDetail, ModelBenchmarkResponse, ModelUsageStats
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/models", tags=["models"])

@router.get("", response_model=List[ModelDetail])
def list_models(current_user: User = Depends(get_current_user)):
    """
    Returns the list of available model engines for AetherMind.
    """
    return [
        { "id": "gpt-5", "name": "GPT-5 Ultra", "provider": "OpenAI", "icon": "zap", "desc": "Next-gen reasoning & complex problem solving", "is_free": False },
        { "id": "claude-3-7", "name": "Claude 3.7 Sonnet", "provider": "Anthropic", "icon": "shield", "desc": "Refined coding & highly accurate Markdown analysis", "is_free": False },
        { "id": "gemini-2-5", "name": "Gemini 1.5 Flash", "provider": "Google", "icon": "sparkles", "desc": "Multimodal processing & speed-optimized search — FREE via AI Studio", "is_free": True },
        { "id": "deepseek-r1", "name": "DeepSeek-R1", "provider": "DeepSeek", "icon": "activity", "desc": "Deep reinforcement reasoning & math proofs", "is_free": False },
        { "id": "llama-3-3", "name": "Llama 3.3 70B", "provider": "Meta", "icon": "globe", "desc": "Open-weights agentic workflow orchestrator", "is_free": False },
        { "id": "mistral-large", "name": "Mistral Large 2", "provider": "Mistral", "icon": "wind", "desc": "Advanced multi-lingual context compliance", "is_free": False },
        # ── Completely FREE models ───────────────────────────────────────
        { "id": "groq-llama", "name": "Llama 3.3 70B", "provider": "Groq (Free)", "icon": "zap", "desc": "Ultra-fast LPU inference — 100% free, no credit card. 14,400 req/day.", "is_free": True },
        { "id": "groq-deepseek", "name": "DeepSeek-R1 Distill", "provider": "Groq (Free)", "icon": "activity", "desc": "DeepSeek-R1 distilled on Llama 70B — free via Groq LPU cloud.", "is_free": True },
        { "id": "groq-llama4", "name": "Llama 4 Scout 17B", "provider": "Groq (Free)", "icon": "sparkles", "desc": "Meta Llama 4 Scout multimodal model — free on Groq.", "is_free": True },
        { "id": "or-deepseek", "name": "DeepSeek-R1 (Free)", "provider": "OpenRouter (Free)", "icon": "activity", "desc": "DeepSeek-R1 via OpenRouter free tier — no credits needed.", "is_free": True },
        { "id": "or-qwen", "name": "Qwen3 8B (Free)", "provider": "OpenRouter (Free)", "icon": "globe", "desc": "Alibaba Qwen3 8B via OpenRouter free endpoint.", "is_free": True },
    ]

@router.get("/benchmarks", response_model=List[ModelBenchmarkResponse])
def get_benchmarks(current_user: User = Depends(get_current_user)):
    """
    Returns comparative performance metrics for routing nodes.
    """
    return [
        { "model_id": "gpt-5", "speed_tokens_per_sec": 75.0, "cost_per_1k_tokens": 0.035, "latency_p95_ms": 1250, "accuracy_score": 0.98 },
        { "model_id": "claude-3-7", "speed_tokens_per_sec": 85.0, "cost_per_1k_tokens": 0.015, "latency_p95_ms": 980, "accuracy_score": 0.96 },
        { "model_id": "gemini-2-5", "speed_tokens_per_sec": 140.0, "cost_per_1k_tokens": 0.00025, "latency_p95_ms": 320, "accuracy_score": 0.89 },
        { "model_id": "deepseek-r1", "speed_tokens_per_sec": 45.0, "cost_per_1k_tokens": 0.0018, "latency_p95_ms": 1950, "accuracy_score": 0.95 },
        { "model_id": "llama-3-3", "speed_tokens_per_sec": 95.0, "cost_per_1k_tokens": 0.0, "latency_p95_ms": 180, "accuracy_score": 0.88 },
        { "model_id": "mistral-large", "speed_tokens_per_sec": 80.0, "cost_per_1k_tokens": 0.005, "latency_p95_ms": 650, "accuracy_score": 0.91 }
    ]

@router.get("/stats", response_model=List[ModelUsageStats])
def get_usage_statistics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Computes total token volume and costs accumulated per model type.
    """
    stats = []
    models_list = ["gpt-5", "claude-3-7", "gemini-2-5", "deepseek-r1", "llama-3-3", "mistral-large"]
    
    for mid in models_list:
        records = db.query(ModelUsage).filter(ModelUsage.model_id == mid).all()
        calls = len(records)
        tokens = sum(r.tokens_input + r.tokens_output for r in records)
        cost = sum(r.cost for r in records)
        avg_lat = sum(r.latency_ms for r in records) / calls if calls > 0 else 0.0
        
        stats.append({
            "model_id": mid,
            "total_calls": calls,
            "total_tokens": tokens,
            "total_cost": round(cost, 5),
            "avg_latency_ms": round(avg_lat, 2)
        })
        
    return stats
