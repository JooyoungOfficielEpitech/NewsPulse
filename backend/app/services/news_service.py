import httpx
from app.database import SessionLocal
from app.models.news import News

from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models.category import Category

from background.task import crawl_and_save_news



def fetch_news_from_api(api_key: str, category: str = "general", limit: int = 10, from_date: str = None, to_date: str = None):
    url = "https://newsapi.org/v2/everything"
    params = {
        "apiKey": api_key,
        "q": "*",  # 기본값으로 모든 기사
        "language": "ko",
        "sortBy": "publishedAt",
        "pageSize": limit,
    }

    if from_date:
        params["from"] = from_date
    if to_date:
        params["to"] = to_date
    if category:
        params["q"] = category

    response = httpx.get(url, params=params)

    if response.status_code == 200:
        print("Success:", response.json())
        
        return response.json()
    else:
        print("Error:", response.status_code, response.text)
        return {"error": response.status_code, "message": response.text}

def save_news_to_db(news_items: list, category : str):
    db = SessionLocal()
    try:
        for item in news_items:
            try:
                if not db.query(News).filter(News.url == item["url"]).first():
                    news = News(
                        title=item["title"],
                        description=item["description"],
                        url=item["url"],
                        published_at=item["published_at"],
                        category=category,
                        source=item["source"],
                    )
                    db.add(news)
            except Exception as e:
                print(f"Error saving news : {e}")
        db.commit()
    finally:
        db.close()


def update_news_from_api_by_scheduler():
    """
    관심 카테고리를 기준으로 지난 10분간의 기사를 가져와 DB에 저장합니다.
    """
    db = SessionLocal()

    try:
        # 1. 관심 카테고리를 DB에서 불러오기
        categories_from_db = db.query(Category).all()

        if not categories_from_db:
            print("No categories found in the database.")
            return

        # 2. 지난 10분간의 기사 불러오기
        current_time = datetime.utcnow()
        ten_minutes_ago = current_time - timedelta(minutes=10)

        for category in categories_from_db:
            category_name = category.name  # 카테고리 이름 필드
            category_id = category.id
            print(f"Fetching news for category: {category_name}")

            task = crawl_and_save_news.delay(category_name, category_id)

    except Exception as e:
        print(f"Error while updating news: {e}")
    finally:
        db.close()