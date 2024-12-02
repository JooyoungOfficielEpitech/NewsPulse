from fastapi import APIRouter, Query
from typing import List

router = APIRouter()

# Mock 트렌드 데이터
trend_data = {
    "경제": [{"time": "00:00", "count": 50}, {"time": "04:00", "count": 60}],
    "정치": [{"time": "00:00", "count": 30}, {"time": "04:00", "count": 40}],
}

@router.get("/")
def get_trends(categories: List[str] = Query(None)):
    if not categories:
        return trend_data
    return {category: trend_data.get(category, []) for category in categories}
