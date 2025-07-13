// customers.js
// Kundenverwaltung für Company OS mit vollständigen Features

// Datenstruktur:
// [{ firstName, lastName, email, phone, type, discount, notes, active, createdAt, updatedAt, lastVisit, totalSpent }]

window.customers = JSON.parse(localStorage.getItem('company-os-customers') || '[]');

// Kundentypen mit Standard-Rabatten
const customerTypes = {
    'Standard': { discount: 0, color: '#6c757d' },
    'Stammkunde': { discount: 5, color: '#28a745' },
    'Premium': { discount: 10, color: '#007bff' },
    'VIP': { discount: 15, color: '#ffc107' },
    'Großkunde': { discount: 20, color: '#dc3545' }
};

// ===================================================================
// CUSTOMER DISPLAY FUNCTIONS
// ===================================================================

// Kunden-Übersicht rendern
window.renderCustomersOverview = function() {
    const list = document.getElementById('customers-overview-content');
    if (!list) return;
    
    if (!window.customers || window.customers.length === 0) {
        list.innerHTML = `<div class="empty-state">
            <h3>Noch keine Kunden vorhanden</h3>
            <p>Fügen Sie Ihren ersten Kunden hinzu!</p>
        </div>`;
        return;
    }
    
    // Kunden-Statistiken berechnen
    const stats = calculateCustomerStats();
    
    // Statistik-Header
    const statsHtml = `
        <div class="stats-header">
            <div class="stat-card">
                <div class="stat-value">${stats.totalCustomers}</div>
                <div class="stat-label">Kunden gesamt</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.activeCustomers}</div>
                <div class="stat-label">Aktive Kunden</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatCurrency(stats.totalRevenue)}</div>
                <div class="stat-label">Gesamtumsatz</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatCurrency(stats.averageSpending)}</div>
                <div class="stat-label">Ø Ausgaben/Kunde</div>
            </div>
        </div>
    `;
    
    // Kunden-Liste
    const customersHtml = window.customers.map((cust, idx) => {
        const customerStats = getCustomerStats(cust);
        const typeConfig = customerTypes[cust.type] || customerTypes['Standard'];
        
        return `
            <div class="list-item">
                <div class="list-item-info">
                    <h3>
                        <span style="color: ${typeConfig.color}">●</span>
                        ${cust.firstName} ${cust.lastName}
                        ${cust.active === false ? '<span style="color: var(--error-color)"> (Inaktiv)</span>' : ''}
                    </h3>
                    <p><strong>Typ:</strong> ${cust.type || 'Standard'} ${cust.discount ? `(${cust.discount}% Rabatt)` : ''}</p>
                    <p><strong>Kontakt:</strong> ${cust.email || 'Keine E-Mail'} ${cust.phone ? `| ${cust.phone}` : ''}</p>
                    <p><strong>Umsatz:</strong> ${formatCurrency(customerStats.totalSpent)} (${customerStats.totalOrders} Bestellungen)</p>
                    <p><strong>Letzter Besuch:</strong> ${customerStats.lastVisit ? formatDate(customerStats.lastVisit) : 'Noch nie'}</p>
                    ${cust.notes ? `<p><strong>Notizen:</strong> ${cust.notes}</p>` : ''}
                </div>
                <div class="list-item-actions">
                    <button class="btn" onclick="viewCustomerDetails(${idx})" title="Details anzeigen">👁️ Details</button>
                    <button class="btn btn-success" onclick="editCustomer(${idx})" title="Bearbeiten">✏️ Bearbeiten</button>
                    <button class="btn btn-danger" onclick="deleteCustomer(${idx})" title="Löschen">🗑️ Löschen</button>
                </div>
            </div>
        `;
    }).join('');
    
    list.innerHTML = statsHtml + '<div class="card"><h3>Kundenliste</h3>' + customersHtml + '</div>';
};

// Kundenverwaltung rendern
window.renderCustomersManagement = function() {
    const list = document.getElementById('customers-management-list');
    if (!list) return;
    
    if (!window.customers || window.customers.length === 0) {
        list.innerHTML = `<div class="empty-state">
            <h3>Noch keine Kunden vorhanden</h3>
            <p>Verwenden Sie den Button oben, um Ihren ersten Kunden hinzuzufügen!</p>
        </div>`;
        return;
    }
    
    // Filter und Sortierung
    const filterHtml = `
        <div class="card" style="margin-bottom: 20px;">
            <h3>Filter & Suche</h3>
            <div class="input-group">
                <input type="text" id="customerSearch" class="input-field" placeholder="Nach Name, E-Mail oder Telefon suchen..." oninput="filterCustomers()">
                <select id="customerTypeFilter" class="input-field" onchange="filterCustomers()">
                    <option value="">Alle Typen</option>
                    ${Object.keys(customerTypes).map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
                <select id="customerStatusFilter" class="input-field" onchange="filterCustomers()">
                    <option value="">Alle Status</option>
                    <option value="active">Nur Aktive</option>
                    <option value="inactive">Nur Inaktive</option>
                </select>
                <button class="btn" onclick="exportCustomersToCSV()">📊 CSV Export</button>
            </div>
        </div>
    `;
    
    list.innerHTML = filterHtml + '<div id="filtered-customers-list"></div>';
    filterCustomers(); // Initial laden
};

// Gefilterte Kunden anzeigen
window.filterCustomers = function() {
    const container = document.getElementById('filtered-customers-list');
    if (!container) return;
    
    const searchTerm = document.getElementById('customerSearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('customerTypeFilter')?.value || '';
    const statusFilter = document.getElementById('customerStatusFilter')?.value || '';
    
    let filteredCustomers = window.customers.filter(customer => {
        // Textsuche
        const matchesSearch = !searchTerm || 
            customer.firstName.toLowerCase().includes(searchTerm) ||
            customer.lastName.toLowerCase().includes(searchTerm) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
            (customer.phone && customer.phone.includes(searchTerm));
        
        // Typ-Filter
        const matchesType = !typeFilter || customer.type === typeFilter;
        
        // Status-Filter
        const matchesStatus = !statusFilter || 
            (statusFilter === 'active' && customer.active !== false) ||
            (statusFilter === 'inactive' && customer.active === false);
        
        return matchesSearch && matchesType && matchesStatus;
    });
    
    if (filteredCustomers.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <h3>Keine Kunden gefunden</h3>
            <p>Versuchen Sie andere Suchkriterien.</p>
        </div>`;
        return;
    }
    
    container.innerHTML = filteredCustomers.map((cust, idx) => {
        const originalIdx = window.customers.indexOf(cust);
        const typeConfig = customerTypes[cust.type] || customerTypes['Standard'];
        
        return `
            <div class="list-item">
                <div class="list-item-info">
                    <h3>
                        <span style="color: ${typeConfig.color}">●</span>
                        ${cust.firstName} ${cust.lastName}
                        ${cust.active === false ? '<span style="color: var(--error-color)"> (Inaktiv)</span>' : ''}
                    </h3>
                    <p><strong>Typ:</strong> ${cust.type || 'Standard'} ${cust.discount ? `(${cust.discount}% Rabatt)` : ''}</p>
                    <p><strong>Kontakt:</strong> ${cust.email || 'Keine E-Mail'} ${cust.phone ? `| ${cust.phone}` : ''}</p>
                    <p><strong>Erstellt:</strong> ${formatDate(cust.createdAt)}</p>
                    ${cust.notes ? `<p><strong>Notizen:</strong> ${cust.notes}</p>` : ''}
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-success" onclick="editCustomer(${originalIdx})" title="Bearbeiten">✏️ Bearbeiten</button>
                    <button class="btn" onclick="duplicateCustomer(${originalIdx})" title="Duplizieren">📋 Duplizieren</button>
                    <button class="btn btn-danger" onclick="deleteCustomer(${originalIdx})" title="Löschen">🗑️ Löschen</button>
                </div>
            </div>
        `;
    }).join('');
};

// ===================================================================
// CUSTOMER MANAGEMENT FUNCTIONS
// ===================================================================

// Neuen Kunden hinzufügen
window.addCustomer = function() {
    const firstName = document.getElementById('newCustomerFirstName').value.trim();
    const lastName = document.getElementById('newCustomerLastName').value.trim();
    const email = document.getElementById('newCustomerEmail').value.trim();
    const phone = document.getElementById('newCustomerPhone').value.trim();
    const type = document.getElementById('newCustomerType').value;
    const discount = parseInt(document.getElementById('newCustomerDiscount').value) || 0;
    const notes = document.getElementById('newCustomerNotes').value.trim();
    
    // Validierung
    if (!validateCustomerInput(firstName, lastName, email, phone)) {
        return;
    }
    
    // Duplikat-Prüfung
    if (isDuplicateCustomer(firstName, lastName, email)) {
        return;
    }
    
    // Neuen Kunden erstellen
    const newCustomer = {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        type: type || 'Standard',
        discount: discount,
        notes: notes || null,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastVisit: null,
        totalSpent: 0
    };
    
    window.customers.push(newCustomer);
    saveCustomers();
    renderCustomersOverview();
    renderCustomersManagement();
    clearNewCustomerFields();
    hideModal('customerModal');
    showNotification(`Kunde "${firstName} ${lastName}" wurde hinzugefügt!`, 'success');
};

// Kunden bearbeiten
window.editCustomer = function(idx) {
    const cust = window.customers[idx];
    if (!cust) {
        showNotification('Kunde nicht gefunden!', 'error');
        return;
    }
    
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
    if (idx === undefined) {
        showNotification('Kein Kunde zum Bearbeiten ausgewählt!', 'error');
        return;
    }
    
    const firstName = document.getElementById('editCustomerFirstName').value.trim();
    const lastName = document.getElementById('editCustomerLastName').value.trim();
    const email = document.getElementById('editCustomerEmail').value.trim();
    const phone = document.getElementById('editCustomerPhone').value.trim();
    const type = document.getElementById('editCustomerType').value;
    const discount = parseInt(document.getElementById('editCustomerDiscount').value) || 0;
    const notes = document.getElementById('editCustomerNotes').value.trim();
    const active = document.getElementById('editCustomerActive').checked;
    
    // Validierung
    if (!validateCustomerInput(firstName, lastName, email, phone)) {
        return;
    }
    
    // Duplikat-Prüfung (außer für aktuellen Kunden)
    if (isDuplicateCustomer(firstName, lastName, email, idx)) {
        return;
    }
    
    // Kunde aktualisieren
    const oldName = `${window.customers[idx].firstName} ${window.customers[idx].lastName}`;
    window.customers[idx] = {
        ...window.customers[idx],
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        type: type || 'Standard',
        discount,
        notes: notes || null,
        active,
        updatedAt: new Date().toISOString()
    };
    
    saveCustomers();
    renderCustomersOverview();
    renderCustomersManagement();
    hideModal('editCustomerModal');
    showNotification(`Kunde "${oldName}" wurde aktualisiert!`, 'success');
    window._editingCustomerIndex = undefined;
};

// Kunde löschen
window.deleteCustomer = function(idx) {
    const customer = window.customers[idx];
    if (!customer) {
        showNotification('Kunde nicht gefunden!', 'error');
        return;
    }
    
    // Prüfen ob Kunde in anderen Modulen verwendet wird
    const hasBookings = window.timeBookings && window.timeBookings.some(booking => 
        booking.customerName === `${customer.firstName} ${customer.lastName}`
    );
    const hasSales = window.sales && window.sales.some(sale => 
        sale.customerName === `${customer.firstName} ${customer.lastName}`
    );
    
    let confirmMessage = `Kunde "${customer.firstName} ${customer.lastName}" wirklich löschen?`;
    if (hasBookings || hasSales) {
        confirmMessage += `\n\nWarnung: Der Kunde hat aufgezeichnete `;
        if (hasBookings) confirmMessage += `Buchungen`;
        if (hasBookings && hasSales) confirmMessage += ` und `;
        if (hasSales) confirmMessage += `Verkäufe`;
        confirmMessage += `.`;
    }
    
    if (!confirm(confirmMessage)) return;
    
    window.customers.splice(idx, 1);
    saveCustomers();
    renderCustomersOverview();
    renderCustomersManagement();
    showNotification(`Kunde "${customer.firstName} ${customer.lastName}" wurde gelöscht!`, 'success');
};

// Kunde duplizieren
window.duplicateCustomer = function(idx) {
    const customer = window.customers[idx];
    if (!customer) {
        showNotification('Kunde nicht gefunden!', 'error');
        return;
    }
    
    const duplicatedCustomer = {
        ...customer,
        firstName: customer.firstName,
        lastName: `${customer.lastName} (Kopie)`,
        email: null, // E-Mail nicht duplizieren
        phone: null, // Telefon nicht duplizieren
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastVisit: null,
        totalSpent: 0
    };
    
    window.customers.push(duplicatedCustomer);
    saveCustomers();
    renderCustomersOverview();
    renderCustomersManagement();
    showNotification(`Kunde "${customer.firstName} ${customer.lastName}" wurde dupliziert!`, 'success');
};

// Kunden-Details anzeigen
window.viewCustomerDetails = function(idx) {
    const customer = window.customers[idx];
    if (!customer) {
        showNotification('Kunde nicht gefunden!', 'error');
        return;
    }
    
    const stats = getCustomerStats(customer);
    const bookings = getCustomerBookings(customer);
    const sales = getCustomerSales(customer);
    
    const detailsHtml = `
        <div class="card">
            <h2>${customer.firstName} ${customer.lastName}</h2>
            
            <div class="stats-header">
                <div class="stat-card">
                    <div class="stat-value">${formatCurrency(stats.totalSpent)}</div>
                    <div class="stat-label">Gesamtumsatz</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalOrders}</div>
                    <div class="stat-label">Bestellungen</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatCurrency(stats.averageOrderValue)}</div>
                    <div class="stat-label">Ø Bestellwert</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.lastVisit ? formatDate(stats.lastVisit) : 'Nie'}</div>
                    <div class="stat-label">Letzter Besuch</div>
                </div>
            </div>
            
            <h3>Buchungen (${bookings.length})</h3>
            <div class="customer-history">
                ${bookings.length > 0 ? bookings.map(booking => `
                    <div class="history-item">
                        <strong>${formatDate(booking.date)}</strong> - ${booking.activity} 
                        (${booking.duration} Min., ${booking.participants} Personen)
                    </div>
                `).join('') : '<p>Keine Buchungen vorhanden.</p>'}
            </div>
            
            <h3>Verkäufe (${sales.length})</h3>
            <div class="customer-history">
                ${sales.length > 0 ? sales.map(sale => `
                    <div class="history-item">
                        <strong>${formatDate(sale.date)}</strong> - ${formatCurrency(calcSaleTotal(sale))}
                        <br><small>${sale.items ? sale.items.map(i => `${i.name} (${i.qty}x)`).join(', ') : ''}</small>
                    </div>
                `).join('') : '<p>Keine Verkäufe vorhanden.</p>'}
            </div>
        </div>
    `;
    
    // Modal für Details erstellen
    showCustomModal('customer-details', 'Kunden-Details', detailsHtml);
};

// ===================================================================
// VALIDATION FUNCTIONS
// ===================================================================

function validateCustomerInput(firstName, lastName, email, phone) {
    if (!firstName || firstName.length < 2) {
        showNotification('Vorname muss mindestens 2 Zeichen lang sein!', 'error');
        document.getElementById('newCustomerFirstName')?.focus() || document.getElementById('editCustomerFirstName')?.focus();
        return false;
    }
    
    if (!lastName || lastName.length < 2) {
        showNotification('Nachname muss mindestens 2 Zeichen lang sein!', 'error');
        document.getElementById('newCustomerLastName')?.focus() || document.getElementById('editCustomerLastName')?.focus();
        return false;
    }
    
    if (firstName.length > 50 || lastName.length > 50) {
        showNotification('Vor- und Nachname dürfen maximal 50 Zeichen lang sein!', 'warning');
        return false;
    }
    
    if (email && !validateEmail(email)) {
        showNotification('Bitte geben Sie eine gültige E-Mail-Adresse ein!', 'error');
        document.getElementById('newCustomerEmail')?.focus() || document.getElementById('editCustomerEmail')?.focus();
        return false;
    }
    
    if (phone && !validatePhone(phone)) {
        showNotification('Bitte geben Sie eine gültige Telefonnummer ein!', 'error');
        document.getElementById('newCustomerPhone')?.focus() || document.getElementById('editCustomerPhone')?.focus();
        return false;
    }
    
    return true;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    // Einfache Telefonnummer-Validierung
    const re = /^[\d\s\-\+\(\)]{6,20}$/;
    return re.test(phone);
}

function isDuplicateCustomer(firstName, lastName, email, excludeIdx = -1) {
    const duplicate = window.customers.find((customer, idx) => {
        if (idx === excludeIdx) return false;
        
        // Name-Duplikat
        if (customer.firstName.toLowerCase() === firstName.toLowerCase() && 
            customer.lastName.toLowerCase() === lastName.toLowerCase()) {
            return true;
        }
        
        // E-Mail-Duplikat
        if (email && customer.email && customer.email.toLowerCase() === email.toLowerCase()) {
            return true;
        }
        
        return false;
    });
    
    if (duplicate) {
        if (duplicate.firstName.toLowerCase() === firstName.toLowerCase() && 
            duplicate.lastName.toLowerCase() === lastName.toLowerCase()) {
            showNotification('Ein Kunde mit diesem Namen existiert bereits!', 'warning');
        } else {
            showNotification('Ein Kunde mit dieser E-Mail-Adresse existiert bereits!', 'warning');
        }
        return true;
    }
    
    return false;
}

// ===================================================================
// STATISTICS FUNCTIONS
// ===================================================================

function calculateCustomerStats() {
    const totalCustomers = window.customers.length;
    const activeCustomers = window.customers.filter(c => c.active !== false).length;
    
    let totalRevenue = 0;
    let totalOrders = 0;
    
    // Umsatz aus Verkäufen
    if (window.sales) {
        window.sales.forEach(sale => {
            totalRevenue += calcSaleTotal(sale);
            totalOrders++;
        });
    }
    
    // Umsatz aus Zeitbuchungen
    if (window.timeBookings && window.activities) {
        window.timeBookings.forEach(booking => {
            const activity = window.activities.find(a => a.name === booking.activity);
            if (activity) {
                let price = 0;
                if (booking.duration === 30) price = activity.halfHourRate || 0;
                else if (booking.duration === 60) price = activity.fullHourRate || 0;
                else price = (activity.fullHourRate || 0) * (booking.duration / 60);
                
                totalRevenue += price * (booking.participants || 1);
                totalOrders++;
            }
        });
    }
    
    const averageSpending = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    
    return {
        totalCustomers,
        activeCustomers,
        totalRevenue,
        totalOrders,
        averageSpending
    };
}

function getCustomerStats(customer) {
    const customerName = `${customer.firstName} ${customer.lastName}`;
    let totalSpent = 0;
    let totalOrders = 0;
    let lastVisit = null;
    
    // Verkäufe
    if (window.sales) {
        const customerSales = window.sales.filter(sale => sale.customerName === customerName);
        customerSales.forEach(sale => {
            totalSpent += calcSaleTotal(sale);
            totalOrders++;
            if (!lastVisit || new Date(sale.date) > new Date(lastVisit)) {
                lastVisit = sale.date;
            }
        });
    }
    
    // Zeitbuchungen
    if (window.timeBookings && window.activities) {
        const customerBookings = window.timeBookings.filter(booking => 
            booking.customerName === customerName || 
            (booking.isWalkIn && booking.walkInName === customerName)
        );
        
        customerBookings.forEach(booking => {
            const activity = window.activities.find(a => a.name === booking.activity);
            if (activity) {
                let price = 0;
                if (booking.duration === 30) price = activity.halfHourRate || 0;
                else if (booking.duration === 60) price = activity.fullHourRate || 0;
                else price = (activity.fullHourRate || 0) * (booking.duration / 60);
                
                totalSpent += price * (booking.participants || 1);
                totalOrders++;
                
                if (!lastVisit || new Date(booking.date) > new Date(lastVisit)) {
                    lastVisit = booking.date;
                }
            }
        });
    }
    
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    return {
        totalSpent,
        totalOrders,
        averageOrderValue,
        lastVisit
    };
}

function getCustomerBookings(customer) {
    if (!window.timeBookings) return [];
    
    const customerName = `${customer.firstName} ${customer.lastName}`;
    return window.timeBookings.filter(booking => 
        booking.customerName === customerName || 
        (booking.isWalkIn && booking.walkInName === customerName)
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getCustomerSales(customer) {
    if (!window.sales) return [];
    
    const customerName = `${customer.firstName} ${customer.lastName}`;
    return window.sales.filter(sale => sale.customerName === customerName)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

function clearNewCustomerFields() {
    document.getElementById('newCustomerFirstName').value = '';
    document.getElementById('newCustomerLastName').value = '';
    document.getElementById('newCustomerEmail').value = '';
    document.getElementById('newCustomerPhone').value = '';
    document.getElementById('newCustomerType').value = 'Standard';
    document.getElementById('newCustomerDiscount').value = 0;
    document.getElementById('newCustomerNotes').value = '';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE');
}

function calcSaleTotal(sale) {
    if (!sale || !sale.items) return 0;
    return sale.items.reduce((sum, i) => sum + ((i.price || 0) * (i.qty || 1)), 0);
}

// Custom Modal für Kunden-Details
function showCustomModal(id, title, content) {
    let modal = document.getElementById(id);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${title}</h2>
                <div class="modal-body">${content}</div>
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn" onclick="hideModal('${id}')">Schließen</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.querySelector('.modal-body').innerHTML = content;
    }
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    
    // Click outside to close
    modal.onclick = function(e) {
        if (e.target === modal) {
            hideModal(id);
        }
    };
}

// ===================================================================
// CUSTOMER TYPE MANAGEMENT
// ===================================================================

// Rabatt basierend auf Kundentyp aktualisieren
window.updateDiscountFromType = function(type, targetFieldId) {
    const targetField = document.getElementById(targetFieldId);
    if (targetField && customerTypes[type]) {
        targetField.value = customerTypes[type].discount;
    }
};

// Kundentyp-Dropdowns aktualisieren
window.updateCustomerTypeDropdowns = function() {
    const dropdowns = [
        document.getElementById('newCustomerType'),
        document.getElementById('editCustomerType')
    ].filter(dropdown => dropdown !== null);
    
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = '';
        
        Object.entries(customerTypes).forEach(([type, config]) => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = `${type} ${config.discount > 0 ? `(${config.discount}% Rabatt)` : ''}`;
            dropdown.appendChild(option);
        });
        
        dropdown.value = currentValue || 'Standard';
    });
};

// ===================================================================
// EXPORT FUNCTIONS
// ===================================================================

// Kunden als CSV exportieren
window.exportCustomersToCSV = function() {
    if (!window.customers || window.customers.length === 0) {
        showNotification('Keine Kunden zum Exportieren vorhanden!', 'warning');
        return;
    }
    
    let csv = 'Vorname,Nachname,E-Mail,Telefon,Typ,Rabatt,Status,Gesamtumsatz,Bestellungen,Letzter Besuch,Erstellt,Notizen\n';
    
    window.customers.forEach(customer => {
        const stats = getCustomerStats(customer);
        const csvRow = [
            `"${customer.firstName}"`,
            `"${customer.lastName}"`,
            `"${customer.email || ''}"`,
            `"${customer.phone || ''}"`,
            `"${customer.type || 'Standard'}"`,
            customer.discount || 0,
            customer.active !== false ? 'Aktiv' : 'Inaktiv',
            stats.totalSpent.toFixed(2),
            stats.totalOrders,
            stats.lastVisit || '',
            formatDate(customer.createdAt),
            `"${customer.notes || ''}"`
        ].join(',');
        
        csv += csvRow + '\n';
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kunden_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 200);
    
    showNotification('Kunden als CSV exportiert!', 'success');
};

// ===================================================================
// STORAGE FUNCTIONS
// ===================================================================

function saveCustomers() {
    try {
        localStorage.setItem('company-os-customers', JSON.stringify(window.customers));
        if (typeof window.saveData === 'function') {
            window.saveData();
        }
    } catch (error) {
        console.error('Fehler beim Speichern der Kunden:', error);
        showNotification('Fehler beim Speichern!', 'error');
    }
}

// ===================================================================
// INITIALIZATION
// ===================================================================

function initializeCustomers() {
    // Kundentyp-Dropdowns aktualisieren
    updateCustomerTypeDropdowns();
    
    // Event Listeners für Typ-Änderungen
    const newTypeSelect = document.getElementById('newCustomerType');
    if (newTypeSelect) {
        newTypeSelect.addEventListener('change', function() {
            updateDiscountFromType(this.value, 'newCustomerDiscount');
        });
    }
    
    const editTypeSelect = document.getElementById('editCustomerType');
    if (editTypeSelect) {
        editTypeSelect.addEventListener('change', function() {
            updateDiscountFromType(this.value, 'editCustomerDiscount');
        });
    }
    
    console.log(`✅ Kunden initialisiert - ${window.customers.length} Kunden geladen`);
}

// Event Listeners beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeCustomers, 300);
    renderCustomersOverview();
    renderCustomersManagement();
});

console.log('✅ customers.js vollständig geladen');