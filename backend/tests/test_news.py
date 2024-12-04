import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.news import News
from app.services.news_service import fetch_news_from_api, save_news_to_db

# 가상 SQLite 데이터베이스 설정
@pytest.fixture(scope="function")
def test_db():
    engine = create_engine("sqlite:///:memory:", echo=False)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    engine.dispose()

@pytest.fixture(scope="function")
def mock_api_response():
    return {
        "status": "ok",
        "totalResults": 2,
        "articles": [
            {
                "title": "Title 1",
                "description": "Description 1",
                "url": "http://example.com/1",
                "publishedAt": "2024-12-03T00:00:00Z",
                "category": "general",
            },
            {
                "title": "Title 2",
                "description": "Description 2",
                "url": "http://example.com/2",
                "publishedAt": "2024-12-03T01:00:00Z",
                "category": "general",
            },
        ],
    }

@patch("app.services.news_service.httpx.get")
def test_fetch_news_from_api(mock_get, mock_api_response):
    mock_get.return_value = MagicMock(status_code=200, json=lambda: mock_api_response)
    api_key = "test_api_key"
    response = fetch_news_from_api(api_key)

    mock_get.assert_called_once_with(
        "https://newsapi.org/v2/top-headlines",
        params={
            "apiKey": api_key,
            "category": "general",
            "country": "kr",
            "pageSize": 10,
        },
    )

    assert response == mock_api_response

def test_save_news_to_db(test_db, mock_api_response):
    # News 저장 함수 테스트
    save_news_to_db(mock_api_response["articles"])

    # DB에 데이터가 저장되었는지 확인
    news_items = test_db.query(News).all()
    assert len(news_items) == 2
    assert news_items[0].title == "Title 1"
    assert news_items[1].title == "Title 2"

    # 중복된 데이터를 다시 저장해도 DB 내용은 변경되지 않아야 함
    save_news_to_db(mock_api_response["articles"])
    news_items = test_db.query(News).all()
    assert len(news_items) == 2
