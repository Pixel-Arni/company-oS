// items.js
// Verwaltung der Items (verkaufbare Artikel) inkl. Crafting-Materialien

// Item-Datenstruktur: 
// [{ name: 'Billardtisch', sellPrice: 500, materials: [{ name: 'Holz', qty: 5 }, ...], craftTime: 60 }, ... ]

window.items = JSON.parse(localStorage.getItem('company-os-items') || '[]');

// Items-Liste rendern (siehe renderTemplates.js)
window.renderItemsList = function() {
    const list = document.getElementById('items-list');
    if (!list) return;
    if (!window.items || window.items.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Items vorhanden.</div>`;
        return;
    }
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
