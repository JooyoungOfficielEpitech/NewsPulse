from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    url = Column(String, unique=True, nullable=False)
    published_at = Column(DateTime, nullable=True)
    source = Column(String, nullable=True)  # 새로 추가된 컬럼
    category = Column(String, nullable=True)