from fastapi import APIRouter, Query
from typing import List

router = APIRouter()

# Mock 데이터
news_data = [
    {"id": "1", "title": "경제 뉴스 1", "category": "경제", "summary": "경제 요약...", "url": "#", "published_at": "2024-12-02T10:00:00"},
    {"id": "2", "title": "정치 뉴스 1", "category": "정치", "summary": "정치 요약...", "url": "#", "published_at": "2024-12-02T10:05:00"},
]

@router.get("/")
def get_news(category: str = Query(None), limit: int = 10):
    if category:
        filtered_news = [news for news in news_data if news["category"] == category]
        return filtered_news[:limit]
    return news_data[:limit]
