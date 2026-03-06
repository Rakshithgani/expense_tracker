"""
Expense routes for managing user expenses.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.core.database import get_db
from app.models.user_model import User
from app.schemas.expense_schema import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseList
)
from app.services.expense_service import ExpenseService
from app.api.deps import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new expense for the current user.
    
    Args:
        expense_data: Expense data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created expense data
        
    Raises:
        HTTPException: If invalid data or operation fails
    """
    try:
        expense = ExpenseService.create_expense(
            db,
            user_id=current_user.id,
            title=expense_data.title,
            amount=expense_data.amount,
            category=expense_data.category,
            expense_date=expense_data.date
        )
        return expense
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=List[ExpenseList])
def get_expenses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all expenses for the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of user expenses
    """
    try:
        expenses = ExpenseService.get_user_expenses(db, current_user.id)
        return expenses
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific expense by ID.
    
    Args:
        expense_id: Expense ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Expense data
        
    Raises:
        HTTPException: If expense not found or doesn't belong to user
    """
    try:
        expense = ExpenseService.get_expense(db, expense_id, current_user.id)
        return expense
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an expense.
    
    Args:
        expense_id: Expense ID
        expense_data: Updated expense data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated expense data
        
    Raises:
        HTTPException: If expense not found, doesn't belong to user, or invalid data
    """
    try:
        expense = ExpenseService.update_expense(
            db,
            expense_id=expense_id,
            user_id=current_user.id,
            title=expense_data.title,
            amount=expense_data.amount,
            category=expense_data.category,
            expense_date=expense_data.date
        )
        return expense
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an expense.
    
    Args:
        expense_id: Expense ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If expense not found or doesn't belong to user
    """
    try:
        ExpenseService.delete_expense(db, expense_id, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/category/{category}", response_model=List[ExpenseList])
def get_expenses_by_category(
    category: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get expenses by category for the current user.
    
    Args:
        category: Category name
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of expenses in category
    """
    expenses = ExpenseService.get_expenses_by_category(
        db,
        current_user.id,
        category
    )
    return expenses


@router.get("/total/all")
def get_total_expenses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get total expenses for the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Total amount spent
    """
    total = ExpenseService.calculate_total_expense(db, current_user.id)
    return {"total": total}


@router.get("/total/{category}")
def get_category_total(
    category: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get total expenses by category for the current user.
    
    Args:
        category: Category name
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Total amount in category
    """
    total = ExpenseService.calculate_category_total(
        db,
        current_user.id,
        category
    )
    return {"category": category, "total": total}
