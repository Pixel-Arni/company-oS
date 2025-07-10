// ===================================================================
// CUSTOMERS.JS - Company OS Kundenverwaltung
// Customer CRUD Operations, Customer Statistics, Revenue Tracking
// ===================================================================

// Global customer data (wird von database.js verwaltet)
// let customers = []; // Wird in database.js definiert
let editingCustomerId = null;

// Kundentypen mit Standard-Einstellungen
const customerTypes = {
    'Stammkunde': { discount: 0, color: '#2ecc71', description: 'Regelmäßiger Kunde' },
    'VIP': { discount: 10, color: '#f39c12', description: 'VIP-Kunde mit Rabatt' },
    'Premium': { discount: 15, color: '#9b59b6', description: 'Premium-Kunde' },
    'Neukunde': { discount: 0, color: '#3498db', description: 'Neuer Kunde' },
    'Laufkundschaft': { discount: 0, color: '#95a5a6', description: 'Einmaliger Kunde' }
};

// ===================================================================
// CUSTOMER MANAGEMENT
// ===================================================================

/**
 * Fügt einen neuen Kunden hinzu
 */
function addCustomer() {
    console.log('👤 Füge neuen Kunden hinzu...');
    
    const firstNameField = document.getElementById('newCustomerFirstName');
    const lastNameField = document.getElementById('newCustomerLastName');
    const emailField = document.getElementById('newCustomerEmail');
    const phoneField = document.getElementById('newCustomerPhone');
    const typeField = document.getElementById('newCustomerType');
    const discountField = document.getElementById('newCustomerDiscount');
    const notesField = document.getElementById('newCustomerNotes');
    
    if (!firstNameField || !lastNameField || !typeField) {
        console.error('❌ Kunden-Eingabefelder nicht gefunden');
        showNotification('Fehler: Eingabefelder nicht gefunden', 'error');
        return;
    }
    
    const firstName = firstNameField.value.trim();
    const lastName = lastNameField.value.trim();
    const email = emailField.value.trim();
    const phone = phoneField.value.trim();
    const customerType = typeField.value;
    const discount = parseFloat(discountField.value) || 0;
    const notes = notesField.value.trim();
    
    // Validierung
    if (!validateCustomerInput(firstName, lastName, email, phone, customerType, discount)) {
        return;
    }
    
    // Duplikat-Prüfung (E-Mail)
    if (email && customers.some(customer => 
        customer.email.toLowerCase() === email.toLowerCase()
    )) {
        showNotification('Ein Kunde mit dieser E-Mail-Adresse existiert bereits!', 'warning');
        return;
    }
    
    // Kunde erstellen
    const customer = {
        id: generateCustomerId(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        customerType: customerType,
        discount: discount,
        notes: notes,
        registeredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        lastVisit: null,
        totalVisits: 0,
        totalSpent: 0
    };
    
    // Hinzufügen und speichern
    customers.push(customer);
    saveCustomerData();
    updateCustomerDisplay();
    
    // Eingabefelder leeren
    clearCustomerInputs();
    firstNameField.focus();
    
    showNotification(`Kunde "${firstName} ${lastName}" wurde hinzugefügt!`, 'success');
    console.log(`✅ Kunde hinzugefügt: ${firstName} ${lastName} (${customerType})`);
}

/**
 * Validiert Kunden-Eingaben
 */
function validateCustomerInput(firstName, lastName, email, phone, customerType, discount) {
    if (!firstName || firstName.length < 2) {
        showNotification('Bitte geben Sie einen gültigen Vornamen ein (min. 2 Zeichen)!', 'warning');
        document.getElementById('newCustomerFirstName').focus();
        return false;
    }
    
    if (!lastName || lastName.length < 2) {
        showNotification('Bitte geben Sie einen gültigen Nachnamen ein (min. 2 Zeichen)!', 'warning');
        document.getElementById('newCustomerLastName').focus();
        return false;
    }
    
    if (firstName.length > 50 || lastName.length > 50) {
        showNotification('Name ist zu lang (max. 50 Zeichen pro Feld)!', 'warning');
        return false;
    }
    
    if (email && !isValidEmail(email)) {
        showNotification('Bitte geben Sie eine gültige E-Mail-Adresse ein!', 'warning');
        document.getElementById('newCustomerEmail').focus();
        return false;
    }
    
    if (phone && phone.length > 20) {
        showNotification('Telefonnummer ist zu lang (max. 20 Zeichen)!', 'warning');
        return false;
    }
    
    if (!customerType || !customerTypes[customerType]) {
        showNotification('Bitte wählen Sie einen gültigen Kundentyp aus!', 'warning');
        return false;
    }
    
    if (isNaN(discount) || discount < 0 || discount > 100) {
        showNotification('Rabatt muss zwischen 0 und 100% liegen!', 'warning');
        document.getElementById('newCustomerDiscount').focus();
        return false;
    }
    
    return true;
}

/**
 * Validiert E-Mail-Adresse
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Leert die Kunden-Eingabefelder
 */
function clearCustomerInputs() {
    const fields = [
        'newCustomerFirstName',
        'newCustomerLastName', 
        'newCustomerEmail',
        'newCustomerPhone',
        'newCustomerNotes'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    // Standardwerte setzen
    const typeField = document.getElementById('newCustomerType');
    if (typeField) typeField.value = 'Stammkunde';
    
    const discountField = document.getElementById('newCustomerDiscount');
    if (discountField) discountField.value = '0';
}

/**
 * Öffnet das Kunden-Bearbeitung Modal
 */
function editCustomer(id) {
    const customer = customers.find(cust => cust.id == id);
    if (!customer) {
        console.error(`❌ Kunde mit ID ${id} nicht gefunden`);
        showNotification('Kunde nicht gefunden!', 'error');
        return;
    }
    
    console.log(`✏️ Bearbeite Kunde: ${customer.firstName} ${customer.lastName}`);
    
    editingCustomerId = id;
    
    // Modal-Felder füllen
    const fields = {
        'editCustomerFirstName': customer.firstName,
        'editCustomerLastName': customer.lastName,
        'editCustomerEmail': customer.email,
        'editCustomerPhone': customer.phone,
        'editCustomerType': customer.customerType,
        'editCustomerDiscount': customer.discount,
        'editCustomerNotes': customer.notes || '',
        'editCustomerActive': customer.isActive
    };
    
    Object.entries(fields).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = value;
            } else {
                field.value = value;
            }
        }
    });
    
    const firstNameField = document.getElementById('editCustomerFirstName');
    if (firstNameField) firstNameField.focus();
    
    showModal('editCustomerModal');
}

/**
 * Speichert die Kunden-Bearbeitung
 */
function saveCustomerEdit() {
    if (!editingCustomerId) {
        console.error('❌ Keine Kunden-ID zum Bearbeiten gefunden');
        return;
    }
    
    const customer = customers.find(cust => cust.id == editingCustomerId);
    if (!customer) {
        console.error(`❌ Kunde mit ID ${editingCustomerId} nicht gefunden`);
        showNotification('Kunde nicht gefunden!', 'error');
        return;
    }
    
    const fields = {
        firstName: document.getElementById('editCustomerFirstName'),
        lastName: document.getElementById('editCustomerLastName'),
        email: document.getElementById('editCustomerEmail'),
        phone: document.getElementById('editCustomerPhone'),
        customerType: document.getElementById('editCustomerType'),
        discount: document.getElementById('editCustomerDiscount'),
        notes: document.getElementById('editCustomerNotes'),
        isActive: document.getElementById('editCustomerActive')
    };
    
    // Prüfe ob alle Felder vorhanden sind
    const missingFields = Object.entries(fields).filter(([key, field]) => !field);
    if (missingFields.length > 0) {
        console.error('❌ Bearbeitungsfelder nicht gefunden:', missingFields.map(([key]) => key));
        return;
    }
    
    const firstName = fields.firstName.value.trim();
    const lastName = fields.lastName.value.trim();
    const email = fields.email.value.trim();
    const phone = fields.phone.value.trim();
    const customerType = fields.customerType.value;
    const discount = parseFloat(fields.discount.value) || 0;
    const notes = fields.notes.value.trim();
    const isActive = fields.isActive.checked;
    
    // Validierung
    if (!validateCustomerInput(firstName, lastName, email, phone, customerType, discount)) {
        return;
    }
    
    // E-Mail-Duplikat-Prüfung (außer für den aktuellen Kunden)
    if (email && customers.some(cust => 
        cust.id != editingCustomerId && 
        cust.email.toLowerCase() === email.toLowerCase()
    )) {
        showNotification('Ein Kunde mit dieser E-Mail-Adresse existiert bereits!', 'warning');
        return;
    }
    
    // Kunde aktualisieren
    const oldName = `${customer.firstName} ${customer.lastName}`;
    customer.firstName = firstName;
    customer.lastName = lastName;
    customer.email = email;
    customer.phone = phone;
    customer.customerType = customerType;
    customer.discount = discount;
    customer.notes = notes;
    customer.isActive = isActive;
    customer.updatedAt = new Date().toISOString();
    
    saveCustomerData();
    updateCustomerDisplay();
    closeCustomerEditModal();
    
    showNotification(`Kunde "${oldName}" wurde aktualisiert!`, 'success');
    console.log(`✅ Kunde aktualisiert: ${firstName} ${lastName}`);
}

/**
 * Schließt das Kunden-Bearbeitung Modal
 */
function closeCustomerEditModal() {
    hideModal('editCustomerModal');
    editingCustomerId = null;
    
    // Felder leeren
    const fields = [
        'editCustomerFirstName', 'editCustomerLastName', 'editCustomerEmail',
        'editCustomerPhone', 'editCustomerType', 'editCustomerDiscount', 'editCustomerNotes'
    ];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const activeField = document.getElementById('editCustomerActive');
    if (activeField) activeField.checked = true;
}

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
    
    // TODO: Prüfung für zeitliche Buchungen und Verkäufe implementieren
    // if (timeBookings && timeBookings.some(booking => booking.customerId == id)) {
    //     hasBookings = true;
    // }
    // if (sales && sales.some(sale => sale.customerId == id)) {
    //     hasSales = true;
    // }
    
    let confirmMessage = `Kunde "${customer.firstName} ${customer.lastName}" wirklich löschen?`;
    if (hasBookings || hasSales) {
        confirmMessage += `\n\nWarnung: Der Kunde hat aufgezeichnete `;
        if (hasBookings) confirmMessage += `Buchungen`;
        if (hasBookings && hasSales) confirmMessage += ` und `;
        if (hasSales) confirmMessage += `Verkäufe`;
        confirmMessage += `. Diese werden ebenfalls gelöscht.`;
    }
    
    if (confirm(confirmMessage)) {
        // TODO: Zugehörige Daten löschen wenn andere Module implementiert sind
        // timeBookings = timeBookings.filter(booking => booking.customerId != id);
        // sales = sales.filter(sale => sale.customerId != id);
        
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
    // TODO: Implementierung wenn zeitliche Buchungen und Verkäufe verfügbar sind
    // const customerBookings = timeBookings.filter(booking => booking.customerId == customerId);
    // const customerSales = sales.filter(sale => sale.customerId == customerId);
    
    return {
        totalVisits: 0, // customer.totalVisits
        totalSpent: 0, // customer.totalSpent
        totalBookings: 0, // customerBookings.length
        totalSales: 0, // customerSales.length
        lastVisit: null, // customer.lastVisit
        averageSpending: 0
    };
}

/**
 * Berechnet wöchentliche Einnahmen eines Kunden
 */
function calculateWeeklyCustomerRevenue(customerId, weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    // TODO: Implementierung wenn zeitliche Buchungen und Verkäufe verfügbar sind
    // const weeklyBookings = timeBookings.filter(booking => 
    //     booking.customerId == customerId &&
    //     new Date(booking.date) >= weekStart &&
    //     new Date(booking.date) < weekEnd
    // );
    
    // const weeklySales = sales.filter(sale =>
    //     sale.customerId == customerId &&
    //     new Date(sale.date) >= weekStart &&
    //     new Date(sale.date) < weekEnd
    // );
    
    return {
        bookingRevenue: 0,
        salesRevenue: 0,
        totalRevenue: 0,
        visits: 0
    };
}

/**
 * Berechnet Gesamtstatistiken aller Kunden
 */
function calculateOverallCustomerStats() {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(cust => cust.isActive).length;
    const vipCustomers = customers.filter(cust => cust.customerType === 'VIP' || cust.customerType === 'Premium').length;
    
    // TODO: Erweitere mit echten Daten aus Buchungen und Verkäufen
    const totalRevenue = customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0);
    const totalVisits = customers.reduce((sum, customer) => sum + (customer.totalVisits || 0), 0);
    
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