from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db, async_get_db
from app.models.category import Category
from app.models.user_category import UserCategory
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse
from app.dependencies import get_current_user
from app.services.news_crawler import crawl_news_from_naver
from app.services.news_service import save_news_to_db
from background.task import crawl_and_save_news

router = APIRouter()

@router.post("/", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    db: AsyncSession = Depends(async_get_db),
    user: User = Depends(get_current_user)
):
    """
    로그인된 유저가 새로운 카테고리를 추가.
    """
    # 전역적으로 카테고리 존재 여부 확인
    result = await db.execute(select(Category).filter(Category.name == category.name))
    existing_category = result.scalar_one_or_none()
    if not existing_category:
        print("존재하지 않는 카테고리!!!")
        # 전역 카테고리가 없으면 새로 생성
        new_category = Category(name=category.name)
        db.add(new_category)
        await db.commit()
        await db.refresh(new_category)
        existing_category = new_category
    
    # 유저별 카테고리 추가 확인
    result = await db.execute(
        select(UserCategory).filter(
            UserCategory.user_id == user.id, UserCategory.category_id == existing_category.id
        )
    )
    user_category = result.scalar_one_or_none()
    if user_category:
        raise HTTPException(status_code=400, detail="Category already added by the user")

    # 유저와 카테고리 연결
    user_category = UserCategory(user_id=user.id, category_id=existing_category.id)
    db.add(user_category)
    await db.commit()

    # 뉴스 크롤링 작업 트리거
    crawl_and_save_news.delay(existing_category.name, user.id)

    return existing_category


@router.get("/", response_model=list[CategoryResponse])
async def get_user_categories(
    db: AsyncSession = Depends(async_get_db),
    user: User = Depends(get_current_user)
):
    """
    로그인된 유저의 카테고리 조회.
    """
    # 유저의 카테고리 조회
    result = await db.execute(
        select(Category).join(UserCategory).filter(UserCategory.user_id == user.id)
    )
    categories = result.scalars().all()
    return categories


@router.delete("/{category_id}", response_model=dict)
async def delete_user_category(
    category_id: int,
    db: AsyncSession = Depends(async_get_db),
    user: User = Depends(get_current_user)
):
    """
    로그인된 유저의 특정 카테고리를 삭제.
    """
    # 유저 카테고리 연결 확인
    result = await db.execute(
        select(UserCategory).filter(
            UserCategory.user_id == user.id, UserCategory.category_id == category_id
        )
    )
    user_category = result.scalar_one_or_none()
    if not user_category:
        raise HTTPException(status_code=404, detail="Category not found for the user")

    # 유저-카테고리 연결 삭제
    await db.delete(user_category)
    await db.commit()

    return {"message": "Category removed successfully"}
