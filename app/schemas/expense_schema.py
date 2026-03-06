"""
Pydantic schemas for Expense validation and serialization.
"""
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class ExpenseCreate(BaseModel):
    """
    Schema for creating a new expense.
    """
    title: str
    amount: float
    category: str
    date: date
    
    class Config:
        from_attributes = True


class ExpenseUpdate(BaseModel):
    """
    Schema for updating an existing expense.
    """
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[date] = None
    
    class Config:
        from_attributes = True


class ExpenseResponse(BaseModel):
    """
    Schema for expense response.
    """
    id: int
    title: str
    amount: float
    category: str
    date: date
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ExpenseList(BaseModel):
    """
    Schema for list of expenses response.
    """
    id: int
    title: str
    amount: float
    category: str
    date: date
    created_at: datetime
    
    class Config:
        from_attributes = True
