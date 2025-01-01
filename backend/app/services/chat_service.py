from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.models.chat_history import ChatHistory

async def save_chat_message(db: AsyncSession, user_id: int, message: str, is_user: bool):
    """
    유저 메시지 또는 시스템 답변을 저장.
    """
    chat_message = ChatHistory(user_id=user_id, message=message, is_user=is_user)
    db.add(chat_message)
    await db.commit()

async def get_chat_history(db: AsyncSession, user_id: int, limit: int = 10):
    """
    유저의 이전 대화 기록을 불러옴.
    """
    result = await db.execute(
        select(ChatHistory)
        .filter(ChatHistory.user_id == user_id)
        .order_by(ChatHistory.timestamp.desc())
        .limit(limit)
    )
    return result.scalars().all()

async def delete_chat_history(db: AsyncSession, user_id: int):
    """
    유저의 채팅 기록 삭제.
    """
    await db.execute(delete(ChatHistory).filter(ChatHistory.user_id == user_id))
    await db.commit()
