"""
Expense repository for database operations.
Database access layer - no business logic here.
"""
from sqlalchemy.orm import Session
from datetime import date
from app.models.expense_model import Expense


class ExpenseRepository:
    """
    Repository for Expense model database operations.
    """
    
    @staticmethod
    def create_expense(
        db: Session,
        title: str,
        amount: float,
        category: str,
        date_value: date,
        user_id: int
    ) -> Expense:
        """
        Create a new expense.
        
        Args:
            db: Database session
            title: Expense title
            amount: Expense amount
            category: Expense category
            date_value: Expense date
            user_id: User ID (expense owner)
            
        Returns:
            Created Expense object
        """
        expense = Expense(
            title=title,
            amount=amount,
            category=category,
            date=date_value,
            user_id=user_id
        )
        db.add(expense)
        db.commit()
        db.refresh(expense)
        return expense
    
    @staticmethod
    def get_expense_by_id(db: Session, expense_id: int):
        """
        Get expense by ID.
        
        Args:
            db: Database session
            expense_id: Expense ID
            
        Returns:
            Expense object or None if not found
        """
        return db.query(Expense).filter(Expense.id == expense_id).first()
    
    @staticmethod
    def get_user_expenses(db: Session, user_id: int):
        """
        Get all expenses for a user.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            List of Expense objects for the user
        """
        return db.query(Expense).filter(Expense.user_id == user_id).all()
    
    @staticmethod
    def get_expenses_by_category(db: Session, user_id: int, category: str):
        """
        Get expenses for a user by category.
        
        Args:
            db: Database session
            user_id: User ID
            category: Category name
            
        Returns:
            List of Expense objects matching category
        """
        return db.query(Expense).filter(
            Expense.user_id == user_id,
            Expense.category == category
        ).all()
    
    @staticmethod
    def get_expenses_by_date_range(
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date
    ):
        """
        Get expenses for a user within a date range.
        
        Args:
            db: Database session
            user_id: User ID
            start_date: Start date
            end_date: End date
            
        Returns:
            List of Expense objects within date range
        """
        return db.query(Expense).filter(
            Expense.user_id == user_id,
            Expense.date >= start_date,
            Expense.date <= end_date
        ).all()
    
    @staticmethod
    def update_expense(
        db: Session,
        expense_id: int,
        title: str = None,
        amount: float = None,
        category: str = None,
        date_value: date = None
    ) -> bool:
        """
        Update an expense.
        
        Args:
            db: Database session
            expense_id: Expense ID to update
            title: New title (optional)
            amount: New amount (optional)
            category: New category (optional)
            date_value: New date (optional)
            
        Returns:
            True if updated, False if not found
        """
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            return False
        
        if title is not None:
            expense.title = title
        if amount is not None:
            expense.amount = amount
        if category is not None:
            expense.category = category
        if date_value is not None:
            expense.date = date_value
        
        db.commit()
        db.refresh(expense)
        return True
    
    @staticmethod
    def delete_expense(db: Session, expense_id: int) -> bool:
        """
        Delete an expense.
        
        Args:
            db: Database session
            expense_id: Expense ID to delete
            
        Returns:
            True if deleted, False if not found
        """
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if expense:
            db.delete(expense)
            db.commit()
            return True
        return False
