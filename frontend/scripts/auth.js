/**
 * Authentication Module
 * Handles user registration, login, and JWT token management
 */

// API on same origin — everything served from one server
const API_URL = window.location.origin + '/api/v1';

/**
 * Show message to user
 */
function showMessage(elementId, message, type = 'success') {
    const messageEl = document.getElementById(elementId);
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.className = `message show ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}

/**
 * Save JWT token to localStorage
 */
function saveToken(token) {
    localStorage.setItem('access_token', token);
}

/**
 * Get JWT token from localStorage
 */
function getToken() {
    return localStorage.getItem('access_token');
}

/**
 * Remove JWT token from localStorage
 */
function removeToken() {
    localStorage.removeItem('access_token');
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!getToken();
}

/**
 * Redirect to login if not authenticated
 */
function redirectIfNotAuthenticated() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

/**
 * Handle User Registration
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('registerMessage', 'Passwords do not match!', 'error');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showMessage('registerMessage', 'Password must be at least 6 characters!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('registerMessage', 'Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            const errorMsg = data.detail || 'Registration failed. Please try again.';
            showMessage('registerMessage', errorMsg, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('registerMessage', 'Network error. Please check your connection.', 'error');
    }
}

/**
 * Handle User Login
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token
            saveToken(data.access_token);
            
            // Save user info
            localStorage.setItem('user_email', data.email);
            localStorage.setItem('user_name', data.username);
            
            showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            const errorMsg = data.detail || 'Login failed. Please check your credentials.';
            showMessage('loginMessage', errorMsg, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Network error. Please check your connection.', 'error');
    }
}

/**
 * Handle User Logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        removeToken();
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_name');
        window.location.href = 'login.html';
    }
}

/**
 * Get authorization header for API calls
 */
function getAuthHeader() {
    const token = getToken();
    if (!token) {
        return null;
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

/**
 * Make authenticated API call
 */
async function authenticatedFetch(url, options = {}) {
    const headers = getAuthHeader();
    
    if (!headers) {
        redirectIfNotAuthenticated();
        return null;
    }
    
    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    });
    
    // If unauthorized, redirect to login
    if (response.status === 401) {
        redirectIfNotAuthenticated();
        return null;
    }
    
    return response;
}

/**
 * Format date string to YYYY-MM-DD
 */
function formatDate(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
}

/**
 * Parse JWT token (without verification - for client-side use only)
 */
function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
    }
}

/**
 * Initialize auth on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default in date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = formatDate(new Date());
        }
    });
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});
