import pytest
from unittest.mock import patch, AsyncMock
from background.task import crawl_and_save_news


@pytest.fixture
def mock_crawl_news():
    """Mocked crawl_news_from_naver function"""
    with patch("background.task.crawl_news_from_naver") as mock_crawler:
        mock_crawler.return_value = [
            {
                "title": "Sample News 1",
                "description": "Sample Description 1",
                "url": "http://sample.com/news1",
                "published_at": "2024-01-01T12:00:00Z",
                "source": "Sample Source",
            },
            {
                "title": "Sample News 2",
                "description": "Sample Description 2",
                "url": "http://sample.com/news2",
                "published_at": "2024-01-02T12:00:00Z",
                "source": "Sample Source",
            },
        ]
        yield mock_crawler


@pytest.fixture
def mock_db_session():
    """Mocked AsyncSession for database interaction"""
    with patch("background.task.SessionLocal") as mock_session:
        mock_instance = AsyncMock()
        mock_session.return_value = mock_instance
        yield mock_instance


def test_crawl_and_save_news(mock_crawl_news, mock_db_session):
    """Test crawl_and_save_news task"""
    category_name = "technology"
    
    # Call the Celery task
    result = crawl_and_save_news(category_name)

    # Assertions for crawl_news_from_naver
    mock_crawl_news.assert_called_once_with(category_name, limit=10)  # Check the mock was called
    assert result["status"] == "success"
    assert result["category"] == category_name
    assert result["count"] == len(mock_crawl_news.return_value)

    # Assertions for database interactions
    assert mock_db_session.commit.called
    assert mock_db_session.close.called
