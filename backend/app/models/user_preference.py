from sqlalchemy import Column, Integer, ForeignKey, String, Table
from sqlalchemy.orm import relationship
from app.database import Base

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    alert_keywords = Column(String, nullable=True)  # 쉼표로 구분된 키워드 저장
