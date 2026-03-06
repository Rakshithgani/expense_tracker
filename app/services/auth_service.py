"""
Authentication service containing business logic for user authentication.
"""
from sqlalchemy.orm import Session
from datetime import timedelta
from jose import JWTError
from app.repositories.user_repository import UserRepository
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)
from app.core.config import settings


class AuthService:
    """
    Service for authentication operations.
    Contains business logic for user registration and login.
    """
    
    @staticmethod
    def register_user(db: Session, email: str, username: str, password: str):
        """
        Register a new user.
        
        Args:
            db: Database session
            email: User email
            username: User username
            password: Plain text password
            
        Returns:
            Registered User object
            
        Raises:
            ValueError: If email or username already exists
        """
        # Check if email already exists
        existing_email = UserRepository.get_user_by_email(db, email)
        if existing_email:
            raise ValueError("Email already registered")
        
        # Check if username already exists
        existing_username = UserRepository.get_user_by_username(db, username)
        if existing_username:
            raise ValueError("Username already taken")
        
        # Hash password and create user
        hashed_password = hash_password(password)
        user = UserRepository.create_user(
            db,
            email=email,
            username=username,
            password_hash=hashed_password
        )
        
        return user
    
    @staticmethod
    def login_user(db: Session, email: str, password: str):
        """
        Login a user and generate access token.
        
        Args:
            db: Database session
            email: User email
            password: Plain text password
            
        Returns:
            Dictionary with user data and access token
            
        Raises:
            ValueError: If credentials are invalid
        """
        # Get user by email
        user = UserRepository.get_user_by_email(db, email)
        if not user:
            raise ValueError("Invalid email or password")
        
        # Verify password
        if not verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password")
        
        # Generate access token
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return {
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
            "access_token": access_token,
            "token_type": "bearer"
        }
    
    @staticmethod
    def verify_token(token: str):
        """
        Verify JWT token and extract user ID.
        
        Args:
            token: JWT token string
            
        Returns:
            User ID from token
            
        Raises:
            JWTError: If token is invalid or expired
        """
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            
            if user_id is None:
                raise JWTError("Invalid token")
            
            return int(user_id)
        except JWTError:
            raise JWTError("Invalid or expired token")
    
    @staticmethod
    def get_current_user(db: Session, token: str):
        """
        Get current user from token.
        
        Args:
            db: Database session
            token: JWT token string
            
        Returns:
            User object
            
        Raises:
            JWTError: If token is invalid
            ValueError: If user not found
        """
        user_id = AuthService.verify_token(token)
        user = UserRepository.get_user_by_id(db, user_id)
        
        if not user:
            raise ValueError("User not found")
        
        return user
