"""
User repository for database operations.
Database access layer - no business logic here.
"""
from sqlalchemy.orm import Session
from app.models.user_model import User


class UserRepository:
    """
    Repository for User model database operations.
    """
    
    @staticmethod
    def create_user(db: Session, email: str, username: str, password_hash: str) -> User:
        """
        Create a new user.
        
        Args:
            db: Database session
            email: User email
            username: User username
            password_hash: Hashed password
            
        Returns:
            Created User object
        """
        user = User(
            email=email,
            username=username,
            password_hash=password_hash
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get_user_by_email(db: Session, email: str):
        """
        Get user by email.
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            User object or None if not found
        """
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str):
        """
        Get user by username.
        
        Args:
            db: Database session
            username: User username
            
        Returns:
            User object or None if not found
        """
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        """
        Get user by ID.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            User object or None if not found
        """
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_all_users(db: Session):
        """
        Get all users.
        
        Args:
            db: Database session
            
        Returns:
            List of User objects
        """
        return db.query(User).all()
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """
        Delete user by ID.
        
        Args:
            db: Database session
            user_id: User ID to delete
            
        Returns:
            True if deleted, False if not found
        """
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
            return True
        return False
