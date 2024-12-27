import logging
from .celery_app import celery_app
from app.services.news_crawler import crawl_news_from_naver
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import SessionLocal
from app.models.news import News
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError

# 로거 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@celery_app.task
def crawl_and_save_news(category_name: str, user_id: int):
    logger.info(f"Starting Celery task for category '{category_name}', user_id={user_id}")
    fetched_news = []

    try:
        # Scrapy 크롤링 실행
        fetched_news = crawl_news_from_naver(category_name, limit=10)
        logger.info(f"Scrapy crawl completed. Articles fetched: {len(fetched_news)}")
    except Exception as e:
        logger.error(f"Scrapy crawl failed: {e}")
        return {"status": "failure", "error": str(e)}

    # 데이터베이스 저장
    db: AsyncSession = SessionLocal()
    try:
        for news in fetched_news:
            stmt = insert(News).values(
                title=news["title"],
                description=news["description"],
                url=news["url"],
                published_at=news["published_at"],
                source=news["source"],
                category=category_name,
                user_id=user_id,
            ).on_conflict_do_nothing(index_elements=["url"])
            db.execute(stmt)
        db.commit()
        logger.info(f"Successfully saved news for category '{category_name}' and user_id={user_id}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"IntegrityError: {e}")
        return {"status": "failure", "error": str(e)}
    finally:
        db.close()

    return {"status": "success", "category": category_name, "count": len(fetched_news)}
