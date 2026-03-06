"""
SQLAlchemy Expense model.
"""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Expense(Base):
    """
    Expense model representing an expense entry in the application.
    """
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="expenses")
    
    def __repr__(self):
        return f"<Expense(id={self.id}, title={self.title}, amount={self.amount}, user_id={self.user_id})>"
