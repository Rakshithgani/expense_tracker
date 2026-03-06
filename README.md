# Expense Tracker API

A comprehensive expense tracking application built with FastAPI, SQLAlchemy, and SQLite.

## Project Stack

| Layer        | Technology              |
| ------------ | ----------------------- |
| Backend API  | Python + FastAPI        |
| ORM          | SQLAlchemy              |
| Validation   | Pydantic                |
| Auth         | JWT + bcrypt            |
| Database     | SQLite                  |
| Frontend     | HTML + CSS + JavaScript |
| Architecture | Layered Architecture    |

## Project Structure

```
expense-tracker/
│
├── app/                                # Backend API
│   ├── main.py                         # FastAPI application entry point
│   │
│   ├── core/
│   │   ├── config.py                  # Configuration settings
│   │   ├── security.py                # Password & JWT utilities
│   │   └── database.py                # Database connection & session
│   │
│   ├── models/
│   │   ├── user_model.py              # User SQLAlchemy model
│   │   └── expense_model.py           # Expense SQLAlchemy model
│   │
│   ├── schemas/
│   │   ├── user_schema.py             # User Pydantic schemas
│   │   └── expense_schema.py          # Expense Pydantic schemas
│   │
│   ├── repositories/
│   │   ├── user_repository.py         # User database operations
│   │   └── expense_repository.py      # Expense database operations
│   │
│   ├── services/
│   │   ├── auth_service.py            # Authentication business logic
│   │   └── expense_service.py         # Expense business logic
│   │
│   ├── api/
│   │   ├── deps.py                    # Dependency injection
│   │   └── routes/
│   │       ├── auth_routes.py         # Authentication endpoints
│   │       └── expense_routes.py      # Expense endpoints
│   │
│   └── utils/
│       └── jwt_handler.py             # JWT utilities
│
├── frontend/                           # Frontend UI
│   ├── index.html                      # Landing page
│   ├── README.md                       # Frontend documentation
│   │
│   ├── pages/
│   │   ├── login.html                 # User login page
│   │   ├── register.html              # User registration page
│   │   └── dashboard.html             # Main dashboard
│   │
│   ├── styles/
│   │   ├── main.css                   # Core styles
│   │   └── dashboard.css              # Dashboard styles
│   │
│   └── scripts/
│       ├── auth.js                    # Authentication logic
│       └── dashboard.js               # Dashboard functionality
│
├── requirements.txt                   # Python dependencies
├── .env                              # Environment variables
├── .gitignore                        # Git ignore rules
├── README.md                         # Main documentation
└── database.db                       # SQLite database (auto-created)
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Edit `.env` file with your settings:
```
SECRET_KEY=your-secret-key-change-this-in-production
DEBUG=True
DATABASE_URL=sqlite:///./database.db
```

### 5. Run the Application

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at: `http://localhost:8000`

## Frontend Setup

The frontend is located in the `frontend/` directory and uses vanilla HTML, CSS, and JavaScript.

### 1. Run a Local Web Server

You can serve the frontend using any local web server:

**Python 3:**
```bash
cd frontend
python -m http.server 8080
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8080
```

**Node.js (http-server):**
```bash
npm install -g http-server
cd frontend
http-server
```

**PHP:**
```bash
cd frontend
php -S localhost:8080
```

### 2. Open in Browser

Navigate to one of these URLs in your browser:
- `http://localhost:8080/index.html` (Landing page)
- `http://localhost:8080/pages/login.html` (Login page)
- `http://localhost:8080/pages/register.html` (Register page)

### 3. Backend Connection

The frontend is configured to connect to the backend API at `http://localhost:8000`.

If your backend is running on a different host/port, update the `API_URL` variable in:
- `frontend/scripts/auth.js`
- `frontend/scripts/dashboard.js`

```javascript
const API_URL = 'http://your-backend-host:port/api/v1';
```

## Frontend Features

### Pages

1. **Landing Page** (`frontend/index.html`)
   - Welcome screen with login and register navigation

2. **Login Page** (`frontend/pages/login.html`)
   - User authentication with email and password
   - JWT token storage
   - Form validation

3. **Register Page** (`frontend/pages/register.html`)
   - New user account creation
   - Password confirmation
   - Form validation

4. **Dashboard** (`frontend/pages/dashboard.html`)
   - View all expenses
   - Add new expenses
   - Delete expenses
   - Filter by category
   - Summary statistics
   - Responsive sidebar navigation

### Styling

- **Responsive Design**: Works on all screen sizes (mobile, tablet, desktop)
- **Modern UI**: Clean card-based layout with gradients
- **Accessibility**: Semantic HTML and proper form labels
- **Color Scheme**: Indigo/purple primary colors with utility colors

### JavaScript Modules

- **auth.js**: Authentication functions (login, register, token management)
- **dashboard.js**: Dashboard functionality (load expenses, add/delete, filtering)

## API Documentation

### Interactive API Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

### Health Check

```
GET /health
```

Returns:
```json
{
  "status": "healthy"
}
```

## Authentication Endpoints

### Register User

```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "secure_password"
}
```

Response:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "john_doe",
  "created_at": "2024-01-15T10:30:00"
}
```

### Login User

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

Response:
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "username": "john_doe",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Expense Endpoints

All expense endpoints require authentication. Use the access token from login:

```
Authorization: Bearer <your_access_token>
```

### Create Expense

```
POST /api/v1/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "amount": 50.00,
  "category": "Food",
  "date": "2024-01-15"
}
```

### Get All Expenses

```
GET /api/v1/expenses
Authorization: Bearer <token>
```

### Get Expense by ID

```
GET /api/v1/expenses/1
Authorization: Bearer <token>
```

### Update Expense

```
PUT /api/v1/expenses/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "amount": 60.00,
  "category": "Food",
  "date": "2024-01-15"
}
```

### Delete Expense

```
DELETE /api/v1/expenses/1
Authorization: Bearer <token>
```

### Get Expenses by Category

```
GET /api/v1/expenses/category/Food
Authorization: Bearer <token>
```

### Get Total Expenses

```
GET /api/v1/expenses/total/all
Authorization: Bearer <token>
```

Response:
```json
{
  "total": 500.00
}
```

### Get Category Total

```
GET /api/v1/expenses/total/Food
Authorization: Bearer <token>
```

Response:
```json
{
  "category": "Food",
  "total": 150.00
}
```

## Database Schema

### Users Table

| Column        | Type     | Description           |
| ------------- | -------- | --------------------- |
| id            | INTEGER  | Primary Key           |
| email         | TEXT     | User email (unique)   |
| username      | TEXT     | Username (unique)     |
| password_hash | TEXT     | Hashed password       |
| created_at    | DATETIME | Account creation date |

### Expenses Table

| Column     | Type     | Description              |
| ---------- | -------- | ------------------------ |
| id         | INTEGER  | Primary Key              |
| title      | TEXT     | Expense title            |
| amount     | FLOAT    | Expense amount           |
| category   | TEXT     | Expense category         |
| date       | DATE     | Expense date             |
| user_id    | INTEGER  | Foreign Key to Users     |
| created_at | DATETIME | Expense creation date    |

## Layered Architecture

### Core Layer
- **Purpose**: System configuration
- **Files**: `config.py`, `security.py`, `database.py`
- **Responsibilities**: Database connection, JWT settings, bcrypt hashing, environment configs

### Models Layer (SQLAlchemy)
- **Purpose**: Database tables as ORM models
- **Files**: `user_model.py`, `expense_model.py`
- **Responsibilities**: Define database schema, relationships between entities

### Schemas Layer (Pydantic)
- **Purpose**: Data validation and serialization
- **Files**: `user_schema.py`, `expense_schema.py`
- **Responsibilities**: Validate requests, format responses, prevent exposing sensitive fields

### Repository Layer
- **Purpose**: Database access abstraction
- **Files**: `user_repository.py`, `expense_repository.py`
- **Responsibilities**: CRUD operations, database queries (NO business logic)

### Service Layer
- **Purpose**: Business logic implementation
- **Files**: `auth_service.py`, `expense_service.py`
- **Responsibilities**: User registration/login, expense calculations, filtering

### API Layer (Routes)
- **Purpose**: HTTP endpoints and request handling
- **Files**: `auth_routes.py`, `expense_routes.py`, `deps.py`
- **Responsibilities**: Define endpoints, handle HTTP requests/responses, dependency injection

## Security Features

### Password Hashing
- Uses **bcrypt** for secure password hashing
- Passwords are hashed before storage in database
- Password verification during login

### JWT Authentication
- Users receive JWT token after successful login
- Token includes user ID in claims
- Protected endpoints require valid token
- Tokens expire after 30 minutes (configurable)

### Protected Routes
- All expense endpoints require authentication
- User can only access their own expenses
- Backend validates ownership before operations

## Development

### Running Tests

```bash
pytest
```

### Code Quality

```bash
# Format code
black app/

# Lint code
pylint app/

# Type checking
mypy app/
```

## Next Steps

### Phase 2: Frontend Development
- Login page
- Register page
- Dashboard page
- Add expense form
- Expense list with filtering

### Phase 3: Styling
- Responsive CSS layout
- Card-based UI for expenses
- Charts for expense visualization
- Clean and modern design

## Troubleshooting

### Port Already in Use

If port 8000 is already in use, run on a different port:

```bash
python -m uvicorn app.main:app --reload --port 8001
```

### Database Issues

To reset the database, delete `database.db` and restart the application.

### Import Errors

Ensure virtual environment is activated and dependencies are installed:

```bash
pip install -r requirements.txt
```

## License

MIT License

## Contributors

Your Name

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15
