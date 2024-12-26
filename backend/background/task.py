from .celery_app import celery_app
from app.services.news_crawler import crawl_news_from_naver  # 기존 크롤링 함수
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import SessionLocal, settings
from app.models.news import News
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError


# Celery 작업 정의
@celery_app.task
def crawl_and_save_news(category_name: str, user_id: int):
    print("시작 전 세팅 관리", settings)
    fetched_news = crawl_news_from_naver(category_name, limit=10)

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
                user_id=user_id,  # user_id 추가
            ).on_conflict_do_nothing(index_elements=["url"])  # 중복시 무시

            db.execute(stmt)
        db.commit()
        print(f"Successfully saved news for category '{category_name}' and user_id={user_id}.")
    except IntegrityError as e:
        db.rollback()
        print(f"IntegrityError: {e}")
    finally:
        db.close()

    return {"status": "success", "category": category_name, "count": len(fetched_news)}
