"""
API dependencies for FastAPI.
Contains dependency functions for routes.
"""
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from jose import JWTError

from app.core.database import get_db
from app.services.auth_service import AuthService


def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get current user from JWT token in Authorization header.
    Used as a dependency in protected routes.
    
    Args:
        request: FastAPI request object
        db: Database session
        
    Returns:
        Current User object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract bearer token
    try:
        scheme, token = auth_header.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid authentication scheme")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user = AuthService.get_current_user(db, token)
        return user
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
