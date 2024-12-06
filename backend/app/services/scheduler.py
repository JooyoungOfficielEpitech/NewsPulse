from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.news_service import update_news_from_api_by_scheduler
from app.services.trend_service import update_trend_from_api_by_scheduler

def schedule_tasks():
    scheduler = AsyncIOScheduler()

    # 뉴스 업데이트 작업 추가
    scheduler.add_job(
        update_news_from_api_by_scheduler,
        "interval",
        minutes=100,
    )

    # 트렌드 업데이트 작업 추가
    scheduler.add_job(
        update_trend_from_api_by_scheduler,
        "interval",
        minutes=30,
    )

    # 스케줄러 시작
    scheduler.start()
