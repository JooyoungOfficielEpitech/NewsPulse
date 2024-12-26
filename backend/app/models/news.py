from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    url = Column(String, unique=True, nullable=False)  # URL 필드 추가
    published_at = Column(DateTime, nullable=True)
    source = Column(String, nullable=True)
    category = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # 사용자 ID
    user = relationship("User", back_populates="news")
