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

<<<<<<< HEAD
// Beim Laden: Listen direkt rendern
document.addEventListener('DOMContentLoaded', function() {
    renderCustomersOverview();
    renderCustomersManagement();
});

console.log('✅ customers.js geladen');
=======
/**
 * Löscht einen Kunden
 */
function deleteCustomer(id) {
    const customer = customers.find(cust => cust.id == id);
    if (!customer) {
        console.error(`❌ Kunde mit ID ${id} nicht gefunden`);
        return;
    }
    
    // Prüfen ob Kunde in anderen Modulen verwendet wird
    let hasBookings = false;
    let hasSales = false;
    
    // Prüfe, ob dieser Kunde Buchungen oder Verkäufe hat
    if (Array.isArray(timeBookings) &&
        timeBookings.some(booking => booking.customerId == id)) {
        hasBookings = true;
    }
    if (Array.isArray(sales) &&
        sales.some(sale => sale.customerId == id)) {
        hasSales = true;
    }
    
    let confirmMessage = `Kunde "${customer.firstName} ${customer.lastName}" wirklich löschen?`;
    if (hasBookings || hasSales) {
        confirmMessage += `\n\nWarnung: Der Kunde hat aufgezeichnete `;
        if (hasBookings) confirmMessage += `Buchungen`;
        if (hasBookings && hasSales) confirmMessage += ` und `;
        if (hasSales) confirmMessage += `Verkäufe`;
        confirmMessage += `. Diese werden ebenfalls gelöscht.`;
    }
    
    if (confirm(confirmMessage)) {
        // Zugehörige Daten in anderen Modulen löschen
        if (hasBookings && Array.isArray(timeBookings)) {
            timeBookings = timeBookings.filter(booking => booking.customerId != id);
            if (typeof saveTimeBookingData === 'function') {
                saveTimeBookingData();
            }
        }
        if (hasSales && Array.isArray(sales)) {
            sales = sales.filter(sale => sale.customerId != id);
            if (typeof saveSalesData === 'function') {
                saveSalesData();
            }
        }
        
        // Kunde löschen
        customers = customers.filter(cust => cust.id != id);
        
        saveCustomerData();
        updateCustomerDisplay();
        
        showNotification(`Kunde "${customer.firstName} ${customer.lastName}" wurde gelöscht!`, 'success');
        console.log(`🗑️ Kunde gelöscht: ${customer.firstName} ${customer.lastName}`);
    }
}

/**
 * Aktualisiert den Rabatt basierend auf Kundentyp
 */
function updateDiscountFromType(customerType, targetFieldId) {
    console.log(`🔄 Aktualisiere Rabatt für Kundentyp: ${customerType}`);
    const targetField = document.getElementById(targetFieldId);
    if (targetField && customerTypes[customerType]) {
        targetField.value = customerTypes[customerType].discount;
        console.log(`✅ Rabatt gesetzt: ${customerTypes[customerType].discount}%`);
    }
}

// ===================================================================
// CUSTOMER STATISTICS & CALCULATIONS
// ===================================================================

/**
 * Berechnet Statistiken für einen Kunden
 */
function calculateCustomerStats(customerId) {
    const customerBookings = Array.isArray(timeBookings)
        ? timeBookings.filter(booking => booking.customerId == customerId)
        : [];
    const customerSales = Array.isArray(sales)
        ? sales.filter(sale => sale.customerId == customerId)
        : [];

    const bookingSpent = customerBookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
    const salesSpent = customerSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalSpent = bookingSpent + salesSpent;

    const lastBookingDate = customerBookings.reduce((latest, b) => {
        return (!latest || new Date(b.date) > new Date(latest)) ? b.date : latest;
    }, null);
    const lastSaleDate = customerSales.reduce((latest, s) => {
        return (!latest || new Date(s.date) > new Date(latest)) ? s.date : latest;
    }, null);

    let lastVisit = null;
    if (lastBookingDate && lastSaleDate) {
        lastVisit = new Date(lastBookingDate) > new Date(lastSaleDate) ? lastBookingDate : lastSaleDate;
    } else {
        lastVisit = lastBookingDate || lastSaleDate;
    }

    const totalVisits = customerBookings.length + customerSales.length;

    return {
        totalVisits,
        totalSpent: Number(totalSpent.toFixed(2)),
        totalBookings: customerBookings.length,
        totalSales: customerSales.length,
        lastVisit,
        averageSpending: totalVisits > 0 ? Number((totalSpent / totalVisits).toFixed(2)) : 0
    };
}

/**
 * Berechnet wöchentliche Einnahmen eines Kunden
 */
function calculateWeeklyCustomerRevenue(customerId, weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weeklyBookings = Array.isArray(timeBookings)
        ? timeBookings.filter(booking =>
            booking.customerId == customerId &&
            new Date(booking.date) >= weekStart &&
            new Date(booking.date) < weekEnd)
        : [];

    const weeklySales = Array.isArray(sales)
        ? sales.filter(sale =>
            sale.customerId == customerId &&
            new Date(sale.date) >= weekStart &&
            new Date(sale.date) < weekEnd)
        : [];

    const bookingRevenue = weeklyBookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
    const salesRevenue = weeklySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalRevenue = bookingRevenue + salesRevenue;

    return {
        bookingRevenue: Number(bookingRevenue.toFixed(2)),
        salesRevenue: Number(salesRevenue.toFixed(2)),
        totalRevenue: Number(totalRevenue.toFixed(2)),
        visits: weeklyBookings.length + weeklySales.length
    };
}

/**
 * Berechnet Gesamtstatistiken aller Kunden
 */
function calculateOverallCustomerStats() {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(cust => cust.isActive).length;
    const vipCustomers = customers.filter(cust => cust.customerType === 'VIP' || cust.customerType === 'Premium').length;
    
    const bookingRevenue = Array.isArray(timeBookings)
        ? timeBookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0)
        : 0;
    const salesRevenue = Array.isArray(sales)
        ? sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
        : 0;
    const totalRevenue = bookingRevenue + salesRevenue;
    const totalVisits = (Array.isArray(timeBookings) ? timeBookings.length : 0) +
        (Array.isArray(sales) ? sales.length : 0);
    
    return {
        totalCustomers,
        activeCustomers,
        vipCustomers,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalVisits,
        averageRevenuePerCustomer: totalCustomers > 0 ? Number((totalRevenue / totalCustomers).toFixed(2)) : 0
    };
}

/**
 * Sucht Kunden nach verschiedenen Kriterien
 */
function searchCustomers(searchTerm) {
    if (!searchTerm) return customers;
    
    const term = searchTerm.toLowerCase();
    return customers.filter(customer => 
        customer.firstName.toLowerCase().includes(term) ||
        customer.lastName.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone.includes(term) ||
        customer.customerType.toLowerCase().includes(term)
    );
}

/**
 * Filtert Kunden nach Typ
 */
function filterCustomersByType(customerType) {
    if (!customerType || customerType === 'all') return customers;
    return customers.filter(customer => customer.customerType === customerType);
}

// ===================================================================
// DATA MANAGEMENT
// ===================================================================

/**
 * Speichert Kundendaten (verwendet database.js saveData)
 */
function saveCustomerData() {
    console.log('💾 Speichere Kundendaten über database.js...');
    
    // Verwende die globale saveData Funktion aus database.js
    if (typeof saveData === 'function') {
        saveData();
    } else {
        console.error('❌ saveData Funktion nicht verfügbar');
    }
}

/**
 * Aktualisiert Kundentyp-Dropdowns
 */
function updateCustomerTypeDropdowns() {
    console.log('🔄 Aktualisiere Kundentyp-Dropdowns...');
    
    const dropdowns = [
        document.getElementById('newCustomerType'),
        document.getElementById('editCustomerType')
    ].filter(dropdown => dropdown !== null);
    
    dropdowns.forEach(dropdown => {
        if (dropdown) {
            dropdown.innerHTML = '';
            Object.entries(customerTypes).forEach(([type, config]) => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = `${type} ${config.discount > 0 ? `(${config.discount}% Rabatt)` : ''}`;
                if (type === 'Stammkunde') {
                    option.selected = true;
                }
                dropdown.appendChild(option);
            });
            console.log(`✅ Dropdown ${dropdown.id} aktualisiert mit ${Object.keys(customerTypes).length} Typen`);
        }
    });
    
    // Standard-Rabatt setzen
    const discountField = document.getElementById('newCustomerDiscount');
    if (discountField && !discountField.value) {
        discountField.value = customerTypes['Stammkunde'].discount;
    }
}

/**
 * Hilfsfunktion für generateId (lokale Implementation)
 */
function generateCustomerId() {
    return 'cust_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===================================================================
// DISPLAY UPDATE FUNCTIONS (Placeholder)
// ===================================================================

/**
 * Aktualisiert die Kunden-Anzeige (wird in ui.js implementiert)
 */
function updateCustomerDisplay() {
    if (typeof updateCustomersDisplay === 'function') {
        updateCustomersDisplay();
    }
}

// ===================================================================
// INITIALIZATION
// ===================================================================

/**
 * Initialisiert das Kunden-System
 */
function initializeCustomerSystem() {
    console.log('👥 Initialisiere Kunden-System...');
    
    // Warte bis database.js initialisiert ist
    if (typeof waitForInitialization === 'function') {
        waitForInitialization(() => {
            // Kundentyp-Dropdowns mit aktuellen Daten füllen
            updateCustomerTypeDropdowns();
            console.log(`✅ Kunden-System initialisiert - ${customers.length} Kunden`);
        });
    } else {
        // Fallback ohne Warten
        updateCustomerTypeDropdowns();
        console.log(`✅ Kunden-System initialisiert - Fallback-Modus`);
    }
}

// Auto-Initialisierung (verzögert nach database.js)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Verzögerung um sicherzustellen, dass database.js zuerst lädt
        setTimeout(initializeCustomerSystem, 600);
    });
} else {
    setTimeout(initializeCustomerSystem, 600);
}

console.log('👥 Customers.js geladen');
>>>>>>> a781f5447017221b870a5042af495d9502e33727
