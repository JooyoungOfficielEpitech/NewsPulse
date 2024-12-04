from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.category import Category
from app.models.news import News  # News 모델 추가
from app.schemas.category import CategoryCreate, CategoryResponse
from app.services.news_crawler import crawl_news_from_naver
from app.services.news_service import save_news_to_db

router = APIRouter(prefix="/categories", tags=["categories"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    # Check if category already exists
    existing_category = db.query(Category).filter(Category.name == category.name).first()
    if existing_category:
        raise HTTPException(status_code=400, detail="Category already exists")

    new_category = Category(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    # Fetch and save news for the new category
    fetched_news = crawl_news_from_naver(new_category.name, limit=10)
    save_news_to_db(fetched_news, new_category.name)

    return new_category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, updated_category: CategoryCreate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    category.name = updated_category.name
    db.commit()
    db.refresh(category)

    # Fetch and save news for the updated category
    fetched_news = crawl_news_from_naver(category.name, limit=10)
    save_news_to_db(fetched_news, category.name, db)

    return category


@router.get("/", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories


@router.delete("/{category_id}", response_model=CategoryResponse)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(category)
    db.commit()
    return category
