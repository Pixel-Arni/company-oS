// sales.js
// Verkauf & Kassenmodul für Company OS mit vollständiger Kassen-Funktionalität

// Datenstruktur Verkauf:
// [{ customerName, date, type, items: [{ name, qty, price }], notes, paid }]

window.sales = JSON.parse(localStorage.getItem('company-os-sales') || '[]');

// ===================================================================
// MAIN DISPLAY FUNCTIONS
// ===================================================================

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
    
    list.innerHTML = todaysSales.map((sale, idx) => {
        const originalIdx = window.sales.indexOf(sale);
        return `
            <div class="list-item">
                <div class="list-item-info">
                    <h3>${sale.customerName || 'Laufkundschaft'}</h3>
                    <p><strong>Datum:</strong> ${formatDate(sale.date)} (${sale.type})</p>
                    <p><strong>Items:</strong> ${sale.items?.map(i => `${i.name} (${i.qty}x @ ${formatCurrency(i.price)})`).join(', ') || '-'}</p>
                    <p><strong>Gesamt:</strong> ${formatCurrency(calcSaleTotal(sale))}</p>
                    <p><strong>Status:</strong> ${sale.paid ? '✅ Bezahlt' : '❌ Offen'}</p>
                    ${sale.notes ? `<p><strong>Notizen:</strong> ${sale.notes}</p>` : ''}
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-success" onclick="editSale(${originalIdx})" title="Verkauf bearbeiten">✏️ Bearbeiten</button>
                    <button class="btn btn-danger" onclick="deleteSale(${originalIdx})" title="Verkauf löschen">🗑️ Löschen</button>
                </div>
            </div>
        `;
    }).join('');
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
    
    // Statistiken berechnen
    const stats = calculateSalesStats(filteredSales);
    
    const statsHtml = `
        <div class="stats-header">
            <div class="stat-card">
                <div class="stat-value">${filteredSales.length}</div>
                <div class="stat-label">Verkäufe</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatCurrency(stats.totalRevenue)}</div>
                <div class="stat-label">Gesamtumsatz</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatCurrency(stats.averageOrderValue)}</div>
                <div class="stat-label">Ø Bestellwert</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.paidSales}</div>
                <div class="stat-label">Bezahlte Verkäufe</div>
            </div>
        </div>
    `;
    
    const salesList = filteredSales.map((sale, idx) => {
        const originalIdx = window.sales.indexOf(sale);
        return `
            <div class="list-item">
                <div class="list-item-info">
                    <h3>${sale.customerName || 'Laufkundschaft'}</h3>
                    <p><strong>Datum:</strong> ${formatDate(sale.date)} (${sale.type})</p>
                    <p><strong>Items:</strong> ${sale.items?.map(i => `${i.name} (${i.qty}x)`).join(', ') || '-'}</p>
                    <p><strong>Gesamt:</strong> ${formatCurrency(calcSaleTotal(sale))}</p>
                    <p><strong>Status:</strong> ${sale.paid ? '✅ Bezahlt' : '❌ Offen'}</p>
                    ${sale.notes ? `<p><strong>Notizen:</strong> ${sale.notes}</p>` : ''}
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-success" onclick="editSale(${originalIdx})" title="Verkauf bearbeiten">✏️ Bearbeiten</button>
                    <button class="btn btn-danger" onclick="deleteSale(${originalIdx})" title="Verkauf löschen">🗑️ Löschen</button>
                </div>
            </div>
        `;
    }).join('');
    
    list.innerHTML = statsHtml + '<div class="card"><h3>Verkaufsliste</h3>' + salesList + '</div>';
};

// ===================================================================
// KASSEN-FUNKTIONALITÄT
// ===================================================================

// Aktuelle Warenkorb-Items (temporär, bis Verkauf abgeschlossen)
window.currentSaleItems = [];

// Verfügbare Items für Kasse anzeigen
window.renderAvailableItems = function() {
    const container = document.getElementById('itemSelectionList');
    if (!container) return;
    
    if (!window.items || window.items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Keine Items verfügbar</h3>
                <p>Bitte fügen Sie zunächst Items hinzu!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="items-grid">
            ${window.items.map((item, idx) => {
                const profit = window.getItemProfit ? window.getItemProfit(item) : 0;
                const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
                
                return `
                    <div class="item-card" onclick="addItemToSale('${item.name}', ${item.sellPrice})">
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <p class="item-price">${formatCurrency(item.sellPrice)}</p>
                            <p class="item-profit ${profitClass}">Gewinn: ${formatCurrency(profit)}</p>
                        </div>
                        <button class="btn btn-success item-add-btn" type="button">
                            + Hinzufügen
                        </button>
                    </div>
                `;
            }).join('')}
        </div>
    `;
};

// Item zum aktuellen Verkauf hinzufügen
window.addItemToSale = function(itemName, itemPrice) {
    const existingItem = window.currentSaleItems.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        window.currentSaleItems.push({
            name: itemName,
            price: itemPrice,
            qty: 1
        });
    }
    
    updateSalePreview();
    showNotification(`${itemName} zum Verkauf hinzugefügt!`, 'success');
};

// Aktuelle Verkaufs-Vorschau aktualisieren
window.updateSalePreview = function() {
    const container = document.getElementById('saleSummary');
    if (!container) return;
    
    if (window.currentSaleItems.length === 0) {
        container.innerHTML = `
            <div class="summary-empty">
                <p>Keine Items ausgewählt</p>
                <p>Klicken Sie auf ein Item, um es hinzuzufügen</p>
            </div>
        `;
        return;
    }
    
    const total = window.currentSaleItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    container.innerHTML = `
        <div class="summary-header">
            <h4>Aktuelle Verkaufsvorschau</h4>
        </div>
        <div class="summary-items">
            ${window.currentSaleItems.map((item, idx) => `
                <div class="summary-item">
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-unit-price">${formatCurrency(item.price)}</span>
                    </div>
                    <div class="item-quantity">
                        <button class="qty-btn" onclick="updateItemQuantity(${idx}, -1)" ${item.qty <= 1 ? 'disabled' : ''}>-</button>
                        <span class="qty-display">${item.qty}</span>
                        <button class="qty-btn" onclick="updateItemQuantity(${idx}, 1)">+</button>
                    </div>
                    <div class="item-total">
                        <span>${formatCurrency(item.price * item.qty)}</span>
                        <button class="remove-item-btn" onclick="removeItemFromSale(${idx})">✖</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="summary-total">
            <div class="total-line">
                <span>Gesamt:</span>
                <strong>${formatCurrency(total)}</strong>
            </div>
        </div>
    `;
};

// Item-Menge aktualisieren
window.updateItemQuantity = function(itemIdx, change) {
    if (itemIdx >= 0 && itemIdx < window.currentSaleItems.length) {
        window.currentSaleItems[itemIdx].qty += change;
        
        if (window.currentSaleItems[itemIdx].qty <= 0) {
            window.currentSaleItems.splice(itemIdx, 1);
        }
        
        updateSalePreview();
    }
};

// Item aus Verkauf entfernen
window.removeItemFromSale = function(itemIdx) {
    if (itemIdx >= 0 && itemIdx < window.currentSaleItems.length) {
        const itemName = window.currentSaleItems[itemIdx].name;
        window.currentSaleItems.splice(itemIdx, 1);
        updateSalePreview();
        showNotification(`${itemName} wurde entfernt!`, 'success');
    }
};

// ===================================================================
// SALE MANAGEMENT
// ===================================================================

// Verkauf hinzufügen (neuer Verkauf im Tagesverkauf)
window.addSale = function() {
    const customerName = document.getElementById('newSaleCustomer').value || 'Laufkundschaft';
    const date = document.getElementById('newSaleDate').value || new Date().toISOString().slice(0,10);
    const type = document.getElementById('newSaleType').value || 'regular';
    const notes = document.getElementById('newSaleNotes').value.trim();
    
    if (!window.currentSaleItems || window.currentSaleItems.length === 0) {
        showNotification('Bitte wählen Sie mindestens ein Item aus!', 'error');
        return;
    }
    
    const sale = {
        customerName,
        date,
        type,
        items: [...window.currentSaleItems], // Kopie erstellen
        notes,
        paid: false,
        createdAt: new Date().toISOString()
    };
    
    window.sales.push(sale);
    saveSales();
    renderSalesDaily();
    renderSalesOverview();
    clearNewSaleFields();
    showNotification('Verkauf erfolgreich hinzugefügt!', 'success');
};

// Bearbeiten (öffnet Modal)
window.editSale = function(idx) {
    const sale = window.sales[idx];
    if (!sale) {
        showNotification('Verkauf nicht gefunden!', 'error');
        return;
    }
    
    document.getElementById('editSaleCustomer').value = sale.customerName || '';
    document.getElementById('editSaleDate').value = sale.date || '';
    document.getElementById('editSaleType').value = sale.type || 'regular';
    document.getElementById('editSalePaid').checked = !!sale.paid;
    document.getElementById('editSaleNotes').value = sale.notes || '';
    
    setItemsToEditModal('editItemSelectionList', sale.items || []);
    window._editingSaleIndex = idx;
    showModal('editSaleModal');
};

// Speichern nach Bearbeitung
window.saveSaleEdit = function() {
    const idx = window._editingSaleIndex;
    if (idx === undefined) {
        showNotification('Kein Verkauf zum Bearbeiten ausgewählt!', 'error');
        return;
    }
    
    const customerName = document.getElementById('editSaleCustomer').value || 'Laufkundschaft';
    const date = document.getElementById('editSaleDate').value;
    const type = document.getElementById('editSaleType').value;
    const paid = document.getElementById('editSalePaid').checked;
    const notes = document.getElementById('editSaleNotes').value.trim();
    const items = getItemsFromEditModal('editItemSelectionList');
    
    if (!date || !items.length) {
        showNotification('Datum und mindestens ein Item sind erforderlich!', 'error');
        return;
    }
    
    window.sales[idx] = {
        ...window.sales[idx],
        customerName,
        date,
        type,
        items,
        notes,
        paid,
        updatedAt: new Date().toISOString()
    };
    
    saveSales();
    renderSalesDaily();
    renderSalesOverview();
    hideModal('editSaleModal');
    showNotification('Verkauf erfolgreich aktualisiert!', 'success');
    window._editingSaleIndex = undefined;
};

// Verkauf löschen
window.deleteSale = function(idx) {
    const sale = window.sales[idx];
    if (!sale) {
        showNotification('Verkauf nicht gefunden!', 'error');
        return;
    }
    
    if (!confirm(`Verkauf von "${sale.customerName}" wirklich löschen?`)) return;
    
    window.sales.splice(idx, 1);
    saveSales();
    renderSalesDaily();
    renderSalesOverview();
    showNotification('Verkauf wurde gelöscht!', 'success');
};

// ===================================================================
// EDIT MODAL FUNCTIONS
// ===================================================================

// Items im Edit-Modal setzen
function setItemsToEditModal(listId, items) {
    const container = document.getElementById(listId);
    if (!container) return;
    
    container.innerHTML = '';
    
    (items || []).forEach(item => {
        const row = document.createElement('div');
        row.className = 'item-assignment-row';
        row.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-unit-price">${formatCurrency(item.price)}</span>
            </div>
            <div class="item-quantity">
                <input type="number" class="quantity-input" value="${item.qty}" min="1" max="999" onchange="updateEditItemTotal(this)">
            </div>
            <div class="item-total">
                <span class="item-total-price">${formatCurrency(item.price * item.qty)}</span>
                <button class="remove-item" onclick="this.parentElement.parentElement.remove(); updateEditSummary();" type="button">✖</button>
            </div>
        `;
        container.appendChild(row);
    });
    
    updateEditSummary();
}

// Items aus Edit-Modal auslesen
function getItemsFromEditModal(listId) {
    const container = document.getElementById(listId);
    if (!container) return [];
    
    const rows = container.querySelectorAll('.item-assignment-row');
    return Array.from(rows).map(row => {
        const name = row.querySelector('.item-name')?.textContent?.trim() || '';
        const price = parseFloat(row.querySelector('.item-unit-price')?.textContent?.replace(/[^\d.-]/g, '')) || 0;
        const qty = parseFloat(row.querySelector('.quantity-input')?.value) || 1;
        return { name, price, qty };
    }).filter(i => i.name && i.qty > 0);
}

// Edit-Modal Item-Total aktualisieren
window.updateEditItemTotal = function(qtyInput) {
    const row = qtyInput.closest('.item-assignment-row');
    if (!row) return;
    
    const price = parseFloat(row.querySelector('.item-unit-price')?.textContent?.replace(/[^\d.-]/g, '')) || 0;
    const qty = parseFloat(qtyInput.value) || 1;
    const total = price * qty;
    
    const totalElement = row.querySelector('.item-total-price');
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
    
    updateEditSummary();
};

// Edit-Modal Summary aktualisieren
window.updateEditSummary = function() {
    const container = document.getElementById('editSaleSummary');
    if (!container) return;
    
    const items = getItemsFromEditModal('editItemSelectionList');
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    container.innerHTML = `
        <div class="summary-title">Verkaufs-Zusammenfassung</div>
        <div class="summary-row">
            <span class="summary-label">Anzahl Items:</span>
            <span class="summary-value">${items.length}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Gesamtmenge:</span>
            <span class="summary-value">${items.reduce((sum, item) => sum + item.qty, 0)}</span>
        </div>
        <div class="summary-row total">
            <span class="summary-label">Gesamtbetrag:</span>
            <span class="summary-value total">${formatCurrency(total)}</span>
        </div>
    `;
};

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

// Verkaufs-Statistiken berechnen
function calculateSalesStats(sales) {
    const totalRevenue = sales.reduce((sum, sale) => sum + calcSaleTotal(sale), 0);
    const paidSales = sales.filter(sale => sale.paid).length;
    const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;
    
    return {
        totalRevenue,
        paidSales,
        averageOrderValue
    };
}

// Preisberechnung für Verkauf (Gesamtsumme)
function calcSaleTotal(sale) {
    if (!sale || !sale.items) return 0;
    return sale.items.reduce((sum, i) => sum + ((i.price || 0) * (i.qty || 1)), 0);
}

// Felder nach neuem Verkauf zurücksetzen
function clearNewSaleFields() {
    document.getElementById('newSaleCustomer').selectedIndex = 0;
    document.getElementById('newSaleDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('newSaleType').value = 'regular';
    document.getElementById('newSaleNotes').value = '';
    
    // Warenkorb leeren
    window.currentSaleItems = [];
    updateSalePreview();
}

// Formatierung
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

// Speichern in LocalStorage
function saveSales() {
    try {
        localStorage.setItem('company-os-sales', JSON.stringify(window.sales));
        if (typeof window.saveData === 'function') {
            window.saveData();
        }
    } catch (error) {
        console.error('Fehler beim Speichern der Verkäufe:', error);
        showNotification('Fehler beim Speichern!', 'error');
    }
}

// ===================================================================
// INITIALIZATION
// ===================================================================

// Sales-Modul initialisieren
function initializeSales() {
    // Warenkorb initialisieren
    window.currentSaleItems = [];
    
    // Verfügbare Items anzeigen
    renderAvailableItems();
    
    // Verkaufsvorschau initialisieren
    updateSalePreview();
    
    // Listen rendern
    renderSalesDaily();
    renderSalesOverview();
    
    console.log(`✅ Sales initialisiert - ${window.sales.length} Verkäufe geladen`);
}

// Event Listeners beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeSales, 300);
});

// Export-Funktionen
window.calcSaleTotal = calcSaleTotal;

console.log('✅ sales.js vollständig geladen - Kassen-Funktionalität implementiert');