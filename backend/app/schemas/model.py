from typing import List, Optional
from pydantic import BaseModel

class ModelDetail(BaseModel):
    id: str
    name: str
    provider: str
    icon: str
    desc: str

class ModelUsageStats(BaseModel):
    model_id: str
    total_calls: int
    total_tokens: int
    total_cost: float
    avg_latency_ms: float

class ModelBenchmarkResponse(BaseModel):
    model_id: str
    speed_tokens_per_sec: float
    cost_per_1k_tokens: float
    latency_p95_ms: float
    accuracy_score: float  # scale of 0.0 to 1.0
