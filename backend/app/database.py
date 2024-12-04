from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# 데이터베이스 엔진 생성

engine = create_engine(settings.DATABASE_URL)
print(settings.DATABASE_URL)

# 세션 관리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 생성
Base = declarative_base()

# 세션 종속성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
