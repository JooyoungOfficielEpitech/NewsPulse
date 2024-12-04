from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

from app.database import get_db  # 데이터베이스 세션 의존성
from app.models.trend import Trend  # Trend 모델 가져오기
from app.services.trend_service import update_trends  # 트렌드 업데이트 함수 가져오기
from app.config import settings


router = APIRouter()

@router.get("/")
def get_trends(
    categories: Optional[List[str]] = Query(None),
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    """
    트렌드 데이터를 조회하는 API 엔드포인트.
    카테고리와 시간 범위로 필터링할 수 있습니다.
    """
    query = db.query(Trend)

    # 카테고리 필터 적용
    if categories:
        query = query.filter(Trend.category.in_(categories))

    # 시간 필터 적용
    if start_time:
        query = query.filter(Trend.time >= start_time)
    if end_time:
        query = query.filter(Trend.time <= end_time)

    # 데이터 조회
    trends = query.all()

    if not trends:
        raise HTTPException(status_code=404, detail="No trends found")

    return trends

@router.post("/")
def add_trend(category: str, count: int, db: Session = Depends(get_db)):
    """
    새로운 트렌드 데이터를 추가하는 엔드포인트.
    """
    trend = Trend(category=category, time=datetime.utcnow(), count=count)
    db.add(trend)
    db.commit()
    return {"message": "Trend added successfully", "trend": trend}

@router.post("/update/")
def update_and_get_trends(categories: List[str], db: Session = Depends(get_db)):
    """
    트렌드 데이터를 업데이트하고 결과를 반환하는 엔드포인트.
    """
    try:
        # 트렌드 업데이트
        update_trends(db, categories)
        
        # 업데이트된 트렌드 조회
        updated_trends = db.query(Trend).filter(Trend.category.in_(categories)).all()

        if not updated_trends:
            return {"message": "Trends updated successfully, but no trends found in the database."}

        return {"message": "Trends updated successfully", "trends": updated_trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update trends: {str(e)}")


@router.get("/trend-data")
def get_trend_data(
    categories: Optional[List[str]] = Query(None, description="조회할 카테고리 목록"),
    interval_minutes: int = Query(60, description="시간 간격 (분 단위, 기본값: 60분)"),
    end_time: Optional[datetime] = Query(None, description="종료 시간 (기본값: 현재 시간)"),
    db: Session = Depends(get_db),
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

    query = db.query(Trend)

    # 카테고리 필터 적용
    if categories:
        query = query.filter(Trend.category.in_(categories))

    # 시간 범위 필터 적용
    query = query.filter(Trend.time >= start_time, Trend.time <= end_time)

    # 데이터 조회
    trends = query.all()

    if not trends:
        raise HTTPException(status_code=404, detail="No trend data found for the specified parameters")

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