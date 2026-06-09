import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AetherMind AI Backend Workstation"
    API_V1_STR: str = "/api/v1"
    
    # Auth Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "SUPER_SECRET_ALGORITHM_SIGNING_KEY_XYZ_123_456")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database Settings
    POSTGRES_USER: Optional[str] = os.getenv("POSTGRES_USER", None)
    POSTGRES_PASSWORD: Optional[str] = os.getenv("POSTGRES_PASSWORD", None)
    POSTGRES_HOST: Optional[str] = os.getenv("POSTGRES_HOST", None)
    POSTGRES_PORT: Optional[str] = os.getenv("POSTGRES_PORT", None)
    POSTGRES_DB: Optional[str] = os.getenv("POSTGRES_DB", None)
    
    # SQLite fallback file
    SQLITE_DB_FILE: str = "aethermind.db"

    @property
    def DATABASE_URL(self) -> str:
        # If PostgreSQL configuration is provided, use it. Otherwise, default to local SQLite.
        if all([self.POSTGRES_USER, self.POSTGRES_PASSWORD, self.POSTGRES_HOST, self.POSTGRES_DB]):
            port = self.POSTGRES_PORT or "5432"
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{port}/{self.POSTGRES_DB}"
        return f"sqlite:///./{self.SQLITE_DB_FILE}"

    # Redis/Celery Settings (with fallback to in-process sync queue if Redis is missing)
    REDIS_HOST: Optional[str] = os.getenv("REDIS_HOST", None)
    REDIS_PORT: str = os.getenv("REDIS_PORT", "6379")
    
    @property
    def CELERY_BROKER_URL(self) -> Optional[str]:
        if self.REDIS_HOST:
            return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
        return None
        
    @property
    def CELERY_RESULT_BACKEND(self) -> Optional[str]:
        if self.REDIS_HOST:
            return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
        return None

    # Premium API Keys
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY", None)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    DEEPSEEK_API_KEY: Optional[str] = os.getenv("DEEPSEEK_API_KEY", None)
    MISTRAL_API_KEY: Optional[str] = os.getenv("MISTRAL_API_KEY", None)

    # Free AI API Keys (no credit card required)
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", None)          # console.groq.com — free
    OPENROUTER_API_KEY: Optional[str] = os.getenv("OPENROUTER_API_KEY", None)  # openrouter.ai — free :free models

    # Local Free Open Source default (Ollama/Llama-3)
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    DEFAULT_OPEN_SOURCE_MODEL: str = "llama3"

    # Vector Databases Configs (Chroma DB is default local SQLite-backed)
    PINECONE_API_KEY: Optional[str] = os.getenv("PINECONE_API_KEY", None)
    PINECONE_ENVIRONMENT: Optional[str] = os.getenv("PINECONE_ENVIRONMENT", None)
    QDRANT_URL: Optional[str] = os.getenv("QDRANT_URL", None)
    QDRANT_API_KEY: Optional[str] = os.getenv("QDRANT_API_KEY", None)
    WEAVIATE_URL: Optional[str] = os.getenv("WEAVIATE_URL", None)
    WEAVIATE_API_KEY: Optional[str] = os.getenv("WEAVIATE_API_KEY", None)
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

    # Cors Origin Settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
