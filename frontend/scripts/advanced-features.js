/**
 * Advanced Features — Sorting, Filtering, Export, Print
 */

/** Sort expenses */
function sortExpenses(expenses, sortBy) {
    const sorted = [...expenses];
    switch (sortBy) {
        case 'date-asc':    sorted.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
        case 'date-desc':   sorted.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
        case 'amount-asc':  sorted.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount)); break;
        case 'amount-desc': sorted.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)); break;
        case 'title':       sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
        case 'category':    sorted.sort((a, b) => a.category.localeCompare(b.category)); break;
        default:            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return sorted;
}

/** Advanced filter */
function filterExpensesAdvanced(expenses, filters) {
    let f = [...expenses];
    if (filters.category) f = f.filter(e => e.category.toLowerCase().includes(filters.category.toLowerCase()));
    if (filters.minAmount) f = f.filter(e => parseFloat(e.amount) >= parseFloat(filters.minAmount));
    if (filters.maxAmount) f = f.filter(e => parseFloat(e.amount) <= parseFloat(filters.maxAmount));
    if (filters.startDate) f = f.filter(e => new Date(e.date) >= new Date(filters.startDate));
    if (filters.endDate)   f = f.filter(e => new Date(e.date) <= new Date(filters.endDate));
    if (filters.search) f = f.filter(e => e.title.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.sortBy) f = sortExpenses(f, filters.sortBy);
    return f;
}

/** Export CSV */
function exportToCSV(expenses) {
    if (!expenses.length) { alert('No expenses to export'); return; }
    const headers = ['Date', 'Title', 'Amount', 'Category', 'Created At'];
    const rows = expenses.map(e => [e.date, `"${e.title}"`, e.amount, e.category, new Date(e.created_at).toLocaleString()]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/** Print Report */
function printExpenses(expenses) {
    if (!expenses.length) { alert('No expenses to print'); return; }
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Expense Report</title>
    <style>body{font-family:Inter,Arial,sans-serif;margin:24px;color:#202126}
    h1{text-align:center}table{width:100%;border-collapse:collapse;margin-top:20px}
    th,td{padding:10px;text-align:left;border-bottom:1px solid #e8e9ee}
    th{background:#202126;color:#fff}.total{font-weight:700;text-align:right}
    .footer{margin-top:20px;text-align:center;color:#7c7e8a;font-size:12px}</style>
    </head><body><h1>Expense Report</h1><p>Generated: ${new Date().toLocaleString()}</p>
    <table><thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Amount</th></tr></thead><tbody>
    ${expenses.map(e => `<tr><td>${e.date}</td><td>${e.title}</td><td>${e.category}</td><td>$${parseFloat(e.amount).toFixed(2)}</td></tr>`).join('')}
    <tr><td colspan="3" class="total">Total:</td><td class="total">$${expenses.reduce((s,e)=>s+parseFloat(e.amount),0).toFixed(2)}</td></tr>
    </tbody></table><div class="footer"><p>Exonad Expense Tracker</p></div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 250);
}

/** Date formatter */
function formatDate(d) {
    return d.toISOString().split('T')[0];
}
