from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Expense, User, TransactionType
from schemas import ExpenseCreate, ExpenseOut, DashboardSummary
from auth import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    expenses = (
        db.query(Expense)
        .filter(Expense.owner_id == current_user.id)
        .order_by(Expense.date.desc())
        .all()
    )
    total_income = sum(e.amount for e in expenses if e.type == TransactionType.income)
    total_expenses = sum(e.amount for e in expenses if e.type == TransactionType.expense)
    return DashboardSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        total_balance=total_income - total_expenses,
        recent_expenses=expenses[:10],
    )


@router.post("/", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_expense = Expense(**expense.model_dump(), owner_id=current_user.id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.get("/", response_model=list[ExpenseOut])
def list_expenses(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return (
        db.query(Expense)
        .filter(Expense.owner_id == current_user.id)
        .order_by(Expense.date.desc())
        .all()
    )


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.owner_id == current_user.id)
        .first()
    )
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
