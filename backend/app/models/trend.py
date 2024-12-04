from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base

class Trend(Base):
    __tablename__ = "trends"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    time = Column(DateTime, index=True)
    count = Column(Integer)
