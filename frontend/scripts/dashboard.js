/**
 * Dashboard Module — Exonad
 * Handles expense management, summary cards, charts, and navigation
 */

// API on same origin — everything served from one server
const API_URL = window.location.origin + '/api/v1';

const categoryIcons = {
    'Food': 'utensils',
    'Transportation': 'car',
    'Shopping': 'shopping-bag',
    'Entertainment': 'film',
    'Bills': 'credit-card',
    'Health': 'heart-pulse',
    'Travel': 'plane',
    'Education': 'book-open',
    'Salary': 'briefcase',
    'Other': 'tag'
};

let allExpenses = [];

/* ===== Load Expenses ===== */
async function loadExpenses() {
    try {
        const response = await authenticatedFetch(`${API_URL}/expenses`);
        if (!response) return;
        if (!response.ok) {
            showMessage('expenseMessage', 'Failed to load expenses', 'error');
            return;
        }
        allExpenses = await response.json();
        displayExpenses(allExpenses);
        updateSummaryCards(allExpenses);
        initializeCharts(allExpenses);
    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}

/* ===== Display Expense List ===== */
function displayExpenses(expenses) {
    const list = document.getElementById('expensesList');
    if (!list) return;

    if (!expenses || expenses.length === 0) {
        list.innerHTML = '<div class="empty-state"><i data-lucide="inbox"></i><p>No expenses yet. Add one!</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = expenses.map(exp => {
        const icon = categoryIcons[exp.category] || 'tag';
        const d = new Date(exp.date);
        const fmt = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        return `
        <div class="expense-item">
            <div class="expense-icon"><i data-lucide="${icon}"></i></div>
            <div class="expense-details">
                <p class="expense-title">${escapeHtml(exp.title)}</p>
                <div class="expense-info">
                    <span class="expense-category">${escapeHtml(exp.category)}</span>
                    <span>${fmt}</span>
                </div>
            </div>
            <div style="text-align:right">
                <p class="expense-amount">$${parseFloat(exp.amount).toFixed(2)}</p>
                <div class="expense-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editExpense(${exp.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteExpense(${exp.id})">Del</button>
                </div>
            </div>
        </div>`;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ===== Summary Cards ===== */
function updateSummaryCards(expenses) {
    const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();
    const monthTotal = expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === cm && d.getFullYear() === cy; })
        .reduce((s, e) => s + parseFloat(e.amount), 0);

    // Income entries (Salary category as proxy)
    const income = expenses.filter(e => e.category === 'Salary').reduce((s, e) => s + parseFloat(e.amount), 0);
    const expenseTotal = expenses.filter(e => e.category !== 'Salary').reduce((s, e) => s + parseFloat(e.amount), 0);
    const savings = income - expenseTotal;

    const el = id => document.getElementById(id);
    if (el('totalIncome'))   el('totalIncome').textContent   = '$' + income.toFixed(2);
    if (el('totalAmount'))   el('totalAmount').textContent   = '$' + expenseTotal.toFixed(2);
    if (el('currentBalance'))el('currentBalance').textContent = '$' + Math.max(0, savings).toFixed(2);

    // Top category (most spending, excluding Salary)
    const cats = {};
    expenses.filter(e => e.category !== 'Salary').forEach(e => {
        cats[e.category] = (cats[e.category] || 0) + parseFloat(e.amount);
    });
    const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
    if (el('topCategory'))       el('topCategory').textContent       = topCat ? topCat[0] : '—';
    if (el('topCategoryAmount')) el('topCategoryAmount').textContent = topCat ? '$' + topCat[1].toFixed(2) : '';
}

/* ===== Charts ===== */
let chartInstances = {};

function destroyChart(name) {
    if (chartInstances[name]) { chartInstances[name].destroy(); chartInstances[name] = null; }
}

function initializeCharts(expenses) {
    if (typeof Chart === 'undefined') return;
    renderCategoryBarChart(expenses);
    renderDonutChart(expenses);
    renderActivityChart(expenses);
}

/* --- Top 5 Bar Chart --- */
function renderCategoryBarChart(expenses) {
    const ctx = document.getElementById('categoryBarChart');
    if (!ctx) return;
    destroyChart('bar');

    const cats = {};
    expenses.filter(e => e.category !== 'Salary').forEach(e => {
        cats[e.category] = (cats[e.category] || 0) + parseFloat(e.amount);
    });
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = sorted.map(s => s[0]);
    const data   = sorted.map(s => s[1]);

    const palette = ['#202126','#3a3b42','#5c5d66','#8b8c94','#b5b6bd'];

    chartInstances['bar'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: palette.slice(0, data.length),
                borderRadius: 6,
                barPercentage: .55,
                categoryPercentage: .7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#202126',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: { label: c => '$' + c.parsed.y.toFixed(2) }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f0f0f3' },
                    ticks: { color: '#7c7e8a', font: { size: 11 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(1)+'k' : v) }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#7c7e8a', font: { size: 11 } }
                }
            }
        }
    });
}

/* --- Donut (Report Overview) --- */
function renderDonutChart(expenses) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    destroyChart('donut');

    const income  = expenses.filter(e => e.category === 'Salary').reduce((s, e) => s + parseFloat(e.amount), 0);
    const expense = expenses.filter(e => e.category !== 'Salary').reduce((s, e) => s + parseFloat(e.amount), 0);
    const savings = Math.max(0, income - expense);

    const data   = [income, expense, savings];
    const labels = ['Income', 'Expense', 'Savings'];
    const colors = ['#202126', '#6c6d75', '#b5b6bd'];

    chartInstances['donut'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 3,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            cutout: '62%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#202126',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: { label: c => c.label + ': $' + c.parsed.toFixed(2) }
                }
            }
        }
    });

    // Custom legend
    const legendEl = document.getElementById('donutLegend');
    if (legendEl) {
        legendEl.innerHTML = labels.map((l, i) =>
            `<span class="donut-legend-item"><span class="donut-legend-dot" style="background:${colors[i]}"></span>${l} $${data[i].toFixed(0)}</span>`
        ).join('');
    }
}

/* --- Activity Line Chart --- */
function renderActivityChart(expenses) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;
    destroyChart('line');

    const now = new Date();
    const monthly = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 5);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        monthly[key] = 0;
    }
    expenses.forEach(e => {
        const ed = new Date(e.date);
        const key = ed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (monthly.hasOwnProperty(key)) monthly[key] += parseFloat(e.amount);
    });

    const labels = Object.keys(monthly);
    const data   = Object.values(monthly);

    chartInstances['line'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Actual expense',
                data,
                borderColor: '#202126',
                backgroundColor: 'rgba(32,33,38,.06)',
                borderWidth: 2.5,
                fill: true,
                tension: .4,
                pointBackgroundColor: '#202126',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { color: '#7c7e8a', font: { size: 12 }, usePointStyle: true, pointStyle: 'line' }
                },
                tooltip: {
                    backgroundColor: '#202126',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: { label: c => '$' + c.parsed.y.toFixed(2) }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f0f0f3' },
                    ticks: { color: '#7c7e8a', font: { size: 11 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(1)+'k' : v) }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#7c7e8a', font: { size: 11 } }
                }
            }
        }
    });
}

/* ===== Add Expense ===== */
async function handleAddExpense(e) {
    e.preventDefault();
    const form = e.target;
    const title    = form.querySelector('[name="title"]').value.trim();
    const amount   = parseFloat(form.querySelector('[name="amount"]').value);
    const category = form.querySelector('[name="category"]').value;
    const date     = form.querySelector('[name="date"]').value;
    const msgId    = 'expenseMessage';

    if (!title || !amount || !category || !date) {
        showMessage(msgId, 'Please fill in all fields', 'error');
        return;
    }
    try {
        const response = await authenticatedFetch(`${API_URL}/expenses`, {
            method: 'POST',
            body: JSON.stringify({ title, amount, category, date })
        });
        if (!response) return;
        if (response.ok) {
            showMessage(msgId, 'Expense added!', 'success');
            form.reset();
            const di = form.querySelector('[name="date"]');
            if (di) di.value = formatDate(new Date());
            setTimeout(() => { loadExpenses(); switchSection(null, 'dashboard-view'); }, 800);
        } else {
            const d = await response.json();
            showMessage(msgId, d.detail || 'Failed to add expense', 'error');
        }
    } catch (err) {
        showMessage(msgId, 'Network error. Try again.', 'error');
    }
}

/* ===== Delete ===== */
async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    try {
        const r = await authenticatedFetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
        if (!r) return;
        if (r.ok || r.status === 204) loadExpenses();
        else { const d = await r.json(); alert(d.detail || 'Failed'); }
    } catch { alert('Network error'); }
}

function editExpense(id) { alert('Edit coming soon! ID: ' + id); }

/* ===== Navigation ===== */
function switchSection(e, sectionId) {
    if (e) e.preventDefault();
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const sec = document.getElementById(sectionId);
    if (sec) sec.classList.add('active');
    const link = document.querySelector(`[data-section="${sectionId}"]`);
    if (link) link.classList.add('active');
}

/* ===== Filtering ===== */
function applyAdvancedFilter() {
    if (!allExpenses.length) return;
    const search   = (document.getElementById('searchInput') || {}).value || '';
    const category = (document.getElementById('categoryFilter') || {}).value || '';
    const sortBy   = (document.getElementById('sortBy') || {}).value || 'date-desc';
    let filtered = filterExpensesAdvanced(allExpenses, { search, category, sortBy });
    displayExpenses(filtered);
}

/* ===== Helpers ===== */
function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', function() {
    redirectIfNotAuthenticated();

    const userName  = localStorage.getItem('user_name');
    const userEmail = localStorage.getItem('user_email');
    if (userName)  document.getElementById('userName').textContent  = userName;
    if (userEmail) document.getElementById('userEmail').textContent = userEmail;

    loadExpenses();

    // Forms
    const ef = document.getElementById('expenseForm');
    if (ef) ef.addEventListener('submit', handleAddExpense);

    // Nav
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            switchSection(null, link.getAttribute('data-section'));
        });
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        window.location.href = '/pages/login.html';
    });

    // Filters
    ['searchInput','categoryFilter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', applyAdvancedFilter);
    });
    const sortBy = document.getElementById('sortBy');
    if (sortBy) sortBy.addEventListener('change', applyAdvancedFilter);

    // Export / Print
    const exportBtn       = document.getElementById('exportBtn');
    const exportReportBtn = document.getElementById('exportReportBtn');
    const printBtn        = document.getElementById('printBtn');
    if (exportBtn)       exportBtn.addEventListener('click', () => exportToCSV(allExpenses));
    if (exportReportBtn) exportReportBtn.addEventListener('click', () => exportToCSV(allExpenses));
    if (printBtn)        printBtn.addEventListener('click', () => printExpenses(allExpenses));

    // Period pills (UI only)
    document.querySelectorAll('.pill').forEach(p => {
        p.addEventListener('click', () => {
            document.querySelectorAll('.pill').forEach(pp => pp.classList.remove('active'));
            p.classList.add('active');
        });
    });

    // Default date
    document.querySelectorAll('[name="date"]').forEach(input => { input.value = formatDate(new Date()); });
});
