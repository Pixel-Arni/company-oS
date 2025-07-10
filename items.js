// ===================================================================
// ITEMS.JS - Company OS Item & Material Management
// CRUD Operations, Calculations, Modal Management
// ===================================================================

// Global editing state
let editingItemId = null;
let editingMaterialId = null;

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

/**
 * Fügt ein neues Material hinzu
 */
function addMaterial() {
    console.log('🏭 Füge neues Material hinzu...');
    
    const nameField = document.getElementById('newMaterialName');
    const priceField = document.getElementById('newMaterialPrice');
    
    if (!nameField || !priceField) {
        console.error('❌ Material-Eingabefelder nicht gefunden');
        showNotification('Fehler: Eingabefelder nicht gefunden', 'error');
        return;
    }
    
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

/**
 * Aktualisiert die Menge eines Materials für das bearbeitete Item
 */
function updateMaterialQuantity(materialId, quantity) {
    if (!editingItemId) {
        console.error('❌ Keine Item-ID zum Bearbeiten gefunden');
        return;
    }
    
    const item = items.find(item => item.id == editingItemId); // Verwende == statt ===
    if (!item) {
        console.error(`❌ Item mit ID ${editingItemId} nicht gefunden`);
        return;
    }
    
    // Sicherstellen, dass materials Array existiert
    if (!item.materials) {
        item.materials = [];
    }
    
    const qty = parseFloat(quantity) || 0;
    const existingIndex = item.materials.findIndex(m => m.materialId == materialId);
    
    if (qty > 0) {
        // Material hinzufügen oder aktualisieren
        if (existingIndex >= 0) {
            item.materials[existingIndex].quantity = qty;
        } else {
            item.materials.push({ 
                materialId: materialId, 
                quantity: qty,
                assignedAt: new Date().toISOString()
            });
        }
    } else {
        // Material entfernen
        if (existingIndex >= 0) {
            item.materials.splice(existingIndex, 1);
        }
    }
    
    console.log(`🔄 Material-Menge aktualisiert: Material-ID ${materialId}, Menge: ${qty}`);
}

/**
 * Speichert die Item-Bearbeitung
 */
function saveItemEdit() {
    if (!editingItemId) {
        console.error('❌ Keine Item-ID zum Bearbeiten gefunden');
        return;
    }
    
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

/**
 * Schließt das Item-Bearbeitung Modal
 */
function closeEditModal() {
    hideModal('editItemModal');
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
    });
    
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    return {
        totalItems: items.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalCosts: Number(totalCosts.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        averageMargin: Number(averageMargin.toFixed(1))
    };
}

// ===================================================================
// UTILITY FUNKTIONEN
// ===================================================================

/**
 * Generiert eine eindeutige ID
 */
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Formatiert Zahlen als Währung (Dollar)
 */
function formatCurrency(amount, currency = '$') {
    return `${currency}${amount.toFixed(2)}`;
}

/**
 * Sucht Items nach Name
 */
function searchItems(searchTerm) {
    if (!searchTerm) return items;
    
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
        item.name.toLowerCase().includes(term)
    );
}

/**
 * Sucht Materialien nach Name
 */
function searchMaterials(searchTerm) {
    if (!searchTerm) return materials;
    
    const term = searchTerm.toLowerCase();
    return materials.filter(material => 
        material.name.toLowerCase().includes(term)
    );
}

/**
 * Sortiert Items nach verschiedenen Kriterien
 */
function sortItems(criteria = 'name', direction = 'asc') {
    const sortedItems = [...items];
    
    sortedItems.sort((a, b) => {
        let valueA, valueB;
        
        switch (criteria) {
            case 'name':
                valueA = a.name.toLowerCase();
                valueB = b.name.toLowerCase();
                break;
            case 'price':
                valueA = a.sellPrice;
                valueB = b.sellPrice;
                break;
            case 'profit':
                valueA = calculateCosts(a).profit;
                valueB = calculateCosts(b).profit;
                break;
            case 'margin':
                valueA = calculateCosts(a).profitMargin;
                valueB = calculateCosts(b).profitMargin;
                break;
            default:
                valueA = a.name.toLowerCase();
                valueB = b.name.toLowerCase();
        }
        
        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    return sortedItems;
}

/**
 * Exportiert Items als CSV
 */
function exportItemsCSV() {
    if (items.length === 0) {
        showNotification('Keine Items zum Exportieren vorhanden!', 'warning');
        return;
    }
    
    const headers = ['Name', 'Verkaufspreis', 'Materialkosten', 'Gewinn', 'Gewinnmarge'];
    const rows = items.map(item => {
        const calc = calculateCosts(item);
        return [
            item.name,
            item.sellPrice.toFixed(2),
            calc.materialCosts.toFixed(2),
            calc.profit.toFixed(2),
            calc.profitMargin.toFixed(1) + '%'
        ];
    });
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Company-OS-Items-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
    showNotification('Items als CSV exportiert!', 'success');
}

console.log('📦 Items.js geladen');