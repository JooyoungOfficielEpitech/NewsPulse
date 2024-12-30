from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import news, user, category, auth, trends
from app.services.scheduler import schedule_tasks
from app.database import engine, Base
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # print("Application startup: resetting database...")
    # Base.metadata.drop_all(bind=engine)
    # print("Existing tables dropped.")
    # Base.metadata.create_all(bind=engine)
    # print("New tables created.")

    # 스케줄링 작업 시작
    schedule_tasks()
    print("Scheduler started.")

    yield  # 애플리케이션 실행

    print("Application shutdown: cleanup tasks...")
    # 필요한 종료 작업 수행
    print("Shutdown complete.")

# Lifespan 핸들러를 FastAPI에 추가
print("Initializing FastAPI Application...")
app = FastAPI(lifespan=lifespan)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트엔드 URL
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
)

# Include Routers
app.include_router(news.router, prefix="/news", tags=["news"])
app.include_router(trends.router, prefix="/trends", tags=["trends"])
app.include_router(user.router, prefix="/user", tags=["user"])
app.include_router(category.router, prefix="/category", tags=["category"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/")
async def read_root():
    return {
        "message": "Hello, NewsPulse!",
        "routes": [route.path for route in app.routes],
    }
