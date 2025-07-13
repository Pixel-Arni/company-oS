// materialPurchases.js
// Verwaltung von Materialeinkäufen

// Datenstruktur: 
// [{ date, supplier, category, invoice, notes, materials: [{ name, qty, price }], total }]

window.materialPurchases = JSON.parse(localStorage.getItem('company-os-materialPurchases') || '[]');

// Materialeinkäufe-Liste rendern
window.renderMaterialPurchases = function() {
    const list = document.getElementById('material-purchases-list');
    if (!list) return;
    if (!window.materialPurchases || window.materialPurchases.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Einkäufe vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.materialPurchases.map((purchase, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${purchase.date} | Lieferant: ${purchase.supplier || '-'}</h3>
                <p>Kategorie: ${purchase.category || '-'}</p>
                <p>Rechnung: ${purchase.invoice || '-'}</p>
                <p>Materialien: ${purchase.materials?.map(m => `${m.name} (${m.qty}x @ $${m.price?.toFixed(2) ?? '0.00'})`).join(', ') || '-'}</p>
                <p>Gesamt: $${purchase.total?.toFixed(2) ?? '0.00'}</p>
                <p>Notizen: ${purchase.notes || '-'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editPurchase(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deletePurchase(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Neueinkauf hinzufügen
window.startNewPurchase = function() {
    const date = document.getElementById('newPurchaseDate').value;
    const supplier = document.getElementById('newPurchaseSupplier').value;
    const category = document.getElementById('newPurchaseCategory').value;
    const invoice = document.getElementById('newPurchaseInvoice').value.trim();
    const notes = document.getElementById('newPurchaseNotes').value.trim();
    const materials = getMaterialsFromSelectionList('materialSelectionList');
    if (!date || materials.length === 0) {
        showNotification('Datum und mindestens ein Material angeben!', 'error');
        return;
    }
    const total = materials.reduce((sum, m) => sum + (m.qty * m.price), 0);
    window.materialPurchases.push({ date, supplier, category, invoice, notes, materials, total });
    saveMaterialPurchases();
    renderMaterialPurchases();
    clearNewPurchaseFields();
    showNotification('Einkauf hinzugefügt!', 'success');
};

// Bearbeiten-Modal öffnen (kann erweitert werden)
window.editPurchase = function(idx) {
    const p = window.materialPurchases[idx];
    if (!p) return;
    document.getElementById('editPurchaseDate').value = p.date || '';
    document.getElementById('editPurchaseSupplier').value = p.supplier || '';
    document.getElementById('editPurchaseCategory').value = p.category || '';
    document.getElementById('editPurchaseInvoice').value = p.invoice || '';
    document.getElementById('editPurchaseNotes').value = p.notes || '';
    setMaterialsToSelectionList('editMaterialSelectionList', p.materials || []);
    window._editingPurchaseIndex = idx;
    showModal('editPurchaseModal');
};

// Einkauf speichern nach Bearbeitung
window.savePurchaseEdit = function() {
    const idx = window._editingPurchaseIndex;
    if (idx === undefined) return;
    const date = document.getElementById('editPurchaseDate').value;
    const supplier = document.getElementById('editPurchaseSupplier').value;
    const category = document.getElementById('editPurchaseCategory').value;
    const invoice = document.getElementById('editPurchaseInvoice').value.trim();
    const notes = document.getElementById('editPurchaseNotes').value.trim();
    const materials = getMaterialsFromSelectionList('editMaterialSelectionList');
    if (!date || materials.length === 0) {
        showNotification('Datum und mindestens ein Material angeben!', 'error');
        return;
    }
    const total = materials.reduce((sum, m) => sum + (m.qty * m.price), 0);
    window.materialPurchases[idx] = { date, supplier, category, invoice, notes, materials, total };
    saveMaterialPurchases();
    renderMaterialPurchases();
    hideModal('editPurchaseModal');
    showNotification('Einkauf gespeichert!', 'success');
    window._editingPurchaseIndex = undefined;
};

// Einkauf löschen
window.deletePurchase = function(idx) {
    if (!confirm('Wirklich löschen?')) return;
    window.materialPurchases.splice(idx, 1);
    saveMaterialPurchases();
    renderMaterialPurchases();
    showNotification('Einkauf gelöscht!', 'success');
};

// Helper: Materialien aus Auswahl-Liste holen (analog zu Items)
function getMaterialsFromSelectionList(listId) {
    const container = document.getElementById(listId);
    if (!container) return [];
    const rows = container.querySelectorAll('.material-assignment-row');
    return Array.from(rows).map(row => {
        const name = row.querySelector('.material-name')?.textContent?.trim() || '';
        const qty = parseFloat(row.querySelector('.quantity-input')?.value) || 1;
        const price = parseFloat(row.querySelector('.material-price')?.textContent?.replace('$','')) || 0;
        return { name, qty, price };
    }).filter(m => m.name && m.qty > 0);
}
function setMaterialsToSelectionList(listId, materials) {
    const container = document.getElementById(listId);
    if (!container) return;
    container.innerHTML = '';
    (materials || []).forEach(mat => {
        const row = document.createElement('div');
        row.className = 'material-assignment-row material-assignment';
        row.innerHTML = `
            <span class="material-name">${mat.name}</span>
            <input type="number" class="quantity-input" value="${mat.qty}" min="1">
            <span class="material-price">$${mat.price?.toFixed(2) ?? '0.00'}</span>
            <button class="remove-material" onclick="this.parentElement.remove()">✖</button>
        `;
        container.appendChild(row);
    });
}

// Felder nach neuem Einkauf zurücksetzen
function clearNewPurchaseFields() {
    document.getElementById('newPurchaseDate').value = '';
    document.getElementById('newPurchaseSupplier').value = 'default';
    document.getElementById('newPurchaseCategory').value = 'regular';
    document.getElementById('newPurchaseInvoice').value = '';
    document.getElementById('newPurchaseNotes').value = '';
    if (document.getElementById('materialSelectionList')) document.getElementById('materialSelectionList').innerHTML = '';
}

// Speichern in LocalStorage
function saveMaterialPurchases() {
    localStorage.setItem('company-os-materialPurchases', JSON.stringify(window.materialPurchases));
    if (typeof saveData === 'function') saveData();
}

// Beim Laden direkt Listen rendern
document.addEventListener('DOMContentLoaded', function() {
    renderMaterialPurchases();
});

console.log('✅ materialPurchases.js geladen');
