from celery import Celery
from app.config import settings
from app.utils.logger import logger

# Initialize Celery only if Redis host is configured. Otherwise, default to inline synchronous tasks.
celery_app = None

if settings.CELERY_BROKER_URL:
    try:
        celery_app = Celery("aethermind_worker", broker=settings.CELERY_BROKER_URL)
        celery_app.conf.update(
            task_serializer="json",
            accept_content=["json"],
            result_serializer="json",
            timezone="UTC",
            enable_utc=True,
        )
        logger.info(f"Celery successfully initialized with Redis broker: {settings.CELERY_BROKER_URL}")
    except Exception as e:
        logger.warning(f"Failed to initialize Celery app: {e}. Falling back to inline synchronous tasks.")
else:
    logger.info("Redis host not found. Task execution will run inline synchronously.")

def run_async_task(task_func, *args, **kwargs):
    """
    Utility wrapper to run a task asynchronously if Celery is available, 
    otherwise runs it synchronously in-process.
    """
    if celery_app and hasattr(task_func, "delay"):
        logger.info(f"[TASK] Submitting task '{task_func.__name__}' to Celery queue.")
        return task_func.delay(*args, **kwargs)
    else:
        logger.info(f"[TASK] Executing task '{task_func.__name__}' inline synchronously.")
        return task_func(*args, **kwargs)
