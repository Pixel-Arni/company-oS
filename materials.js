// materials.js
// Verwaltung der Materialien (Rohstoffe) für das Unternehmen

// Datenstruktur für Materialien:
// [{ name: 'Stahl', price: 10.00 }, ... ]

window.materials = JSON.parse(localStorage.getItem('company-os-materials') || '[]');

// Material-Liste anzeigen (wird von renderTemplates.js benutzt)
window.renderMaterialsList = function() {
    const list = document.getElementById('materials-list');
    if (!list) return;
    if (!window.materials || window.materials.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Materialien vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.materials.map((mat, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${mat.name}</h3>
                <p>Preis pro Einheit: $${mat.price?.toFixed(2) ?? '0.00'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editMaterial(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteMaterial(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Neues Material hinzufügen
window.addMaterial = function() {
    const name = document.getElementById('newMaterialName').value.trim();
    const price = parseFloat(document.getElementById('newMaterialPrice').value);
    if (!name || isNaN(price)) {
        showNotification('Bitte Namen und Preis eingeben!', 'error');
        return;
    }
    window.materials.push({ name, price });
    saveMaterials();
    renderMaterialsList();
    document.getElementById('newMaterialName').value = '';
    document.getElementById('newMaterialPrice').value = '';
    hideModal('materialModal');
    showNotification('Material hinzugefügt!', 'success');
};

// Material bearbeiten (öffnet Modal und füllt Felder)
window.editMaterial = function(idx) {
    const mat = window.materials[idx];
    if (!mat) return;
    document.getElementById('editMaterialName').value = mat.name;
    document.getElementById('editMaterialPrice').value = mat.price;
    window._editingMaterialIndex = idx;
    showModal('editMaterialModal');
};

// Material speichern (nach Bearbeitung)
window.saveMaterialEdit = function() {
    const idx = window._editingMaterialIndex;
    const name = document.getElementById('editMaterialName').value.trim();
    const price = parseFloat(document.getElementById('editMaterialPrice').value);
    if (idx === undefined || !name || isNaN(price)) {
        showNotification('Ungültige Eingabe!', 'error');
        return;
    }
    window.materials[idx] = { name, price };
    saveMaterials();
    renderMaterialsList();
    hideModal('editMaterialModal');
    showNotification('Material gespeichert!', 'success');
    window._editingMaterialIndex = undefined;
};

// Material löschen
window.deleteMaterial = function(idx) {
    if (!confirm('Wirklich löschen?')) return;
    window.materials.splice(idx, 1);
    saveMaterials();
    renderMaterialsList();
    showNotification('Material gelöscht!', 'success');
};

// Speichern in LocalStorage
function saveMaterials() {
    localStorage.setItem('company-os-materials', JSON.stringify(window.materials));
    if (typeof saveData === 'function') saveData();
}

// Initial beim Laden: Render-Liste immer aktuell halten
document.addEventListener('DOMContentLoaded', function() {
    renderMaterialsList();
});

console.log('✅ materials.js geladen');
