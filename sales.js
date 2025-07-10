// ===================================================================
// SALES.JS - Company OS Verkaufsmodul
// Daily Sales, Item Sales Tracking, Revenue Management
// ===================================================================

// Global sales data (wird von database.js verwaltet)
// let sales = []; // Wird in database.js definiert
// let items = []; // Wird in database.js definiert
// let customers = []; // Wird in database.js definiert
let editingSaleId = null;
let currentSaleItems = []; // Temporäre Liste für aktuellen Verkauf

// Verkaufstypen
const saleTypes = {
    'daily': { label: 'Tagesverkauf', description: 'Verkauf eines kompletten Tages' },
    'individual': { label: 'Einzelverkauf', description: 'Einzelner Verkauf an Kunde' },
    'bulk': { label: 'Großverkauf', description: 'Großer Verkauf mit mehreren Items' }
};

// ===================================================================
// SALES MANAGEMENT
// ===================================================================

/**
 * Startet einen neuen Verkauf
 */
function startNewSale() {
    console.log('💰 Starte neuen Verkauf...');
    
    const dateField = document.getElementById('newSaleDate');
    const customerField = document.getElementById('newSaleCustomer');
    const typeField = document.getElementById('newSaleType');
    
    if (!dateField) {
        console.error('❌ Verkaufs-Eingabefelder nicht gefunden');
        if (typeof showNotification === 'function') {
            showNotification('Fehler: Eingabefelder nicht gefunden', 'error');
        }
        return;
    }
    
    const date = dateField.value;
    const customerId = customerField ? customerField.value : null;
    const saleType = typeField ? typeField.value : 'daily';
    
    // Validierung
    if (!date) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie ein Datum ein!', 'warning');
        }
        dateField.focus();
        return;
    }
    
    // Prüfe ob bereits ein Verkauf für dieses Datum existiert (bei Tagesverkauf)
    if (saleType === 'daily' && sales.some(sale => sale.date === date && sale.saleType === 'daily')) {
        if (typeof showNotification === 'function') {
            showNotification('Für dieses Datum existiert bereits ein Tagesverkauf!', 'warning');
        }
        return;
    }
    
    // Leere aktuelle Verkaufsliste
    currentSaleItems = [];
    
    // Öffne Item-Auswahl Modal
    populateItemSelection();
    if (typeof showModal === 'function') {
        showModal('itemSelectionModal');
    }
    
    // Setze aktuelle Verkaufsdaten
    const modalDateElement = document.getElementById('modalSaleDate');
    if (modalDateElement) {
        modalDateElement.textContent = new Date(date).toLocaleDateString('de-DE');
    }
    
    const modalCustomerElement = document.getElementById('modalSaleCustomer');
    if (modalCustomerElement) {
        modalCustomerElement.textContent = customerId ? getCustomerName(customerId) : 'Laufkundschaft';
    }
    
    const modalTypeElement = document.getElementById('modalSaleType');
    if (modalTypeElement) {
        modalTypeElement.textContent = saleTypes[saleType].label;
    }
    
    console.log(`✅ Neuer Verkauf gestartet für ${date}`);
}

/**
 * Füllt die Item-Auswahl für den Verkauf
 */
function populateItemSelection() {
    const container = document.getElementById('itemSelectionList');
    if (!container) {
        console.error('❌ Item-Selection Container nicht gefunden');
        return;
    }
    
    if (items.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                <p>Keine Items verfügbar.</p>
                <p>Fügen Sie zuerst Items hinzu, um Verkäufe zu erfassen.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-selection-row';
        
        const calculation = calculateCosts(item);
        
        div.innerHTML = `
            <div class="item-info">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-price">${formatCurrency(item.sellPrice)}</div>
                <div class="item-profit">(Gewinn: ${formatCurrency(calculation.profit)})</div>
            </div>
            <div class="item-quantity">
                <button type="button" onclick="decreaseItemQuantity('${item.id}')" class="qty-btn">-</button>
                <input type="number" 
                       id="qty_${item.id}" 
                       class="qty-input" 
                       value="0" 
                       min="0" 
                       max="999"
                       onchange="updateItemQuantity('${item.id}', this.value)">
                <button type="button" onclick="increaseItemQuantity('${item.id}')" class="qty-btn">+</button>
            </div>
            <div class="item-total" id="total_${item.id}">$0.00</div>
        `;
        container.appendChild(div);
    });
    
    updateSaleSummary();
}

/**
 * Erhöht Item-Menge
 */
function increaseItemQuantity(itemId) {
    const input = document.getElementById(`qty_${itemId}`);
    if (input) {
        const newValue = parseInt(input.value) + 1;
        input.value = newValue;
        updateItemQuantity(itemId, newValue);
    }
}

/**
 * Verringert Item-Menge
 */
function decreaseItemQuantity(itemId) {
    const input = document.getElementById(`qty_${itemId}`);
    if (input) {
        const newValue = Math.max(0, parseInt(input.value) - 1);
        input.value = newValue;
        updateItemQuantity(itemId, newValue);
    }
}

/**
 * Aktualisiert Item-Menge im Verkauf
 */
function updateItemQuantity(itemId, quantity) {
    const qty = parseInt(quantity) || 0;
    const item = items.find(i => i.id == itemId);
    
    if (!item) {
        console.error(`❌ Item mit ID ${itemId} nicht gefunden`);
        return;
    }
    
    // Aktualisiere currentSaleItems
    const existingIndex = currentSaleItems.findIndex(si => si.itemId == itemId);
    
    if (qty > 0) {
        const saleItem = {
            itemId: itemId,
            itemName: item.name,
            quantity: qty,
            unitPrice: item.sellPrice,
            totalPrice: qty * item.sellPrice
        };
        
        if (existingIndex >= 0) {
            currentSaleItems[existingIndex] = saleItem;
        } else {
            currentSaleItems.push(saleItem);
        }
    } else {
        if (existingIndex >= 0) {
            currentSaleItems.splice(existingIndex, 1);
        }
    }
    
    // Aktualisiere UI
    const totalDiv = document.getElementById(`total_${itemId}`);
    if (totalDiv) {
        totalDiv.textContent = formatCurrency(qty * item.sellPrice);
    }
    
    updateSaleSummary();
    console.log(`🔄 Item-Menge aktualisiert: ${item.name} = ${qty}`);
}

/**
 * Aktualisiert die Verkaufs-Zusammenfassung
 */
function updateSaleSummary() {
    const summaryDiv = document.getElementById('saleSummary');
    if (!summaryDiv) return;
    
    const totalItems = currentSaleItems.reduce((sum, si) => sum + si.quantity, 0);
    const totalRevenue = currentSaleItems.reduce((sum, si) => sum + si.totalPrice, 0);
    
    // Berechne Gesamtkosten und Gewinn
    let totalCosts = 0;
    currentSaleItems.forEach(saleItem => {
        const item = items.find(i => i.id == saleItem.itemId);
        if (item) {
            const calculation = calculateCosts(item);
            totalCosts += calculation.materialCosts * saleItem.quantity;
        }
    });
    
    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    summaryDiv.innerHTML = `
        <div class="summary-row">
            <span>Artikel gesamt:</span>
            <span><strong>${totalItems}</strong></span>
        </div>
        <div class="summary-row">
            <span>Umsatz:</span>
            <span><strong>${formatCurrency(totalRevenue)}</strong></span>
        </div>
        <div class="summary-row">
            <span>Kosten:</span>
            <span><strong>${formatCurrency(totalCosts)}</strong></span>
        </div>
        <div class="summary-row profit-row">
            <span>Gewinn:</span>
            <span class="${totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}">
                <strong>${formatCurrency(totalProfit)} (${profitMargin.toFixed(1)}%)</strong>
            </span>
        </div>
    `;
}

/**
 * Speichert den aktuellen Verkauf
 */
function saveSale() {
    console.log('💾 Speichere Verkauf...');
    
    if (currentSaleItems.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte fügen Sie mindestens ein Item hinzu!', 'warning');
        }
        return;
    }
    
    const dateField = document.getElementById('newSaleDate');
    const customerField = document.getElementById('newSaleCustomer');
    const typeField = document.getElementById('newSaleType');
    const notesField = document.getElementById('newSaleNotes');
    
    const date = dateField.value;
    const customerId = customerField ? customerField.value : null;
    const saleType = typeField ? typeField.value : 'daily';
    const notes = notesField ? notesField.value.trim() : '';
    
    // Berechne Verkaufsstatistiken
    const totalQuantity = currentSaleItems.reduce((sum, si) => sum + si.quantity, 0);
    const totalAmount = currentSaleItems.reduce((sum, si) => sum + si.totalPrice, 0);
    
    let totalCosts = 0;
    currentSaleItems.forEach(saleItem => {
        const item = items.find(i => i.id == saleItem.itemId);
        if (item) {
            const calculation = calculateCosts(item);
            totalCosts += calculation.materialCosts * saleItem.quantity;
        }
    });
    
    const totalProfit = totalAmount - totalCosts;
    
    // Verkauf erstellen
    const sale = {
        id: generateSaleId(),
        date: date,
        customerId: customerId,
        saleType: saleType,
        items: [...currentSaleItems], // Deep copy
        totalQuantity: totalQuantity,
        totalAmount: Number(totalAmount.toFixed(2)),
        totalCosts: Number(totalCosts.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        notes: notes,
        isPaid: true, // Standardmäßig als bezahlt markieren
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Hinzufügen und speichern
    sales.push(sale);
    
    // Kundendaten aktualisieren wenn vorhanden
    if (customerId) {
        updateCustomerSalesStats(customerId, totalAmount);
    }
    
    saveSalesData();
    updateSalesDisplay();
    
    // Modal schließen und Felder leeren
    if (typeof hideModal === 'function') {
        hideModal('itemSelectionModal');
    }
    clearSalesInputs();
    
    if (typeof showNotification === 'function') {
        showNotification(`Verkauf für ${new Date(date).toLocaleDateString('de-DE')} wurde gespeichert!`, 'success');
    }
    console.log(`✅ Verkauf gespeichert: ${totalQuantity} Items, ${formatCurrency(totalAmount)}`);
}

/**
 * Aktualisiert Kunden-Verkaufsstatistiken
 */
function updateCustomerSalesStats(customerId, amount) {
    const customer = customers.find(c => c.id == customerId);
    if (customer) {
        customer.totalSpent = (customer.totalSpent || 0) + amount;
        customer.totalVisits = (customer.totalVisits || 0) + 1;
        customer.lastVisit = new Date().toISOString();
        customer.updatedAt = new Date().toISOString();
    }
}

/**
 * Bricht die Verkaufs-Erstellung ab
 */
function cancelSale() {
    if (currentSaleItems.length > 0) {
        if (confirm('Möchten Sie den Verkauf wirklich abbrechen?\n\nAlle Eingaben gehen verloren.')) {
            currentSaleItems = [];
            if (typeof hideModal === 'function') {
                hideModal('itemSelectionModal');
            }
            clearSalesInputs();
        }
    } else {
        if (typeof hideModal === 'function') {
            hideModal('itemSelectionModal');
        }
        clearSalesInputs();
    }
}

/**
 * Leert die Verkaufs-Eingabefelder
 */
function clearSalesInputs() {
    const fields = ['newSaleNotes'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    // Dropdowns auf Standard setzen
    const customerField = document.getElementById('newSaleCustomer');
    if (customerField) customerField.value = '';
    
    const typeField = document.getElementById('newSaleType');
    if (typeField) typeField.value = 'daily';
    
    // Datum auf heute setzen
    setDefaultSaleDate();
    
    // Aktuelle Items leeren
    currentSaleItems = [];
}

/**
 * Setzt Standard-Datum für Verkäufe
 */
function setDefaultSaleDate() {
    const dateField = document.getElementById('newSaleDate');
    if (dateField && !dateField.value) {
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;
    }
}

// ===================================================================
// SALE EDITING
// ===================================================================

/**
 * Bearbeitet einen Verkauf
 */
function editSale(id) {
    const sale = sales.find(s => s.id == id);
    if (!sale) {
        console.error(`❌ Verkauf mit ID ${id} nicht gefunden`);
        if (typeof showNotification === 'function') {
            showNotification('Verkauf nicht gefunden!', 'error');
        }
        return;
    }
    
    console.log(`✏️ Bearbeite Verkauf: ${sale.date}`);
    
    editingSaleId = id;
    currentSaleItems = [...sale.items]; // Deep copy
    
    // Modal-Felder füllen
    const editDateField = document.getElementById('editSaleDate');
    if (editDateField) editDateField.value = sale.date;
    
    const editCustomerField = document.getElementById('editSaleCustomer');
    if (editCustomerField) editCustomerField.value = sale.customerId || '';
    
    const editTypeField = document.getElementById('editSaleType');
    if (editTypeField) editTypeField.value = sale.saleType;
    
    const editNotesField = document.getElementById('editSaleNotes');
    if (editNotesField) editNotesField.value = sale.notes || '';
    
    const editPaidField = document.getElementById('editSalePaid');
    if (editPaidField) editPaidField.checked = sale.isPaid;
    
    // Item-Liste für Bearbeitung füllen
    populateEditItemSelection();
    if (typeof showModal === 'function') {
        showModal('editSaleModal');
    }
}

/**
 * Füllt die Item-Auswahl für die Bearbeitung
 */
function populateEditItemSelection() {
    const container = document.getElementById('editItemSelectionList');
    if (!container) return;
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const existingItem = currentSaleItems.find(si => si.itemId == item.id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        
        const div = document.createElement('div');
        div.className = 'item-selection-row';
        
        const calculation = calculateCosts(item);
        
        div.innerHTML = `
            <div class="item-info">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-price">${formatCurrency(item.sellPrice)}</div>
                <div class="item-profit">(Gewinn: ${formatCurrency(calculation.profit)})</div>
            </div>
            <div class="item-quantity">
                <button type="button" onclick="decreaseEditItemQuantity('${item.id}')" class="qty-btn">-</button>
                <input type="number" 
                       id="edit_qty_${item.id}" 
                       class="qty-input" 
                       value="${currentQty}" 
                       min="0" 
                       max="999"
                       onchange="updateEditItemQuantity('${item.id}', this.value)">
                <button type="button" onclick="increaseEditItemQuantity('${item.id}')" class="qty-btn">+</button>
            </div>
            <div class="item-total" id="edit_total_${item.id}">${formatCurrency(currentQty * item.sellPrice)}</div>
        `;
        container.appendChild(div);
    });
    
    updateEditSaleSummary();
}

/**
 * Erhöht Item-Menge bei Bearbeitung
 */
function increaseEditItemQuantity(itemId) {
    const input = document.getElementById(`edit_qty_${itemId}`);
    if (input) {
        const newValue = parseInt(input.value) + 1;
        input.value = newValue;
        updateEditItemQuantity(itemId, newValue);
    }
}

/**
 * Verringert Item-Menge bei Bearbeitung
 */
function decreaseEditItemQuantity(itemId) {
    const input = document.getElementById(`edit_qty_${itemId}`);
    if (input) {
        const newValue = Math.max(0, parseInt(input.value) - 1);
        input.value = newValue;
        updateEditItemQuantity(itemId, newValue);
    }
}

/**
 * Aktualisiert Item-Menge bei Bearbeitung
 */
function updateEditItemQuantity(itemId, quantity) {
    const qty = parseInt(quantity) || 0;
    const item = items.find(i => i.id == itemId);
    
    if (!item) return;
    
    const existingIndex = currentSaleItems.findIndex(si => si.itemId == itemId);
    
    if (qty > 0) {
        const saleItem = {
            itemId: itemId,
            itemName: item.name,
            quantity: qty,
            unitPrice: item.sellPrice,
            totalPrice: qty * item.sellPrice
        };
        
        if (existingIndex >= 0) {
            currentSaleItems[existingIndex] = saleItem;
        } else {
            currentSaleItems.push(saleItem);
        }
    } else {
        if (existingIndex >= 0) {
            currentSaleItems.splice(existingIndex, 1);
        }
    }
    
    // UI aktualisieren
    const totalDiv = document.getElementById(`edit_total_${itemId}`);
    if (totalDiv) {
        totalDiv.textContent = formatCurrency(qty * item.sellPrice);
    }
    
    updateEditSaleSummary();
}

/**
 * Aktualisiert die Bearbeitungs-Zusammenfassung
 */
function updateEditSaleSummary() {
    const summaryDiv = document.getElementById('editSaleSummary');
    if (!summaryDiv) return;
    
    const totalItems = currentSaleItems.reduce((sum, si) => sum + si.quantity, 0);
    const totalRevenue = currentSaleItems.reduce((sum, si) => sum + si.totalPrice, 0);
    
    let totalCosts = 0;
    currentSaleItems.forEach(saleItem => {
        const item = items.find(i => i.id == saleItem.itemId);
        if (item) {
            const calculation = calculateCosts(item);
            totalCosts += calculation.materialCosts * saleItem.quantity;
        }
    });
    
    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    summaryDiv.innerHTML = `
        <div class="summary-row">
            <span>Artikel gesamt:</span>
            <span><strong>${totalItems}</strong></span>
        </div>
        <div class="summary-row">
            <span>Umsatz:</span>
            <span><strong>${formatCurrency(totalRevenue)}</strong></span>
        </div>
        <div class="summary-row">
            <span>Kosten:</span>
            <span><strong>${formatCurrency(totalCosts)}</strong></span>
        </div>
        <div class="summary-row profit-row">
            <span>Gewinn:</span>
            <span class="${totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}">
                <strong>${formatCurrency(totalProfit)} (${profitMargin.toFixed(1)}%)</strong>
            </span>
        </div>
    `;
}

/**
 * Speichert die Verkaufs-Bearbeitung
 */
function saveSaleEdit() {
    if (!editingSaleId) {
        console.error('❌ Keine Verkaufs-ID zum Bearbeiten gefunden');
        return;
    }
    
    const sale = sales.find(s => s.id == editingSaleId);
    if (!sale) {
        console.error(`❌ Verkauf mit ID ${editingSaleId} nicht gefunden`);
        if (typeof showNotification === 'function') {
            showNotification('Verkauf nicht gefunden!', 'error');
        }
        return;
    }
    
    if (currentSaleItems.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte fügen Sie mindestens ein Item hinzu!', 'warning');
        }
        return;
    }
    
    // Aktualisiere Verkaufsdaten
    const dateField = document.getElementById('editSaleDate');
    const customerField = document.getElementById('editSaleCustomer');
    const typeField = document.getElementById('editSaleType');
    const notesField = document.getElementById('editSaleNotes');
    const paidField = document.getElementById('editSalePaid');
    
    const date = dateField ? dateField.value : sale.date;
    const customerId = customerField ? (customerField.value || null) : sale.customerId;
    const saleType = typeField ? typeField.value : sale.saleType;
    const notes = notesField ? notesField.value.trim() : sale.notes;
    const isPaid = paidField ? paidField.checked : sale.isPaid;
    
    // Berechne neue Statistiken
    const totalQuantity = currentSaleItems.reduce((sum, si) => sum + si.quantity, 0);
    const totalAmount = currentSaleItems.reduce((sum, si) => sum + si.totalPrice, 0);
    
    let totalCosts = 0;
    currentSaleItems.forEach(saleItem => {
        const item = items.find(i => i.id == saleItem.itemId);
        if (item) {
            const calculation = calculateCosts(item);
            totalCosts += calculation.materialCosts * saleItem.quantity;
        }
    });
    
    const totalProfit = totalAmount - totalCosts;
    
    // Verkauf aktualisieren
    sale.date = date;
    sale.customerId = customerId;
    sale.saleType = saleType;
    sale.items = [...currentSaleItems];
    sale.totalQuantity = totalQuantity;
    sale.totalAmount = Number(totalAmount.toFixed(2));
    sale.totalCosts = Number(totalCosts.toFixed(2));
    sale.totalProfit = Number(totalProfit.toFixed(2));
    sale.notes = notes;
    sale.isPaid = isPaid;
    sale.updatedAt = new Date().toISOString();
    
    saveSalesData();
    updateSalesDisplay();
    closeSaleEditModal();
    
    if (typeof showNotification === 'function') {
        showNotification('Verkauf wurde aktualisiert!', 'success');
    }
    console.log(`✅ Verkauf aktualisiert: ${date}`);
}

/**
 * Schließt das Verkaufs-Bearbeitung Modal
 */
function closeSaleEditModal() {
    if (typeof hideModal === 'function') {
        hideModal('editSaleModal');
    }
    editingSaleId = null;
    currentSaleItems = [];
}

/**
 * Löscht einen Verkauf
 */
function deleteSale(id) {
    const sale = sales.find(s => s.id == id);
    if (!sale) {
        console.error(`❌ Verkauf mit ID ${id} nicht gefunden`);
        return;
    }
    
    const saleInfo = `${sale.date} (${sale.totalQuantity} Items, ${formatCurrency(sale.totalAmount)})`;
    
    if (confirm(`Verkauf "${saleInfo}" wirklich löschen?`)) {
        sales = sales.filter(s => s.id != id);
        
        saveSalesData();
        updateSalesDisplay();
        
        if (typeof showNotification === 'function') {
            showNotification('Verkauf wurde gelöscht!', 'success');
        }
        console.log(`🗑️ Verkauf gelöscht: ${id}`);
    }
}

/**
 * Markiert einen Verkauf als bezahlt/unbezahlt
 */
function toggleSalePaid(saleId) {
    const sale = sales.find(s => s.id == saleId);
    if (!sale) {
        console.error(`❌ Verkauf mit ID ${saleId} nicht gefunden`);
        return;
    }
    
    sale.isPaid = !sale.isPaid;
    sale.updatedAt = new Date().toISOString();
    
    saveSalesData();
    updateSalesDisplay();
    
    const status = sale.isPaid ? 'bezahlt' : 'unbezahlt';
    if (typeof showNotification === 'function') {
        showNotification(`Verkauf als ${status} markiert!`, 'success');
    }
}

// ===================================================================
// STATISTICS & CALCULATIONS
// ===================================================================

/**
 * Berechnet Verkaufsstatistiken
 */
function calculateSalesStats(dateRange = null) {
    let filteredSales = sales;
    
    if (dateRange) {
        filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= dateRange.start && saleDate <= dateRange.end;
        });
    }
    
    const totalSales = filteredSales.length;
    const paidSales = filteredSales.filter(s => s.isPaid).length;
    const unpaidSales = totalSales - paidSales;
    
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalCosts = filteredSales.reduce((sum, sale) => sum + sale.totalCosts, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.totalProfit, 0);
    const totalItems = filteredSales.reduce((sum, sale) => sum + sale.totalQuantity, 0);
    
    const paidRevenue = filteredSales.filter(s => s.isPaid).reduce((sum, sale) => sum + sale.totalAmount, 0);
    const unpaidRevenue = totalRevenue - paidRevenue;
    
    // Item-Statistiken
    const itemStats = {};
    filteredSales.forEach(sale => {
        sale.items.forEach(saleItem => {
            if (!itemStats[saleItem.itemId]) {
                itemStats[saleItem.itemId] = {
                    itemName: saleItem.itemName,
                    quantity: 0,
                    revenue: 0
                };
            }
            itemStats[saleItem.itemId].quantity += saleItem.quantity;
            itemStats[saleItem.itemId].revenue += saleItem.totalPrice;
        });
    });
    
    return {
        totalSales,
        paidSales,
        unpaidSales,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalCosts: Number(totalCosts.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        totalItems,
        paidRevenue: Number(paidRevenue.toFixed(2)),
        unpaidRevenue: Number(unpaidRevenue.toFixed(2)),
        itemStats,
        averageSaleValue: totalSales > 0 ? Number((totalRevenue / totalSales).toFixed(2)) : 0,
        profitMargin: totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0
    };
}

/**
 * Berechnet tägliche Verkaufsstatistiken
 */
function calculateDailySalesStats(date) {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    return calculateSalesStats({
        start: new Date(dateStr),
        end: new Date(dateStr)
    });
}

/**
 * Berechnet wöchentliche Verkaufsstatistiken
 */
function calculateWeeklySalesStats(weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return calculateSalesStats({
        start: weekStart,
        end: weekEnd
    });
}

// ===================================================================
// HELPERS
// ===================================================================

/**
 * Ermittelt Kundenname anhand ID
 */
function getCustomerName(customerId) {
    const customer = customers.find(c => c.id == customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unbekannt';
}

/**
 * Aktualisiert Kunden-Dropdowns für Verkäufe
 */
function updateSalesCustomerDropdowns() {
    const dropdowns = [
        document.getElementById('newSaleCustomer'),
        document.getElementById('editSaleCustomer')
    ].filter(dropdown => dropdown !== null);
    
    dropdowns.forEach(dropdown => {
        if (!dropdown) return;
        
        const activeCustomers = customers.filter(c => c.isActive);
        
        dropdown.innerHTML = '<option value="">Laufkundschaft</option>';
        
        if (activeCustomers.length > 0) {
            activeCustomers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.firstName} ${customer.lastName} (${customer.customerType})`;
                dropdown.appendChild(option);
            });
        }
    });
}

// ===================================================================
// DATA MANAGEMENT
// ===================================================================

/**
 * Speichert Verkaufsdaten (verwendet database.js saveData)
 */
function saveSalesData() {
    console.log('💾 Speichere Verkaufsdaten über database.js...');
    
    if (typeof saveData === 'function') {
        saveData();
    } else {
        console.error('❌ saveData Funktion nicht verfügbar');
    }
}

/**
 * Hilfsfunktion für generateId (lokale Implementation)
 */
function generateSaleId() {
    return 'sale_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===================================================================
// DISPLAY UPDATE FUNCTIONS (Placeholder)
// ===================================================================

/**
 * Aktualisiert die Verkaufs-Anzeige (wird in ui.js implementiert)
 */
function updateSalesDisplay() {
    if (typeof updateSalesDisplayUI === 'function') {
        updateSalesDisplayUI();
    }
}

// ===================================================================
// INITIALIZATION
// ===================================================================

/**
 * Initialisiert das Verkaufs-System
 */
function initializeSalesSystem() {
    console.log('💰 Initialisiere Verkaufs-System...');
    
    // Warte bis database.js initialisiert ist
    if (typeof waitForInitialization === 'function') {
        waitForInitialization(() => {
            updateSalesCustomerDropdowns();
            setDefaultSaleDate();
            console.log(`✅ Verkaufs-System initialisiert - ${sales.length} Verkäufe`);
        });
    } else {
        // Fallback ohne Warten
        updateSalesCustomerDropdowns();
        setDefaultSaleDate();
        console.log(`✅ Verkaufs-System initialisiert - Fallback-Modus`);
    }
}

// Auto-Initialisierung (verzögert nach database.js)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Verzögerung um sicherzustellen, dass database.js zuerst lädt
        setTimeout(initializeSalesSystem, 800);
    });
} else {
    setTimeout(initializeSalesSystem, 800);
}

console.log('💰 Sales.js geladen');