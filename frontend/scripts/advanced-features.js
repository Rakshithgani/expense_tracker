/**
 * Enhanced Dashboard Features
 * Includes charts, advanced filtering, sorting, and export functionality
 */

/**
 * Initialize Chart.js for expense visualization
 */
async function initializeCharts(expenses) {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded. Charts will not display.');
        return;
    }

    try {
        // Category breakdown pie chart
        renderCategoryChart(expenses);
        
        // Monthly trend line chart
        renderMonthlyTrendChart(expenses);
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

/**
 * Render category breakdown pie chart
 */
function renderCategoryChart(expenses) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Calculate category totals
    const categoryTotals = {};
    expenses.forEach(exp => {
        if (!categoryTotals[exp.category]) {
            categoryTotals[exp.category] = 0;
        }
        categoryTotals[exp.category] += parseFloat(exp.amount);
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    // Define colors for each category
    const colors = [
        '#4f46e5', '#7c3aed', '#10b981', '#f59e0b',
        '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#f97316'
    ];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors.slice(0, categories.length),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim(),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-dark').trim(),
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const amount = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((amount / total) * 100).toFixed(1);
                            return `$${amount.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render monthly trend line chart
 */
function renderMonthlyTrendChart(expenses) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    // Calculate monthly totals for last 6 months
    const now = new Date();
    const monthlyData = {};

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthlyData[monthKey] = 0;
    }

    expenses.forEach(exp => {
        const expDate = new Date(exp.date);
        const monthKey = expDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        if (monthlyData.hasOwnProperty(monthKey)) {
            monthlyData[monthKey] += parseFloat(exp.amount);
        }
    });

    const labels = Object.keys(monthlyData);
    const data = Object.values(monthlyData);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Expenses',
                data: data,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4f46e5',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-dark').trim(),
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim(),
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim()
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Sort expenses by different criteria
 */
function sortExpenses(expenses, sortBy = 'date') {
    const sorted = [...expenses];
    
    switch(sortBy) {
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'amount-asc':
            sorted.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
            break;
        case 'amount-desc':
            sorted.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
            break;
        case 'title':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'category':
            sorted.sort((a, b) => a.category.localeCompare(b.category));
            break;
        default:
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    return sorted;
}

/**
 * Advanced filtering of expenses
 */
function filterExpensesAdvanced(expenses, filters = {}) {
    let filtered = [...expenses];
    
    // Filter by category
    if (filters.category && filters.category !== '') {
        filtered = filtered.filter(exp => 
            exp.category.toLowerCase().includes(filters.category.toLowerCase())
        );
    }
    
    // Filter by amount range
    if (filters.minAmount) {
        filtered = filtered.filter(exp => parseFloat(exp.amount) >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
        filtered = filtered.filter(exp => parseFloat(exp.amount) <= parseFloat(filters.maxAmount));
    }
    
    // Filter by date range
    if (filters.startDate) {
        filtered = filtered.filter(exp => new Date(exp.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
        filtered = filtered.filter(exp => new Date(exp.date) <= new Date(filters.endDate));
    }
    
    // Filter by title search
    if (filters.search && filters.search !== '') {
        filtered = filtered.filter(exp => 
            exp.title.toLowerCase().includes(filters.search.toLowerCase())
        );
    }
    
    // Sort results
    if (filters.sortBy) {
        filtered = sortExpenses(filtered, filters.sortBy);
    }
    
    return filtered;
}

/**
 * Export expenses to CSV
 */
function exportToCSV(expenses) {
    if (expenses.length === 0) {
        alert('No expenses to export');
        return;
    }
    
    // Prepare CSV header
    const headers = ['Date', 'Title', 'Amount', 'Category', 'Created At'];
    
    // Prepare CSV rows
    const rows = expenses.map(exp => [
        exp.date,
        `"${exp.title}"`,  // Wrap in quotes to handle commas
        exp.amount,
        exp.category,
        new Date(exp.created_at).toLocaleString()
    ]);
    
    // Combine header and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('expenseMessage', 'Expenses exported successfully!', 'success');
}

/**
 * Print expenses
 */
function printExpenses(expenses) {
    if (expenses.length === 0) {
        alert('No expenses to print');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Expense Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #4f46e5; color: white; }
                tr:hover { background-color: #f5f5f5; }
                .total { font-weight: bold; text-align: right; }
                .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>Expense Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${expenses.map(exp => `
                        <tr>
                            <td>${exp.date}</td>
                            <td>${escapeHtml(exp.title)}</td>
                            <td>${exp.category}</td>
                            <td>$${parseFloat(exp.amount).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td colspan="3" class="total">Total:</td>
                        <td class="total">$${expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="footer">
                <p>This is an automated report generated by Expense Tracker</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    const html = document.documentElement;
    const isDarkMode = html.classList.contains('dark-mode');
    
    if (isDarkMode) {
        html.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    } else {
        html.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    }
}

/**
 * Load dark mode preference from localStorage
 */
function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode');
    
    // Check system preference if no saved preference
    if (!darkMode) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        localStorage.setItem('darkMode', prefersDark ? 'true' : 'false');
        if (prefersDark) {
            document.documentElement.classList.add('dark-mode');
        }
    } else if (darkMode === 'true') {
        document.documentElement.classList.add('dark-mode');
    }
}

/**
 * Initialize advanced features
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load dark mode preference
    loadDarkModePreference();
    
    // Setup theme toggle button
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
    }
});
