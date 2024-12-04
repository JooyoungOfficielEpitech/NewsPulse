from collections import Counter
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.news import News
from app.models.trend import Trend
from app.models.category import Category
from konlpy.tag import Okt  # 한국어 형태소 분석기
from app.database import SessionLocal



def update_trends(db: Session, keywords: list[str], hours: int = 24):
    """
    제공된 키워드 목록을 기준으로 트렌드를 업데이트합니다.
    """
    now = datetime.utcnow()
    start_time = now - timedelta(hours=hours)

    # 최근 뉴스 데이터 조회
    recent_news = db.query(News).filter(News.published_at >= start_time).all()

    if not recent_news:
        print("No recent news found.")
        return

    # 모든 뉴스의 제목과 설명 합치기
    all_text = " ".join(news.title + " " + news.description for news in recent_news)

    # 키워드 언급 횟수 초기화
    keyword_counts = {category: 0 for category in keywords}

    # 형태소 분석 및 명사 추출
    okt = Okt()
    extracted_words = okt.nouns(all_text)

    # 카테고리 키워드 매칭
    for word in extracted_words:
        if word in keyword_counts:
            keyword_counts[word] += 1

    # Trend 테이블에 항상 새로운 데이터 추가
    for category, count in keyword_counts.items():
        new_trend = Trend(category=category, count=count, time=now)
        db.add(new_trend)

    db.commit()
    print("Added new trends based on categories.")




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