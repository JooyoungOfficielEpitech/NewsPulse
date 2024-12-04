from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.news_service import fetch_news_from_api, save_news_to_db
from app.config import settings
from app.models.news import News
from app.services.news_crawler import crawl_news_from_naver


router = APIRouter()

@router.get("/")
def get_news(category: str = None, db: Session = Depends(get_db)):
    query = db.query(News).order_by(News.published_at.desc())
    if category:
        query = query.filter(News.category == category)
    return query.all()

@router.post("/fetch")
def fetch_news(category: str = "general", limit: int = 10):
    data = crawl_news_from_naver(category, limit)
    save_news_to_db(data, category)
    return {"status": "success", "fetched": len(data)}
