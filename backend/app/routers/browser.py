from fastapi import APIRouter, Depends, Query
from app.services.browser_agent import BrowserAgent
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/browser", tags=["browser"])
browser_agent = BrowserAgent()

@router.get("/search")
def search_web_pages(
    q: str = Query(..., description="Query search query to run against DuckDuckGo"),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers the browser agent to search and crawl target domains.
    """
    return browser_agent.perform_search(q)
