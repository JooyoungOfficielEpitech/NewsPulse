from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from app.dependencies import get_current_user
from app.models.user import User  # User 모델 가져오기

router = APIRouter()

# Mock 사용자 설정 데이터
user_preferences = {}

class UserPreferences(BaseModel):
    user_id: str
    selected_categories: List[str]
    alert_keywords: List[str]

@router.post("/preferences")
def save_preferences(preferences: UserPreferences):
    user_preferences[preferences.user_id] = preferences
    return {"message": "Preferences saved successfully"}

@router.get("/preferences")
def get_preferences(user_id: str):
    return user_preferences.get(user_id, {})

# 사용자 정보를 반환하는 엔드포인트
@router.get("/me")
def get_user_info(user: User = Depends(get_current_user)):
    """
    현재 로그인된 사용자의 정보를 반환합니다.
    """
    if not user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    return {
        "user_id": user.id,
        "username": user.username,
    }
