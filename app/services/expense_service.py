"""
Expense service containing business logic for expense management.
"""
from sqlalchemy.orm import Session
from datetime import date
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.user_repository import UserRepository


class ExpenseService:
    """
    Service for expense operations.
    Contains business logic for expense management.
    """
    
    @staticmethod
    def create_expense(
        db: Session,
        user_id: int,
        title: str,
        amount: float,
        category: str,
        expense_date: date
    ):
        """
        Create a new expense for a user.
        
        Args:
            db: Database session
            user_id: User ID
            title: Expense title
            amount: Expense amount
            category: Expense category
            expense_date: Expense date
            
        Returns:
            Created Expense object
            
        Raises:
            ValueError: If user not found or invalid amount
        """
        # Verify user exists
        user = UserRepository.get_user_by_id(db, user_id)
        if not user:
            raise ValueError("User not found")
        
        # Validate amount
        if amount <= 0:
            raise ValueError("Amount must be greater than 0")
        
        # Create expense
        expense = ExpenseRepository.create_expense(
            db,
            title=title,
            amount=amount,
            category=category,
            date_value=expense_date,
            user_id=user_id
        )
        
        return expense
    
    @staticmethod
    def get_expense(db: Session, expense_id: int, user_id: int):
        """
        Get an expense, verifying it belongs to the user.
        
        Args:
            db: Database session
            expense_id: Expense ID
            user_id: User ID (to verify ownership)
            
        Returns:
            Expense object
            
        Raises:
            ValueError: If expense not found or doesn't belong to user
        """
        expense = ExpenseRepository.get_expense_by_id(db, expense_id)
        
        if not expense:
            raise ValueError("Expense not found")
        
        if expense.user_id != user_id:
            raise ValueError("Expense does not belong to this user")
        
        return expense
    
    @staticmethod
    def get_user_expenses(db: Session, user_id: int):
        """
        Get all expenses for a user.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            List of Expense objects
            
        Raises:
            ValueError: If user not found
        """
        user = UserRepository.get_user_by_id(db, user_id)
        if not user:
            raise ValueError("User not found")
        
        return ExpenseRepository.get_user_expenses(db, user_id)
    
    @staticmethod
    def get_expenses_by_category(db: Session, user_id: int, category: str):
        """
        Get expenses for a user filtered by category.
        
        Args:
            db: Database session
            user_id: User ID
            category: Category name
            
        Returns:
            List of Expense objects
        """
        return ExpenseRepository.get_expenses_by_category(db, user_id, category)
    
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
            List of Expense objects
        """
        return ExpenseRepository.get_expenses_by_date_range(
            db, user_id, start_date, end_date
        )
    
    @staticmethod
    def update_expense(
        db: Session,
        expense_id: int,
        user_id: int,
        title: str = None,
        amount: float = None,
        category: str = None,
        expense_date: date = None
    ):
        """
        Update an expense (only if it belongs to the user).
        
        Args:
            db: Database session
            expense_id: Expense ID
            user_id: User ID (to verify ownership)
            title: New title (optional)
            amount: New amount (optional)
            category: New category (optional)
            expense_date: New date (optional)
            
        Returns:
            Updated Expense object
            
        Raises:
            ValueError: If expense not found, doesn't belong to user, or invalid amount
        """
        # Verify expense exists and belongs to user
        expense = ExpenseRepository.get_expense_by_id(db, expense_id)
        if not expense:
            raise ValueError("Expense not found")
        
        if expense.user_id != user_id:
            raise ValueError("Expense does not belong to this user")
        
        # Validate amount if provided
        if amount is not None and amount <= 0:
            raise ValueError("Amount must be greater than 0")
        
        # Update expense
        updated = ExpenseRepository.update_expense(
            db,
            expense_id,
            title=title,
            amount=amount,
            category=category,
            date_value=expense_date
        )
        
        if not updated:
            raise ValueError("Failed to update expense")
        
        # Return updated expense
        return ExpenseRepository.get_expense_by_id(db, expense_id)
    
    @staticmethod
    def delete_expense(db: Session, expense_id: int, user_id: int):
        """
        Delete an expense (only if it belongs to the user).
        
        Args:
            db: Database session
            expense_id: Expense ID
            user_id: User ID (to verify ownership)
            
        Returns:
            True if deleted
            
        Raises:
            ValueError: If expense not found or doesn't belong to user
        """
        expense = ExpenseRepository.get_expense_by_id(db, expense_id)
        
        if not expense:
            raise ValueError("Expense not found")
        
        if expense.user_id != user_id:
            raise ValueError("Expense does not belong to this user")
        
        return ExpenseRepository.delete_expense(db, expense_id)
    
    @staticmethod
    def calculate_total_expense(db: Session, user_id: int) -> float:
        """
        Calculate total expenses for a user.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Total amount of expenses
        """
        expenses = ExpenseRepository.get_user_expenses(db, user_id)
        return sum(expense.amount for expense in expenses)
    
    @staticmethod
    def calculate_category_total(db: Session, user_id: int, category: str) -> float:
        """
        Calculate total expenses for a user in a specific category.
        
        Args:
            db: Database session
            user_id: User ID
            category: Category name
            
        Returns:
            Total amount in category
        """
        expenses = ExpenseRepository.get_expenses_by_category(
            db, user_id, category
        )
        return sum(expense.amount for expense in expenses)
