// ui.js

// Globale Tab-Funktion
window.showTab = function(tabId) {
    // Alle Tabs ausblenden
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Gewählten Tab anzeigen
    const tab = document.getElementById(tabId);
    if(tab) tab.classList.add('active');
    // Menü-Button aktivieren
    document.querySelectorAll('.sidebar-nav button').forEach(btn => btn.classList.remove('active'));
    // Passenden Button setzen
    const mapping = {
        'calculator': 'Waren Übersicht',
        'items': 'Items',
        'materials': 'Materialien',
        'customers-overview': 'Kunden',
        'customers-management': 'Kunden',
        'time-bookings': 'Zeitbuchungen',
        'bookings-overview': 'Zeitbuchungen',
        'activities-management': 'Zeitbuchungen',
        'sales-daily': 'Verkauf',
        'sales-overview': 'Verkauf',
        'material-purchases': 'Einkauf',
        'purchases-overview': 'Einkauf',
        'bilanz-daily': 'Bilanz',
        'bilanz-weekly': 'Bilanz',
        'bilanz-monthly': 'Bilanz',
        'employees-overview': 'Mitarbeiter',
        'employees-management': 'Mitarbeiter',
        'time-tracking': 'Mitarbeiter',
        'settings': 'Einstellungen',
        'backup': 'Einstellungen',
    };
    // Seitenmenü Dropdown auf/zu
    document.querySelectorAll('.dropdown').forEach(drop => drop.classList.remove('active'));
    for (let key in mapping) {
        if(tabId === key) {
            const li = [...document.querySelectorAll('.sidebar-nav ul li')].find(l => l.textContent.includes(mapping[key]));
            if(li) {
                const btn = li.querySelector('button');
                if(btn) btn.classList.add('active');
                const ul = li.querySelector('ul');
                if(ul) ul.classList.add('active');
            }
        }
    }
    // Display aktualisieren
    if(window.updateDisplay) window.updateDisplay(tabId);
};

// Globale Notification
window.showNotification = function(message, type = 'info') {
    let notif = document.getElementById('globalNotification');
    if(!notif) {
        notif = document.createElement('div');
        notif.id = 'globalNotification';
        notif.style.position = 'fixed';
        notif.style.top = '20px';
        notif.style.right = '20px';
        notif.style.zIndex = '9999';
        notif.style.padding = '16px 28px';
        notif.style.borderRadius = '10px';
        notif.style.fontWeight = 'bold';
        notif.style.boxShadow = '0 8px 32px 0 rgba(0,0,0,0.22)';
        notif.style.color = '#222';
        document.body.appendChild(notif);
    }
    let color = '#ffd700';
    if(type === 'success') color = '#2ecc71';
    if(type === 'error') color = '#e74c3c';
    if(type === 'warning') color = '#f39c12';
    notif.style.background = color;
    notif.textContent = message;
    notif.style.display = 'block';
    setTimeout(() => { notif.style.display = 'none'; }, 2500);
};

// Modal anzeigen
window.showModal = function(id) {
    const modal = document.getElementById(id);
    if(modal) {
        modal.classList.add('show', 'opening');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.remove('opening'), 400);
        // Modal-Fokus: erstes Input
        const input = modal.querySelector('input,select,textarea');
        if(input) input.focus();
    }
    // Close bei Klick auf Hintergrund
    modal.onclick = function(e) {
        if(e.target === modal) window.hideModal(id);
    };
};
window.hideModal = function(id) {
    const modal = document.getElementById(id);
    if(modal) {
        modal.classList.add('closing');
        setTimeout(() => {
            modal.classList.remove('show', 'closing');
            modal.style.display = 'none';
        }, 350);
    }
};

// Sidebar toggeln (für Mobile)
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    if(sidebar) sidebar.classList.toggle('mobile-open');
};
window.toggleDropdown = function(id) {
    document.querySelectorAll('.dropdown').forEach(drop => {
        if(drop.id !== id) drop.classList.remove('active');
    });
    const el = document.getElementById(id);
    if(el) el.classList.toggle('active');
};

// Anzeige für verschiedene Tabs aktualisieren
window.updateDisplay = function(tabId) {
    // Tab-abhängige Render-Funktionen
    if(tabId === 'items' && window.renderItemsList) window.renderItemsList();
    if(tabId === 'materials' && window.renderMaterialsList) window.renderMaterialsList();
    if(tabId === 'customers-overview' && window.renderCustomersOverview) window.renderCustomersOverview();
    if(tabId === 'customers-management' && window.renderCustomersManagement) window.renderCustomersManagement();
    if(tabId === 'time-bookings' && window.renderTimeBookings) window.renderTimeBookings();
    if(tabId === 'bookings-overview' && window.renderBookingsOverview) window.renderBookingsOverview();
    if(tabId === 'activities-management' && window.renderActivitiesManagement) window.renderActivitiesManagement();
    if(tabId === 'sales-daily' && window.renderSalesDaily) window.renderSalesDaily();
    if(tabId === 'sales-overview' && window.renderSalesOverview) window.renderSalesOverview();
    if(tabId === 'material-purchases' && window.renderMaterialPurchases) window.renderMaterialPurchases();
    if(tabId === 'purchases-overview' && window.renderPurchasesOverview) window.renderPurchasesOverview();
    if(tabId === 'bilanz-daily' && window.renderBilanzDaily) window.renderBilanzDaily();
    if(tabId === 'bilanz-weekly' && window.renderBilanzWeekly) window.renderBilanzWeekly();
    if(tabId === 'bilanz-monthly' && window.renderBilanzMonthly) window.renderBilanzMonthly();
    if(tabId === 'employees-overview' && window.renderEmployeesOverview) window.renderEmployeesOverview();
    if(tabId === 'employees-management' && window.renderEmployeesManagement) window.renderEmployeesManagement();
    if(tabId === 'time-tracking' && window.renderTimeTracking) window.renderTimeTracking();
    if(tabId === 'settings' && window.renderSettings) window.renderSettings();
    if(tabId === 'backup' && window.renderBackup) window.renderBackup();
};

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    // Themes laden (falls vorhanden)
    if(window.loadTheme) window.loadTheme();
    // Datenbank initialisieren (falls Funktion vorhanden)
    if(window.initDatabase) window.initDatabase();
    // Starttab anzeigen
    window.showTab('calculator');
});

console.log('✅ ui.js Basisfunktionen geladen und bereit.');
