from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base

class UserCategory(Base):
    __tablename__ = "user_categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
