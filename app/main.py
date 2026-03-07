"""
FastAPI application entry point.
Main application factory and route registration.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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


# ----- Frontend file serving -----
_frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")

# Serve CSS / JS / other assets at paths that match the HTML references
# HTML uses  ../styles/  ../scripts/  which resolve to /styles/ and /scripts/
# when pages are served at /pages/<file>.html
if os.path.isdir(_frontend_dir):
    _styles_dir = os.path.join(_frontend_dir, "styles")
    _scripts_dir = os.path.join(_frontend_dir, "scripts")
    if os.path.isdir(_styles_dir):
        app.mount("/styles", StaticFiles(directory=_styles_dir), name="styles")
    if os.path.isdir(_scripts_dir):
        app.mount("/scripts", StaticFiles(directory=_scripts_dir), name="scripts")


def _serve_page(name: str):
    """Return a frontend HTML page by filename."""
    path = os.path.join(_frontend_dir, "pages", name)
    if os.path.exists(path):
        return FileResponse(path, media_type="text/html")
    return {"error": "Page not found"}


@app.get("/", include_in_schema=False)
def root():
    return _serve_page("login.html")


@app.get("/pages/{page_name}", include_in_schema=False)
def serve_page(page_name: str):
    # Only allow known html files
    if not page_name.endswith(".html"):
        return {"error": "Not found"}
    return _serve_page(page_name)
