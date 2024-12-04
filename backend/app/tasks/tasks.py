from app.tasks.celery_app import app  # Celery 앱 가져오기
from app.services.news_service import fetch_news_from_api, save_news_to_db
from app.config import settings

@app.task
def fetch_and_store_news():
    """
    뉴스 데이터를 외부 API에서 가져와 데이터베이스에 저장하는 작업.
    """
    try:
        # API에서 뉴스 데이터 가져오기
        news_data = fetch_news_from_api(settings.NEWS_API_KEY, category="general", limit=20)
        
        # DB에 저장
        save_news_to_db(news_data["articles"])
    except Exception as e:
        # 에러 발생 시 로깅 또는 알림
        print(f"Error in fetch_and_store_news: {e}")
