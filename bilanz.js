// bilanz.js
// Finanzübersicht: Tages-, Wochen-, Monatsbilanz für Company OS

window.bilanzData = JSON.parse(localStorage.getItem('company-os-bilanzData') || '[]');

// Tagesbilanz rendern
window.renderBilanzDaily = function() {
    const content = document.getElementById('bilanz-daily-content');
    if (!content) return;
    const date = document.getElementById('bilanzDatePicker')?.value || new Date().toISOString().slice(0,10);
    // Einnahmen/Ausgaben filtern (Beispiel: alle Verkäufe, Einkäufe, Löhne etc. an diesem Tag)
    const sales = (window.sales || []).filter(s => s.date === date);
    const purchases = (window.materialPurchases || []).filter(p => p.date === date);
    const sessions = (window.workSessions || []).filter(s => s.date === date);

    let income = sales.reduce((sum, s) => sum + (s.items ? s.items.reduce((a, i) => a + (i.price * i.qty), 0) : 0), 0);
    let expenses = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
    let wages = sessions.reduce((sum, sess) => {
        const emp = (window.employees || []).find(e => `${e.firstName} ${e.lastName}` === sess.employeeName);
        const duration = getSessionDuration(sess);
        return sum + ((emp?.hourlyRate || 0) * duration);
    }, 0);

    const profit = income - expenses - wages;
    content.innerHTML = `
        <div class="stats-header">
            <div class="stat-card"><div class="stat-value">$${income.toFixed(2)}</div><div class="stat-label">Einnahmen</div></div>
            <div class="stat-card"><div class="stat-value">$${expenses.toFixed(2)}</div><div class="stat-label">Ausgaben</div></div>
            <div class="stat-card"><div class="stat-value">$${wages.toFixed(2)}</div><div class="stat-label">Löhne</div></div>
            <div class="stat-card"><div class="stat-value ${profit >= 0 ? 'profit-positive' : 'profit-negative'}">$${profit.toFixed(2)}</div><div class="stat-label">Gewinn</div></div>
        </div>
        <div class="card" style="margin-top:20px">
            <h3>Verkäufe</h3>
            ${sales.map(s => `<div>${s.customerName || 'Laufkundschaft'}: $${(s.items || []).reduce((a,i)=>a+(i.price*i.qty),0).toFixed(2)}</div>`).join('') || '<div>-</div>'}
            <h3 style="margin-top:15px;">Einkäufe</h3>
            ${purchases.map(p => `<div>${p.supplier || '-'}: $${(p.total || 0).toFixed(2)}</div>`).join('') || '<div>-</div>'}
            <h3 style="margin-top:15px;">Arbeitszeiten</h3>
            ${sessions.map(sess => {
                const emp = (window.employees || []).find(e => `${e.firstName} ${e.lastName}` === sess.employeeName);
                const wage = (emp?.hourlyRate || 0) * getSessionDuration(sess);
                return `<div>${sess.employeeName}: $${wage.toFixed(2)}</div>`;
            }).join('') || '<div>-</div>'}
        </div>
    `;
};

// Wochenbilanz rendern
window.renderBilanzWeekly = function() {
    const content = document.getElementById('bilanz-weekly-content');
    if (!content) return;
    // Aktuelle Woche bestimmen (Montag-Sonntag)
    const today = new Date();
    const currDate = today;
    const currDay = currDate.getDay() || 7;
    const monday = new Date(currDate);
    monday.setDate(currDate.getDate() - currDay + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    document.getElementById('weekRange').innerText = `KW ${getWeekNumber(monday)} (${formatDate(monday)} - ${formatDate(sunday)})`;

    // Filter für Woche
    const dates = [];
    for(let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().slice(0,10));
    }
    // Alle relevanten Daten dieser Woche
    const sales = (window.sales || []).filter(s => dates.includes(s.date));
    const purchases = (window.materialPurchases || []).filter(p => dates.includes(p.date));
    const sessions = (window.workSessions || []).filter(s => dates.includes(s.date));

    let income = sales.reduce((sum, s) => sum + (s.items ? s.items.reduce((a, i) => a + (i.price * i.qty), 0) : 0), 0);
    let expenses = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
    let wages = sessions.reduce((sum, sess) => {
        const emp = (window.employees || []).find(e => `${e.firstName} ${e.lastName}` === sess.employeeName);
        const duration = getSessionDuration(sess);
        return sum + ((emp?.hourlyRate || 0) * duration);
    }, 0);

    const profit = income - expenses - wages;
    content.innerHTML = `
        <div class="stats-header">
            <div class="stat-card"><div class="stat-value">$${income.toFixed(2)}</div><div class="stat-label">Einnahmen</div></div>
            <div class="stat-card"><div class="stat-value">$${expenses.toFixed(2)}</div><div class="stat-label">Ausgaben</div></div>
            <div class="stat-card"><div class="stat-value">$${wages.toFixed(2)}</div><div class="stat-label">Löhne</div></div>
            <div class="stat-card"><div class="stat-value ${profit >= 0 ? 'profit-positive' : 'profit-negative'}">$${profit.toFixed(2)}</div><div class="stat-label">Gewinn</div></div>
        </div>
    `;
};

// Monatsbilanz rendern
window.renderBilanzMonthly = function() {
    const content = document.getElementById('bilanz-monthly-content');
    if (!content) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthStr = `${year}-${String(month+1).padStart(2,'0')}`;
    document.getElementById('monthRange').innerText = `${getMonthName(month)} ${year}`;
    // Filter für Monat
    const sales = (window.sales || []).filter(s => (s.date || '').startsWith(monthStr));
    const purchases = (window.materialPurchases || []).filter(p => (p.date || '').startsWith(monthStr));
    const sessions = (window.workSessions || []).filter(s => (s.date || '').startsWith(monthStr));

    let income = sales.reduce((sum, s) => sum + (s.items ? s.items.reduce((a, i) => a + (i.price * i.qty), 0) : 0), 0);
    let expenses = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
    let wages = sessions.reduce((sum, sess) => {
        const emp = (window.employees || []).find(e => `${e.firstName} ${e.lastName}` === sess.employeeName);
        const duration = getSessionDuration(sess);
        return sum + ((emp?.hourlyRate || 0) * duration);
    }, 0);

    const profit = income - expenses - wages;
    content.innerHTML = `
        <div class="stats-header">
            <div class="stat-card"><div class="stat-value">$${income.toFixed(2)}</div><div class="stat-label">Einnahmen</div></div>
            <div class="stat-card"><div class="stat-value">$${expenses.toFixed(2)}</div><div class="stat-label">Ausgaben</div></div>
            <div class="stat-card"><div class="stat-value">$${wages.toFixed(2)}</div><div class="stat-label">Löhne</div></div>
            <div class="stat-card"><div class="stat-value ${profit >= 0 ? 'profit-positive' : 'profit-negative'}">$${profit.toFixed(2)}</div><div class="stat-label">Gewinn</div></div>
        </div>
    `;
};

// Exportfunktion für Bilanzdaten (CSV)
window.exportBilanz = function() {
    let csv = 'Typ,Datum,Betrag,Details\n';
    // Verkäufe
    (window.sales || []).forEach(s => {
        csv += `Verkauf,${s.date},${calcSaleTotal(s).toFixed(2)},"${(s.items||[]).map(i=>`${i.name} (${i.qty})`).join('; ')}"\n`;
    });
    // Einkäufe
    (window.materialPurchases || []).forEach(p => {
        csv += `Einkauf,${p.date},-${(p.total || 0).toFixed(2)},"${(p.materials||[]).map(m=>`${m.name} (${m.qty})`).join('; ')}"\n`;
    });
    // Löhne
    (window.workSessions || []).forEach(sess => {
        const emp = (window.employees || []).find(e => `${e.firstName} ${e.lastName}` === sess.employeeName);
        const wage = ((emp?.hourlyRate || 0) * getSessionDuration(sess)).toFixed(2);
        csv += `Lohn,${sess.date},-${wage},"${sess.employeeName}"\n`;
    });
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company-os-bilanz_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    showNotification('Bilanz exportiert!', 'success');
};

// Navigation für Bilanz-Ansichten (dummy, kann erweitert werden)
window.navigateBilanz = function(dir) {
    // Navigation der Zeiträume kann je nach Bedarf mit State-Management erweitert werden
    showNotification('Navigation nicht implementiert (Demo)', 'warning');
};

// Helpers
function getSessionDuration(session) {
    if (!session || !session.startTime || !session.endTime) return 0;
    const [sh, sm] = session.startTime.split(':').map(Number);
    const [eh, em] = session.endTime.split(':').map(Number);
    let start = sh * 60 + sm;
    let end = eh * 60 + em;
    if (end < start) end += 24 * 60; // Über Mitternacht
    const mins = end - start;
    return Math.round((mins / 60) * 100) / 100;
}
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}
function formatDate(date) {
    return date.toISOString().slice(0,10);
}
function getMonthName(m) {
    return ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'][m];
}
function calcSaleTotal(sale) {
    if (!sale || !sale.items) return 0;
    return sale.items.reduce((sum, i) => sum + ((i.price || 0) * (i.qty || 1)), 0);
}

// Direkt Listen füllen beim Laden
document.addEventListener('DOMContentLoaded', function() {
    renderBilanzDaily();
    renderBilanzWeekly();
    renderBilanzMonthly();
});

console.log('✅ bilanz.js geladen');
