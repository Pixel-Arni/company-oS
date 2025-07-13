// ui.js

// Globale Tab-Funktion
window.showTab = function(tabId) {
    // Alle Tabs ausblenden
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
<<<<<<< HEAD
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
=======
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.sidebar-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.style.display = 'block';
    }
    
    // Add active class to clicked button and its parent dropdown
    const targetButton = document.querySelector(`button[onclick*="showTab('${tabName}')"]`);
    if (targetButton) {
        targetButton.classList.add('active');
        
        // Wenn der Button in einem Dropdown ist, aktiviere auch den übergeordneten Button und das Dropdown
        const parentLi = targetButton.closest('li');
        if (parentLi && parentLi.parentElement && parentLi.parentElement.classList.contains('dropdown')) {
            const dropdownMenu = parentLi.parentElement;
            const parentDropdownButton = dropdownMenu.previousElementSibling;
            
            // Aktiviere den übergeordneten Button
            if (parentDropdownButton) {
                parentDropdownButton.classList.add('active');
            }
            
            // Aktiviere das Dropdown-Menü
            dropdownMenu.classList.add('active');
        }
    }
    
    // Update displays based on tab
    updateTabDisplays(tabName);
}

function updateTabDisplays(tabName) {
    switch(tabName) {
        case 'materials':
            updateMaterialsDisplay();
            break;
        case 'employees':
            updateEmployeesDisplay();
            break;
        case 'customers':
            updateCustomersDisplay();
            break;
        case 'sales':
            updateSalesDisplay();
            break;
        case 'purchases':
            updatePurchasesDisplay();
            break;
        case 'time-bookings':
            updateTimeBookingsDisplay();
            break;
        case 'bilanz':
            updateBilanzDisplay();
            break;
        case 'calculator':
            updateCalculatorDisplay();
            break;
        default:
            updateDisplay();
    }
}

// ===================================================================
// DISPLAY UPDATE FUNCTIONS
// ===================================================================

function updateDisplay() {
    updateItemsDisplay();
    updateMaterialsDisplay();
    updateEmployeesDisplay();
    updateCustomersDisplay();
    updateSalesDisplay();
    updatePurchasesDisplay();
    updateTimeBookingsDisplay();
    updateCalculatorDisplay();
    updateAllDropdowns();
}

function updateItemsDisplay() {
    const container = document.getElementById('items-list');
    if (!container || !window.items) return;

    if (items.length === 0) {
        container.innerHTML = createEmptyState('Keine Items vorhanden', 'Fügen Sie Ihr erstes Item hinzu!');
        return;
    }

    container.innerHTML = items.map(item => {
        const calc = calculateCosts(item);
        return createListItem(
            item.name,
            [
                `VK: ${formatCurrency(item.sellPrice)}`,
                `Materialkosten: ${formatCurrency(calc.materialCosts)}`,
                `Gewinn: ${formatCurrency(calc.profit)} (${calc.profitMargin.toFixed(1)}%)`
            ],
            [
                { text: '✏️ Bearbeiten', onclick: `editItem('${item.id}')`, class: 'btn' },
                { text: '🗑️ Löschen', onclick: `deleteItem('${item.id}')`, class: 'btn btn-danger' }
            ]
        );
    }).join('');
}

function updateCalculatorDisplay() {
    const container = document.getElementById('calculator-content');
    if (!container || !window.items) return;

    if (items.length === 0) {
        container.innerHTML = createEmptyState('Keine Items vorhanden', 'Fügen Sie zunächst Items und Materialien hinzu!');
        return;
    }

    const rows = items.map(item => {
        const calc = calculateCosts(item);
        return `
            <tr>
                <td>${escapeHtml(item.name)}</td>
                <td>${formatCurrency(item.sellPrice)}</td>
                <td>${formatCurrency(calc.materialCosts)}</td>
                <td>${formatCurrency(calc.profit)}</td>
                <td>${calc.profitMargin.toFixed(1)}%</td>
            </tr>
        `;
    }).join('');

    const stats = calculateOverallStats();

    container.innerHTML = `
        <table class="calculator-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>VK</th>
                    <th>Material</th>
                    <th>Gewinn</th>
                    <th>Marge</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
                <tr>
                    <td><strong>Summe</strong></td>
                    <td>${formatCurrency(stats.totalRevenue)}</td>
                    <td>${formatCurrency(stats.totalCosts)}</td>
                    <td>${formatCurrency(stats.totalProfit)}</td>
                    <td>${stats.averageMargin.toFixed(1)}%</td>
                </tr>
            </tfoot>
        </table>`;
}

function updateMaterialsDisplay() {
    const container = document.getElementById('materials-list');
    if (!container || !window.materials) return;
    
    if (materials.length === 0) {
        container.innerHTML = createEmptyState('Keine Materialien vorhanden', 'Fügen Sie Ihr erstes Material hinzu!');
        return;
    }
    
    container.innerHTML = materials.map(material => {
        const isLowStock = material.stock <= material.minStock;
        return createListItem(
            material.name + (isLowStock ? ' ⚠️' : ''),
            [
                `Bestand: ${material.stock} ${material.unit || ''}`,
                `Mindestbestand: ${material.minStock} ${material.unit || ''}`,
                `Kosten: ${formatCurrency(material.cost)} / ${material.unit || 'Einheit'}`,
                `Lieferant: ${material.supplier || 'Nicht angegeben'}`,
                isLowStock ? '⚠️ Niedriger Bestand!' : ''
            ].filter(Boolean),
            [
                { text: '✏️ Bearbeiten', onclick: `editMaterial('${material.id}')`, class: 'btn' },
                { text: '🗑️ Löschen', onclick: `deleteMaterial('${material.id}')`, class: 'btn btn-danger' }
            ]
        );
    }).join('');
}

function updateEmployeesDisplay() {
    const container = document.getElementById('employees-list');
    if (!container || !window.employees) return;
    
    if (employees.length === 0) {
        container.innerHTML = createEmptyState('Keine Mitarbeiter vorhanden', 'Fügen Sie Ihren ersten Mitarbeiter hinzu!');
        return;
    }
    
    container.innerHTML = employees.map(employee => createListItem(
        `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
        [
            `Position: ${employee.position || 'Nicht angegeben'}`,
            `Stundenlohn: ${formatCurrency(employee.hourlyRate || 0)}`,
            employee.email ? `E-Mail: ${employee.email}` : '',
            employee.phone ? `Telefon: ${employee.phone}` : ''
        ].filter(Boolean),
        [
            { text: '✏️ Bearbeiten', onclick: `editEmployee('${employee.id}')`, class: 'btn' },
            { text: '🗑️ Löschen', onclick: `deleteEmployee('${employee.id}')`, class: 'btn btn-danger' }
        ]
    )).join('');
}

function updateCustomersDisplay() {
    const container = document.getElementById('customers-list');
    if (!container || !window.customers) return;
    
    if (customers.length === 0) {
        container.innerHTML = createEmptyState('Keine Kunden vorhanden', 'Fügen Sie Ihren ersten Kunden hinzu!');
        return;
    }
    
    container.innerHTML = customers.map(customer => createListItem(
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        [
            customer.email ? `E-Mail: ${customer.email}` : '',
            customer.phone ? `Telefon: ${customer.phone}` : '',
            `Typ: ${customer.type || 'Standard'}`,
            customer.discount ? `Rabatt: ${customer.discount}%` : ''
        ].filter(Boolean),
        [
            { text: '✏️ Bearbeiten', onclick: `editCustomer('${customer.id}')`, class: 'btn' },
            { text: '🗑️ Löschen', onclick: `deleteCustomer('${customer.id}')`, class: 'btn btn-danger' }
        ]
    )).join('');
}

function updateSalesDisplay() {
    const container = document.getElementById('sales-list');
    if (!container || !window.sales) return;
    
    if (sales.length === 0) {
        container.innerHTML = createEmptyState('Keine Verkäufe vorhanden', 'Erfassen Sie Ihren ersten Verkauf!');
        return;
    }
    
    container.innerHTML = sales.map(sale => createListItem(
        `Verkauf vom ${formatDate(sale.date)}`,
        [
            `Kunde: ${sale.customerName || 'Unbekannt'}`,
            `Betrag: ${formatCurrency(sale.totalAmount || 0)}`,
            `Items: ${sale.items ? sale.items.length : 0}`,
            sale.notes ? `Notizen: ${sale.notes}` : ''
        ].filter(Boolean),
        [
            { text: '✏️ Bearbeiten', onclick: `editSale('${sale.id}')`, class: 'btn' },
            { text: '🗑️ Löschen', onclick: `deleteSale('${sale.id}')`, class: 'btn btn-danger' }
        ]
    )).join('');
}

function updatePurchasesDisplay() {
    const container = document.getElementById('purchases-list');
    if (!container || !window.materialPurchases) return;
    
    if (materialPurchases.length === 0) {
        container.innerHTML = createEmptyState('Keine Einkäufe vorhanden', 'Erfassen Sie Ihren ersten Einkauf!');
        return;
    }
    
    container.innerHTML = materialPurchases.map(purchase => createListItem(
        `Einkauf vom ${formatDate(purchase.date)}`,
        [
            `Lieferant: ${purchase.supplier || 'Unbekannt'}`,
            `Kosten: ${formatCurrency(purchase.totalCost || 0)}`,
            `Materialien: ${purchase.items ? purchase.items.length : 0}`,
            purchase.invoice ? `Rechnung: ${purchase.invoice}` : '',
            purchase.notes ? `Notizen: ${purchase.notes}` : ''
        ].filter(Boolean),
        [
            { text: '✏️ Bearbeiten', onclick: `editPurchase('${purchase.id}')`, class: 'btn' },
            { text: '🗑️ Löschen', onclick: `deletePurchase('${purchase.id}')`, class: 'btn btn-danger' }
        ]
    )).join('');
}

function updateTimeBookingsDisplay() {
    const container = document.getElementById('timeBookings-list');
    if (!container || !window.timeBookings) return;
    
    if (timeBookings.length === 0) {
        container.innerHTML = createEmptyState('Keine Zeitbuchungen vorhanden', 'Erfassen Sie die erste Arbeitszeit!');
        return;
    }
    
    container.innerHTML = timeBookings.map(booking => createListItem(
        `${booking.employeeName || 'Unbekannt'} - ${formatDate(booking.date)}`,
        [
            `Zeit: ${booking.startTime} - ${booking.endTime}`,
            `Pause: ${booking.breakMinutes || 0} Minuten`,
            `Gearbeitet: ${booking.workedHours || 0} Stunden`,
            `Kosten: ${formatCurrency(booking.totalCost || 0)}`,
            booking.description ? `Beschreibung: ${booking.description}` : ''
        ].filter(Boolean),
        [
            { text: '✏️ Bearbeiten', onclick: `editTimeBooking('${booking.id}')`, class: 'btn' },
            { text: '🗑️ Löschen', onclick: `deleteTimeBooking('${booking.id}')`, class: 'btn btn-danger' }
        ]
    )).join('');
}

function updateBilanzDisplay() {
    // Bilanz calculations
    const revenue = (window.sales || []).reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const materialCosts = (window.materialPurchases || []).reduce((sum, purchase) => sum + (purchase.totalCost || 0), 0);
    const laborCosts = (window.timeBookings || []).reduce((sum, booking) => sum + (booking.totalCost || 0), 0);
    const totalCosts = materialCosts + laborCosts;
    const profit = revenue - totalCosts;
    
    // Update bilanz elements
    const elements = {
        'bilanz-revenue': formatCurrency(revenue),
        'bilanz-costs': formatCurrency(totalCosts),
        'bilanz-profit': formatCurrency(profit),
        'bilanz-margin': revenue > 0 ? ((profit / revenue) * 100).toFixed(1) + '%' : '0%'
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

// ===================================================================
// DROPDOWN UPDATES
// ===================================================================

function updateAllDropdowns() {
    updateEmployeeDropdowns();
    updateCustomerDropdowns();
    updateItemDropdowns();
    updateMaterialDropdowns();
}
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    
    const isVisible = dropdown.classList.contains('active');
    
    // Schließe andere Dropdowns
    document.querySelectorAll('.dropdown').forEach(dd => {
        if (dd.id !== dropdownId) {
            dd.classList.remove('active');
        }
    });
    
    // Toggle aktives Dropdown
    if (isVisible) {
        dropdown.classList.remove('active');
    } else {
        dropdown.classList.add('active');
    }
}
function updateEmployeeDropdowns() {
    const dropdowns = document.querySelectorAll('select[id*="employee"], select[id*="Employee"]');
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Mitarbeiter wählen...</option>';
        
        if (window.employees) {
            employees.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp.id;
                option.textContent = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                dropdown.appendChild(option);
            });
        }
        
        dropdown.value = currentValue;
    });
}

function updateCustomerDropdowns() {
    const dropdowns = document.querySelectorAll('select[id*="customer"], select[id*="Customer"]');
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Kunde wählen...</option>';
        
        if (window.customers) {
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                dropdown.appendChild(option);
            });
        }
        
        dropdown.value = currentValue;
    });
}

function updateItemDropdowns() {
    const dropdowns = document.querySelectorAll('select[id*="item"], select[id*="Item"]');
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Item wählen...</option>';
        
        if (window.items) {
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = `${item.name} (${item.quantity || 0} verfügbar)`;
                dropdown.appendChild(option);
            });
        }
        
        dropdown.value = currentValue;
    });
}

function updateMaterialDropdowns() {
    const dropdowns = document.querySelectorAll('select[id*="material"], select[id*="Material"]');
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Material wählen...</option>';
        
        if (window.materials) {
            materials.forEach(material => {
                const option = document.createElement('option');
                option.value = material.id;
                option.textContent = material.name;
                dropdown.appendChild(option);
            });
        }
        
        dropdown.value = currentValue;
    });
}


// ===================================================================
// UPDATE FUNCTIONS FOR OTHER MODULES
// ===================================================================

function updateItemsDisplayUI() { updateItemsDisplay(); }
function updateMaterialsDisplayUI() { updateMaterialsDisplay(); }
function updateSalesDisplayUI() { updateSalesDisplayActual(); }
function updateMaterialPurchasesDisplayUI() { updatePurchasesDisplay(); }
function updateEmployeeDisplay() { updateEmployeesDisplay(); }
function updateCustomerDisplay() { updateCustomersDisplay(); }
function updateTimeBookingDisplay() { updateTimeBookingsDisplay(); }

// ===================================================================
// EVENT LISTENERS
// ===================================================================

function updateSalesDisplay() {
    updateSalesDisplayActual();
}

function updateSalesDisplayActual() {
    const container = document.getElementById('sales-list');
    if (!container || !window.sales) return;
    
    if (sales.length === 0) {
        container.innerHTML = createEmptyState('Keine Verkäufe vorhanden', 'Erfassen Sie Ihren ersten Verkauf!');
        return;
    }
    
    container.innerHTML = sales.map(sale => createListItem(
        `Verkauf vom ${formatDate(sale.date)}`,
        [
            `Kunde: ${sale.customerName || 'Unbekannt'}`,
            `Betrag: ${formatCurrency(sale.totalAmount || 0)}`,
            `Items: ${sale.items ? sale.items.length : 0}`,
            sale.notes ? `Notizen: ${sale.notes}` : ''
        ].filter(Boolean),
        [
            { text: '✏️ Bearbeiten', onclick: `editSale('${sale.id}')`, class: 'btn' },
            { text: '🗑️ Löschen', onclick: `deleteSale('${sale.id}')`, class: 'btn btn-danger' }
        ]
    )).join('');
}

// ===================================================================
// MOBILE SIDEBAR TOGGLE
// ===================================================================

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

function handleResize() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        // Auf mobilen Geräten wird die Sidebar nur angezeigt, wenn mobile-open Klasse vorhanden ist
        if (mainContent) mainContent.style.marginLeft = '0';
    } else {
        // Auf Desktop-Geräten wird die Sidebar immer angezeigt
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (mainContent) mainContent.style.marginLeft = '280px';
    }
}

function initializeEventListeners() {
    window.addEventListener('resize', handleResize);
    handleResize();
    
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (typeof saveData === 'function') {
                saveData();
                showNotification('Daten gespeichert!', 'success');
            }
        }
        
        if (e.key === 'Escape') {
            document.querySelectorAll('[id$="Modal"][style*="display: block"]').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

// ===================================================================
// INITIALIZATION
// ===================================================================

function initializeUI() {
    console.log('🎨 Initialisiere UI-System...');
    
    initializeEventListeners();
    showTab('calculator');
    
    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .list-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 15px;
            margin: 10px 0;
            background: var(--card-bg, rgba(255,255,255,0.1));
            border: 1px solid var(--border-color, rgba(255,255,255,0.2));
            border-radius: 8px;
        }
        
        .list-item-info {
            flex: 1;
        }
        
        .list-item-actions {
            display: flex;
            gap: 5px;
            flex-shrink: 0;
        }
        
        .btn {
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            background: var(--accent-primary, #ffd700);
            color: var(--primary-bg, #1e3c72);
        }
        
        .btn-danger {
            background: #e74c3c;
            color: white;
        }
        
        .btn:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ UI-System initialisiert');
}

// Auto-Initialisierung
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeUI, 1200);
    });
} else {
    setTimeout(initializeUI, 1200);
}

console.log('🎨 UI.js geladen');
>>>>>>> a781f5447017221b870a5042af495d9502e33727
