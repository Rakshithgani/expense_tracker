"""
Configuration settings for the application.
"""
import os
from datetime import timedelta
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application configuration settings.
    Loads environment variables and sets defaults.
    """
    
    # Application
    APP_NAME: str = "Expense Tracker"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./database.db"
    
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API
    API_V1_STR: str = "/api/v1"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
