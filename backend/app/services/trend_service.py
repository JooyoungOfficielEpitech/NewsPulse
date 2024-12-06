from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from collections import Counter
from datetime import datetime, timedelta
from app.models.news import News
from app.models.trend import Trend
from app.models.category import Category
from app.database import async_session
from konlpy.tag import Okt  # 형태소 분석기

async def update_trends(db: AsyncSession, keywords: list[str], hours: int = 24):
    now = datetime.utcnow()
    start_time = now - timedelta(hours=hours)

    try:
        # 최근 뉴스 데이터 조회
        result = await db.execute(select(News)) #.filter(News.published_at >= start_time))
        recent_news = result.scalars().all()  # 수정된 부분

        if not recent_news:
            print("No recent news found.")
            return

        # 모든 뉴스의 제목과 설명 합치기
        all_text = " ".join(news.title + " " + news.description for news in recent_news)

        
        # 형태소 분석 및 명사 추출
        okt = Okt()
        extracted_words = okt.nouns(all_text)

        # 키워드 매칭
        keyword_counts = Counter(extracted_words)
        for category in keywords:
            count = keyword_counts.get(category, 0)
            new_trend = Trend(category=category, count=count, time=now)
            db.add(new_trend)

        await db.commit()
        print("Trends updated successfully.")

    except Exception as e:
        print(f"Error in update_trends: {e}")


async def update_trend_from_api_by_scheduler():
    async with async_session() as db:
        try:
            # 카테고리 조회
            result = await db.execute(select(Category))
            categories_from_db = result.scalars().all()  # 수정된 부분

            if not categories_from_db:
                print("No categories found.")
                return

            category_names = [cat.name for cat in categories_from_db]
            await update_trends(db, category_names)

        except Exception as e:
            print(f"Error in update_trend_from_api_by_scheduler: {e}")
