"""
Authentication routes for user registration and login.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        Created user data
        
    Raises:
        HTTPException: If email or username already exists
    """
    try:
        user = AuthService.register_user(
            db,
            email=user_data.email,
            username=user_data.username,
            password=user_data.password
        )
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login")
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login user and return access token.
    
    Args:
        login_data: User login credentials
        db: Database session
        
    Returns:
        User data with access token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    try:
        result = AuthService.login_user(
            db,
            email=login_data.email,
            password=login_data.password
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
