from apscheduler.schedulers.background import BackgroundScheduler
from app.services.news_service import fetch_news_from_api, save_news_to_db, update_news_from_api_by_scheduler
from app.services.trend_service import update_trend_from_api_by_scheduler
from app.config import settings

def schedule_tasks():
    scheduler = BackgroundScheduler()
    
    # 뉴스 업데이트
    scheduler.add_job(
        lambda: update_news_from_api_by_scheduler(),
        "interval",
        minutes=1,
    )
    
    # 트렌드 업데이트
    scheduler.add_job(
        lambda: update_trend_from_api_by_scheduler(),
        "interval",
        minutes=1,
    )
    
    
    scheduler.start()
