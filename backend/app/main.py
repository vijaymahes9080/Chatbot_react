from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
# Import models to ensure they are registered with Base metadata for auto-creation
import app.models  
from app.routers import (
    auth,
    chat,
    conversation,
    models_api,
    rag,
    vector,
    mcp,
    tools,
    browser,
    files,
    memory,
    dashboard,
    settings as settings_router
)

# Initialize database tables on startup (PostgreSQL or SQLite fallback)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise-grade AI Chatbot Platform Backend Orchestrator",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Policy configuration (Allows direct Vite frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route prefixes
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(conversation.router, prefix=settings.API_V1_STR)
app.include_router(models_api.router, prefix=settings.API_V1_STR)
app.include_router(rag.router, prefix=settings.API_V1_STR)
app.include_router(vector.router, prefix=settings.API_V1_STR)
app.include_router(mcp.router, prefix=settings.API_V1_STR)
app.include_router(tools.router, prefix=settings.API_V1_STR)
app.include_router(browser.router, prefix=settings.API_V1_STR)
app.include_router(files.router, prefix=settings.API_V1_STR)
app.include_router(memory.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "api_docs": "/docs",
        "api_prefix": settings.API_V1_STR,
        "database": "SQLite" if settings.DATABASE_URL.startswith("sqlite") else "PostgreSQL"
    }
