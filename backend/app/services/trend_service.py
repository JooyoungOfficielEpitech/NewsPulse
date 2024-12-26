from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from collections import Counter
from datetime import datetime, timedelta
from app.models.news import News
from app.models.trend import Trend
from app.models.category import Category
from app.database import async_session
from konlpy.tag import Okt  # 형태소 분석기


async def update_trends(db: AsyncSession, keywords: list[str], user_id: int, hours: int = 24):
    now = datetime.utcnow()
    start_time = now - timedelta(hours=hours)

    try:
        print(f"Updating trends for user_id={user_id}...")

        # 최근 뉴스 데이터 조회
        result = await db.execute(
            select(News).filter(News.user_id == user_id, News.published_at >= start_time)
        )
        recent_news = result.scalars().all()

        if not recent_news:
            print("No recent news found for user.")
            return

        # 모든 뉴스의 제목과 설명 합치기
        all_text = " ".join(news.title + " " + news.description for news in recent_news)
        print(f"Aggregated text for user_id={user_id}: {all_text}")

        # 형태소 분석 및 명사 추출
        okt = Okt()
        extracted_words = okt.nouns(all_text)

        # 키워드 매칭
        keyword_counts = Counter(extracted_words)
        for category in keywords:
            count = keyword_counts.get(category, 0)
            new_trend = Trend(category=category, count=count, time=now, user_id=user_id)
            db.add(new_trend)

        await db.commit()
        print(f"Trends updated successfully for user_id={user_id}.")

    except Exception as e:
        print(f"Error in update_trends for user_id={user_id}: {e}")


async def update_trend_from_api_by_scheduler():
    async with async_session() as db:
        try:
            # 모든 카테고리를 가져오기
            result = await db.execute(select(Category))
            categories_from_db = result.scalars().all()

            if not categories_from_db:
                print("No categories found.")
                return

            # 사용자별로 트렌드를 업데이트
            for category in categories_from_db:
                user_id = category.user_id  # 각 카테고리에 연결된 사용자 ID
                category_names = [cat.name for cat in categories_from_db if cat.user_id == user_id]
                await update_trends(db, category_names, user_id=user_id)

        except Exception as e:
            print(f"Error in update_trend_from_api_by_scheduler: {e}")
