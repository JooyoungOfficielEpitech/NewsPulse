from fastapi import APIRouter, Depends, HTTPException, Form, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import async_get_db
from app.models.user import User
from passlib.context import CryptContext
import jwt  # PyJWT 사용

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


class UserRegisterRequest(BaseModel):
    username: str
    password: str


@router.post("/register")
async def register(
    request: Request,
    db: AsyncSession = Depends(async_get_db),
):
    """
    회원가입: JSON 및 Form 데이터를 지원하여 사용자 정보를 저장합니다.
    """
    # 요청 Content-Type에 따라 분기 처리
    if request.headers.get("Content-Type") == "application/json":
        # JSON 요청 처리
        body = await request.json()
        username = body.get("username")
        password = body.get("password")
    elif request.headers.get("Content-Type") == "application/x-www-form-urlencoded":
        # Form 요청 처리
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
    else:
        raise HTTPException(status_code=415, detail="Unsupported Content-Type")

    # 유효성 검사
    if not username or not password:
        raise HTTPException(status_code=400, detail="Invalid input")

    # 사용자 중복 확인
    result = await db.execute(select(User).filter(User.username == username))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    # 비밀번호 해싱 및 저장
    hashed_password = pwd_context.hash(password)
    user = User(username=username, hashed_password=hashed_password)
    db.add(user)
    await db.commit()
    return {"message": "User registered successfully"}


@router.post("/login")
async def login(
    request: Request,
    db: AsyncSession = Depends(async_get_db),
):
    """
    로그인: JSON 및 Form 데이터를 지원하여 사용자 인증 후 JWT 토큰 반환.
    """
    # 요청 Content-Type에 따라 분기 처리
    if request.headers.get("Content-Type") == "application/json":
        # JSON 요청 처리
        body = await request.json()
        username = body.get("username")
        password = body.get("password")
    elif request.headers.get("Content-Type") == "application/x-www-form-urlencoded":
        # Form 요청 처리
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
    else:
        raise HTTPException(status_code=415, detail="Unsupported Content-Type")

    # 유효성 검사
    if not username or not password:
        raise HTTPException(status_code=400, detail="Invalid input")

    # 사용자 조회
    result = await db.execute(select(User).filter(User.username == username))
    user = result.scalars().first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # JWT 토큰 생성
    token = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}
