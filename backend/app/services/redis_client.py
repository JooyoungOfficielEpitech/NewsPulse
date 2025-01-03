import os
import redis

# Redis 클라이언트 초기화
redis_client = redis.StrictRedis(
    host=os.environ.get("REDIS_HOST", "redis"),  # 환경 변수로 호스트 설정
    port=int(os.environ.get("REDIS_PORT", 6379)),  # 환경 변수로 포트 설정
    db=0,  # 사용할 Redis 데이터베이스 인덱스
)
