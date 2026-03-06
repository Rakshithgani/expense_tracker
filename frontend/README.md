# Expense Tracker Frontend

A responsive, modern frontend for the Expense Tracker application built with vanilla HTML, CSS, and JavaScript.

## Project Structure

```
frontend/
├── index.html                 # Landing/home page
├── pages/
│   ├── login.html            # User login page
│   ├── register.html         # User registration page
│   └── dashboard.html        # Main dashboard with expense management
├── styles/
│   ├── main.css              # Core styles for auth pages
│   └── dashboard.css         # Dashboard-specific styles
└── scripts/
    ├── auth.js               # Authentication logic
    └── dashboard.js          # Dashboard functionality
```

## Features

### Authentication Pages
- **Login Page** (`pages/login.html`)
  - Email and password login
  - JWT token storage
  - Form validation
  - Error handling with user messages

- **Register Page** (`pages/register.html`)
  - Create new user account
  - Username, email, and password
  - Password confirmation match validation
  - Redirect to login on success

### Dashboard
- **Expense Management** (`pages/dashboard.html`)
  - View all expenses
  - Add new expenses with title, amount, category, and date
  - Delete expenses (with confirmation)
  - Filter expenses by category
  - Summary cards showing: total spent, expense count, and monthly total

### Responsive Design
- Mobile-friendly layout
- Flexible navigation sidebar
- Responsive grid system
- Touch-friendly buttons and forms
- Works on all screen sizes (480px and up)

## Setup Instructions

### 1. Open the Frontend

Simply open `frontend/index.html` in your web browser, or serve it using a local web server:

```bash
# Using Python 3
python -m http.server 8080

# Using Python 2
python -m SimpleHTTPServer 8080

# Using Node.js (http-server)
npm install -g http-server
http-server

# Using PHP
php -S localhost:8080
```

Then navigate to `http://localhost:8080` in your browser.

### 2. Configure API Connection

The frontend expects the backend API to be running on `http://localhost:8000`.

If your backend is running on a different URL, update the `API_URL` variable in:
- `scripts/auth.js`
- `scripts/dashboard.js`

```javascript
const API_URL = 'http://your-backend-url:port/api/v1';
```

### 3. CORS Configuration (Backend)

The backend must allow requests from the frontend origin. The backend already includes CORS middleware:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Pages & Functionality

### Landing Page (`index.html`)
- Entry point with links to login and register
- Clean introduction to the app

### Login Page (`login.html`)
```javascript
// Form submission calls handleLogin()
// Validates credentials against backend
// Stores JWT token in localStorage
// Redirects to dashboard on success
```

**Endpoint**: `POST /api/v1/auth/login`
**Request**: `{ email, password }`
**Response**: `{ user_id, email, username, access_token, token_type }`

### Register Page (`register.html`)
```javascript
// Form submission calls handleRegister()
// Validates input and password match
// Creates new user account
// Redirects to login on success
```

**Endpoint**: `POST /api/v1/auth/register`
**Request**: `{ email, username, password }`
**Response**: `{ id, email, username, created_at }`

### Dashboard (`dashboard.html`)
Main interface with multiple sections:

#### Expenses Section
- Displays all user expenses in a card-based list
- Shows emoji by category
- Displays title, amount, category, and date
- Edit and delete buttons for each expense
- Filter by category
- Summary statistics

#### Add Expense Section
- Form to create new expenses
- Fields: title, amount, category, date
- Category dropdown with emojis
- Form validation
- Success confirmation message

## JavaScript Functions

### Authentication (`auth.js`)

```javascript
// Register new user
handleRegister(e)

// Login user
handleLogin(e)

// Logout user
handleLogout()

// Token management
saveToken(token)
getToken()
removeToken()
isAuthenticated()

// API calls
getAuthHeader()
authenticatedFetch(url, options)

// Utility
redirectIfNotAuthenticated()
parseJWT(token)
formatDate(date)
showMessage(elementId, message, type)
```

### Dashboard (`dashboard.js`)

```javascript
// Load and display expenses
loadExpenses()
displayExpenses(expenses)
updateSummaryCards(expenses)

// Manage expenses
handleAddExpense(e)
deleteExpense(expenseId)
editExpense(expenseId)

// UI functionality
switchSection(e, sectionId)
filterExpensesByCategory()

// Utility
escapeHtml(text)
```

## Storage

The application uses browser localStorage to store:
- `access_token`: JWT token for API authentication
- `user_email`: Current logged-in user's email
- `user_name`: Current logged-in user's username

These are automatically cleared on logout.

## Security Features

1. **JWT Token Storage**: Access tokens stored in localStorage
2. **Authorization Header**: All authenticated requests include `Authorization: Bearer <token>`
3. **XSS Prevention**: HTML escaping for user-generated content
4. **HTTPS Ready**: Use HTTPS in production
5. **Automatic Redirect**: Unauthenticated users redirected to login

## API Communication

### Request Headers
```javascript
{
    'Authorization': 'Bearer <access_token>',
    'Content-Type': 'application/json'
}
```

### Response Handling
- 200/201: Success
- 400: Bad request (validation error)
- 401: Unauthorized (invalid/expired token)
- 404: Not found
- 500: Server error

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Styling

### Color Scheme
- **Primary**: `#4f46e5` (Indigo)
- **Secondary**: `#7c3aed` (Purple)
- **Success**: `#10b981` (Green)
- **Danger**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Amber)

### Typography
- **Font**: System font stack (Apple, Segoe, Helvetica, Arial)
- **Body**: 14px
- **Headings**: 24px-32px

### Responsive Breakpoints
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: 768px - 1024px
- Large: > 1024px

## Environment Setup

### Local Development
1. Clone the repository
2. Start the backend API on `http://localhost:8000`
3. Serve the frontend with a local server
4. Open in browser and navigate to frontend home

### Production Deployment
1. Update `API_URL` to production backend URL
2. Deploy frontend files to static hosting (GitHub Pages, Netlify, AWS S3, etc.)
3. Ensure CORS is properly configured on backend
4. Use HTTPS for all requests

## Testing the Frontend

### Without Backend
If testing without a running backend:
1. Mock responses in `auth.js` and `dashboard.js`
2. Use browser DevTools Network tab to inspect requests
3. Check localStorage for token storage

### With Backend
1. Start backend: `python -m uvicorn app.main:app --reload`
2. Serve frontend: `python -m http.server 8080`
3. Navigate to `http://localhost:8080/frontend`
4. Test registration → login → dashboard flow

## Troubleshooting

### CORS Errors
- Ensure backend is running on the correct URL
- Check browser console for detailed error messages
- Verify CORS middleware is enabled on backend

### Token Expiration
- Tokens expire after 30 minutes (configurable on backend)
- Expired tokens redirect user to login page
- New token obtained by logging in again

### Storage Full
- localStorage has ~5-10MB limit per domain
- Clear browser cache and cookies if issues persist

### Not Receiving Data
- Check network tab in DevTools
- Verify API endpoints match backend routes
- Ensure authentication token is valid

## Contributing

When adding new features:
1. Follow existing code style
2. Use semantic HTML
3. Test on multiple devices/browsers
4. Update documentation
5. Commit with clear messages

## License

MIT License - See LICENSE file in main repository

---

**Frontend Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Backend API**: http://localhost:8000/api/v1
