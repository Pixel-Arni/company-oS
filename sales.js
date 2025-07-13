// sales.js
// Verkauf & Kassenmodul für Company OS

// Datenstruktur Verkauf:
// [{ customerName, date, type, items: [{ name, qty, price }], notes, paid }]

window.sales = JSON.parse(localStorage.getItem('company-os-sales') || '[]');

// Tagesverkauf rendern (heutige Verkäufe)
window.renderSalesDaily = function() {
    const list = document.getElementById('sales-daily-list');
    if (!list) return;
    if (!window.sales || window.sales.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Verkäufe erfasst.</div>`;
        return;
    }
    // Heutiges Datum
    const today = new Date().toISOString().slice(0,10);
    const todaysSales = window.sales.filter(s => s.date === today);
    if (todaysSales.length === 0) {
        list.innerHTML = `<div class="empty-state">Heute noch keine Verkäufe.</div>`;
        return;
    }
    list.innerHTML = todaysSales.map((sale, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${sale.customerName || 'Laufkundschaft'}</h3>
                <p>${sale.date} (${sale.type})</p>
                <p>Items: ${sale.items?.map(i => `${i.name} (${i.qty}x @ $${i.price?.toFixed(2) ?? '0.00'})`).join(', ') || '-'}</p>
                <p>Gesamt: $${calcSaleTotal(sale).toFixed(2)}</p>
                <p>Status: ${sale.paid ? '✅ bezahlt' : '❌ offen'}</p>
                <p>Notizen: ${sale.notes || '-'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editSale(${window.sales.indexOf(sale)})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteSale(${window.sales.indexOf(sale)})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Verkaufsübersicht (letzte 6 Monate)
window.renderSalesOverview = function() {
    const list = document.getElementById('sales-overview-content');
    if (!list) return;
    if (!window.sales || window.sales.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Verkäufe vorhanden.</div>`;
        return;
    }
    // Nur letzte 6 Monate
    const now = new Date();
    const minDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const filteredSales = window.sales.filter(s => new Date(s.date) >= minDate);
    if (filteredSales.length === 0) {
        list.innerHTML = `<div class="empty-state">Keine Verkäufe in den letzten 6 Monaten.</div>`;
        return;
    }
    list.innerHTML = filteredSales.map((sale, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${sale.customerName || 'Laufkundschaft'}</h3>
                <p>${sale.date} (${sale.type})</p>
                <p>Items: ${sale.items?.map(i => `${i.name} (${i.qty}x @ $${i.price?.toFixed(2) ?? '0.00'})`).join(', ') || '-'}</p>
                <p>Gesamt: $${calcSaleTotal(sale).toFixed(2)}</p>
                <p>Status: ${sale.paid ? '✅ bezahlt' : '❌ offen'}</p>
                <p>Notizen: ${sale.notes || '-'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editSale(${window.sales.indexOf(sale)})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteSale(${window.sales.indexOf(sale)})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Verkauf hinzufügen (neuer Verkauf im Tagesverkauf)
window.addSale = function() {
    const customerName = document.getElementById('newSaleCustomer').value || 'Laufkundschaft';
    const date = document.getElementById('newSaleDate').value || new Date().toISOString().slice(0,10);
    const type = document.getElementById('newSaleType').value || 'regular';
    const notes = document.getElementById('newSaleNotes').value.trim();
    const items = getItemsFromSelectionList('itemSelectionList');
    if (!items.length) {
        showNotification('Mindestens ein Item auswählen!', 'error');
        return;
    }
    const sale = { customerName, date, type, items, notes, paid: false };
    window.sales.push(sale);
    saveSales();
    renderSalesDaily();
    renderSalesOverview();
    clearNewSaleFields();
    showNotification('Verkauf hinzugefügt!', 'success');
};

// Bearbeiten (öffnet Modal)
window.editSale = function(idx) {
    const sale = window.sales[idx];
    if (!sale) return;
    document.getElementById('editSaleCustomer').value = sale.customerName || '';
    document.getElementById('editSaleDate').value = sale.date || '';
    document.getElementById('editSaleType').value = sale.type || 'regular';
    document.getElementById('editSalePaid').checked = !!sale.paid;
    document.getElementById('editSaleNotes').value = sale.notes || '';
    setItemsToSelectionList('editItemSelectionList', sale.items || []);
    window._editingSaleIndex = idx;
    showModal('editSaleModal');
};

// Speichern nach Bearbeitung
window.saveSaleEdit = function() {
    const idx = window._editingSaleIndex;
    if (idx === undefined) return;
    const customerName = document.getElementById('editSaleCustomer').value || 'Laufkundschaft';
    const date = document.getElementById('editSaleDate').value;
    const type = document.getElementById('editSaleType').value;
    const paid = document.getElementById('editSalePaid').checked;
    const notes = document.getElementById('editSaleNotes').value.trim();
    const items = getItemsFromSelectionList('editItemSelectionList');
    if (!date || !items.length) {
        showNotification('Datum und mindestens ein Item angeben!', 'error');
        return;
    }
    window.sales[idx] = { customerName, date, type, items, notes, paid };
    saveSales();
    renderSalesDaily();
    renderSalesOverview();
    hideModal('editSaleModal');
    showNotification('Verkauf gespeichert!', 'success');
    window._editingSaleIndex = undefined;
};

// Verkauf löschen
window.deleteSale = function(idx) {
    if (!confirm('Wirklich löschen?')) return;
    window.sales.splice(idx, 1);
    saveSales();
    renderSalesDaily();
    renderSalesOverview();
    showNotification('Verkauf gelöscht!', 'success');
};

// Hilfsfunktionen für Item-Auswahl im Modal
function getItemsFromSelectionList(listId) {
    const container = document.getElementById(listId);
    if (!container) return [];
    const rows = container.querySelectorAll('.item-assignment-row');
    return Array.from(rows).map(row => {
        const name = row.querySelector('.item-name')?.textContent?.trim() || '';
        const qty = parseFloat(row.querySelector('.quantity-input')?.value) || 1;
        const price = parseFloat(row.querySelector('.item-price')?.textContent?.replace('$','')) || 0;
        return { name, qty, price };
    }).filter(i => i.name && i.qty > 0);
}
function setItemsToSelectionList(listId, items) {
    const container = document.getElementById(listId);
    if (!container) return;
    container.innerHTML = '';
    (items || []).forEach(item => {
        const row = document.createElement('div');
        row.className = 'item-assignment-row';
        row.innerHTML = `
            <span class="item-name">${item.name}</span>
            <input type="number" class="quantity-input" value="${item.qty}" min="1">
            <span class="item-price">$${item.price?.toFixed(2) ?? '0.00'}</span>
            <button class="remove-item" onclick="this.parentElement.remove()">✖</button>
        `;
        container.appendChild(row);
    });
}

// Preisberechnung für Verkauf (Gesamtsumme)
function calcSaleTotal(sale) {
    if (!sale || !sale.items) return 0;
    return sale.items.reduce((sum, i) => sum + ((i.price || 0) * (i.qty || 1)), 0);
}

// Felder zurücksetzen nach Hinzufügen
function clearNewSaleFields() {
    document.getElementById('newSaleCustomer').selectedIndex = 0;
    document.getElementById('newSaleDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('newSaleType').value = 'regular';
    document.getElementById('newSaleNotes').value = '';
    if (document.getElementById('itemSelectionList')) document.getElementById('itemSelectionList').innerHTML = '';
}

// Speichern in LocalStorage
function saveSales() {
    localStorage.setItem('company-os-sales', JSON.stringify(window.sales));
    if (typeof saveData === 'function') saveData();
}

// Beim Laden Listen füllen
document.addEventListener('DOMContentLoaded', function() {
    renderSalesDaily();
    renderSalesOverview();
});

console.log('✅ sales.js geladen');
