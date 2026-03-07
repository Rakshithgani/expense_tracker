"""
Pydantic schemas for User validation and serialization.
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


class UserCreate(BaseModel):
    """
    Schema for creating a new user (registration).
    """
    email: EmailStr
    username: str
    password: str = Field(
        ...,
        min_length=6,
        max_length=72,
        description="Password must be between 6-72 characters. Max 72 due to bcrypt limitation."
    )
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """
    Schema for user login request.
    """
    email: EmailStr
    password: str = Field(
        ...,
        min_length=6,
        max_length=72,
        description="Password must be between 6-72 characters"
    )


class UserResponse(BaseModel):
    """
    Schema for user response (without sensitive data).
    """
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserDetail(BaseModel):
    """
    Detailed user schema including expenses.
    """
    id: int
    email: str
    username: str
    created_at: datetime
    expenses: Optional[List] = []
    
    class Config:
        from_attributes = True
