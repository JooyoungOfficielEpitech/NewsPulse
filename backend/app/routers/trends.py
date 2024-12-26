from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

from app.database import get_db, async_get_db  # 데이터베이스 세션 의존성
from app.models.trend import Trend  # Trend 모델 가져오기
from app.services.trend_service import update_trends  # 트렌드 업데이트 함수 가져오기
from app.dependencies import get_current_user
from app.models.user import User
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.get("/")
def get_trends(
    categories: Optional[List[str]] = Query(None),
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    print(f"Authenticated User ID: {user.id}")  # 사용자 ID 디버깅
    query = db.query(Trend).filter(Trend.user_id == user.id)  # 사용자 ID로 필터링

    # 카테고리 필터 적용
    if categories:
        print(f"Filtering categories: {categories}")
        query = query.filter(Trend.category.in_(categories))

    # 시간 필터 적용
    if start_time:
        print(f"Filtering from start_time: {start_time}")
        query = query.filter(Trend.time >= start_time)
    if end_time:
        print(f"Filtering until end_time: {end_time}")
        query = query.filter(Trend.time <= end_time)

    trends = query.all()
    print(f"Fetched Trends: {trends}")  # 조회된 트렌드 디버깅

    if not trends:
        raise HTTPException(status_code=404, detail="No trends found")

    return trends



@router.post("/update/")
async def update_and_get_trends(
    categories: List[str],
    db: AsyncSession = Depends(async_get_db),
    user: User = Depends(get_current_user),
):
    """
    트렌드 데이터를 업데이트하고 결과를 반환하는 엔드포인트.
    """
    try:
        # 트렌드 업데이트
        await update_trends(db, categories, user_id=user.id)
        
        # 업데이트된 트렌드 조회
        result = await db.execute(
            select(Trend).filter(Trend.category.in_(categories), Trend.user_id == user.id)
        )
        updated_trends = result.scalars().all()

        if not updated_trends:
            return {"message": "Trends updated successfully, but no trends found in the database."}

        return {"message": "Trends updated successfully", "trends": updated_trends}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Failed to update trends: {str(e)}")


@router.get("/trend-data")
def get_trend_data(
    categories: Optional[List[str]] = Query(None, description="조회할 카테고리 목록"),
    interval_minutes: int = Query(60, description="시간 간격 (분 단위, 기본값: 60분)"),
    end_time: Optional[datetime] = Query(None, description="종료 시간 (기본값: 현재 시간)"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    특정 카테고리와 시간 간격에 따라 트렌드 데이터를 필터링하여 반환합니다.
    - categories: 카테고리 목록 (예: 경제, 정치)
    - interval_minutes: 시간 간격 (분 단위, 기본값: 60분)
    - end_time: 종료 시간 (기본값: 현재 시간)
    """
    if not end_time:
        end_time = datetime.utcnow()
    start_time = end_time - timedelta(minutes=interval_minutes)

    query = db.query(Trend).filter(Trend.user_id == user.id)  # 사용자 ID로 필터링

    # 카테고리 필터 적용
    if categories:
        query = query.filter(Trend.category.in_(categories))

    # 시간 범위 필터 적용
    query = query.filter(Trend.time >= start_time, Trend.time <= end_time)

    # 데이터 조회
    trends = query.all()

    if not trends:
        return {
            "interval_start": start_time,
            "interval_end": end_time,
            "data": [],
        }

    # 데이터 그룹화 및 응답 형식 정리
    result = {}
    for trend in trends:
        if trend.category not in result:
            result[trend.category] = []
        result[trend.category].append({
            "time": trend.time,
            "count": trend.count,
        })

    return {
        "interval_start": start_time,
        "interval_end": end_time,
        "data": result,
    }
