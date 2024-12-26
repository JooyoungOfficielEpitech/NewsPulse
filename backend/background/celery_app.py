import os
from celery import Celery

# Celery 설정
broker_url = os.environ.get("REDIS_URL", "redis://redis:6379/0")
backend_url = os.environ.get("REDIS_URL", "redis://redis:6379/0")

celery_app = Celery("background", broker=broker_url, backend=backend_url)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


# # Task 모듈 임포트 (중요!!)
import background.task  # 작업이 정의된 모듈을 명시적으로 임포트
