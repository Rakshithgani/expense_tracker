from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional
from models import TransactionType


# ── User schemas ──
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


# ── Expense schemas ──
class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    type: TransactionType
    date: date
    description: Optional[str] = ""


class ExpenseOut(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    type: TransactionType
    date: date
    description: Optional[str] = ""

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    total_balance: float
    recent_expenses: list[ExpenseOut]
