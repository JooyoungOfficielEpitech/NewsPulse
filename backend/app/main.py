from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import news, trends, user

app = FastAPI()

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

@app.get("/")
def read_root():
    return {"message": "Welcome to NewsPulse Backend"}
