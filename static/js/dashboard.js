const API = "";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/login";
}

function authHeaders() {
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function formatCurrency(n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Load Dashboard ──
async function loadDashboard() {
    try {
        const res = await fetch(`${API}/api/expenses/dashboard`, { headers: authHeaders() });
        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }
        const data = await res.json();

        document.getElementById("total-balance").textContent = formatCurrency(data.total_balance);
        document.getElementById("total-income").textContent = formatCurrency(data.total_income);
        document.getElementById("total-expenses").textContent = formatCurrency(data.total_expenses);

        renderExpenses(data.recent_expenses);
    } catch {
        console.error("Failed to load dashboard");
    }
}

// ── Render Expenses ──
function renderExpenses(expenses) {
    const list = document.getElementById("expenses-list");
    if (!expenses.length) {
        list.innerHTML = '<div class="empty-state">No expenses yet. Add your first one!</div>';
        return;
    }

    list.innerHTML = expenses.map((e) => {
        const isIncome = e.type === "income";
        const sign = isIncome ? "+" : "-";
        const colorClass = isIncome ? "green" : "red";
        const badgeClass = `badge badge-${e.category}`;

        return `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-title">${escapeHtml(e.title)}</div>
                <div class="expense-meta">
                    <span class="${badgeClass}">${escapeHtml(e.category)}</span>
                    <span>${e.date}</span>
                </div>
            </div>
            <span class="expense-amount ${colorClass}">${sign}${formatCurrency(e.amount)}</span>
            <div class="expense-actions">
                <button class="btn btn-danger" onclick="deleteExpense(${e.id})">Delete</button>
            </div>
        </div>`;
    }).join("");
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ── Add Expense ──
const expenseForm = document.getElementById("expense-form");
expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        title: document.getElementById("title").value.trim(),
        amount: parseFloat(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        type: document.getElementById("type").value,
        date: document.getElementById("date").value,
        description: document.getElementById("description").value.trim(),
    };

    try {
        const res = await fetch(`${API}/api/expenses/`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(payload),
        });
        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }
        if (res.ok) {
            expenseForm.reset();
            setDefaultDate();
            loadDashboard();
        }
    } catch {
        console.error("Failed to add expense");
    }
});

// ── Delete Expense ──
async function deleteExpense(id) {
    try {
        const res = await fetch(`${API}/api/expenses/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }
        loadDashboard();
    } catch {
        console.error("Failed to delete expense");
    }
}

// ── Logout ──
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
});

// ── Set default date to today ──
function setDefaultDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today;
}

setDefaultDate();
loadDashboard();
