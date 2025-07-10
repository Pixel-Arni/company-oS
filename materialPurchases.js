// ===================================================================
// MATERIALPURCHASES.JS - Company OS Materialeinkäufe
// Material Purchase Tracking, Inventory Management, Cost Analysis
// ===================================================================

// Global materialPurchases data (wird von database.js verwaltet)
// let materialPurchases = []; // Wird in database.js definiert
// let materials = []; // Wird in database.js definiert
let editingPurchaseId = null;
let currentPurchaseItems = []; // Temporäre Liste für aktuellen Einkauf

// Lieferanten-Datenbank
const suppliers = {
    'default': { name: 'Unbekannt', contact: '', notes: '' },
    'local_supplier': { name: 'Lokaler Lieferant', contact: 'Tel: 08654-123456', notes: 'Schnelle Lieferung' },
    'wholesale_partner': { name: 'Großhandel Partner', contact: 'bestellung@grosshandel.de', notes: 'Mengenrabatte verfügbar' },
    'online_store': { name: 'Online Shop', contact: 'www.materialshop.de', notes: 'Günstige Preise' },
    'direct_manufacturer': { name: 'Direkter Hersteller', contact: 'info@hersteller.com', notes: 'Beste Qualität' },
    'emergency_supplier': { name: 'Notfall-Lieferant', contact: 'notfall@express.de', notes: 'Teure aber schnelle Lieferung' }
};

// Einkaufs-Kategorien
const purchaseCategories = {
    'regular': { label: 'Regulärer Einkauf', color: '#3498db', description: 'Geplanter Materialeinkauf' },
    'emergency': { label: 'Notfall-Einkauf', color: '#e74c3c', description: 'Dringender Nachkauf' },
    'bulk': { label: 'Großeinkauf', color: '#2ecc71', description: 'Mengenrabatt-Einkauf' },
    'trial': { label: 'Test-Einkauf', color: '#f39c12', description: 'Neue Materialien testen' }
};

// ===================================================================
// MATERIAL PURCHASE MANAGEMENT
// ===================================================================

/**
 * Startet einen neuen Materialeinkauf
 */
function startNewPurchase() {
    console.log('🛒 Starte neuen Materialeinkauf...');
    
    const dateField = document.getElementById('newPurchaseDate');
    const supplierField = document.getElementById('newPurchaseSupplier');
    const categoryField = document.getElementById('newPurchaseCategory');
    
    if (!dateField) {
        console.error('❌ Einkaufs-Eingabefelder nicht gefunden');
        showNotification('Fehler: Eingabefelder nicht gefunden', 'error');
        return;
    }
    
    const date = dateField.value;
    const supplier = supplierField ? supplierField.value : 'default';
    const category = categoryField ? categoryField.value : 'regular';
    
    // Validierung
    if (!date) {
        showNotification('Bitte geben Sie ein Datum ein!', 'warning');
        dateField.focus();
        return;
    }
    
    // Leere aktuelle Einkaufsliste
    currentPurchaseItems = [];
    
    // Öffne Material-Auswahl Modal
    populateMaterialSelection();
    showModal('materialSelectionModal');
    
    // Setze aktuelle Einkaufsdaten
    document.getElementById('modalPurchaseDate').textContent = new Date(date).toLocaleDateString('de-DE');
    document.getElementById('modalPurchaseSupplier').textContent = suppliers[supplier].name;
    document.getElementById('modalPurchaseCategory').textContent = purchaseCategories[category].label;
    
    console.log(`✅ Neuer Einkauf gestartet für ${date}`);
}

/**
 * Füllt die Material-Auswahl für den Einkauf
 */
function populateMaterialSelection() {
    const container = document.getElementById('materialSelectionList');
    if (!container) {
        console.error('❌ Material-Selection Container nicht gefunden');
        return;
    }
    
    if (materials.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                <p>Keine Materialien verfügbar.</p>
                <p>Fügen Sie zuerst Materialien hinzu, um Einkäufe zu erfassen.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    materials.forEach(material => {
        const div = document.createElement('div');
        div.className = 'material-selection-row';
        
        div.innerHTML = `
            <div class="material-info">
                <div class="material-name">${escapeHtml(material.name)}</div>
                <div class="material-current-price">Aktueller Preis: ${formatCurrency(material.price)}</div>
            </div>
            <div class="material-quantity">
                <button type="button" onclick="decreaseMaterialQuantity('${material.id}')" class="qty-btn">-</button>
                <input type="number" 
                       id="qty_${material.id}" 
                       class="qty-input" 
                       value="0" 
                       min="0" 
                       max="9999"
                       step="0.1"
                       onchange="updateMaterialQuantity('${material.id}', this.value)">
                <button type="button" onclick="increaseMaterialQuantity('${material.id}')" class="qty-btn">+</button>
            </div>
            <div class="material-price">
                <input type="number" 
                       id="price_${material.id}" 
                       class="price-input" 
                       value="${material.price}" 
                       min="0" 
                       max="9999.99"
                       step="0.01"
                       placeholder="Einkaufspreis"
                       onchange="updateMaterialPrice('${material.id}', this.value)">
            </div>
            <div class="material-total" id="total_${material.id}">0.00€</div>
        `;
        container.appendChild(div);
    });
    
    updatePurchaseSummary();
}

/**
 * Erhöht Material-Menge
 */
function increaseMaterialQuantity(materialId) {
    const input = document.getElementById(`qty_${materialId}`);
    if (input) {
        const newValue = parseFloat(input.value) + 1;
        input.value = newValue.toFixed(1);
        updateMaterialQuantity(materialId, newValue);
    }
}

/**
 * Verringert Material-Menge
 */
function decreaseMaterialQuantity(materialId) {
    const input = document.getElementById(`qty_${materialId}`);
    if (input) {
        const newValue = Math.max(0, parseFloat(input.value) - 1);
        input.value = newValue.toFixed(1);
        updateMaterialQuantity(materialId, newValue);
    }
}

/**
 * Aktualisiert Material-Menge im Einkauf
 */
function updateMaterialQuantity(materialId, quantity) {
    const qty = parseFloat(quantity) || 0;
    const material = materials.find(m => m.id == materialId);
    
    if (!material) {
        console.error(`❌ Material mit ID ${materialId} nicht gefunden`);
        return;
    }
    
    const priceInput = document.getElementById(`price_${materialId}`);
    const unitPrice = priceInput ? parseFloat(priceInput.value) || material.price : material.price;
    
    // Aktualisiere currentPurchaseItems
    const existingIndex = currentPurchaseItems.findIndex(pi => pi.materialId == materialId);
    
    if (qty > 0) {
        const purchaseItem = {
            materialId: materialId,
            materialName: material.name,
            quantity: qty,
            unitPrice: unitPrice,
            totalCost: qty * unitPrice
        };
        
        if (existingIndex >= 0) {
            currentPurchaseItems[existingIndex] = purchaseItem;
        } else {
            currentPurchaseItems.push(purchaseItem);
        }
    } else {
        if (existingIndex >= 0) {
            currentPurchaseItems.splice(existingIndex, 1);
        }
    }
    
    // Aktualisiere UI
    const totalDiv = document.getElementById(`total_${materialId}`);
    if (totalDiv) {
        totalDiv.textContent = formatCurrency(qty * unitPrice);
    }
    
    updatePurchaseSummary();
    console.log(`🔄 Material-Menge aktualisiert: ${material.name} = ${qty}`);
}

/**
 * Aktualisiert Material-Preis im Einkauf
 */
function updateMaterialPrice(materialId, price) {
    const unitPrice = parseFloat(price) || 0;
    const qtyInput = document.getElementById(`qty_${materialId}`);
    const qty = qtyInput ? parseFloat(qtyInput.value) || 0 : 0;
    
    if (qty > 0) {
        updateMaterialQuantity(materialId, qty);
    }
}

/**
 * Aktualisiert die Einkaufs-Zusammenfassung
 */
function updatePurchaseSummary() {
    const summaryDiv = document.getElementById('purchaseSummary');
    if (!summaryDiv) return;
    
    const totalItems = currentPurchaseItems.reduce((sum, pi) => sum + pi.quantity, 0);
    const totalCost = currentPurchaseItems.reduce((sum, pi) => sum + pi.totalCost, 0);
    const uniqueMaterials = currentPurchaseItems.length;
    
    // Berechne durchschnittlichen Preis-Unterschied zu aktuellen Materialpreisen
    let priceComparisonHtml = '';
    if (currentPurchaseItems.length > 0) {
        let totalCurrentPrice = 0;
        currentPurchaseItems.forEach(purchaseItem => {
            const material = materials.find(m => m.id == purchaseItem.materialId);
            if (material) {
                totalCurrentPrice += material.price * purchaseItem.quantity;
            }
        });
        
        const priceDifference = totalCost - totalCurrentPrice;
        const priceChangePercent = totalCurrentPrice > 0 ? (priceDifference / totalCurrentPrice) * 100 : 0;
        
        priceComparisonHtml = `
            <div class="summary-row">
                <span>Preisänderung:</span>
                <span class="${priceDifference >= 0 ? 'profit-negative' : 'profit-positive'}">
                    ${priceDifference >= 0 ? '+' : ''}${formatCurrency(priceDifference)} 
                    (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(1)}%)
                </span>
            </div>
        `;
    }
    
    summaryDiv.innerHTML = `
        <div class="summary-row">
            <span>Materialarten:</span>
            <span><strong>${uniqueMaterials}</strong></span>
        </div>
        <div class="summary-row">
            <span>Gesamtmenge:</span>
            <span><strong>${totalItems.toFixed(1)}</strong></span>
        </div>
        <div class="summary-row">
            <span>Gesamtkosten:</span>
            <span><strong>${formatCurrency(totalCost)}</strong></span>
        </div>
        ${priceComparisonHtml}
    `;
}

/**
 * Speichert den aktuellen Einkauf
 */
function savePurchase() {
    console.log('💾 Speichere Einkauf...');
    
    if (currentPurchaseItems.length === 0) {
        showNotification('Bitte fügen Sie mindestens ein Material hinzu!', 'warning');
        return;
    }
    
    const dateField = document.getElementById('newPurchaseDate');
    const supplierField = document.getElementById('newPurchaseSupplier');
    const categoryField = document.getElementById('newPurchaseCategory');
    const notesField = document.getElementById('newPurchaseNotes');
    const invoiceField = document.getElementById('newPurchaseInvoice');
    
    const date = dateField.value;
    const supplier = supplierField ? supplierField.value : 'default';
    const category = categoryField ? categoryField.value : 'regular';
    const notes = notesField ? notesField.value.trim() : '';
    const invoiceNumber = invoiceField ? invoiceField.value.trim() : '';
    
    // Berechne Einkaufsstatistiken
    const totalQuantity = currentPurchaseItems.reduce((sum, pi) => sum + pi.quantity, 0);
    const totalCost = currentPurchaseItems.reduce((sum, pi) => sum + pi.totalCost, 0);
    
    // Erstelle einzelne Einkäufe für jedes Material
    const purchases = currentPurchaseItems.map(purchaseItem => ({
        id: generatePurchaseId(),
        date: date,
        materialId: purchaseItem.materialId,
        materialName: purchaseItem.materialName,
        quantity: purchaseItem.quantity,
        unitPrice: purchaseItem.unitPrice,
        totalCost: Number(purchaseItem.totalCost.toFixed(2)),
        supplier: supplier,
        category: category,
        notes: notes,
        invoiceNumber: invoiceNumber,
        batchId: generateBatchId(), // Alle Items eines Einkaufs haben die gleiche Batch-ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
    
    // Verwende die gleiche Batch-ID für alle Items
    const batchId = purchases[0].batchId;
    purchases.forEach(purchase => {
        purchase.batchId = batchId;
    });
    
    // Hinzufügen und speichern
    materialPurchases.push(...purchases);
    
    // Material-Preise aktualisieren (optional)
    if (confirm('Möchten Sie die aktuellen Materialpreise mit den Einkaufspreisen aktualisieren?')) {
        updateMaterialPrices(currentPurchaseItems);
    }
    
    savePurchaseData();
    updateMaterialPurchaseDisplay();
    
    // Modal schließen und Felder leeren
    hideModal('materialSelectionModal');
    clearPurchaseInputs();
    
    showNotification(`Einkauf für ${new Date(date).toLocaleDateString('de-DE')} wurde gespeichert!`, 'success');
    console.log(`✅ Einkauf gespeichert: ${currentPurchaseItems.length} Materialien, ${formatCurrency(totalCost)}`);
}

/**
 * Aktualisiert Material-Preise basierend auf Einkauf
 */
function updateMaterialPrices(purchaseItems) {
    purchaseItems.forEach(purchaseItem => {
        const material = materials.find(m => m.id == purchaseItem.materialId);
        if (material) {
            material.price = purchaseItem.unitPrice;
            material.updatedAt = new Date().toISOString();
        }
    });
    
    // Speichere aktualisierte Materialien
    if (typeof saveData === 'function') {
        saveData();
    }
    
    showNotification('Materialpreise wurden aktualisiert!', 'success');
}

/**
 * Bricht den Einkauf ab
 */
function cancelPurchase() {
    if (currentPurchaseItems.length > 0) {
        if (confirm('Möchten Sie den Einkauf wirklich abbrechen?\n\nAlle Eingaben gehen verloren.')) {
            currentPurchaseItems = [];
            hideModal('materialSelectionModal');
            clearPurchaseInputs();
        }
    } else {
        hideModal('materialSelectionModal');
        clearPurchaseInputs();
    }
}

/**
 * Leert die Einkaufs-Eingabefelder
 */
function clearPurchaseInputs() {
    const fields = ['newPurchaseNotes', 'newPurchaseInvoice'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    // Dropdowns auf Standard setzen
    const supplierField = document.getElementById('newPurchaseSupplier');
    if (supplierField) supplierField.value = 'default';
    
    const categoryField = document.getElementById('newPurchaseCategory');
    if (categoryField) categoryField.value = 'regular';
    
    // Datum auf heute setzen
    setDefaultPurchaseDate();
    
    // Aktuelle Items leeren
    currentPurchaseItems = [];
}

/**
 * Setzt Standard-Datum für Einkäufe
 */
function setDefaultPurchaseDate() {
    const dateField = document.getElementById('newPurchaseDate');
    if (dateField && !dateField.value) {
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;
    }
}

// ===================================================================
// PURCHASE EDITING
// ===================================================================

/**
 * Bearbeitet einen Einkauf (Batch)
 */
function editPurchaseBatch(batchId) {
    const batchPurchases = materialPurchases.filter(p => p.batchId === batchId);
    if (batchPurchases.length === 0) {
        console.error(`❌ Einkaufs-Batch mit ID ${batchId} nicht gefunden`);
        showNotification('Einkauf nicht gefunden!', 'error');
        return;
    }
    
    const firstPurchase = batchPurchases[0];
    console.log(`✏️ Bearbeite Einkaufs-Batch: ${firstPurchase.date}`);
    
    editingPurchaseId = batchId;
    
    // Lade Batch-Items in currentPurchaseItems
    currentPurchaseItems = batchPurchases.map(purchase => ({
        materialId: purchase.materialId,
        materialName: purchase.materialName,
        quantity: purchase.quantity,
        unitPrice: purchase.unitPrice,
        totalCost: purchase.totalCost
    }));
    
    // Modal-Felder füllen
    document.getElementById('editPurchaseDate').value = firstPurchase.date;
    document.getElementById('editPurchaseSupplier').value = firstPurchase.supplier;
    document.getElementById('editPurchaseCategory').value = firstPurchase.category;
    document.getElementById('editPurchaseNotes').value = firstPurchase.notes || '';
    document.getElementById('editPurchaseInvoice').value = firstPurchase.invoiceNumber || '';
    
    // Material-Liste für Bearbeitung füllen
    populateEditMaterialSelection();
    showModal('editPurchaseModal');
}

/**
 * Füllt die Material-Auswahl für die Bearbeitung
 */
function populateEditMaterialSelection() {
    const container = document.getElementById('editMaterialSelectionList');
    if (!container) return;
    
    container.innerHTML = '';
    
    materials.forEach(material => {
        const existingItem = currentPurchaseItems.find(pi => pi.materialId == material.id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        const currentPrice = existingItem ? existingItem.unitPrice : material.price;
        
        const div = document.createElement('div');
        div.className = 'material-selection-row';
        
        div.innerHTML = `
            <div class="material-info">
                <div class="material-name">${escapeHtml(material.name)}</div>
                <div class="material-current-price">Aktueller Preis: ${formatCurrency(material.price)}</div>
            </div>
            <div class="material-quantity">
                <button type="button" onclick="decreaseEditMaterialQuantity('${material.id}')" class="qty-btn">-</button>
                <input type="number" 
                       id="edit_qty_${material.id}" 
                       class="qty-input" 
                       value="${currentQty}" 
                       min="0" 
                       max="9999"
                       step="0.1"
                       onchange="updateEditMaterialQuantity('${material.id}', this.value)">
                <button type="button" onclick="increaseEditMaterialQuantity('${material.id}')" class="qty-btn">+</button>
            </div>
            <div class="material-price">
                <input type="number" 
                       id="edit_price_${material.id}" 
                       class="price-input" 
                       value="${currentPrice}" 
                       min="0" 
                       max="9999.99"
                       step="0.01"
                       placeholder="Einkaufspreis"
                       onchange="updateEditMaterialPrice('${material.id}', this.value)">
            </div>
            <div class="material-total" id="edit_total_${material.id}">${formatCurrency(currentQty * currentPrice)}</div>
        `;
        container.appendChild(div);
    });
    
    updateEditPurchaseSummary();
}

/**
 * Erhöht Material-Menge bei Bearbeitung
 */
function increaseEditMaterialQuantity(materialId) {
    const input = document.getElementById(`edit_qty_${materialId}`);
    if (input) {
        const newValue = parseFloat(input.value) + 1;
        input.value = newValue.toFixed(1);
        updateEditMaterialQuantity(materialId, newValue);
    }
}

/**
 * Verringert Material-Menge bei Bearbeitung
 */
function decreaseEditMaterialQuantity(materialId) {
    const input = document.getElementById(`edit_qty_${materialId}`);
    if (input) {
        const newValue = Math.max(0, parseFloat(input.value) - 1);
        input.value = newValue.toFixed(1);
        updateEditMaterialQuantity(materialId, newValue);
    }
}

/**
 * Aktualisiert Material-Menge bei Bearbeitung
 */
function updateEditMaterialQuantity(materialId, quantity) {
    const qty = parseFloat(quantity) || 0;
    const material = materials.find(m => m.id == materialId);
    
    if (!material) return;
    
    const priceInput = document.getElementById(`edit_price_${materialId}`);
    const unitPrice = priceInput ? parseFloat(priceInput.value) || material.price : material.price;
    
    const existingIndex = currentPurchaseItems.findIndex(pi => pi.materialId == materialId);
    
    if (qty > 0) {
        const purchaseItem = {
            materialId: materialId,
            materialName: material.name,
            quantity: qty,
            unitPrice: unitPrice,
            totalCost: qty * unitPrice
        };
        
        if (existingIndex >= 0) {
            currentPurchaseItems[existingIndex] = purchaseItem;
        } else {
            currentPurchaseItems.push(purchaseItem);
        }
    } else {
        if (existingIndex >= 0) {
            currentPurchaseItems.splice(existingIndex, 1);
        }
    }
    
    // UI aktualisieren
    const totalDiv = document.getElementById(`edit_total_${materialId}`);
    if (totalDiv) {
        totalDiv.textContent = formatCurrency(qty * unitPrice);
    }
    
    updateEditPurchaseSummary();
}

/**
 * Aktualisiert Material-Preis bei Bearbeitung
 */
function updateEditMaterialPrice(materialId, price) {
    const unitPrice = parseFloat(price) || 0;
    const qtyInput = document.getElementById(`edit_qty_${materialId}`);
    const qty = qtyInput ? parseFloat(qtyInput.value) || 0 : 0;
    
    if (qty > 0) {
        updateEditMaterialQuantity(materialId, qty);
    }
}

/**
 * Aktualisiert die Bearbeitungs-Zusammenfassung
 */
function updateEditPurchaseSummary() {
    const summaryDiv = document.getElementById('editPurchaseSummary');
    if (!summaryDiv) return;
    
    const totalItems = currentPurchaseItems.reduce((sum, pi) => sum + pi.quantity, 0);
    const totalCost = currentPurchaseItems.reduce((sum, pi) => sum + pi.totalCost, 0);
    const uniqueMaterials = currentPurchaseItems.length;
    
    summaryDiv.innerHTML = `
        <div class="summary-row">
            <span>Materialarten:</span>
            <span><strong>${uniqueMaterials}</strong></span>
        </div>
        <div class="summary-row">
            <span>Gesamtmenge:</span>
            <span><strong>${totalItems.toFixed(1)}</strong></span>
        </div>
        <div class="summary-row">
            <span>Gesamtkosten:</span>
            <span><strong>${formatCurrency(totalCost)}</strong></span>
        </div>
    `;
}

/**
 * Speichert die Einkaufs-Bearbeitung
 */
function savePurchaseEdit() {
    if (!editingPurchaseId) {
        console.error('❌ Keine Einkaufs-ID zum Bearbeiten gefunden');
        return;
    }
    
    if (currentPurchaseItems.length === 0) {
        showNotification('Bitte fügen Sie mindestens ein Material hinzu!', 'warning');
        return;
    }
    
    // Lösche alte Batch-Einträge
    materialPurchases = materialPurchases.filter(p => p.batchId !== editingPurchaseId);
    
    // Aktualisiere Einkaufsdaten
    const date = document.getElementById('editPurchaseDate').value;
    const supplier = document.getElementById('editPurchaseSupplier').value;
    const category = document.getElementById('editPurchaseCategory').value;
    const notes = document.getElementById('editPurchaseNotes').value.trim();
    const invoiceNumber = document.getElementById('editPurchaseInvoice').value.trim();
    
    // Erstelle neue Einkäufe
    const newPurchases = currentPurchaseItems.map(purchaseItem => ({
        id: generatePurchaseId(),
        date: date,
        materialId: purchaseItem.materialId,
        materialName: purchaseItem.materialName,
        quantity: purchaseItem.quantity,
        unitPrice: purchaseItem.unitPrice,
        totalCost: Number(purchaseItem.totalCost.toFixed(2)),
        supplier: supplier,
        category: category,
        notes: notes,
        invoiceNumber: invoiceNumber,
        batchId: editingPurchaseId, // Behalte die ursprüngliche Batch-ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
    
    // Hinzufügen
    materialPurchases.push(...newPurchases);
    
    savePurchaseData();
    updateMaterialPurchaseDisplay();
    closePurchaseEditModal();
    
    showNotification('Einkauf wurde aktualisiert!', 'success');
    console.log(`✅ Einkauf aktualisiert: ${date}`);
}

/**
 * Schließt das Einkaufs-Bearbeitung Modal
 */
function closePurchaseEditModal() {
    hideModal('editPurchaseModal');
    editingPurchaseId = null;
    currentPurchaseItems = [];
}

/**
 * Löscht einen Einkauf (gesamte Batch)
 */
function deletePurchaseBatch(batchId) {
    const batchPurchases = materialPurchases.filter(p => p.batchId === batchId);
    if (batchPurchases.length === 0) {
        console.error(`❌ Einkaufs-Batch mit ID ${batchId} nicht gefunden`);
        return;
    }
    
    const firstPurchase = batchPurchases[0];
    const totalCost = batchPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    const purchaseInfo = `${firstPurchase.date} (${batchPurchases.length} Materialien, ${formatCurrency(totalCost)})`;
    
    if (confirm(`Einkauf "${purchaseInfo}" wirklich löschen?`)) {
        materialPurchases = materialPurchases.filter(p => p.batchId !== batchId);
        
        savePurchaseData();
        updateMaterialPurchaseDisplay();
        
        showNotification('Einkauf wurde gelöscht!', 'success');
        console.log(`🗑️ Einkaufs-Batch gelöscht: ${batchId}`);
    }
}

// ===================================================================
// STATISTICS & CALCULATIONS
// ===================================================================

/**
 * Berechnet Einkaufsstatistiken
 */
function calculatePurchaseStats(dateRange = null) {
    let filteredPurchases = materialPurchases;
    
    if (dateRange) {
        filteredPurchases = materialPurchases.filter(purchase => {
            const purchaseDate = new Date(purchase.date);
            return purchaseDate >= dateRange.start && purchaseDate <= dateRange.end;
        });
    }
    
    const totalPurchases = filteredPurchases.length;
    const uniqueBatches = [...new Set(filteredPurchases.map(p => p.batchId))].length;
    const totalCost = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
    const totalQuantity = filteredPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
    
    // Material-Statistiken
    const materialStats = {};
    filteredPurchases.forEach(purchase => {
        if (!materialStats[purchase.materialId]) {
            materialStats[purchase.materialId] = {
                materialName: purchase.materialName,
                quantity: 0,
                totalCost: 0,
                purchases: 0,
                averagePrice: 0
            };
        }
        materialStats[purchase.materialId].quantity += purchase.quantity;
        materialStats[purchase.materialId].totalCost += purchase.totalCost;
        materialStats[purchase.materialId].purchases++;
    });
    
    // Berechne Durchschnittspreise
    Object.values(materialStats).forEach(stat => {
        stat.averagePrice = stat.quantity > 0 ? stat.totalCost / stat.quantity : 0;
        stat.totalCost = Number(stat.totalCost.toFixed(2));
        stat.averagePrice = Number(stat.averagePrice.toFixed(2));
    });
    
    // Supplier-Statistiken
    const supplierStats = {};
    filteredPurchases.forEach(purchase => {
        if (!supplierStats[purchase.supplier]) {
            supplierStats[purchase.supplier] = {
                supplierName: suppliers[purchase.supplier]?.name || purchase.supplier,
                totalCost: 0,
                purchases: 0
            };
        }
        supplierStats[purchase.supplier].totalCost += purchase.totalCost;
        supplierStats[purchase.supplier].purchases++;
    });
    
    Object.values(supplierStats).forEach(stat => {
        stat.totalCost = Number(stat.totalCost.toFixed(2));
    });
    
    return {
        totalPurchases,
        uniqueBatches,
        totalCost: Number(totalCost.toFixed(2)),
        totalQuantity: Number(totalQuantity.toFixed(1)),
        materialStats,
        supplierStats,
        averagePurchaseValue: uniqueBatches > 0 ? Number((totalCost / uniqueBatches).toFixed(2)) : 0
    };
}

/**
 * Berechnet tägliche Einkaufsstatistiken
 */
function calculateDailyPurchaseStats(date) {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    return calculatePurchaseStats({
        start: new Date(dateStr),
        end: new Date(dateStr)
    });
}

/**
 * Berechnet wöchentliche Einkaufsstatistiken
 */
function calculateWeeklyPurchaseStats(weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return calculatePurchaseStats({
        start: weekStart,
        end: weekEnd
    });
}

/**
 * Berechnet Materialbestand basierend auf Einkäufen
 */
function calculateMaterialInventory() {
    const inventory = {};
    
    materialPurchases.forEach(purchase => {
        if (!inventory[purchase.materialId]) {
            inventory[purchase.materialId] = {
                materialName: purchase.materialName,
                totalPurchased: 0,
                totalCost: 0,
                averagePrice: 0,
                lastPurchase: null,
                purchaseCount: 0
            };
        }
        
        inventory[purchase.materialId].totalPurchased += purchase.quantity;
        inventory[purchase.materialId].totalCost += purchase.totalCost;
        inventory[purchase.materialId].purchaseCount++;
        
        // Aktualisiere letzten Einkauf
        if (!inventory[purchase.materialId].lastPurchase || 
            new Date(purchase.date) > new Date(inventory[purchase.materialId].lastPurchase)) {
            inventory[purchase.materialId].lastPurchase = purchase.date;
        }
    });
    
    // Berechne Durchschnittspreise
    Object.values(inventory).forEach(item => {
        item.averagePrice = item.totalPurchased > 0 ? item.totalCost / item.totalPurchased : 0;
        item.totalCost = Number(item.totalCost.toFixed(2));
        item.averagePrice = Number(item.averagePrice.toFixed(2));
        item.totalPurchased = Number(item.totalPurchased.toFixed(1));
    });
    
    return inventory;
}

// ===================================================================
// HELPERS
// ===================================================================

/**
 * Aktualisiert Lieferanten-Dropdowns
 */
function updateSupplierDropdowns() {
    const dropdowns = [
        document.getElementById('newPurchaseSupplier'),
        document.getElementById('editPurchaseSupplier')
    ].filter(dropdown => dropdown !== null);
    
    dropdowns.forEach(dropdown => {
        if (!dropdown) return;
        
        dropdown.innerHTML = '';
        Object.entries(suppliers).forEach(([supplierId, supplier]) => {
            const option = document.createElement('option');
            option.value = supplierId;
            option.textContent = supplier.name;
            if (supplierId === 'default') {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    });
}

/**
 * Aktualisiert Kategorie-Dropdowns
 */
function updateCategoryDropdowns() {
    const dropdowns = [
        document.getElementById('newPurchaseCategory'),
        document.getElementById('editPurchaseCategory')
    ].filter(dropdown => dropdown !== null);
    
    dropdowns.forEach(dropdown => {
        if (!dropdown) return;
        
        dropdown.innerHTML = '';
        Object.entries(purchaseCategories).forEach(([categoryId, category]) => {
            const option = document.createElement('option');
            option.value = categoryId;
            option.textContent = category.label;
            if (categoryId === 'regular') {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    });
}

/**
 * Gruppiert Einkäufe nach Batch-ID
 */
function groupPurchasesByBatch() {
    const batches = {};
    
    materialPurchases.forEach(purchase => {
        if (!batches[purchase.batchId]) {
            batches[purchase.batchId] = {
                batchId: purchase.batchId,
                date: purchase.date,
                supplier: purchase.supplier,
                category: purchase.category,
                notes: purchase.notes,
                invoiceNumber: purchase.invoiceNumber,
                items: [],
                totalCost: 0,
                totalQuantity: 0,
                createdAt: purchase.createdAt
            };
        }
        
        batches[purchase.batchId].items.push(purchase);
        batches[purchase.batchId].totalCost += purchase.totalCost;
        batches[purchase.batchId].totalQuantity += purchase.quantity;
    });
    
    // Runde Werte
    Object.values(batches).forEach(batch => {
        batch.totalCost = Number(batch.totalCost.toFixed(2));
        batch.totalQuantity = Number(batch.totalQuantity.toFixed(1));
    });
    
    return Object.values(batches).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ===================================================================
// DATA MANAGEMENT
// ===================================================================

/**
 * Speichert Einkaufsdaten (verwendet database.js saveData)
 */
function savePurchaseData() {
    console.log('💾 Speichere Einkaufsdaten über database.js...');
    
    if (typeof saveData === 'function') {
        saveData();
    } else {
        console.error('❌ saveData Funktion nicht verfügbar');
    }
}

/**
 * Hilfsfunktion für generateId (lokale Implementation)
 */
function generatePurchaseId() {
    return 'purchase_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generiert Batch-ID für zusammengehörige Einkäufe
 */
function generateBatchId() {
    return 'batch_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===================================================================
// DISPLAY UPDATE FUNCTIONS (Placeholder)
// ===================================================================

/**
 * Aktualisiert die Einkaufs-Anzeige (wird in ui.js implementiert)
 */
function updateMaterialPurchaseDisplay() {
    if (typeof updateMaterialPurchasesDisplayUI === 'function') {
        updateMaterialPurchasesDisplayUI();
    }
}

// ===================================================================
// INITIALIZATION
// ===================================================================

/**
 * Initialisiert das Einkaufs-System
 */
function initializePurchaseSystem() {
    console.log('🛒 Initialisiere Einkaufs-System...');
    
    // Warte bis database.js initialisiert ist
    if (typeof waitForInitialization === 'function') {
        waitForInitialization(() => {
            updateSupplierDropdowns();
            updateCategoryDropdowns();
            setDefaultPurchaseDate();
            console.log(`✅ Einkaufs-System initialisiert - ${materialPurchases.length} Einkäufe`);
        });
    } else {
        // Fallback ohne Warten
        updateSupplierDropdowns();
        updateCategoryDropdowns();
        setDefaultPurchaseDate();
        console.log(`✅ Einkaufs-System initialisiert - Fallback-Modus`);
    }
}

// Auto-Initialisierung (verzögert nach database.js)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Verzögerung um sicherzustellen, dass database.js zuerst lädt
        setTimeout(initializePurchaseSystem, 900);
    });
} else {
    setTimeout(initializePurchaseSystem, 900);
}

console.log('🛒 MaterialPurchases.js geladen');