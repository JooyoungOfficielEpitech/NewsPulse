from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt  # PyJWT 라이브러리
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db, async_get_db
from app.models.user import User
from sqlalchemy.future import select

# JWT 설정
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

# OAuth2PasswordBearer를 사용해 토큰을 받아옴
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(async_get_db)) -> User:
    """
    JWT 토큰을 검증하고 현재 인증된 사용자를 반환.
    """
    try:
        print("Received Token:", token)  # 토큰 출력
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("Decoded Payload:", payload)  # 디코딩된 페이로드 출력
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        print("Token has expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        print("Invalid token:", str(e))
        raise HTTPException(status_code=401, detail="Invalid token")

    # 데이터베이스에서 사용자 조회
    result = await db.execute(select(User).filter(User.username == username))
    user = result.scalar_one_or_none()
    if user is None:
        print("User not found:", username)
        raise HTTPException(status_code=401, detail="User not found")
    print("Authenticated User:", user.username)  # 사용자 정보 출력
    return user
