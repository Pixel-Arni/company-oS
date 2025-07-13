// items.js
// Verwaltung der Items (verkaufbare Artikel) inkl. Crafting-Materialien

// Item-Datenstruktur: 
// [{ name: 'Billardtisch', sellPrice: 500, materials: [{ name: 'Holz', qty: 5 }, ...], craftTime: 60 }, ... ]

<<<<<<< HEAD
window.items = JSON.parse(localStorage.getItem('company-os-items') || '[]');
=======
// Helper to create a material selection row
function createMaterialRow(listId, materialId = '', quantity = '') {
    const list = document.getElementById(listId);
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'material-row';

    const select = document.createElement('select');
    select.className = 'material-select';
    select.innerHTML = '<option value="">Material wählen...</option>';
    materials.forEach(mat => {
        const option = document.createElement('option');
        option.value = mat.id;
        option.textContent = `${mat.name} (${formatCurrency(mat.price)})`;
        select.appendChild(option);
    });
    select.value = materialId;

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'quantity-input';
    qtyInput.min = '0';
    qtyInput.step = '0.01';
    qtyInput.value = quantity || '';

    row.appendChild(select);
    row.appendChild(qtyInput);

    list.appendChild(row);
}

function getMaterialRowsData(listId) {
    const list = document.getElementById(listId);
    if (!list) return [];

    const rows = list.querySelectorAll('.material-row');
    const data = [];
    rows.forEach(row => {
        const select = row.querySelector('select');
        const input = row.querySelector('input');
        const materialId = select ? select.value : '';
        const qty = parseFloat(input ? input.value : '');
        if (materialId && !isNaN(qty) && qty > 0) {
            data.push({
                materialId: materialId,
                quantity: qty,
                assignedAt: new Date().toISOString()
            });
        }
    });
    return data;
}

function addMaterialToItem() {
    createMaterialRow('itemMaterialList');
}

function addMaterialToEditItem() {
    createMaterialRow('editItemMaterialList');
}

// ===================================================================
// MATERIAL MANAGEMENT
// ===================================================================
>>>>>>> a781f5447017221b870a5042af495d9502e33727

// Items-Liste rendern (siehe renderTemplates.js)
window.renderItemsList = function() {
    const list = document.getElementById('items-list');
    if (!list) return;
    if (!window.items || window.items.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Items vorhanden.</div>`;
        return;
    }
<<<<<<< HEAD
    list.innerHTML = window.items.map((item, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${item.name}</h3>
                <p>Verkaufspreis: $${item.sellPrice?.toFixed(2) ?? '0.00'}</p>
                <p>Materialien: ${item.materials && item.materials.length ? item.materials.map(m => `${m.name} (${m.qty}x)`).join(', ') : '-'}</p>
                <p>Verarbeitungsdauer: ${item.craftTime ? item.craftTime + ' Min.' : 'n/a'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editItem(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteItem(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};
=======
    
    const name = nameField.value.trim();
    const price = parseFloat(priceField.value);
    
    // Validierung
    if (!validateMaterialInput(name, price)) {
        return;
    }
    
    // Duplikat-Prüfung
    if (materials.some(material => material.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Ein Material mit diesem Namen existiert bereits!', 'warning');
        return;
    }
    
    // Material erstellen
    const material = {
        id: generateId(),
        name: name,
        price: price,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Hinzufügen und speichern
    materials.push(material);
    saveData();
    updateDisplay();
    
    // Eingabefelder leeren
    nameField.value = '';
    priceField.value = '';
    nameField.focus();
    
    showNotification(`Material "${name}" wurde hinzugefügt!`, 'success');
    console.log(`✅ Material hinzugefügt: ${name} (${formatCurrency(price)})`);
}

/**
 * Validiert Material-Eingaben
 */
function validateMaterialInput(name, price) {
    if (!name) {
        showNotification('Bitte geben Sie einen Material-Namen ein!', 'warning');
        document.getElementById('newMaterialName').focus();
        return false;
    }
    
    if (name.length > 100) {
        showNotification('Material-Name ist zu lang (max. 100 Zeichen)!', 'warning');
        return false;
    }
    
    if (isNaN(price) || price < 0) {
        showNotification('Bitte geben Sie einen gültigen Preis ein!', 'warning');
        document.getElementById('newMaterialPrice').focus();
        return false;
    }
    
    if (price > 999999.99) {
        showNotification('Preis ist zu hoch (max. 999.999,99$)!', 'warning');
        return false;
    }
    
    return true;
}

/**
 * Öffnet das Material-Bearbeitung Modal
 */
function editMaterial(id) {
    const material = materials.find(mat => mat.id == id); // Verwende == statt === für flexible Vergleiche
    if (!material) {
        console.error(`❌ Material mit ID ${id} nicht gefunden`);
        showNotification('Material nicht gefunden!', 'error');
        return;
    }
    
    console.log(`✏️ Bearbeite Material: ${material.name}`);
    
    editingMaterialId = id;
    
    // Modal-Felder füllen
    const nameField = document.getElementById('editMaterialName');
    const priceField = document.getElementById('editMaterialPrice');
    
    if (nameField && priceField) {
        nameField.value = material.name;
        priceField.value = material.price;
        nameField.focus();
    }
    
    showModal('editMaterialModal');
}

/**
 * Speichert die Material-Bearbeitung
 */
function saveMaterialEdit() {
    if (!editingMaterialId) {
        console.error('❌ Keine Material-ID zum Bearbeiten gefunden');
        return;
    }
    
    const material = materials.find(mat => mat.id == editingMaterialId); // Verwende == statt ===
    if (!material) {
        console.error(`❌ Material mit ID ${editingMaterialId} nicht gefunden`);
        showNotification('Material nicht gefunden!', 'error');
        return;
    }
    
    const nameField = document.getElementById('editMaterialName');
    const priceField = document.getElementById('editMaterialPrice');
    
    if (!nameField || !priceField) {
        console.error('❌ Bearbeitungsfelder nicht gefunden');
        return;
    }
    
    const name = nameField.value.trim();
    const price = parseFloat(priceField.value);
    
    // Validierung
    if (!validateMaterialInput(name, price)) {
        return;
    }
    
    // Duplikat-Prüfung (außer für das aktuelle Material)
    if (materials.some(mat => mat.id != editingMaterialId && mat.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Ein Material mit diesem Namen existiert bereits!', 'warning');
        return;
    }
    
    // Material aktualisieren
    const oldName = material.name;
    material.name = name;
    material.price = price;
    material.updatedAt = new Date().toISOString();
    
    saveData();
    updateDisplay();
    closeMaterialEditModal();
    
    showNotification(`Material "${oldName}" wurde aktualisiert!`, 'success');
    console.log(`✅ Material aktualisiert: ${name} (${formatCurrency(price)})`);
}

/**
 * Schließt das Material-Bearbeitung Modal
 */
function closeMaterialEditModal() {
    hideModal('editMaterialModal');
    editingMaterialId = null;
    
    // Felder leeren
    const nameField = document.getElementById('editMaterialName');
    const priceField = document.getElementById('editMaterialPrice');
    if (nameField) nameField.value = '';
    if (priceField) priceField.value = '';
}

/**
 * Löscht ein Material
 */
function deleteMaterial(id) {
    const material = materials.find(mat => mat.id == id); // Verwende == statt ===
    if (!material) {
        console.error(`❌ Material mit ID ${id} nicht gefunden`);
        return;
    }
    
    // Prüfen ob Material in Items verwendet wird
    const usedInItems = items.filter(item => 
        item.materials && item.materials.some(mat => mat.materialId == id)
    );
    
    let confirmMessage = `Material "${material.name}" wirklich löschen?`;
    if (usedInItems.length > 0) {
        confirmMessage += `\n\nWarnung: Das Material wird in ${usedInItems.length} Item(s) verwendet und wird dort entfernt.`;
    }
    
    if (confirm(confirmMessage)) {
        // Material aus allen Items entfernen
        items.forEach(item => {
            if (item.materials) {
                item.materials = item.materials.filter(mat => mat.materialId != id);
                item.updatedAt = new Date().toISOString();
            }
        });
        
        // Material löschen
        materials = materials.filter(mat => mat.id != id);
        
        saveData();
        updateDisplay();
        
        showNotification(`Material "${material.name}" wurde gelöscht!`, 'success');
        console.log(`🗑️ Material gelöscht: ${material.name}`);
    }
}

// ===================================================================
// ITEM MANAGEMENT
// ===================================================================

/**
 * Fügt ein neues Item hinzu
 */
function addItem() {
    console.log('📦 Füge neues Item hinzu...');
    
    const nameField = document.getElementById('newItemName');
    const priceField = document.getElementById('newItemSellPrice');
    
    if (!nameField || !priceField) {
        console.error('❌ Item-Eingabefelder nicht gefunden');
        showNotification('Fehler: Eingabefelder nicht gefunden', 'error');
        return;
    }
    
    const name = nameField.value.trim();
    const price = parseFloat(priceField.value);
    
    // Validierung
    if (!validateItemInput(name, price)) {
        return;
    }
    
    // Duplikat-Prüfung
    if (items.some(item => item.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Ein Item mit diesem Namen existiert bereits!', 'warning');
        return;
    }
    
    // Item erstellen
    const item = {
        id: generateId(),
        name: name,
        sellPrice: price,
        materials: getMaterialRowsData('itemMaterialList'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Hinzufügen und speichern
    items.push(item);
    saveData();
    updateDisplay();

    // Eingabefelder leeren
    nameField.value = '';
    priceField.value = '';
    const matList = document.getElementById('itemMaterialList');
    if (matList) matList.innerHTML = '';
    nameField.focus();
    
    showNotification(`Item "${name}" wurde hinzugefügt!`, 'success');
    console.log(`✅ Item hinzugefügt: ${name} (${formatCurrency(price)})`);
}

/**
 * Validiert Item-Eingaben
 */
function validateItemInput(name, price) {
    if (!name) {
        showNotification('Bitte geben Sie einen Item-Namen ein!', 'warning');
        document.getElementById('newItemName').focus();
        return false;
    }
    
    if (name.length > 100) {
        showNotification('Item-Name ist zu lang (max. 100 Zeichen)!', 'warning');
        return false;
    }
    
    if (isNaN(price) || price < 0) {
        showNotification('Bitte geben Sie einen gültigen Verkaufspreis ein!', 'warning');
        document.getElementById('newItemSellPrice').focus();
        return false;
    }
    
    if (price > 999999.99) {
        showNotification('Verkaufspreis ist zu hoch (max. 999.999,99$)!', 'warning');
        return false;
    }
    
    return true;
}

/**
 * Öffnet das Item-Bearbeitung Modal
 */
function editItem(id) {
    const item = items.find(item => item.id == id); // Verwende == statt ===
    if (!item) {
        console.error(`❌ Item mit ID ${id} nicht gefunden`);
        showNotification('Item nicht gefunden!', 'error');
        return;
    }
    
    console.log(`✏️ Bearbeite Item: ${item.name}`);
    
    editingItemId = id;
    
    // Modal-Felder füllen
    const nameField = document.getElementById('editItemName');
    const priceField = document.getElementById('editItemSellPrice');
    
    if (nameField && priceField) {
        nameField.value = item.name;
        priceField.value = item.sellPrice;
        nameField.focus();
    }
    
    // Material-Zuweisungen aktualisieren
    updateMaterialAssignments(item);
    
    showModal('editItemModal');
}

/**
 * Aktualisiert die Material-Zuweisungen im Modal
 */
function updateMaterialAssignments(item) {
    const container = document.getElementById('editItemMaterialList');
    if (!container) {
        console.error('❌ Material-Assignments Container nicht gefunden');
        return;
    }

    container.innerHTML = '';

    if (!item.materials || item.materials.length === 0) {
        createMaterialRow('editItemMaterialList');
    } else {
        item.materials.forEach(mat => {
            createMaterialRow('editItemMaterialList', mat.materialId, mat.quantity);
        });
    }
}
>>>>>>> a781f5447017221b870a5042af495d9502e33727

// Neues Item hinzufügen
window.addItem = function() {
    const name = document.getElementById('newItemName').value.trim();
    const sellPrice = parseFloat(document.getElementById('newItemSellPrice').value);
    const materials = getItemMaterialsFromModal('itemMaterialList');
    const craftTime = parseInt(document.getElementById('newItemCraftTime')?.value) || 0;

    if (!name || isNaN(sellPrice)) {
        showNotification('Bitte Namen und Verkaufspreis angeben!', 'error');
        return;
    }
<<<<<<< HEAD
    window.items.push({ name, sellPrice, materials, craftTime });
    saveItems();
    renderItemsList();
    document.getElementById('newItemName').value = '';
    document.getElementById('newItemSellPrice').value = '';
    // Reset Materialauswahl
    setItemMaterialsToModal('itemMaterialList', []);
    if (document.getElementById('newItemCraftTime')) document.getElementById('newItemCraftTime').value = '';
    hideModal('itemModal');
    showNotification('Item hinzugefügt!', 'success');
};
=======
    
    const item = items.find(item => item.id == editingItemId); // Verwende == statt ===
    if (!item) {
        console.error(`❌ Item mit ID ${editingItemId} nicht gefunden`);
        showNotification('Item nicht gefunden!', 'error');
        return;
    }
    
    const nameField = document.getElementById('editItemName');
    const priceField = document.getElementById('editItemSellPrice');
    
    if (!nameField || !priceField) {
        console.error('❌ Bearbeitungsfelder nicht gefunden');
        return;
    }
    
    const name = nameField.value.trim();
    const price = parseFloat(priceField.value);
    
    // Validierung
    if (!validateItemInput(name, price)) {
        return;
    }
    
    // Duplikat-Prüfung (außer für das aktuelle Item)
    if (items.some(itm => itm.id != editingItemId && itm.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Ein Item mit diesem Namen existiert bereits!', 'warning');
        return;
    }
    
    // Item aktualisieren
    const oldName = item.name;
    item.name = name;
    item.sellPrice = price;
    item.materials = getMaterialRowsData('editItemMaterialList');
    item.updatedAt = new Date().toISOString();
    
    saveData();
    updateDisplay();
    closeEditModal();
    
    showNotification(`Item "${oldName}" wurde aktualisiert!`, 'success');
    console.log(`✅ Item aktualisiert: ${name} (${formatCurrency(price)})`);
}
>>>>>>> a781f5447017221b870a5042af495d9502e33727

// Item bearbeiten (öffnet Modal, füllt Felder)
window.editItem = function(idx) {
    const item = window.items[idx];
    if (!item) return;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemSellPrice').value = item.sellPrice;
    setItemMaterialsToModal('editItemMaterialList', item.materials || []);
    if (document.getElementById('editItemCraftTime')) document.getElementById('editItemCraftTime').value = item.craftTime || '';
    window._editingItemIndex = idx;
    showModal('editItemModal');
};

// Item speichern (nach Bearbeitung)
window.saveItemEdit = function() {
    const idx = window._editingItemIndex;
    const name = document.getElementById('editItemName').value.trim();
    const sellPrice = parseFloat(document.getElementById('editItemSellPrice').value);
    const materials = getItemMaterialsFromModal('editItemMaterialList');
    const craftTime = parseInt(document.getElementById('editItemCraftTime')?.value) || 0;

    if (idx === undefined || !name || isNaN(sellPrice)) {
        showNotification('Ungültige Eingabe!', 'error');
        return;
    }
    window.items[idx] = { name, sellPrice, materials, craftTime };
    saveItems();
    renderItemsList();
    hideModal('editItemModal');
<<<<<<< HEAD
    showNotification('Item gespeichert!', 'success');
    window._editingItemIndex = undefined;
};

// Item löschen
window.deleteItem = function(idx) {
    if (!confirm('Wirklich löschen?')) return;
    window.items.splice(idx, 1);
    saveItems();
    renderItemsList();
    showNotification('Item gelöscht!', 'success');
};

// Materialien für das aktuelle Modal auslesen (Hilfsfunktion)
function getItemMaterialsFromModal(listId) {
    const container = document.getElementById(listId);
    if (!container) return [];
    const rows = container.querySelectorAll('.material-assignment-row');
    return Array.from(rows).map(row => {
        const name = row.querySelector('.material-name')?.textContent?.trim() || '';
        const qty = parseFloat(row.querySelector('.quantity-input')?.value) || 1;
        return { name, qty };
    }).filter(m => m.name && m.qty > 0);
}

// Materialien im Modal setzen (Hilfsfunktion)
function setItemMaterialsToModal(listId, materials) {
    const container = document.getElementById(listId);
    if (!container) return;
    container.innerHTML = '';
    (materials || []).forEach(mat => {
        const row = document.createElement('div');
        row.className = 'material-assignment-row material-assignment';
        row.innerHTML = `
            <span class="material-name">${mat.name}</span>
            <input type="number" class="quantity-input" value="${mat.qty}" min="1">
            <button class="remove-material" onclick="this.parentElement.remove()">✖</button>
        `;
        container.appendChild(row);
=======
    editingItemId = null;
    
    // Felder leeren
    const nameField = document.getElementById('editItemName');
    const priceField = document.getElementById('editItemSellPrice');
    if (nameField) nameField.value = '';
    if (priceField) priceField.value = '';
    
    // Material-Assignments leeren
    const container = document.getElementById('editItemMaterialList');
    if (container) container.innerHTML = '';
}

function closeItemEditModal() {
    closeEditModal();
}

/**
 * Löscht ein Item
 */
function deleteItem(id) {
    const item = items.find(item => item.id == id); // Verwende == statt ===
    if (!item) {
        console.error(`❌ Item mit ID ${id} nicht gefunden`);
        return;
    }
    
    if (confirm(`Item "${item.name}" wirklich löschen?`)) {
        items = items.filter(item => item.id != id);
        
        saveData();
        updateDisplay();
        
        showNotification(`Item "${item.name}" wurde gelöscht!`, 'success');
        console.log(`🗑️ Item gelöscht: ${item.name}`);
    }
}

// ===================================================================
// BERECHNUNGEN
// ===================================================================

/**
 * Berechnet Kosten und Gewinn für ein Item
 */
function calculateCosts(item) {
    if (!item || !Array.isArray(item.materials)) {
        return {
            materialCosts: 0,
            profit: item ? item.sellPrice : 0,
            profitMargin: 0
        };
    }
    
    const materialCosts = item.materials.reduce((total, itemMaterial) => {
        const material = materials.find(m => m.id == itemMaterial.materialId); // Verwende == statt ===
        if (material && itemMaterial.quantity > 0) {
            return total + (material.price * itemMaterial.quantity);
        }
        return total;
    }, 0);
    
    const profit = item.sellPrice - materialCosts;
    const profitMargin = item.sellPrice > 0 ? (profit / item.sellPrice) * 100 : 0;
    
    return { 
        materialCosts: Number(materialCosts.toFixed(2)), 
        profit: Number(profit.toFixed(2)), 
        profitMargin: Number(profitMargin.toFixed(1))
    };
}

/**
 * Berechnet Gesamtstatistiken
 */
function calculateOverallStats() {
    if (items.length === 0) {
        return {
            totalItems: 0,
            totalRevenue: 0,
            totalCosts: 0,
            totalProfit: 0,
            averageMargin: 0
        };
    }
    
    let totalRevenue = 0;
    let totalCosts = 0;
    let totalProfit = 0;
    
    items.forEach(item => {
        const calc = calculateCosts(item);
        totalRevenue += item.sellPrice;
        totalCosts += calc.materialCosts;
        totalProfit += calc.profit;
>>>>>>> a781f5447017221b870a5042af495d9502e33727
    });
}

// Material zu Item (im Modal) hinzufügen
window.addMaterialToItem = function() {
    const select = document.createElement('select');
    select.className = 'input-field';
    (window.materials || []).forEach(m => {
        const option = document.createElement('option');
        option.value = m.name;
        option.textContent = m.name;
        select.appendChild(option);
    });
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'quantity-input';
    qtyInput.value = '1';
    qtyInput.min = 1;
    const row = document.createElement('div');
    row.className = 'material-assignment-row material-assignment';
    row.innerHTML = `
        <span class="material-name">${select.value || (window.materials?.[0]?.name || '')}</span>
    `;
    row.appendChild(qtyInput);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-material';
    removeBtn.innerText = '✖';
    removeBtn.onclick = function() { row.remove(); };
    row.appendChild(removeBtn);
    document.getElementById('itemMaterialList').appendChild(row);
};

// Material zu Item im Edit-Modal hinzufügen
window.addMaterialToEditItem = function() {
    const select = document.createElement('select');
    select.className = 'input-field';
    (window.materials || []).forEach(m => {
        const option = document.createElement('option');
        option.value = m.name;
        option.textContent = m.name;
        select.appendChild(option);
    });
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'quantity-input';
    qtyInput.value = '1';
    qtyInput.min = 1;
    const row = document.createElement('div');
    row.className = 'material-assignment-row material-assignment';
    row.innerHTML = `
        <span class="material-name">${select.value || (window.materials?.[0]?.name || '')}</span>
    `;
    row.appendChild(qtyInput);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-material';
    removeBtn.innerText = '✖';
    removeBtn.onclick = function() { row.remove(); };
    row.appendChild(removeBtn);
    document.getElementById('editItemMaterialList').appendChild(row);
};

// Save-Funktion für LocalStorage
function saveItems() {
    localStorage.setItem('company-os-items', JSON.stringify(window.items));
    if (typeof saveData === 'function') saveData();
}

// Beim Laden direkt Listen füllen
document.addEventListener('DOMContentLoaded', function() {
    renderItemsList();
});

// Optional: Weitere Utility-Funktionen für Preis/Marge
window.getItemMaterialCost = function(item) {
    if (!item || !item.materials || !window.materials) return 0;
    let sum = 0;
    item.materials.forEach(m => {
        const mat = window.materials.find(mat => mat.name === m.name);
        if (mat) sum += (mat.price || 0) * (m.qty || 1);
    });
    return sum;
};
window.getItemProfit = function(item) {
    return (item.sellPrice || 0) - window.getItemMaterialCost(item);
};

console.log('✅ items.js geladen');
