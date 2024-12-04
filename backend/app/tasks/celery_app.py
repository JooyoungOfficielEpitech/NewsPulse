from celery import Celery

# Celery 앱 초기화
app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",  # Redis 브로커
    backend="redis://localhost:6379/0",  # 결과 백엔드
)

# Celery 설정
app.conf.update(
    timezone="Asia/Seoul",
    enable_utc=False,
    result_expires=3600,  # 작업 결과 유지 시간 (초)
)

# Celery Beat 스케줄 설정
app.conf.beat_schedule = {
    "fetch-news-every-10-minutes": {
        "task": "app.tasks.tasks.fetch_and_store_news",
        "schedule": 600.0,  # 10분 간격
    },
}
