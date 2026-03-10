import os
from datetime import datetime
from typing import Optional

from fastapi import Depends, FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from passlib.hash import pbkdf2_sha256
from pydantic import ValidationError
from sqlalchemy import func
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from database import Base, engine, get_db
from models import Expense, User
from schemas import ExpenseCreate, ExpenseOut, UserSignup

# ── Bootstrap DB ─────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App ───────────────────────────────────────────────────────
app = FastAPI(title="Expense Tracker")

app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ.get("SECRET_KEY", "dev-secret-change-in-production"),
)

app.mount("/static", StaticFiles(directory="static"), name="static")


# ── Session helper ────────────────────────────────────────────
def current_uid(request: Request) -> Optional[int]:
    return request.session.get("user_id")


# ── Routes: Pages ─────────────────────────────────────────────
@app.get("/")
async def index(request: Request):
    if current_uid(request):
        return RedirectResponse(url="/dashboard", status_code=302)
    return RedirectResponse(url="/login", status_code=302)


@app.get("/login")
async def login_page(request: Request):
    if current_uid(request):
        return RedirectResponse(url="/dashboard", status_code=302)
    return FileResponse("static/login.html")


@app.get("/signup")
async def signup_page(request: Request):
    if current_uid(request):
        return RedirectResponse(url="/dashboard", status_code=302)
    return FileResponse("static/signup.html")


@app.get("/dashboard")
async def dashboard_page(request: Request):
    if not current_uid(request):
        return RedirectResponse(url="/login", status_code=302)
    return FileResponse("static/dashboard.html")


@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/login", status_code=302)


# ── API: Auth ─────────────────────────────────────────────────
@app.post("/api/login")
async def api_login(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))

    user = db.query(User).filter(User.username == username).first()
    if user and pbkdf2_sha256.verify(password, user.password_hash):
        request.session["user_id"] = user.id
        request.session["username"] = user.username
        return {"message": "Login successful"}
    return JSONResponse({"error": "Invalid username or password."}, status_code=401)


@app.post("/api/signup", status_code=201)
async def api_signup(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    signup_data = None
    errors: list[str] = []

    try:
        signup_data = UserSignup(**data)
    except ValidationError as exc:
        errors = [e["msg"].removeprefix("Value error, ") for e in exc.errors()]

    if not errors and signup_data:
        existing = (
            db.query(User)
            .filter(
                (User.username == signup_data.username)
                | (User.email == str(signup_data.email))
            )
            .first()
        )
        if existing:
            errors.append("Username or email already exists.")

    if errors:
        return JSONResponse({"errors": errors}, status_code=400)

    new_user = User(
        username=signup_data.username,
        email=str(signup_data.email),
        password_hash=pbkdf2_sha256.hash(signup_data.password),
    )
    db.add(new_user)
    db.commit()
    return {"message": "Account created."}


@app.get("/api/me")
async def api_me(request: Request, db: Session = Depends(get_db)):
    uid = current_uid(request)
    if not uid:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        return JSONResponse({"error": "User not found"}, status_code=404)
    return {"username": user.username, "email": user.email}


# ── API: Expenses ─────────────────────────────────────────────
@app.get("/api/expenses")
async def get_expenses(request: Request, db: Session = Depends(get_db)):
    uid = current_uid(request)
    if not uid:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    rows = (
        db.query(Expense)
        .filter(Expense.user_id == uid)
        .order_by(Expense.date.desc())
        .all()
    )
    return [ExpenseOut.model_validate(r).model_dump(mode="json") for r in rows]


@app.post("/api/expenses", status_code=201)
async def add_expense(
    request: Request,
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
):
    uid = current_uid(request)
    if not uid:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    exp = Expense(
        user_id=uid,
        amount=payload.amount,
        category=payload.category,
        description=payload.description or "",
        date=payload.date or datetime.now().strftime("%Y-%m-%d"),
    )
    db.add(exp)
    db.commit()
    return {"message": "Expense added."}


@app.delete("/api/expenses/{expense_id}")
async def delete_expense(
    expense_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    uid = current_uid(request)
    if not uid:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    db.query(Expense).filter(
        Expense.id == expense_id, Expense.user_id == uid
    ).delete()
    db.commit()
    return {"message": "Expense deleted."}


@app.get("/api/summary")
async def get_summary(request: Request, db: Session = Depends(get_db)):
    uid = current_uid(request)
    if not uid:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    total = (
        db.query(func.sum(Expense.amount)).filter(Expense.user_id == uid).scalar() or 0.0
    )
    by_cat = (
        db.query(Expense.category, func.sum(Expense.amount).label("total"))
        .filter(Expense.user_id == uid)
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )
    return {
        "total": round(float(total), 2),
        "by_category": [{"category": c, "total": round(float(t), 2)} for c, t in by_cat],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
