// renderTemplates.js
// Renderfunktionen für Company OS – als Vorlage für alle Listenbereiche

// Items-Liste
window.renderItemsList = function() {
    const list = document.getElementById('items-list');
    if(!list) return;
    if(!window.items || window.items.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Items vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.items.map((item, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${item.name}</h3>
                <p>Verkaufspreis: $${item.sellPrice?.toFixed(2) ?? '0.00'}</p>
                <p>Materialien: ${item.materials && item.materials.length ? item.materials.map(m => `${m.name} (${m.qty}x)`).join(', ') : '-'}</p>
                <p>Verarbeitungsdauer: ${item.craftTime ? item.craftTime + ' Min.' : 'n/a'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editItem(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteItem(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Materialien-Liste
window.renderMaterialsList = function() {
    const list = document.getElementById('materials-list');
    if(!list) return;
    if(!window.materials || window.materials.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Materialien vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.materials.map((mat, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${mat.name}</h3>
                <p>Preis pro Einheit: $${mat.price?.toFixed(2) ?? '0.00'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editMaterial(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteMaterial(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Kundenübersicht
window.renderCustomersOverview = function() {
    const list = document.getElementById('customers-overview-content');
    if(!list) return;
    if(!window.customers || window.customers.length === 0) {
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

// Kundenverwaltung
window.renderCustomersManagement = function() {
    const list = document.getElementById('customers-management-list');
    if(!list) return;
    if(!window.customers || window.customers.length === 0) {
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

// Mitarbeiter-Übersicht
window.renderEmployeesOverview = function() {
    const list = document.getElementById('employees-overview-content');
    if(!list) return;
    if(!window.employees || window.employees.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Mitarbeiter vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.employees.map((emp, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${emp.firstName} ${emp.lastName}</h3>
                <p>Rang: ${emp.rank || '-'}</p>
                <p>Stundenlohn: $${emp.hourlyRate?.toFixed(2) ?? '0.00'}</p>
                <p>Status: ${(emp.active === false) ? 'Inaktiv' : 'Aktiv'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editEmployee(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteEmployee(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Mitarbeiter-Verwaltung
window.renderEmployeesManagement = function() {
    const list = document.getElementById('employees-management-list');
    if(!list) return;
    if(!window.employees || window.employees.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Mitarbeiter vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.employees.map((emp, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${emp.firstName} ${emp.lastName}</h3>
                <p>Rang: ${emp.rank || '-'}</p>
                <p>Stundenlohn: $${emp.hourlyRate?.toFixed(2) ?? '0.00'}</p>
                <p>Status: ${(emp.active === false) ? 'Inaktiv' : 'Aktiv'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editEmployee(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteEmployee(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Zeitbuchungen-Übersicht (wird meist in timeBookings.js selbst gemacht!)

// Analog: Für alle weiteren Module (Sales, Purchases, Activities, Bookings Overview etc.)
// nach demselben Muster – siehe bestehende renderXYZ-Funktionen.

// Fertig geladen:
console.log('✅ renderTemplates.js geladen');
