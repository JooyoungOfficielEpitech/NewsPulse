import logging
from .celery_app import celery_app
from app.services.news_crawler import crawl_news_from_naver
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session
from app.models.news import News
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError
import traceback
from sqlalchemy.future import select
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from asyncio import run
from datetime import datetime
from langchain.schema import Document
from app.services.redis_client import redis_client
import pickle

from dotenv import load_dotenv
import os

load_dotenv()

# 로거 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@celery_app.task
def crawl_and_save_news(category_name: str, user_id: int):
    import asyncio
    asyncio.run(crawl_and_save_news_async(category_name, user_id))


async def crawl_and_save_news_async(category_name: str, user_id: int):
    logger.info(f"Starting Celery task for category '{category_name}', user_id={user_id}")
    fetched_news = []

    try:
        # 뉴스 크롤링 실행
        fetched_news = crawl_news_from_naver(category_name, limit=10)
        logger.info(f"Crawling completed. Articles fetched: {len(fetched_news)}")
    except Exception as e:
        logger.error(f"Crawling failed: {e}\n{traceback.format_exc()}")
        return {"status": "failure", "error": str(e)}

    # 데이터베이스 저장
    db: AsyncSession = async_session()
    try:
        for news in fetched_news:
            # 문자열로 제공된 published_at을 datetime 형식으로 변환
            published_at = (
                datetime.strptime(news["published_at"], "%Y-%m-%d %H:%M:%S")
                if news["published_at"]
                else None
            )
            stmt = insert(News).values(
                title=news["title"],
                description=news["description"],
                url=news["url"],
                published_at=published_at,
                source=news["source"],
                category=category_name,
                user_id=user_id,
            ).on_conflict_do_nothing(index_elements=["url"])
            await db.execute(stmt)
        await db.commit()
        logger.info(f"Successfully saved news for category '{category_name}' and user_id={user_id}")

        # 뉴스 데이터를 벡터화
        create_user_vectorstore_task.delay(user_id)
        logger.info(f"Vectorization task queued for user_id={user_id}")

    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError while saving news: {e}")
        return {"status": "failure", "error": str(e)}

    except Exception as e:
        logger.error(f"Error during data processing for user_id={user_id}: {e}\n{traceback.format_exc()}")
        return {"status": "failure", "error": str(e)}

    finally:
        await db.close()

    return {"status": "success", "category": category_name, "count": len(fetched_news)}


@celery_app.task
def create_user_vectorstore_task(user_id: int):
    run(create_user_vectorstore(user_id))  # asyncio.run으로 실행


async def create_user_vectorstore(user_id: int):
    """
    유저별 뉴스 데이터를 벡터화하여 디스크에 저장하고, 경로를 Redis에 저장.

    Args:
        user_id (int): 유저 ID.
    """
    db: AsyncSession = async_session()

    try:
        # 유저의 뉴스 데이터 가져오기
        result = await db.execute(select(News).filter(News.user_id == user_id))
        news_list = result.scalars().all()

        if not news_list:
            logger.info(f"No news data found for user_id={user_id}")
            return None

        # 뉴스 데이터를 Document 객체로 변환
        documents = [
            Document(
                page_content=f"{news.title}\n\n{news.description}",
                metadata={"id": news.id}
            )
            for news in news_list
        ]

        # 텍스트 분할
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(documents)

        # 디스크 저장소 경로 설정
        persist_directory = f"./chroma_data/user_{user_id}"

        # 벡터 스토어 생성
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=OpenAIEmbeddings(),
            collection_name=f"user_{user_id}_news",
            persist_directory=persist_directory,  # 디스크 기반 경로 설정
        )
        logger.info(f"Vector store created for user_id={user_id} at {persist_directory}")

        # Redis에 경로 저장
        redis_client.set(f"user_vectorstore:{user_id}", persist_directory)
        logger.info(f"Persist directory path saved to Redis for user_id={user_id}")

    except Exception as e:
        logger.error(f"Failed to create vector store for user_id={user_id}: {e}\n{traceback.format_exc()}")
        return None

    finally:
        await db.close()
