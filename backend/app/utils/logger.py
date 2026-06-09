import time
import logging
from typing import Dict, Any, Callable

# Standard logger configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("aethermind")

# Structured trace performance metric hook
def log_performance(activity: str, details: Dict[str, Any] = None):
    meta = details or {}
    logger.info(f"[PERF] {activity} - details: {meta}")

# Decorator to measure function latency
def measure_time(func: Callable):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        duration_ms = int((time.time() - start_time) * 1000)
        log_performance(f"Function: {func.__name__}", {"duration_ms": duration_ms})
        return result
    return wrapper
