from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Trend(Base):
    __tablename__ = "trends"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    count = Column(Integer)
    time = Column(DateTime, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # 사용자와 연결
    user = relationship("User", back_populates="trends")  # 관계 설정
