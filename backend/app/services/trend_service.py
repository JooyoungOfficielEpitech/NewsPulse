from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.trend import Trend
from app.services.news_service import fetch_news_from_api
from app.database import SessionLocal
from app.services.news_crawler import crawl_news_from_naver
from app.models.category import Category



def update_trends(db: Session, keywords: list[str], limit: int = 100):
    """
    제공된 키워드 목록을 기준으로 트렌드를 업데이트합니다.
    """
    current_time = datetime.utcnow()
    
    all_trends = {}
    for keyword in keywords:
        crawled_articles = crawl_news_from_naver(keyword, limit=limit)
        count = len(crawled_articles)
        all_trends[keyword] = count
        
        existing_trend = (
            db.query(Trend)
            .filter(Trend.category == keyword, Trend.time == current_time)
            .first()
        )
        
        if existing_trend:
            # 기존 트렌드 업데이트
            existing_trend.count = count
        else:
            # 새로운 트렌드 데이터 추가
            new_trend = Trend(
                category=keyword,
                time=current_time,
                count=count,
            )
            db.add(new_trend)

    # 변경사항 커밋
    db.commit()
        
        
    return {"message": "Trends updated successfully", "trends": all_trends}



def update_trend_from_api_by_scheduler():
    """
    관심 카테고리를 기준으로 지난 10분간의 기사를 가져와 DB에 저장합니다.
    """
    db = SessionLocal()

    try:
        # 1. 관심 카테고리를 DB에서 불러오기
        categories_from_db = db.query(Category).all()

        if not categories_from_db:
            print("No categories found in the database.")
            return
        
        categorie_names = [cat.name for cat in categories_from_db]
        
        update_trends(db, categorie_names)
        
        print(f"updated trends as follow : {categorie_names}")
        
    except Exception as e:
        print(f"Error while updating trends: {e}")
    finally:
        db.close()