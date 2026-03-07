# Expense Tracker

A modern web application for tracking and managing personal expenses. Built with FastAPI backend and HTML/CSS/JavaScript frontend.

## Features

- 🔐 **User Authentication** - Secure user registration and login with JWT and bcrypt password hashing
- 💰 **Expense Management** - Create, read, update, and delete expenses
- 📊 **Expense Tracking** - Track expenses by category and date
- 💾 **Database Storage** - SQLAlchemy ORM with SQLite database
- 🎨 **Responsive UI** - User-friendly web interface with templates
- ⚙️ **Session Management** - Secure session handling with middleware

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Database**: SQLAlchemy ORM with SQLite
- **Authentication**: python-jose, passlib, bcrypt
- **Validation**: Pydantic

### Frontend
- **Templates**: Jinja2
- **Static Files**: HTML, CSS, JavaScript

## Project Structure

```
expense_tracker/
├── app.py              # Main FastAPI application
├── auth.py             # Authentication routes
├── models.py           # SQLAlchemy database models
├── schemas.py          # Pydantic schemas for request/response validation
├── database.py         # Database configuration and session management
├── config.py           # Application configuration
├── main.py             # Entry point
├── routers/            # API route handlers
├── templates/          # Jinja2 HTML templates
├── static/             # Static files (CSS, JavaScript, images)
├── requirements.txt    # Python dependencies
├── .env                # Environment variables
└── README.md           # This file
```

## Installation

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Steps

1. Clone the repository
```bash
git clone https://github.com/Rakshithgani/expense_tracker.git
cd expense_tracker
```

2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Setup environment variables
```bash
cp .env.example .env  # Create .env file with required variables
```

5. Run the application
```bash
python main.py
# Or directly with Uvicorn:
uvicorn app:app --reload
```

The application will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /login` - User login
- `POST /logout` - User logout

### Expenses
- `GET /expenses` - Get all expenses for the logged-in user
- `POST /expenses` - Create a new expense
- `GET /expenses/{id}` - Get expense by ID
- `PUT /expenses/{id}` - Update an expense
- `DELETE /expenses/{id}` - Delete an expense

## Database Models

### User
- `id`: Unique identifier
- `username`: Username (unique)
- `email`: Email address (unique)
- `hashed_password`: Bcrypt hashed password
- `created_at`: Account creation timestamp

### Expense
- `id`: Unique identifier
- `user_id`: Foreign key to User
- `amount`: Expense amount
- `category`: Expense category
- `description`: Expense description
- `date`: Expense date
- `created_at`: Creation timestamp

## Configuration

### Environment Variables
- `SECRET_KEY`: Secret key for session management
- `DATABASE_URL`: Database connection string
- `DEBUG`: Debug mode flag

## Development

### Running in Development Mode
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Testing
```bash
pytest  # If pytest is configured
```

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on the GitHub repository.

## Author

[Rakshith H H](https://github.com/Rakshithgani)
