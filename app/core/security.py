"""
Security utilities for password hashing and JWT token management.
"""
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    
    Args:
        password: Plain text password to hash (max 72 bytes for bcrypt)
        
    Returns:
        Hashed password string
    """
    # Ensure password doesn't exceed 72 bytes (bcrypt limitation)
    password_bytes = password.encode('utf-8') if isinstance(password, str) else password
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    password_str = password_bytes.decode('utf-8', errors='ignore') if isinstance(password_bytes, bytes) else password_bytes
    return pwd_context.hash(password_str)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hashed password.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    # Apply same 72-byte truncation as hash_password for consistency
    password_bytes = plain_password.encode('utf-8') if isinstance(plain_password, str) else plain_password
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    plain_password_str = password_bytes.decode('utf-8', errors='ignore') if isinstance(password_bytes, bytes) else password_bytes
    return pwd_context.verify(plain_password_str, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing token claims
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    
    # Encode and return token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT access token.
    
    Args:
        token: JWT token string to decode
        
    Returns:
        Decoded token payload (dict)
        
    Raises:
        JWTError: If token is invalid or expired
    """
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM]
    )
    return payload
