from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

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
