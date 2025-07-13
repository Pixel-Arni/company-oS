// ui.js - Vollständige UI-Verwaltung für Company OS

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createEmptyState(title, subtitle) {
    return `
        <div class="empty-state">
            <h3>${title}</h3>
            <p>${subtitle}</p>
        </div>
    `;
}

function createListItem(title, details, actions) {
    return `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${escapeHtml(title)}</h3>
                ${details.map(detail => `<p>${escapeHtml(detail)}</p>`).join('')}
            </div>
            <div class="list-item-actions">
                ${actions.map(action => 
                    `<button class="${action.class}" onclick="${action.onclick}">${action.text}</button>`
                ).join('')}
            </div>
        </div>
    `;
}

// ===================================================================
// TAB MANAGEMENT
// ===================================================================

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
    updateDisplay(tabId);
};

// ===================================================================
// NOTIFICATIONS
// ===================================================================

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

// ===================================================================
// MODAL MANAGEMENT
// ===================================================================

window.showModal = function(id) {
    const modal = document.getElementById(id);
    if(modal) {
        modal.classList.add('show', 'opening');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.remove('opening'), 400);
        
        // Modal-Fokus: erstes Input
        const input = modal.querySelector('input,select,textarea');
        if(input) input.focus();
        
        // Close bei Klick auf Hintergrund
        modal.onclick = function(e) {
            if(e.target === modal) window.hideModal(id);
        };
    }
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

// ===================================================================
// SIDEBAR MANAGEMENT
// ===================================================================

window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    if(sidebar) {
        sidebar.classList.toggle('collapsed');
        if(mainContent) {
            mainContent.classList.toggle('expanded');
        }
    }
};

window.toggleDropdown = function(id) {
    document.querySelectorAll('.dropdown').forEach(drop => {
        if(drop.id !== id) drop.classList.remove('active');
    });
    const el = document.getElementById(id);
    if(el) el.classList.toggle('active');
};

// ===================================================================
// CALCULATOR DISPLAY (Waren Übersicht)
// ===================================================================

function updateCalculatorDisplay() {
    const container = document.getElementById('calculator-content');
    if (!container) return;

    if (!window.items || window.items.length === 0) {
        container.innerHTML = createEmptyState('Keine Items vorhanden', 'Fügen Sie zunächst Items und Materialien hinzu!');
        return;
    }

    const rows = window.items.map(item => {
        const materialCosts = getItemMaterialCost(item);
        const profit = getItemProfit(item);
        const margin = item.sellPrice > 0 ? ((profit / item.sellPrice) * 100) : 0;
        
        return `
            <tr>
                <td>${escapeHtml(item.name)}</td>
                <td>${formatCurrency(item.sellPrice)}</td>
                <td>${formatCurrency(materialCosts)}</td>
                <td class="${profit >= 0 ? 'profit-positive' : 'profit-negative'}">${formatCurrency(profit)}</td>
                <td>${margin.toFixed(1)}%</td>
            </tr>
        `;
    }).join('');

    // Gesamtstatistiken berechnen
    const totalRevenue = window.items.reduce((sum, item) => sum + (item.sellPrice || 0), 0);
    const totalCosts = window.items.reduce((sum, item) => sum + getItemMaterialCost(item), 0);
    const totalProfit = totalRevenue - totalCosts;
    const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

    container.innerHTML = `
        <div class="stats-header">
            <div class="stat-card">
                <div class="stat-value">${window.items.length}</div>
                <div class="stat-label">Items</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatCurrency(totalRevenue)}</div>
                <div class="stat-label">Gesamtumsatz</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatCurrency(totalCosts)}</div>
                <div class="stat-label">Materialkosten</div>
            </div>
            <div class="stat-card">
                <div class="stat-value ${totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}">${formatCurrency(totalProfit)}</div>
                <div class="stat-label">Gewinn</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgMargin.toFixed(1)}%</div>
                <div class="stat-label">Durchschnittsmarge</div>
            </div>
        </div>
        
        <div class="card">
            <h3>Kosten-Gewinn-Analyse</h3>
            <table class="calculator-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Verkaufspreis</th>
                        <th>Materialkosten</th>
                        <th>Gewinn</th>
                        <th>Marge</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr>
                        <td><strong>Gesamt</strong></td>
                        <td><strong>${formatCurrency(totalRevenue)}</strong></td>
                        <td><strong>${formatCurrency(totalCosts)}</strong></td>
                        <td class="${totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}"><strong>${formatCurrency(totalProfit)}</strong></td>
                        <td><strong>${avgMargin.toFixed(1)}%</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

// ===================================================================
// DISPLAY UPDATE FUNCTIONS
// ===================================================================

window.updateDisplay = function(tabId) {
    // Calculator wird immer aktualisiert
    if (tabId === 'calculator') {
        updateCalculatorDisplay();
    }
    
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
    if(tabId === 'backup' && window.renderDataStatus) window.renderDataStatus();
    
    // Dropdown-Listen aktualisieren
    updateAllDropdowns();
};

// ===================================================================
// DROPDOWN MANAGEMENT
// ===================================================================

function updateAllDropdowns() {
    updateCustomerDropdowns();
    updateEmployeeDropdowns();
    updateActivityDropdowns();
    updateMaterialDropdowns();
    updateItemDropdowns();
}

function updateCustomerDropdowns() {
    const dropdowns = [
        document.getElementById('newSaleCustomer'),
        document.getElementById('newBookingCustomer'),
        document.getElementById('editSaleCustomer'),
        document.getElementById('editBookingCustomer')
    ].filter(el => el);
    
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Laufkundschaft</option>';
        
        if (window.customers) {
            window.customers.forEach(customer => {
                if (customer.active !== false) {
                    const option = document.createElement('option');
                    option.value = `${customer.firstName} ${customer.lastName}`;
                    option.textContent = `${customer.firstName} ${customer.lastName}`;
                    dropdown.appendChild(option);
                }
            });
        }
        
        dropdown.value = currentValue;
    });
}

function updateEmployeeDropdowns() {
    const dropdowns = [
        document.getElementById('newSessionEmployee')
    ].filter(el => el);
    
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Mitarbeiter auswählen...</option>';
        
        if (window.employees) {
            window.employees.forEach(employee => {
                if (employee.active !== false) {
                    const option = document.createElement('option');
                    option.value = `${employee.firstName} ${employee.lastName}`;
                    option.textContent = `${employee.firstName} ${employee.lastName}`;
                    dropdown.appendChild(option);
                }
            });
        }
        
        dropdown.value = currentValue;
    });
}

function updateActivityDropdowns() {
    const dropdowns = [
        document.getElementById('newBookingActivity'),
        document.getElementById('editBookingActivity')
    ].filter(el => el);
    
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Aktivität auswählen...</option>';
        
        if (window.activities) {
            window.activities.forEach(activity => {
                if (activity.active !== false) {
                    const option = document.createElement('option');
                    option.value = activity.name;
                    option.textContent = `${activity.icon || '🎯'} ${activity.name}`;
                    dropdown.appendChild(option);
                }
            });
        }
        
        dropdown.value = currentValue;
    });
}

function updateMaterialDropdowns() {
    // Wird von items.js für Material-Auswahl verwendet
    const selects = document.querySelectorAll('.material-select');
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Material wählen...</option>';
        
        if (window.materials) {
            window.materials.forEach(material => {
                const option = document.createElement('option');
                option.value = material.name;
                option.textContent = `${material.name} (${formatCurrency(material.price)})`;
                select.appendChild(option);
            });
        }
        
        select.value = currentValue;
    });
}

function updateItemDropdowns() {
    // Für Verkauf-Auswahl
    const dropdowns = document.querySelectorAll('.item-select');
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Item auswählen...</option>';
        
        if (window.items) {
            window.items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.name;
                option.textContent = `${item.name} (${formatCurrency(item.sellPrice)})`;
                dropdown.appendChild(option);
            });
        }
        
        dropdown.value = currentValue;
    });
}

// Duration Dropdown für Zeitbuchungen
function updateDurationDropdowns() {
    const dropdowns = [
        document.getElementById('newBookingDuration'),
        document.getElementById('editBookingDuration')
    ].filter(el => el);
    
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = `
            <option value="">Dauer auswählen...</option>
            <option value="30">30 Minuten</option>
            <option value="60">60 Minuten</option>
            <option value="90">90 Minuten</option>
            <option value="120">120 Minuten</option>
        `;
        dropdown.value = currentValue;
    });
}

// ===================================================================
// HELPER FUNCTIONS FÜR BERECHNUNGEN
// ===================================================================

// Item-Materialkosten berechnen
window.getItemMaterialCost = function(item) {
    if (!item || !item.materials || !window.materials) return 0;
    let sum = 0;
    item.materials.forEach(m => {
        const mat = window.materials.find(mat => mat.name === m.name);
        if (mat) sum += (mat.price || 0) * (m.qty || 1);
    });
    return sum;
};

// Item-Gewinn berechnen
window.getItemProfit = function(item) {
    return (item.sellPrice || 0) - window.getItemMaterialCost(item);
};

// Verkauf-Gesamtsumme berechnen
window.calcSaleTotal = function(sale) {
    if (!sale || !sale.items) return 0;
    return sale.items.reduce((sum, i) => sum + ((i.price || 0) * (i.qty || 1)), 0);
};

// ===================================================================
// MODAL CLOSE FUNCTIONS
// ===================================================================

window.closeCustomerEditModal = function() {
    hideModal('editCustomerModal');
    window._editingCustomerIndex = undefined;
};

window.closeItemEditModal = function() {
    hideModal('editItemModal');
    window._editingItemIndex = undefined;
};

window.closeMaterialEditModal = function() {
    hideModal('editMaterialModal');
    window._editingMaterialIndex = undefined;
};

window.closeActivityEditModal = function() {
    hideModal('editActivityModal');
    window._editingActivityIndex = undefined;
};

window.closeTimeBookingEditModal = function() {
    hideModal('editTimeBookingModal');
    window._editingBookingIndex = undefined;
};

window.closeEmployeeEditModal = function() {
    hideModal('editEmployeeModal');
    window._editingEmployeeIndex = undefined;
};

window.closeSaleEditModal = function() {
    hideModal('editSaleModal');
    window._editingSaleIndex = undefined;
};

window.closePurchaseEditModal = function() {
    hideModal('editPurchaseModal');
    window._editingPurchaseIndex = undefined;
};

// ===================================================================
// ADDITIONAL HELPER FUNCTIONS
// ===================================================================

// Hilfsfunktion für Stundenlohn basierend auf Rang
window.updateHourlyRateFromRank = function(rank, fieldId) {
    const rates = {
        'Aushilfe': 12.00,
        'Teilzeit': 15.00,
        'Vollzeit': 18.00,
        'Senior': 22.00,
        'Manager': 28.00
    };
    const field = document.getElementById(fieldId);
    if (field && rates[rank]) {
        field.value = rates[rank];
    }
};

// Input-Validierung
function validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
        showNotification(`${fieldName} ist erforderlich!`, 'error');
        return false;
    }
    return true;
}

function validateNumber(value, fieldName, min = 0) {
    const num = parseFloat(value);
    if (isNaN(num) || num < min) {
        showNotification(`${fieldName} muss eine gültige Zahl >= ${min} sein!`, 'error');
        return false;
    }
    return true;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Date Helpers
function getCurrentDate() {
    return new Date().toISOString().slice(0, 10);
}

function getCurrentTime() {
    return new Date().toTimeString().slice(0, 5);
}

// ===================================================================
// EVENT LISTENERS
// ===================================================================

function initializeEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Strg+S zum Speichern
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (typeof window.saveData === 'function') {
                window.saveData();
                showNotification('Daten gespeichert!', 'success');
            }
        }
        
        // ESC zum Schließen von Modals
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                hideModal(modal.id);
            });
        }
        
        // Alt+Zahl für Tab-Navigation
        if (e.altKey && !isNaN(e.key)) {
            e.preventDefault();
            const tabMapping = {
                1: 'calculator',
                2: 'items',
                3: 'time-bookings',
                4: 'sales-daily',
                5: 'material-purchases',
                6: 'bilanz-daily',
                7: 'employees-overview',
                8: 'settings'
            };
            if (tabMapping[e.key]) {
                showTab(tabMapping[e.key]);
            }
        }
    });
    
    // Mobile-optimierte Touch-Events
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        if (Math.abs(diff) > swipeThreshold) {
            // Swipe-Logik kann hier erweitert werden
        }
    }
    
    // Window resize handling
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Auto-save bei Formulareingaben
    let autoSaveTimeout;
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('input-field')) {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                if (typeof window.saveData === 'function') {
                    window.saveData();
                }
            }, 5000);
        }
    });
}

function handleResize() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        if (mainContent) mainContent.classList.add('expanded');
    } else {
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (mainContent) mainContent.classList.remove('expanded');
    }
}

// ===================================================================
// INITIALIZATION
// ===================================================================

function initializeUI() {
    console.log('🎨 Initialisiere UI-System...');
    
    // Event Listeners initialisieren
    initializeEventListeners();
    
    // Defaultwerte setzen
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = getCurrentDate();
        }
    });
    
    const timeInputs = document.querySelectorAll('input[type="time"]');
    timeInputs.forEach(input => {
        if (!input.value) {
            input.value = getCurrentTime();
        }
    });
    
    // Starttab anzeigen
    showTab('calculator');
    
    console.log('✅ UI-System vollständig initialisiert');
}

// ===================================================================
// DOCUMENT READY
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Warten bis alle anderen Module geladen sind
    setTimeout(() => {
        // Themes laden (falls vorhanden)
        if(window.loadTheme) window.loadTheme();
        
        // Datenbank initialisieren (falls Funktion vorhanden)
        if(window.initDatabase) window.initDatabase();
        
        // UI initialisieren
        initializeUI();
        
        // Duration Dropdowns füllen
        updateDurationDropdowns();
        
        console.log('🚀 Company OS vollständig geladen und bereit!');
    }, 100);
});

console.log('✅ ui.js vollständig geladen');