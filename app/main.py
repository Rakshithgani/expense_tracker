"""
FastAPI application entry point.
Main application factory and route registration.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import init_db, SessionLocal
from app.core.config import settings
from app.api.routes import auth_routes, expense_routes
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Track and manage your expenses efficiently",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Event handlers
@app.on_event("startup")
def startup_event():
    """
    Initialize database on application startup and create demo account.
    """
    init_db()
    print("Database initialized")
    
    # Create demo account if it doesn't exist
    try:
        db = SessionLocal()
        demo_email = "demo@example.com"
        demo_user = UserRepository.get_user_by_email(db, demo_email)
        
        if not demo_user:
            try:
                # Create demo account
                AuthService.register_user(
                    db,
                    email=demo_email,
                    username="demo",
                    password="demo123"
                )
                print("✓ Demo account created: demo@example.com / demo123")
            except ValueError as e:
                # Account might already exist, that's okay
                if "already" in str(e).lower():
                    print("✓ Demo account already exists")
                else:
                    print(f"Demo account creation warning: {e}")
            except Exception as e:
                # Passlib/bcrypt compatibility issues - that's okay
                print(f"Demo account setup skipped: {type(e).__name__}")
        else:
            print("✓ Demo account already exists")
    except Exception as e:
        print(f"Database connection note: {type(e).__name__}")
    finally:
        try:
            db.close()
        except:
            pass


# Route registration
app.include_router(
    auth_routes.router,
    prefix=settings.API_V1_STR
)
app.include_router(
    expense_routes.router,
    prefix=settings.API_V1_STR
)


# Health check endpoint
@app.get("/health", tags=["health"])
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}


@app.get("/", tags=["root"])
def root():
    """
    Root endpoint with API information.
    """
    return {
        "message": "Welcome to Expense Tracker API",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
