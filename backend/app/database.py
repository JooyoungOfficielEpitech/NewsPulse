from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# 데이터베이스 엔진 생성

async_engine = create_async_engine(settings.DATABASE_URL, echo=True)


async_session = sessionmaker(
    async_engine,
    expire_on_commit=False,
    class_=AsyncSession
)

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


async def async_get_db():
    async with async_session() as db:
        yield db