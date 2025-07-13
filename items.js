// items.js
// Verwaltung der Items (verkaufbare Artikel) inkl. Crafting-Materialien und Berechnungen

// Item-Datenstruktur: 
// [{ name: 'Billardtisch', sellPrice: 500, materials: [{ name: 'Holz', qty: 5 }, ...], craftTime: 60 }, ... ]

window.items = JSON.parse(localStorage.getItem('company-os-items') || '[]');

// ===================================================================
// ITEM DISPLAY FUNCTIONS
// ===================================================================

// Items-Liste rendern
window.renderItemsList = function() {
    const list = document.getElementById('items-list');
    if (!list) return;
    
    if (!window.items || window.items.length === 0) {
        list.innerHTML = `<div class="empty-state">
            <h3>Noch keine Items vorhanden</h3>
            <p>Fügen Sie Ihr erstes verkaufbares Item hinzu!</p>
        </div>`;
        return;
    }
    
    list.innerHTML = window.items.map((item, idx) => {
        const materialCosts = getItemMaterialCost(item);
        const profit = getItemProfit(item);
        const margin = item.sellPrice > 0 ? ((profit / item.sellPrice) * 100) : 0;
        const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
        
        return `
            <div class="list-item">
                <div class="list-item-info">
                    <h3>${item.name}</h3>
                    <p><strong>Verkaufspreis:</strong> ${formatCurrency(item.sellPrice)}</p>
                    <p><strong>Materialkosten:</strong> ${formatCurrency(materialCosts)}</p>
                    <p class="${profitClass}"><strong>Gewinn:</strong> ${formatCurrency(profit)} (${margin.toFixed(1)}%)</p>
                    <p><strong>Materialien:</strong> ${getMaterialsDisplay(item.materials)}</p>
                    <p><strong>Verarbeitungsdauer:</strong> ${item.craftTime ? item.craftTime + ' Min.' : 'Nicht angegeben'}</p>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-success" onclick="editItem(${idx})" title="Item bearbeiten">✏️ Bearbeiten</button>
                    <button class="btn" onclick="duplicateItem(${idx})" title="Item duplizieren">📋 Duplizieren</button>
                    <button class="btn btn-danger" onclick="deleteItem(${idx})" title="Item löschen">🗑️ Löschen</button>
                </div>
            </div>
        `;
    }).join('');
};

// ===================================================================
// ITEM MANAGEMENT FUNCTIONS
// ===================================================================

// Neues Item hinzufügen
window.addItem = function() {
    const name = document.getElementById('newItemName').value.trim();
    const sellPrice = parseFloat(document.getElementById('newItemSellPrice').value);
    const materials = getItemMaterialsFromModal('itemMaterialList');
    const craftTime = parseInt(document.getElementById('newItemCraftTime')?.value) || 0;

    // Validierung
    if (!validateItemInput(name, sellPrice)) {
        return;
    }
    
    // Duplikat-Prüfung
    if (window.items.some(item => item.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Ein Item mit diesem Namen existiert bereits!', 'warning');
        return;
    }
    
    // Item erstellen
    const newItem = {
        name,
        sellPrice,
        materials: materials || [],
        craftTime,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    window.items.push(newItem);
    saveItems();
    renderItemsList();
    clearNewItemFields();
    hideModal('itemModal');
    showNotification(`Item "${name}" wurde hinzugefügt!`, 'success');
    
    // Calculator aktualisieren
    if (window.updateDisplay) window.updateDisplay('calculator');
};

// Item bearbeiten (öffnet Modal, füllt Felder)
window.editItem = function(idx) {
    const item = window.items[idx];
    if (!item) {
        showNotification('Item nicht gefunden!', 'error');
        return;
    }
    
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemSellPrice').value = item.sellPrice;
    if (document.getElementById('editItemCraftTime')) {
        document.getElementById('editItemCraftTime').value = item.craftTime || '';
    }
    
    setItemMaterialsToModal('editItemMaterialList', item.materials || []);
    window._editingItemIndex = idx;
    showModal('editItemModal');
};

// Item speichern (nach Bearbeitung)
window.saveItemEdit = function() {
    const idx = window._editingItemIndex;
    if (idx === undefined) {
        showNotification('Kein Item zum Bearbeiten ausgewählt!', 'error');
        return;
    }
    
    const name = document.getElementById('editItemName').value.trim();
    const sellPrice = parseFloat(document.getElementById('editItemSellPrice').value);
    const materials = getItemMaterialsFromModal('editItemMaterialList');
    const craftTime = parseInt(document.getElementById('editItemCraftTime')?.value) || 0;

    // Validierung
    if (!validateItemInput(name, sellPrice)) {
        return;
    }
    
    // Duplikat-Prüfung (außer für das aktuelle Item)
    if (window.items.some((item, i) => i !== idx && item.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Ein Item mit diesem Namen existiert bereits!', 'warning');
        return;
    }
    
    // Item aktualisieren
    const oldName = window.items[idx].name;
    window.items[idx] = {
        ...window.items[idx],
        name,
        sellPrice,
        materials: materials || [],
        craftTime,
        updatedAt: new Date().toISOString()
    };
    
    saveItems();
    renderItemsList();
    hideModal('editItemModal');
    showNotification(`Item "${oldName}" wurde aktualisiert!`, 'success');
    window._editingItemIndex = undefined;
    
    // Calculator aktualisieren
    if (window.updateDisplay) window.updateDisplay('calculator');
};

// Item löschen
window.deleteItem = function(idx) {
    const item = window.items[idx];
    if (!item) {
        showNotification('Item nicht gefunden!', 'error');
        return;
    }
    
    if (!confirm(`Item "${item.name}" wirklich löschen?`)) return;
    
    window.items.splice(idx, 1);
    saveItems();
    renderItemsList();
    showNotification(`Item "${item.name}" wurde gelöscht!`, 'success');
    
    // Calculator aktualisieren
    if (window.updateDisplay) window.updateDisplay('calculator');
};

// Item duplizieren
window.duplicateItem = function(idx) {
    const item = window.items[idx];
    if (!item) {
        showNotification('Item nicht gefunden!', 'error');
        return;
    }
    
    const duplicatedItem = {
        ...item,
        name: `${item.name} (Kopie)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    window.items.push(duplicatedItem);
    saveItems();
    renderItemsList();
    showNotification(`Item "${item.name}" wurde dupliziert!`, 'success');
    
    // Calculator aktualisieren
    if (window.updateDisplay) window.updateDisplay('calculator');
};

// ===================================================================
// MATERIAL ASSIGNMENT FUNCTIONS
// ===================================================================

// Materialien für das aktuelle Modal auslesen
function getItemMaterialsFromModal(listId) {
    const container = document.getElementById(listId);
    if (!container) return [];
    
    const rows = container.querySelectorAll('.material-assignment-row');
    const materials = [];
    
    rows.forEach(row => {
        const select = row.querySelector('.material-select');
        const qtyInput = row.querySelector('.quantity-input');
        
        if (select && qtyInput) {
            const materialName = select.value;
            const qty = parseFloat(qtyInput.value) || 0;
            
            if (materialName && qty > 0) {
                materials.push({
                    name: materialName,
                    qty: qty
                });
            }
        }
    });
    
    return materials;
}

// Materialien im Modal setzen
function setItemMaterialsToModal(listId, materials) {
    const container = document.getElementById(listId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!materials || materials.length === 0) {
        // Leere Zeile hinzufügen
        addMaterialRow(listId);
    } else {
        materials.forEach(mat => {
            addMaterialRow(listId, mat.name, mat.qty);
        });
    }
}

// Material-Zeile hinzufügen
function addMaterialRow(listId, materialName = '', quantity = 1) {
    const container = document.getElementById(listId);
    if (!container) return;
    
    const row = document.createElement('div');
    row.className = 'material-assignment-row';
    
    // Material-Auswahl
    const select = document.createElement('select');
    select.className = 'material-select input-field';
    select.innerHTML = '<option value="">Material wählen...</option>';
    
    if (window.materials) {
        window.materials.forEach(material => {
            const option = document.createElement('option');
            option.value = material.name;
            option.textContent = `${material.name} (${formatCurrency(material.price)})`;
            if (material.name === materialName) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }
    
    // Mengen-Input
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'quantity-input';
    qtyInput.value = quantity;
    qtyInput.min = '0.1';
    qtyInput.step = '0.1';
    qtyInput.placeholder = 'Menge';
    
    // Entfernen-Button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-material btn btn-danger';
    removeBtn.innerHTML = '✖';
    removeBtn.onclick = function() {
        row.remove();
        updateMaterialCostPreview(listId);
    };
    
    // Preis-Anzeige
    const priceSpan = document.createElement('span');
    priceSpan.className = 'material-price';
    updateMaterialPrice(select, qtyInput, priceSpan);
    
    // Event Listener für Preis-Update
    select.addEventListener('change', () => updateMaterialPrice(select, qtyInput, priceSpan));
    qtyInput.addEventListener('input', () => updateMaterialPrice(select, qtyInput, priceSpan));
    
    row.appendChild(select);
    row.appendChild(qtyInput);
    row.appendChild(priceSpan);
    row.appendChild(removeBtn);
    
    container.appendChild(row);
    updateMaterialCostPreview(listId);
}

// Materialpreis in der Zeile aktualisieren
function updateMaterialPrice(select, qtyInput, priceSpan) {
    const materialName = select.value;
    const qty = parseFloat(qtyInput.value) || 0;
    
    if (materialName && window.materials) {
        const material = window.materials.find(m => m.name === materialName);
        if (material) {
            const totalPrice = material.price * qty;
            priceSpan.textContent = formatCurrency(totalPrice);
            priceSpan.style.color = 'var(--success-color)';
        } else {
            priceSpan.textContent = 'Material nicht gefunden';
            priceSpan.style.color = 'var(--error-color)';
        }
    } else {
        priceSpan.textContent = formatCurrency(0);
        priceSpan.style.color = 'var(--text-muted)';
    }
}

// Materialkosten-Vorschau aktualisieren
function updateMaterialCostPreview(listId) {
    const materials = getItemMaterialsFromModal(listId);
    let totalCost = 0;
    
    materials.forEach(mat => {
        if (window.materials) {
            const material = window.materials.find(m => m.name === mat.name);
            if (material) {
                totalCost += material.price * mat.qty;
            }
        }
    });
    
    // Preview anzeigen (falls Container vorhanden)
    const previewId = listId.replace('List', 'Preview');
    const preview = document.getElementById(previewId);
    if (preview) {
        preview.innerHTML = `
            <strong>Geschätzte Materialkosten: ${formatCurrency(totalCost)}</strong>
        `;
    }
}

// Material zu Item (im Modal) hinzufügen
window.addMaterialToItem = function() {
    addMaterialRow('itemMaterialList');
};

// Material zu Item im Edit-Modal hinzufügen
window.addMaterialToEditItem = function() {
    addMaterialRow('editItemMaterialList');
};

// ===================================================================
// CALCULATION FUNCTIONS
// ===================================================================

// Item-Materialkosten berechnen
window.getItemMaterialCost = function(item) {
    if (!item || !item.materials || !window.materials) return 0;
    
    let sum = 0;
    item.materials.forEach(m => {
        const mat = window.materials.find(mat => mat.name === m.name);
        if (mat) {
            sum += (mat.price || 0) * (m.qty || 1);
        }
    });
    return sum;
};

// Item-Gewinn berechnen
window.getItemProfit = function(item) {
    return (item.sellPrice || 0) - window.getItemMaterialCost(item);
};

// Item-Gewinnmarge berechnen
window.getItemProfitMargin = function(item) {
    const sellPrice = item.sellPrice || 0;
    if (sellPrice === 0) return 0;
    
    const profit = window.getItemProfit(item);
    return (profit / sellPrice) * 100;
};

// ===================================================================
// STATISTICS FUNCTIONS
// ===================================================================

// Gesamtstatistiken berechnen
window.calculateItemStats = function() {
    if (!window.items || window.items.length === 0) {
        return {
            totalItems: 0,
            totalRevenue: 0,
            totalCosts: 0,
            totalProfit: 0,
            averageMargin: 0,
            profitableItems: 0,
            unprofitableItems: 0
        };
    }
    
    let totalRevenue = 0;
    let totalCosts = 0;
    let profitableItems = 0;
    let unprofitableItems = 0;
    
    window.items.forEach(item => {
        const sellPrice = item.sellPrice || 0;
        const materialCosts = window.getItemMaterialCost(item);
        const profit = sellPrice - materialCosts;
        
        totalRevenue += sellPrice;
        totalCosts += materialCosts;
        
        if (profit >= 0) {
            profitableItems++;
        } else {
            unprofitableItems++;
        }
    });
    
    const totalProfit = totalRevenue - totalCosts;
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    return {
        totalItems: window.items.length,
        totalRevenue: totalRevenue,
        totalCosts: totalCosts,
        totalProfit: totalProfit,
        averageMargin: averageMargin,
        profitableItems: profitableItems,
        unprofitableItems: unprofitableItems
    };
};

// Top profitable Items finden
window.getTopProfitableItems = function(limit = 5) {
    if (!window.items || window.items.length === 0) return [];
    
    return window.items
        .map(item => ({
            ...item,
            profit: window.getItemProfit(item),
            margin: window.getItemProfitMargin(item)
        }))
        .sort((a, b) => b.profit - a.profit)
        .slice(0, limit);
};

// Items mit geringer Marge finden
window.getLowMarginItems = function(threshold = 10) {
    if (!window.items || window.items.length === 0) return [];
    
    return window.items
        .map(item => ({
            ...item,
            profit: window.getItemProfit(item),
            margin: window.getItemProfitMargin(item)
        }))
        .filter(item => item.margin < threshold)
        .sort((a, b) => a.margin - b.margin);
};

// ===================================================================
// VALIDATION FUNCTIONS
// ===================================================================

function validateItemInput(name, sellPrice) {
    if (!name) {
        showNotification('Bitte geben Sie einen Item-Namen ein!', 'error');
        document.getElementById('newItemName')?.focus() || document.getElementById('editItemName')?.focus();
        return false;
    }
    
    if (name.length > 100) {
        showNotification('Item-Name ist zu lang (max. 100 Zeichen)!', 'warning');
        return false;
    }
    
    if (isNaN(sellPrice) || sellPrice < 0) {
        showNotification('Bitte geben Sie einen gültigen Verkaufspreis ein!', 'error');
        document.getElementById('newItemSellPrice')?.focus() || document.getElementById('editItemSellPrice')?.focus();
        return false;
    }
    
    if (sellPrice > 999999.99) {
        showNotification('Verkaufspreis ist zu hoch (max. 999.999,99€)!', 'warning');
        return false;
    }
    
    return true;
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

// Materialien-Anzeige formatieren
function getMaterialsDisplay(materials) {
    if (!materials || materials.length === 0) {
        return 'Keine Materialien';
    }
    
    return materials.map(m => `${m.name} (${m.qty}x)`).join(', ');
}

// Felder nach neuem Item zurücksetzen
function clearNewItemFields() {
    document.getElementById('newItemName').value = '';
    document.getElementById('newItemSellPrice').value = '';
    if (document.getElementById('newItemCraftTime')) {
        document.getElementById('newItemCraftTime').value = '';
    }
    
    // Material-Liste leeren
    const container = document.getElementById('itemMaterialList');
    if (container) {
        container.innerHTML = '';
        addMaterialRow('itemMaterialList'); // Eine leere Zeile hinzufügen
    }
}

// Currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(amount || 0);
}

// ===================================================================
// EXPORT/IMPORT FUNCTIONS
// ===================================================================

// Items als CSV exportieren
window.exportItemsToCSV = function() {
    if (!window.items || window.items.length === 0) {
        showNotification('Keine Items zum Exportieren vorhanden!', 'warning');
        return;
    }
    
    let csv = 'Name,Verkaufspreis,Materialkosten,Gewinn,Gewinnmarge,Materialien,Verarbeitungsdauer\n';
    
    window.items.forEach(item => {
        const materialCosts = window.getItemMaterialCost(item);
        const profit = window.getItemProfit(item);
        const margin = window.getItemProfitMargin(item);
        const materialsStr = getMaterialsDisplay(item.materials);
        
        csv += `"${item.name}",${item.sellPrice},${materialCosts.toFixed(2)},${profit.toFixed(2)},${margin.toFixed(1)}%,"${materialsStr}",${item.craftTime || 0}\n`;
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `items_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 200);
    
    showNotification('Items als CSV exportiert!', 'success');
};

// ===================================================================
// STORAGE FUNCTIONS
// ===================================================================

// Save-Funktion für LocalStorage
function saveItems() {
    try {
        localStorage.setItem('company-os-items', JSON.stringify(window.items));
        if (typeof window.saveData === 'function') {
            window.saveData();
        }
    } catch (error) {
        console.error('Fehler beim Speichern der Items:', error);
        showNotification('Fehler beim Speichern!', 'error');
    }
}

// ===================================================================
// INITIALIZATION
// ===================================================================

// Items beim Laden der Seite initialisieren
function initializeItems() {
    // Default-Items hinzufügen falls leer
    if (!window.items || window.items.length === 0) {
        window.items = [
            {
                name: 'Beispiel-Item',
                sellPrice: 100,
                materials: [],
                craftTime: 30,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        saveItems();
    }
    
    // Listen rendern
    renderItemsList();
    
    console.log(`✅ Items initialisiert - ${window.items.length} Items geladen`);
}

// Event Listeners beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeItems, 200); // Warten bis andere Module geladen sind
});

console.log('✅ items.js vollständig geladen');