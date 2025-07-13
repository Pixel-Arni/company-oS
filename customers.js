// customers.js
// Kundenverwaltung für Company OS

// Datenstruktur:
// [{ firstName, lastName, email, phone, type, discount, notes, active }]

window.customers = JSON.parse(localStorage.getItem('company-os-customers') || '[]');

// Kunden-Übersicht rendern
window.renderCustomersOverview = function() {
    const list = document.getElementById('customers-overview-content');
    if (!list) return;
    if (!window.customers || window.customers.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Kunden vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.customers.map((cust, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${cust.firstName} ${cust.lastName}</h3>
                <p>Typ: ${cust.type ?? 'Standard'}</p>
                <p>Rabatt: ${cust.discount ?? 0}%</p>
                <p>Telefon: ${cust.phone ?? '-'}</p>
                <p>Status: ${(cust.active === false) ? 'Inaktiv' : 'Aktiv'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editCustomer(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteCustomer(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Kundenverwaltung rendern
window.renderCustomersManagement = function() {
    const list = document.getElementById('customers-management-list');
    if (!list) return;
    if (!window.customers || window.customers.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Kunden vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.customers.map((cust, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${cust.firstName} ${cust.lastName}</h3>
                <p>Typ: ${cust.type ?? 'Standard'}</p>
                <p>Rabatt: ${cust.discount ?? 0}%</p>
                <p>Telefon: ${cust.phone ?? '-'}</p>
                <p>Status: ${(cust.active === false) ? 'Inaktiv' : 'Aktiv'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editCustomer(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteCustomer(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Neuen Kunden hinzufügen
window.addCustomer = function() {
    const firstName = document.getElementById('newCustomerFirstName').value.trim();
    const lastName = document.getElementById('newCustomerLastName').value.trim();
    const email = document.getElementById('newCustomerEmail').value.trim();
    const phone = document.getElementById('newCustomerPhone').value.trim();
    const type = document.getElementById('newCustomerType').value;
    const discount = parseInt(document.getElementById('newCustomerDiscount').value) || 0;
    const notes = document.getElementById('newCustomerNotes').value.trim();
    if (!firstName || !lastName) {
        showNotification('Vor- und Nachname sind Pflicht!', 'error');
        return;
    }
    window.customers.push({
        firstName, lastName, email, phone, type, discount, notes, active: true
    });
    saveCustomers();
    renderCustomersOverview();
    renderCustomersManagement();
    // Felder zurücksetzen
    document.getElementById('newCustomerFirstName').value = '';
    document.getElementById('newCustomerLastName').value = '';
    document.getElementById('newCustomerEmail').value = '';
    document.getElementById('newCustomerPhone').value = '';
    document.getElementById('newCustomerDiscount').value = 0;
    document.getElementById('newCustomerNotes').value = '';
    document.getElementById('newCustomerType').value = 'Standard';
    hideModal('customerModal');
    showNotification('Kunde hinzugefügt!', 'success');
};

// Kunden bearbeiten (öffnet Modal und füllt Felder)
window.editCustomer = function(idx) {
    const cust = window.customers[idx];
    if (!cust) return;
    document.getElementById('editCustomerFirstName').value = cust.firstName;
    document.getElementById('editCustomerLastName').value = cust.lastName;
    document.getElementById('editCustomerEmail').value = cust.email || '';
    document.getElementById('editCustomerPhone').value = cust.phone || '';
    document.getElementById('editCustomerType').value = cust.type || 'Standard';
    document.getElementById('editCustomerDiscount').value = cust.discount || 0;
    document.getElementById('editCustomerNotes').value = cust.notes || '';
    document.getElementById('editCustomerActive').checked = cust.active !== false;
    window._editingCustomerIndex = idx;
    showModal('editCustomerModal');
};

// Speichern nach Bearbeitung
window.saveCustomerEdit = function() {
    const idx = window._editingCustomerIndex;
    if (idx === undefined) return;
    const firstName = document.getElementById('editCustomerFirstName').value.trim();
    const lastName = document.getElementById('editCustomerLastName').value.trim();
    const email = document.getElementById('editCustomerEmail').value.trim();
    const phone = document.getElementById('editCustomerPhone').value.trim();
    const type = document.getElementById('editCustomerType').value;
    const discount = parseInt(document.getElementById('editCustomerDiscount').value) || 0;
    const notes = document.getElementById('editCustomerNotes').value.trim();
    const active = document.getElementById('editCustomerActive').checked;
    if (!firstName || !lastName) {
        showNotification('Vor- und Nachname sind Pflicht!', 'error');
        return;
    }
    window.customers[idx] = {
        firstName, lastName, email, phone, type, discount, notes, active
    };
    saveCustomers();
    renderCustomersOverview();
    renderCustomersManagement();
    hideModal('editCustomerModal');
    showNotification('Kunde gespeichert!', 'success');
    window._editingCustomerIndex = undefined;
};

// Kunde löschen
window.deleteCustomer = function(idx) {
    if (!confirm('Wirklich löschen?')) return;
    window.customers.splice(idx, 1);
    saveCustomers();
    renderCustomersOverview();
    renderCustomersManagement();
    showNotification('Kunde gelöscht!', 'success');
};

// Helper zum Speichern
function saveCustomers() {
    localStorage.setItem('company-os-customers', JSON.stringify(window.customers));
    if (typeof saveData === 'function') saveData();
}

// Beim Laden: Listen direkt rendern
document.addEventListener('DOMContentLoaded', function() {
    renderCustomersOverview();
    renderCustomersManagement();
});

console.log('✅ customers.js geladen');
