from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    news = relationship("News", back_populates="user")  # News와의 관계 설정
    trends = relationship("Trend", back_populates="user")  # Trend와의 관계 설정
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
