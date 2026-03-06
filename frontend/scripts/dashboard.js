/**
 * Dashboard Module
 * Handles expense management and dashboard functionality
 */

const API_URL = 'http://localhost:8000/api/v1';

// Category emoji mapping
const categoryEmojis = {
    'Food': '🍔',
    'Transportation': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎭',
    'Bills': '💳',
    'Health': '🏥',
    'Travel': '✈️',
    'Education': '📚',
    'Other': '📌'
};

/**
 * Load and display all expenses
 */
async function loadExpenses() {
    try {
        const response = await authenticatedFetch(`${API_URL}/expenses`);
        if (!response) return;
        
        if (!response.ok) {
            showMessage('expenseMessage', 'Failed to load expenses', 'error');
            return;
        }
        
        const expenses = await response.json();
        displayExpenses(expenses);
        updateSummaryCards(expenses);
    } catch (error) {
        console.error('Error loading expenses:', error);
        showMessage('expenseMessage', 'Error loading expenses', 'error');
    }
}

/**
 * Display expenses in the list
 */
function displayExpenses(expenses) {
    const expensesList = document.getElementById('expensesList');
    
    if (!expenses || expenses.length === 0) {
        expensesList.innerHTML = `
            <div class="empty-state">
                <p>📭 No expenses yet. <a href="#" class="nav-link" data-section="add-expense" onclick="switchSection(event, 'add-expense')">Add one now!</a></p>
            </div>
        `;
        return;
    }
    
    // Sort expenses by date (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    expensesList.innerHTML = expenses.map(expense => {
        const emoji = categoryEmojis[expense.category] || '📌';
        const date = new Date(expense.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="expense-item">
                <div class="expense-icon">${emoji}</div>
                <div class="expense-details">
                    <p class="expense-title">${escapeHtml(expense.title)}</p>
                    <div class="expense-info">
                        <span class="expense-category">${expense.category}</span>
                        <span>📅 ${formattedDate}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p class="expense-amount">$${parseFloat(expense.amount).toFixed(2)}</p>
                    <div class="expense-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editExpense(${expense.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Update summary cards with totals
 */
function updateSummaryCards(expenses) {
    const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const totalCount = expenses.length;
    
    // Calculate current month total
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthExpenses = expenses.filter(exp => {
        const date = new Date(exp.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthTotal = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    // Update DOM
    document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('monthAmount').textContent = `$${monthTotal.toFixed(2)}`;
}

/**
 * Handle adding a new expense
 */
async function handleAddExpense(e) {
    e.preventDefault();
    
    const form = e.target;
    const title = form.querySelector('#expenseTitle').value.trim();
    const amount = parseFloat(form.querySelector('#expenseAmount').value);
    const category = form.querySelector('#expenseCategory').value;
    const date = form.querySelector('#expenseDate').value;
    
    if (!title || !amount || !category || !date) {
        showMessage('expenseMessage', 'Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_URL}/expenses`, {
            method: 'POST',
            body: JSON.stringify({
                title,
                amount,
                category,
                date
            })
        });
        
        if (!response) return;
        
        if (response.ok) {
            showMessage('expenseMessage', 'Expense added successfully!', 'success');
            form.reset();
            
            // Set today's date again
            form.querySelector('#expenseDate').value = formatDate(new Date());
            
            // Reload expenses and switch to dashboard
            setTimeout(() => {
                loadExpenses();
                switchSection(null, 'expenses');
            }, 1500);
        } else {
            const data = await response.json();
            const errorMsg = data.detail || 'Failed to add expense';
            showMessage('expenseMessage', errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error adding expense:', error);
        showMessage('expenseMessage', 'Network error. Please try again.', 'error');
    }
}

/**
 * Delete an expense
 */
async function deleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_URL}/expenses/${expenseId}`, {
            method: 'DELETE'
        });
        
        if (!response) return;
        
        if (response.ok || response.status === 204) {
            showMessage('expenseMessage', 'Expense deleted successfully!', 'success');
            setTimeout(() => {
                loadExpenses();
            }, 1000);
        } else {
            const data = await response.json();
            const errorMsg = data.detail || 'Failed to delete expense';
            showMessage('expenseMessage', errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        showMessage('expenseMessage', 'Network error. Please try again.', 'error');
    }
}

/**
 * Edit an expense (placeholder)
 */
function editExpense(expenseId) {
    alert('Edit functionality coming soon! Expense ID: ' + expenseId);
}

/**
 * Switch between sections
 */
function switchSection(e, sectionId) {
    if (e) {
        e.preventDefault();
    }
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Mark nav link as active
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/**
 * Filter expenses by category
 */
function filterExpensesByCategory() {
    const filterInput = document.getElementById('categoryFilter');
    const category = filterInput.value.trim().toLowerCase();
    
    if (!category) {
        loadExpenses();
        return;
    }
    
    const expenseItems = document.querySelectorAll('.expense-item');
    expenseItems.forEach(item => {
        const expenseCategory = item.querySelector('.expense-category').textContent.toLowerCase();
        if (expenseCategory.includes(category)) {
            item.style.display = 'grid';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Escape HTML characters to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize dashboard on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    redirectIfNotAuthenticated();
    
    // Load user info
    const userName = localStorage.getItem('user_name');
    const userEmail = localStorage.getItem('user_email');
    
    if (userName) {
        document.getElementById('userName').textContent = userName;
    }
    if (userEmail) {
        document.getElementById('userEmail').textContent = userEmail;
    }
    
    // Load expenses
    loadExpenses();
    
    // Setup event listeners
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleAddExpense);
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            switchSection(null, sectionId);
        });
    });
    
    // Filter functionality
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('input', filterExpensesByCategory);
    }
    
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            document.getElementById('categoryFilter').value = '';
            loadExpenses();
        });
    }
    
    // Set default date to today
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) {
        dateInput.value = formatDate(new Date());
    }
});
