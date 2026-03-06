"""
Database connection and session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from typing import Generator

# Database URL for SQLite
DATABASE_URL = "sqlite:///./database.db"

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite specific setting
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create base class for models
Base = declarative_base()


def get_db() -> Generator:
    """
    Dependency function to get database session.
    Yields a database session and ensures it closes after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Create all database tables.
    Call this function on application startup.
    """
    Base.metadata.create_all(bind=engine)
