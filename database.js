// ===================================================================
// DATABASE.JS - Company OS Datenverwaltung (ERWEITERT)
// IndexedDB mit LocalStorage Fallback (alle Module)
// ===================================================================

// Global variables
let db = null;
let items = [];
let materials = [];
let employees = [];
let workSessions = [];
let customers = []; // NEU
let timeBookings = []; // NEU
let sales = []; // NEU
let materialPurchases = []; // NEU
let isInitialized = false;

// ===================================================================
// INDEXEDDB SETUP
// ===================================================================

/**
 * Initialisiert die IndexedDB Datenbank
 */
function initDatabase() {
    console.log('🚀 Starte Datenbank-Initialisierung...');
    
    const request = indexedDB.open('CompanyOS', 3); // Version erhöht für neue Stores
    
    request.onerror = function(event) {
        console.error('❌ Datenbank-Fehler:', event.target.error);
        updateDbStatus('❌ IndexedDB Fehler - Verwende LocalStorage', 'error');
        // Fallback zu LocalStorage
        loadFromLocalStorage();
        finalizeInitialization();
    };
    
    request.onsuccess = function(event) {
        db = event.target.result;
        console.log('✅ IndexedDB erfolgreich geöffnet');
        updateDbStatus('✅ IndexedDB aktiv - Automatische Sicherung läuft', 'success');
        loadFromDatabase();
    };
    
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        console.log('🔄 Datenbank wird erstellt/aktualisiert');
        
        // Items Store
        if (!db.objectStoreNames.contains('items')) {
            const itemStore = db.createObjectStore('items', { keyPath: 'id' });
            itemStore.createIndex('name', 'name', { unique: false });
            console.log('📦 Items Store erstellt');
        }
        
        // Materials Store
        if (!db.objectStoreNames.contains('materials')) {
            const materialStore = db.createObjectStore('materials', { keyPath: 'id' });
            materialStore.createIndex('name', 'name', { unique: false });
            console.log('🏭 Materials Store erstellt');
        }
        
        // Employees Store
        if (!db.objectStoreNames.contains('employees')) {
            const employeeStore = db.createObjectStore('employees', { keyPath: 'id' });
            employeeStore.createIndex('firstName', 'firstName', { unique: false });
            employeeStore.createIndex('lastName', 'lastName', { unique: false });
            employeeStore.createIndex('rank', 'rank', { unique: false });
            employeeStore.createIndex('isActive', 'isActive', { unique: false });
            console.log('👥 Employees Store erstellt');
        }
        
        // Work Sessions Store
        if (!db.objectStoreNames.contains('workSessions')) {
            const sessionStore = db.createObjectStore('workSessions', { keyPath: 'id' });
            sessionStore.createIndex('employeeId', 'employeeId', { unique: false });
            sessionStore.createIndex('date', 'date', { unique: false });
            sessionStore.createIndex('isPaid', 'isPaid', { unique: false });
            console.log('⏰ Work Sessions Store erstellt');
        }
        
        // Customers Store (NEU)
        if (!db.objectStoreNames.contains('customers')) {
            const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
            customerStore.createIndex('firstName', 'firstName', { unique: false });
            customerStore.createIndex('lastName', 'lastName', { unique: false });
            customerStore.createIndex('email', 'email', { unique: false });
            customerStore.createIndex('customerType', 'customerType', { unique: false });
            customerStore.createIndex('isActive', 'isActive', { unique: false });
            console.log('👤 Customers Store erstellt');
        }
        
        // Time Bookings Store (NEU)
        if (!db.objectStoreNames.contains('timeBookings')) {
            const timeBookingStore = db.createObjectStore('timeBookings', { keyPath: 'id' });
            timeBookingStore.createIndex('customerId', 'customerId', { unique: false });
            timeBookingStore.createIndex('date', 'date', { unique: false });
            timeBookingStore.createIndex('activityType', 'activityType', { unique: false });
            timeBookingStore.createIndex('isPaid', 'isPaid', { unique: false });
            console.log('🎱 Time Bookings Store erstellt');
        }
        
        // Sales Store (NEU)
        if (!db.objectStoreNames.contains('sales')) {
            const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
            salesStore.createIndex('date', 'date', { unique: false });
            salesStore.createIndex('customerId', 'customerId', { unique: false });
            salesStore.createIndex('totalAmount', 'totalAmount', { unique: false });
            console.log('💰 Sales Store erstellt');
        }
        
        // Material Purchases Store (NEU)
        if (!db.objectStoreNames.contains('materialPurchases')) {
            const purchaseStore = db.createObjectStore('materialPurchases', { keyPath: 'id' });
            purchaseStore.createIndex('date', 'date', { unique: false });
            purchaseStore.createIndex('materialId', 'materialId', { unique: false });
            purchaseStore.createIndex('totalCost', 'totalCost', { unique: false });
            console.log('🛒 Material Purchases Store erstellt');
        }
        
        // Backups Store
        if (!db.objectStoreNames.contains('backups')) {
            const backupStore = db.createObjectStore('backups', { keyPath: 'id', autoIncrement: true });
            backupStore.createIndex('timestamp', 'timestamp', { unique: false });
            console.log('💾 Backups Store erstellt');
        }
        
        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
            const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
            console.log('⚙️ Settings Store erstellt');
        }
        
        console.log('✅ Datenbank-Schema erstellt');
    };
}

/**
 * Aktualisiert den Datenbank-Status in der UI
 */
function updateDbStatus(message, type) {
    const statusDiv = document.getElementById('db-status');
    if (statusDiv) {
        statusDiv.innerHTML = message;
        
        // Status-Farben setzen
        const colors = {
            success: { bg: 'rgba(46, 204, 113, 0.3)', border: '#2ecc71' },
            error: { bg: 'rgba(231, 76, 60, 0.3)', border: '#e74c3c' },
            info: { bg: 'rgba(52, 152, 219, 0.3)', border: '#3498db' }
        };
        
        const color = colors[type] || colors.info;
        statusDiv.style.background = color.bg;
        statusDiv.style.border = `1px solid ${color.border}`;
    }
}

// ===================================================================
// DATEN LADEN & SPEICHERN
// ===================================================================

/**
 * Lädt Daten aus der IndexedDB
 */
function loadFromDatabase() {
    if (!db) {
        console.warn('⚠️ IndexedDB nicht verfügbar');
        loadFromLocalStorage();
        return;
    }
    
    console.log('📖 Lade Daten aus IndexedDB...');
    
    const storeNames = ['items', 'materials', 'employees', 'workSessions', 'customers', 'timeBookings', 'sales', 'materialPurchases'];
    const transaction = db.transaction(storeNames, 'readonly');
    
    let loadedStores = {};
    let completedStores = 0;
    const totalStores = storeNames.length;
    
    // Items laden
    const itemStore = transaction.objectStore('items');
    const itemRequest = itemStore.getAll();
    
    itemRequest.onsuccess = function(event) {
        const dbItems = event.target.result;
        if (dbItems && dbItems.length > 0) {
            items = dbItems;
            console.log(`📦 ${items.length} Items aus IndexedDB geladen`);
        } else {
            console.log('📦 Keine Items in IndexedDB gefunden');
        }
        loadedStores.items = true;
        checkLoadComplete();
    };
    
    itemRequest.onerror = function(event) {
        console.error('❌ Fehler beim Laden der Items:', event.target.error);
        loadedStores.items = true;
        checkLoadComplete();
    };
    
    // Materials laden
    const materialStore = transaction.objectStore('materials');
    const materialRequest = materialStore.getAll();
    
    materialRequest.onsuccess = function(event) {
        const dbMaterials = event.target.result;
        if (dbMaterials && dbMaterials.length > 0) {
            materials = dbMaterials;
            console.log(`🏭 ${materials.length} Materialien aus IndexedDB geladen`);
        } else {
            console.log('🏭 Keine Materialien in IndexedDB gefunden');
        }
        loadedStores.materials = true;
        checkLoadComplete();
    };
    
    materialRequest.onerror = function(event) {
        console.error('❌ Fehler beim Laden der Materialien:', event.target.error);
        loadedStores.materials = true;
        checkLoadComplete();
    };
    
    // Employees laden
    const employeeStore = transaction.objectStore('employees');
    const employeeRequest = employeeStore.getAll();
    
    employeeRequest.onsuccess = function(event) {
        const dbEmployees = event.target.result;
        if (dbEmployees && dbEmployees.length > 0) {
            employees = dbEmployees;
            console.log(`👥 ${employees.length} Mitarbeiter aus IndexedDB geladen`);
        } else {
            console.log('👥 Keine Mitarbeiter in IndexedDB gefunden');
        }
        loadedStores.employees = true;
        checkLoadComplete();
    };
    
    employeeRequest.onerror = function(event) {
        console.error('❌ Fehler beim Laden der Mitarbeiter:', event.target.error);
        loadedStores.employees = true;
        checkLoadComplete();
    };
    
    // Work Sessions laden
    const sessionStore = transaction.objectStore('workSessions');
    const sessionRequest = sessionStore.getAll();
    
    sessionRequest.onsuccess = function(event) {
        const dbSessions = event.target.result;
        if (dbSessions && dbSessions.length > 0) {
            workSessions = dbSessions;
            console.log(`⏰ ${workSessions.length} Arbeitssessions aus IndexedDB geladen`);
        } else {
            console.log('⏰ Keine Arbeitssessions in IndexedDB gefunden');
        }
        loadedStores.workSessions = true;
        checkLoadComplete();
    };
    
    sessionRequest.onerror = function(event) {
        console.error('❌ Fehler beim Laden der Arbeitssessions:', event.target.error);
        loadedStores.workSessions = true;
        checkLoadComplete();
    };
    
    // Customers laden (NEU)
    const customerStore = transaction.objectStore('customers');
    const customerRequest = customerStore.getAll();
    
    customerRequest.onsuccess = function(event) {
        const dbCustomers = event.target.result;
        if (dbCustomers && dbCustomers.length > 0) {
            customers = dbCustomers;
            console.log(`👤 ${customers.length} Kunden aus IndexedDB geladen`);
        } else {
            console.log('👤 Keine Kunden in IndexedDB gefunden');
        }
        loadedStores.customers = true;
        checkLoadComplete();
    };
    
    customerRequest.onerror = function(event) {
        console.error('❌ Fehler beim Laden der Kunden:', event.target.error);
        loadedStores.customers = true;
        checkLoadComplete();
    };
    
    // Time Bookings laden (NEU)
    const timeBookingStore = transaction.objectStore('timeBookings');
    const timeBookingRequest = timeBookingStore.getAll();
    
    timeBookingRequest.onsuccess = function(event) {
        const dbTimeBookings = event.target.result;
        if (dbTimeBookings && dbTimeBookings.length > 0) {
            timeBookings = dbTimeBookings;
            console.log(`🎱 ${timeBookings.length} Zeitbuchungen aus IndexedDB geladen`);
        } else {
            console.log('🎱 Keine Zeitbuchungen in IndexedDB gefunden');
        }
        loadedStores.timeBookings = true;
        checkLoadComplete();
    };
    
    timeBookingRequest.onerror = function(event) {
        console.error('❌ Fehler beim Laden der Zeitbuchungen:', event.target.error);
        loadedStores.timeBookings = true;
        checkLoadComplete();
    };
    
    // Sales laden (NEU)
    const salesStore = transaction.objectStore('sales');
    const salesRequest = salesStore.getAll();
    
    salesRequest.onsuccess = function(event) {
        const dbSales = event.target.result;
        if (dbSales && dbSales.length > 0) {
            sales = dbSales;
            console.log(`💰 ${sales.length} Verkäufe aus IndexedDB geladen`);
        } else {
            console.log('💰 Keine Verkäufe in IndexedDB gefunden');
        }
        loadedStores.sales = true;
        checkLoadComplete();
    };
    
    salesRequest.onerror = function(event) {
        console.error('❌ Fehler beim Laden der Verkäufe:', event.target.error);
        loadedStores.sales = true;
        checkLoadComplete();
    };
    
    // Material Purchases laden (NEU)
    const purchaseStore = transaction.objectStore('materialPurchases');
    const purchaseRequest = purchaseStore.getAll();
    
    purchaseRequest.onsuccess = function(event) {
        const dbPurchases = event.target.result;
        if (dbPurchases && dbPurchases.length > 0) {
            materialPurchases = dbPurchases;
            console.log(`🛒 ${materialPurchases.length} Materialeinkäufe aus IndexedDB geladen`);
        } else {
            console.log('🛒 Keine Materialeinkäufe in IndexedDB gefunden');
        }
        loadedStores.materialPurchases = true;
        checkLoadComplete();
    };
    
    purchaseRequest.onerror = function(event) {
        console.error('❌ Fehler beim Laden der Materialeinkäufe:', event.target.error);
        loadedStores.materialPurchases = true;
        checkLoadComplete();
    };
    
    // Prüft ob alle Stores geladen sind
    function checkLoadComplete() {
        completedStores++;
        if (completedStores >= totalStores) {
            // Fallback zu LocalStorage wenn keine Daten in IndexedDB
            if (items.length === 0 && materials.length === 0 && employees.length === 0 && 
                workSessions.length === 0 && customers.length === 0 && timeBookings.length === 0 && 
                sales.length === 0 && materialPurchases.length === 0) {
                console.log('📄 IndexedDB leer - Lade aus LocalStorage als Fallback');
                loadFromLocalStorage();
            }
            finalizeInitialization();
        }
    }
    
    transaction.onerror = function(event) {
        console.error('❌ Fehler beim Laden aus IndexedDB:', event.target.error);
        loadFromLocalStorage();
        finalizeInitialization();
    };
}

/**
 * Speichert Daten in der IndexedDB
 */
function saveToDatabase() {
    if (!db) {
        console.warn('⚠️ IndexedDB nicht verfügbar - speichere nur in LocalStorage');
        return;
    }
    
    console.log('💾 Speichere in IndexedDB...');
    
    const storeNames = ['items', 'materials', 'employees', 'workSessions', 'customers', 'timeBookings', 'sales', 'materialPurchases'];
    const transaction = db.transaction(storeNames, 'readwrite');
    
    try {
        // Items speichern
        const itemStore = transaction.objectStore('items');
        itemStore.clear();
        items.forEach(item => {
            itemStore.add(item);
        });
        
        // Materials speichern
        const materialStore = transaction.objectStore('materials');
        materialStore.clear();
        materials.forEach(material => {
            materialStore.add(material);
        });
        
        // Employees speichern
        const employeeStore = transaction.objectStore('employees');
        employeeStore.clear();
        employees.forEach(employee => {
            employeeStore.add(employee);
        });
        
        // Work Sessions speichern
        const sessionStore = transaction.objectStore('workSessions');
        sessionStore.clear();
        workSessions.forEach(session => {
            sessionStore.add(session);
        });
        
        // Customers speichern (NEU)
        const customerStore = transaction.objectStore('customers');
        customerStore.clear();
        customers.forEach(customer => {
            customerStore.add(customer);
        });
        
        // Time Bookings speichern (NEU)
        const timeBookingStore = transaction.objectStore('timeBookings');
        timeBookingStore.clear();
        timeBookings.forEach(booking => {
            timeBookingStore.add(booking);
        });
        
        // Sales speichern (NEU)
        const salesStore = transaction.objectStore('sales');
        salesStore.clear();
        sales.forEach(sale => {
            salesStore.add(sale);
        });
        
        // Material Purchases speichern (NEU)
        const purchaseStore = transaction.objectStore('materialPurchases');
        purchaseStore.clear();
        materialPurchases.forEach(purchase => {
            purchaseStore.add(purchase);
        });
        
        transaction.oncomplete = function() {
            console.log('✅ Daten erfolgreich in IndexedDB gespeichert');
            updateDbStatus('✅ Daten gespeichert', 'success');
        };
        
        transaction.onerror = function(event) {
            console.error('❌ Fehler beim Speichern in IndexedDB:', event.target.error);
            updateDbStatus('❌ Speicherfehler in IndexedDB', 'error');
        };
        
    } catch (error) {
        console.error('❌ IndexedDB Speicher-Fehler:', error);
        updateDbStatus('❌ IndexedDB Speicherfehler', 'error');
    }
}

// ===================================================================
// LOCALSTORAGE FALLBACK
// ===================================================================

/**
 * Lädt Daten aus dem LocalStorage (Fallback)
 */
function loadFromLocalStorage() {
    console.log('📄 Lade Daten aus LocalStorage...');
    
    try {
        const savedItems = localStorage.getItem('company-os-items');
        const savedMaterials = localStorage.getItem('company-os-materials');
        const savedEmployees = localStorage.getItem('company-os-employees');
        const savedWorkSessions = localStorage.getItem('company-os-work-sessions');
        const savedCustomers = localStorage.getItem('company-os-customers'); // NEU
        const savedTimeBookings = localStorage.getItem('company-os-time-bookings'); // NEU
        const savedSales = localStorage.getItem('company-os-sales'); // NEU
        const savedMaterialPurchases = localStorage.getItem('company-os-material-purchases'); // NEU
        
        if (savedItems) {
            const parsedItems = JSON.parse(savedItems);
            if (Array.isArray(parsedItems)) {
                items = parsedItems;
                console.log(`📦 ${items.length} Items aus LocalStorage geladen`);
            }
        }
        
        if (savedMaterials) {
            const parsedMaterials = JSON.parse(savedMaterials);
            if (Array.isArray(parsedMaterials)) {
                materials = parsedMaterials;
                console.log(`🏭 ${materials.length} Materialien aus LocalStorage geladen`);
            }
        }
        
        if (savedEmployees) {
            const parsedEmployees = JSON.parse(savedEmployees);
            if (Array.isArray(parsedEmployees)) {
                employees = parsedEmployees;
                console.log(`👥 ${employees.length} Mitarbeiter aus LocalStorage geladen`);
            }
        }
        
        if (savedWorkSessions) {
            const parsedSessions = JSON.parse(savedWorkSessions);
            if (Array.isArray(parsedSessions)) {
                workSessions = parsedSessions;
                console.log(`⏰ ${workSessions.length} Arbeitssessions aus LocalStorage geladen`);
            }
        }
        
        // Neue Module laden (NEU)
        if (savedCustomers) {
            const parsedCustomers = JSON.parse(savedCustomers);
            if (Array.isArray(parsedCustomers)) {
                customers = parsedCustomers;
                console.log(`👤 ${customers.length} Kunden aus LocalStorage geladen`);
            }
        }
        
        if (savedTimeBookings) {
            const parsedBookings = JSON.parse(savedTimeBookings);
            if (Array.isArray(parsedBookings)) {
                timeBookings = parsedBookings;
                console.log(`🎱 ${timeBookings.length} Zeitbuchungen aus LocalStorage geladen`);
            }
        }
        
        if (savedSales) {
            const parsedSales = JSON.parse(savedSales);
            if (Array.isArray(parsedSales)) {
                sales = parsedSales;
                console.log(`💰 ${sales.length} Verkäufe aus LocalStorage geladen`);
            }
        }
        
        if (savedMaterialPurchases) {
            const parsedPurchases = JSON.parse(savedMaterialPurchases);
            if (Array.isArray(parsedPurchases)) {
                materialPurchases = parsedPurchases;
                console.log(`🛒 ${materialPurchases.length} Materialeinkäufe aus LocalStorage geladen`);
            }
        }
        
        const totalCount = items.length + materials.length + employees.length + workSessions.length + 
                          customers.length + timeBookings.length + sales.length + materialPurchases.length;
        
        if (totalCount === 0) {
            console.log('📄 Keine gespeicherten Daten gefunden - Starte mit leeren Arrays');
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Laden aus LocalStorage:', error);
        items = [];
        materials = [];
        employees = [];
        workSessions = [];
        customers = []; // NEU
        timeBookings = []; // NEU
        sales = []; // NEU
        materialPurchases = []; // NEU
    }
}

/**
 * Speichert Daten im LocalStorage
 */
function saveToLocalStorage() {
    try {
        localStorage.setItem('company-os-items', JSON.stringify(items));
        localStorage.setItem('company-os-materials', JSON.stringify(materials));
        localStorage.setItem('company-os-employees', JSON.stringify(employees));
        localStorage.setItem('company-os-work-sessions', JSON.stringify(workSessions));
        localStorage.setItem('company-os-customers', JSON.stringify(customers)); // NEU
        localStorage.setItem('company-os-time-bookings', JSON.stringify(timeBookings)); // NEU
        localStorage.setItem('company-os-sales', JSON.stringify(sales)); // NEU
        localStorage.setItem('company-os-material-purchases', JSON.stringify(materialPurchases)); // NEU
        console.log('💾 Daten in LocalStorage gespeichert');
    } catch (error) {
        console.error('❌ Fehler beim Speichern in LocalStorage:', error);
    }
}

// ===================================================================
// HAUPT-SPEICHER-FUNKTION
// ===================================================================

/**
 * Hauptfunktion zum Speichern der Daten
 */
function saveData() {
    console.log('💾 Speichere alle Daten...');
    
    // In LocalStorage speichern (immer)
    saveToLocalStorage();
    
    // In IndexedDB speichern (wenn verfügbar)
    saveToDatabase();
    
    // Zufällige Backup-Erstellung (20% Chance)
    if (Math.random() < 0.2) {
        createDatabaseBackup();
    }
    
    // UI aktualisieren
    if (typeof updateDataStatus === 'function') {
        updateDataStatus();
    }
}

// ===================================================================
// INITIALISIERUNG & FINALISIERUNG
// ===================================================================

/**
 * Finalisiert die Initialisierung
 */
function finalizeInitialization() {
    if (isInitialized) return;
    
    console.log('🎯 Finalisiere Initialisierung...');
    
    isInitialized = true;
    
    // UI aktualisieren
    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }
    
    if (typeof updateDataStatus === 'function') {
        updateDataStatus();
    }
    
    // Modul-spezifische UI Updates
    if (typeof updateEmployeeDisplay === 'function') {
        updateEmployeeDisplay();
    }
    
    if (typeof updateEmployeeDropdowns === 'function') {
        updateEmployeeDropdowns();
    }
    
    if (typeof updateCustomerDisplay === 'function') {
        updateCustomerDisplay();
    }
    
    if (typeof updateTimeBookingDisplay === 'function') {
        updateTimeBookingDisplay();
    }
    
    if (typeof updateSalesDisplay === 'function') {
        updateSalesDisplay();
    }
    
    if (typeof updateBilanzDisplay === 'function') {
        updateBilanzDisplay();
    }
    
    console.log(`✅ Initialisierung abgeschlossen - ${items.length} Items, ${materials.length} Materialien, ${employees.length} Mitarbeiter, ${workSessions.length} Sessions, ${customers.length} Kunden, ${timeBookings.length} Buchungen, ${sales.length} Verkäufe, ${materialPurchases.length} Einkäufe geladen`);
}

/**
 * Wartet bis die Datenbank initialisiert ist
 */
function waitForInitialization(callback, timeout = 5000) {
    const startTime = Date.now();
    
    function check() {
        if (isInitialized) {
            callback();
        } else if (Date.now() - startTime < timeout) {
            setTimeout(check, 50);
        } else {
            console.warn('⚠️ Timeout beim Warten auf Initialisierung');
            callback();
        }
    }
    
    check();
}

// ===================================================================
// BACKUP-SYSTEM (ERWEITERT)
// ===================================================================

/**
 * Erstellt ein Backup in der IndexedDB
 */
function createDatabaseBackup() {
    if (!db) return;
    
    const backup = {
        timestamp: new Date().toISOString(),
        items: JSON.parse(JSON.stringify(items)),
        materials: JSON.parse(JSON.stringify(materials)),
        employees: JSON.parse(JSON.stringify(employees)),
        workSessions: JSON.parse(JSON.stringify(workSessions)),
        customers: JSON.parse(JSON.stringify(customers)), // NEU
        timeBookings: JSON.parse(JSON.stringify(timeBookings)), // NEU
        sales: JSON.parse(JSON.stringify(sales)), // NEU
        materialPurchases: JSON.parse(JSON.stringify(materialPurchases)), // NEU
        version: '3.0', // Version erhöht
        itemCount: items.length,
        materialCount: materials.length,
        employeeCount: employees.length,
        sessionCount: workSessions.length,
        customerCount: customers.length, // NEU
        timeBookingCount: timeBookings.length, // NEU
        salesCount: sales.length, // NEU
        purchaseCount: materialPurchases.length // NEU
    };
    
    const transaction = db.transaction(['backups'], 'readwrite');
    const backupStore = transaction.objectStore('backups');
    
    backupStore.add(backup);
    
    transaction.oncomplete = function() {
        console.log('💾 Automatisches Backup erstellt');
    };
    
    transaction.onerror = function(event) {
        console.error('❌ Backup-Fehler:', event.target.error);
    };
}

/**
 * Manuelles Backup erstellen
 */
function manualBackup() {
    createDatabaseBackup();
    saveData();
    if (typeof showNotification === 'function') {
        showNotification('✅ Manuelle Sicherung erstellt!', 'success');
    } else {
        alert('✅ Manuelle Sicherung erstellt!');
    }
}

// ===================================================================
// DATEN-STATUS & EXPORT/IMPORT (ERWEITERT)
// ===================================================================

/**
 * Aktualisiert die Datenanzeige in der UI
 */
function updateDataStatus() {
    const statusDiv = document.getElementById('data-status');
    if (statusDiv) {
        const totalItems = items.length;
        const totalMaterials = materials.length;
        const totalEmployees = employees.length;
        const totalSessions = workSessions.length;
        const totalCustomers = customers.length; // NEU
        const totalTimeBookings = timeBookings.length; // NEU
        const totalSales = sales.length; // NEU
        const totalPurchases = materialPurchases.length; // NEU
        const lastUpdate = new Date().toLocaleString('de-DE');
        
        statusDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
                <div><strong>${totalItems}</strong> Items</div>
                <div><strong>${totalMaterials}</strong> Materialien</div>
                <div><strong>${totalEmployees}</strong> Mitarbeiter</div>
                <div><strong>${totalSessions}</strong> Arbeitsstunden</div>
                <div><strong>${totalCustomers}</strong> Kunden</div>
                <div><strong>${totalTimeBookings}</strong> Buchungen</div>
                <div><strong>${totalSales}</strong> Verkäufe</div>
                <div><strong>${totalPurchases}</strong> Einkäufe</div>
                <div><strong>Letztes Update:</strong><br>${lastUpdate}</div>
            </div>
        `;
    }
}

/**
 * Exportiert alle Daten als JSON-Datei (ERWEITERT)
 */
function exportData() {
    const exportData = {
        version: '3.0', // Version erhöht
        timestamp: new Date().toISOString(),
        items: items,
        materials: materials,
        employees: employees,
        workSessions: workSessions,
        customers: customers, // NEU
        timeBookings: timeBookings, // NEU
        sales: sales, // NEU
        materialPurchases: materialPurchases, // NEU
        itemCount: items.length,
        materialCount: materials.length,
        employeeCount: employees.length,
        sessionCount: workSessions.length,
        customerCount: customers.length, // NEU
        timeBookingCount: timeBookings.length, // NEU
        salesCount: sales.length, // NEU
        purchaseCount: materialPurchases.length // NEU
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `Company-OS-Backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
    
    if (typeof showNotification === 'function') {
        showNotification('✅ Backup-Datei wurde heruntergeladen!', 'success');
    } else {
        alert('✅ Backup-Datei wurde heruntergeladen!');
    }
}

/**
 * Kopiert Backup-Daten in die Zwischenablage (ERWEITERT)
 */
function copyDataToClipboard() {
    const exportData = {
        version: '3.0', // Version erhöht
        timestamp: new Date().toISOString(),
        items: items,
        materials: materials,
        employees: employees,
        workSessions: workSessions,
        customers: customers, // NEU
        timeBookings: timeBookings, // NEU
        sales: sales, // NEU
        materialPurchases: materialPurchases, // NEU
        itemCount: items.length,
        materialCount: materials.length,
        employeeCount: employees.length,
        sessionCount: workSessions.length,
        customerCount: customers.length, // NEU
        timeBookingCount: timeBookings.length, // NEU
        salesCount: sales.length, // NEU
        purchaseCount: materialPurchases.length // NEU
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    
    // Moderne Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(dataStr).then(() => {
            if (typeof showNotification === 'function') {
                showNotification('✅ Backup-Daten in Zwischenablage kopiert!', 'success');
            } else {
                alert('✅ Backup-Daten in Zwischenablage kopiert!');
            }
        }).catch(err => {
            console.error('Clipboard-Fehler:', err);
            fallbackCopyToClipboard(dataStr);
        });
    } else {
        // Fallback für ältere Browser
        fallbackCopyToClipboard(dataStr);
    }
}

/**
 * Fallback-Methode zum Kopieren in die Zwischenablage
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        if (typeof showNotification === 'function') {
            showNotification('✅ Backup-Daten in Zwischenablage kopiert!', 'success');
        } else {
            alert('✅ Backup-Daten in Zwischenablage kopiert!');
        }
    } catch (err) {
        console.error('Fallback-Copy-Fehler:', err);
        alert('❌ Fehler beim Kopieren. Bitte manuell kopieren.');
    }
    
    document.body.removeChild(textArea);
}

/**
 * Importiert Daten aus einer Datei
 */
function importFromFile() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('❌ Bitte wählen Sie eine Datei aus!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            processImportData(importData);
        } catch (error) {
            console.error('Import-Fehler:', error);
            alert('❌ Fehler beim Lesen der Datei: ' + error.message);
        }
    };
    reader.readAsText(file);
}

/**
 * Importiert Daten aus einem Text-Input
 */
function importFromText() {
    const importText = document.getElementById('importText').value.trim();
    
    if (!importText) {
        alert('❌ Bitte fügen Sie Backup-Daten ein!');
        return;
    }
    
    try {
        const importData = JSON.parse(importText);
        processImportData(importData);
    } catch (error) {
        console.error('Import-Fehler:', error);
        alert('❌ Ungültige Backup-Daten: ' + error.message);
    }
}

/**
 * Verarbeitet importierte Daten (ERWEITERT)
 */
function processImportData(importData) {
    // Validierung
    if (!importData.items || !importData.materials) {
        alert('❌ Ungültiges Backup-Format! Benötigte Felder: items, materials');
        return;
    }
    
    if (!Array.isArray(importData.items) || !Array.isArray(importData.materials)) {
        alert('❌ Ungültiges Datenformat! Items und Materials müssen Arrays sein.');
        return;
    }
    
    // Prüfe ob neue Daten vorhanden sind
    const hasEmployeeData = importData.employees && Array.isArray(importData.employees);
    const hasSessionData = importData.workSessions && Array.isArray(importData.workSessions);
    const hasCustomerData = importData.customers && Array.isArray(importData.customers);
    const hasTimeBookingData = importData.timeBookings && Array.isArray(importData.timeBookings);
    const hasSalesData = importData.sales && Array.isArray(importData.sales);
    const hasPurchaseData = importData.materialPurchases && Array.isArray(importData.materialPurchases);
    
    // Bestätigung
    const currentData = `${items.length} Items, ${materials.length} Materialien, ${employees.length} Mitarbeiter, ${workSessions.length} Sessions, ${customers.length} Kunden, ${timeBookings.length} Buchungen, ${sales.length} Verkäufe, ${materialPurchases.length} Einkäufe`;
    const newData = `${importData.items.length} Items, ${importData.materials.length} Materialien, ${hasEmployeeData ? importData.employees.length : 0} Mitarbeiter, ${hasSessionData ? importData.workSessions.length : 0} Sessions, ${hasCustomerData ? importData.customers.length : 0} Kunden, ${hasTimeBookingData ? importData.timeBookings.length : 0} Buchungen, ${hasSalesData ? importData.sales.length : 0} Verkäufe, ${hasPurchaseData ? importData.materialPurchases.length : 0} Einkäufe`;
    
    if (confirm(`⚠️ Möchten Sie die aktuellen Daten durch das Backup ersetzen?\n\nAktuelle Daten: ${currentData}\nBackup-Daten: ${newData}`)) {
        
        // Daten ersetzen
        items = importData.items;
        materials = importData.materials;
        
        // Mitarbeiter-Daten wenn vorhanden
        if (hasEmployeeData) {
            employees = importData.employees;
        }
        
        // Session-Daten wenn vorhanden
        if (hasSessionData) {
            workSessions = importData.workSessions;
        }
        
        // Neue Module-Daten wenn vorhanden (NEU)
        if (hasCustomerData) {
            customers = importData.customers;
        }
        
        if (hasTimeBookingData) {
            timeBookings = importData.timeBookings;
        }
        
        if (hasSalesData) {
            sales = importData.sales;
        }
        
        if (hasPurchaseData) {
            materialPurchases = importData.materialPurchases;
        }
        
        // Speichern und UI aktualisieren
        saveData();
        if (typeof updateDisplay === 'function') {
            updateDisplay();
        }
        
        if (typeof updateEmployeeDisplay === 'function') {
            updateEmployeeDisplay();
        }
        
        if (typeof updateCustomerDisplay === 'function') {
            updateCustomerDisplay();
        }
        
        if (typeof updateTimeBookingDisplay === 'function') {
            updateTimeBookingDisplay();
        }
        
        if (typeof updateSalesDisplay === 'function') {
            updateSalesDisplay();
        }
        
        if (typeof updateBilanzDisplay === 'function') {
            updateBilanzDisplay();
        }
        
        // Input-Feld leeren
        const importTextArea = document.getElementById('importText');
        if (importTextArea) {
            importTextArea.value = '';
        }
        
        if (typeof showNotification === 'function') {
            showNotification('✅ Backup erfolgreich wiederhergestellt!', 'success');
        } else {
            alert('✅ Backup erfolgreich wiederhergestellt!');
        }
        console.log(`📊 Import abgeschlossen: ${items.length} Items, ${materials.length} Materialien, ${employees.length} Mitarbeiter, ${workSessions.length} Sessions, ${customers.length} Kunden, ${timeBookings.length} Buchungen, ${sales.length} Verkäufe, ${materialPurchases.length} Einkäufe`);
    }
}

/**
 * Löscht den Import-Text
 */
function clearImportText() {
    const importTextArea = document.getElementById('importText');
    if (importTextArea) {
        importTextArea.value = '';
    }
}

// ===================================================================
// DATEN ZURÜCKSETZEN (ERWEITERT)
// ===================================================================

/**
 * Löscht alle Daten (mit Bestätigung)
 */
function resetAllData() {
    if (confirm('⚠️ ACHTUNG: Alle Daten werden unwiderruflich gelöscht!\n\nSind Sie sicher?')) {
        if (confirm('🚨 LETZTE WARNUNG: Alle Items, Materialien, Mitarbeiter, Kunden, Buchungen, Verkäufe und Einkäufe werden gelöscht!\n\nWirklich fortfahren?')) {
            
            // Arrays leeren
            items = [];
            materials = [];
            employees = [];
            workSessions = [];
            customers = []; // NEU
            timeBookings = []; // NEU
            sales = []; // NEU
            materialPurchases = []; // NEU
            
            // LocalStorage leeren
            localStorage.removeItem('company-os-items');
            localStorage.removeItem('company-os-materials');
            localStorage.removeItem('company-os-employees');
            localStorage.removeItem('company-os-work-sessions');
            localStorage.removeItem('company-os-customers'); // NEU
            localStorage.removeItem('company-os-time-bookings'); // NEU
            localStorage.removeItem('company-os-sales'); // NEU
            localStorage.removeItem('company-os-material-purchases'); // NEU
            
            // IndexedDB leeren
            if (db) {
                const storeNames = ['items', 'materials', 'employees', 'workSessions', 'customers', 'timeBookings', 'sales', 'materialPurchases'];
                const transaction = db.transaction(storeNames, 'readwrite');
                
                storeNames.forEach(storeName => {
                    transaction.objectStore(storeName).clear();
                });
                
                transaction.oncomplete = function() {
                    console.log('🗑️ IndexedDB erfolgreich geleert');
                };
            }
            
            // UI aktualisieren
            if (typeof updateDisplay === 'function') {
                updateDisplay();
            }
            
            if (typeof updateEmployeeDisplay === 'function') {
                updateEmployeeDisplay();
            }
            
            if (typeof updateCustomerDisplay === 'function') {
                updateCustomerDisplay();
            }
            
            if (typeof updateTimeBookingDisplay === 'function') {
                updateTimeBookingDisplay();
            }
            
            if (typeof updateSalesDisplay === 'function') {
                updateSalesDisplay();
            }
            
            if (typeof updateBilanzDisplay === 'function') {
                updateBilanzDisplay();
            }
            
            updateDataStatus();
            
            if (typeof showNotification === 'function') {
                showNotification('✅ Alle Daten wurden gelöscht!', 'success');
            } else {
                alert('✅ Alle Daten wurden gelöscht!');
            }
            console.log('🗑️ Komplette Datenbereinigung durchgeführt');
        }
    }
}

// ===================================================================
// INITIALISIERUNG
// ===================================================================

/**
 * Initialisiert das Datenbank-System beim Laden der Seite
 */
function initDatabaseSystem() {
    console.log('🚀 Initialisiere Datenbank-System...');
    
    // Zuerst LocalStorage laden für sofortige Verfügbarkeit
    loadFromLocalStorage();
    
    // Dann IndexedDB initialisieren
    if (typeof indexedDB !== 'undefined') {
        initDatabase();
    } else {
        console.warn('⚠️ IndexedDB nicht unterstützt - verwende nur LocalStorage');
        updateDbStatus('⚠️ IndexedDB nicht unterstützt - LocalStorage wird verwendet', 'warning');
        finalizeInitialization();
    }
    
    // Fallback-Timer für den Fall, dass IndexedDB nicht verfügbar ist
    setTimeout(() => {
        if (!isInitialized) {
            console.warn('⚠️ IndexedDB Timeout - verwende LocalStorage');
            updateDbStatus('⚠️ IndexedDB Timeout - LocalStorage wird verwendet', 'warning');
            finalizeInitialization();
        }
    }, 3000);
}

// Auto-Export bei kritischen Fehlern
window.addEventListener('beforeunload', function() {
    const totalCount = items.length + materials.length + employees.length + workSessions.length + 
                      customers.length + timeBookings.length + sales.length + materialPurchases.length;
    if (totalCount > 0) {
        saveToLocalStorage();
    }
});

// Auto-Start beim Laden
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDatabaseSystem);
} else {
    initDatabaseSystem();
}



console.log('📦 Database.js geladen (erweitert)');