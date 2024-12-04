from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import news, user, category

from app.services.scheduler import schedule_tasks

from app.database import engine, Base
from app.routers import trends

# 테이블 생성
Base.metadata.create_all(bind=engine)




schedule_tasks()

app = FastAPI()

# @app.on_event("startup")
# async def startup():
#     print("Dropping all tables...")
#     Base.metadata.drop_all(bind=engine)  # 기존 테이블 삭제
#     print("Creating all tables...")
#     Base.metadata.create_all(bind=engine)  # 테이블 다시 생성
#     print("Database reset complete.")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인을 허용. 필요에 따라 도메인을 제한 가능.
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
)

# Include Routers
app.include_router(news.router, prefix="/news", tags=["news"])
app.include_router(trends.router, prefix="/trends", tags=["trends"])
app.include_router(user.router, prefix="/user", tags=["user"])
app.include_router(category.router, prefix="/category", tags=["category"])

@app.get("/")
def read_root():
    return {"message": "Welcome to NewsPulse Backend"}
