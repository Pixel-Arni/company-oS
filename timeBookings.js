// timeBookings.js
// Zeitbuchungen & Angebote für Company OS

// Datenstruktur für Buchungen: 
// [{ customerName, isWalkIn, walkInName, date, startTime, activity, duration, participants, notes, paid, completed }]

// Datenstruktur für Aktivitäten/Angebote: 
// [{ name, category, icon, color, halfHourRate, fullHourRate, maxCapacity, description, equipment, rules, active }]

window.timeBookings = JSON.parse(localStorage.getItem('company-os-timeBookings') || '[]');
window.activities = JSON.parse(localStorage.getItem('company-os-activities') || '[]');

// Buchungen anzeigen
window.renderTimeBookings = function() {
    const list = document.getElementById('time-bookings-list');
    if (!list) return;
    if (!window.timeBookings || window.timeBookings.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Buchungen vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.timeBookings.map((b, idx) => {
        const activity = window.activities.find(a => a.name === b.activity);
        const icon = activity?.icon || '🎱';
        const paid = b.paid ? '✅ bezahlt' : '❌ unbezahlt';
        const completed = b.completed ? '✔️ erledigt' : '';
        return `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${icon} ${b.activity} (${b.date} ${b.startTime})</h3>
                <p>Kunde: ${b.isWalkIn ? (b.walkInName || 'Laufkundschaft') : (b.customerName || '-')}</p>
                <p>Dauer: ${b.duration} min. | Teilnehmer: ${b.participants}</p>
                <p>Status: ${paid} ${completed}</p>
                <p>Notizen: ${b.notes ?? '-'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editTimeBooking(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteTimeBooking(${idx})">🗑️ Löschen</button>
            </div>
        </div>
        `;
    }).join('');
};

// Angebote/Activities für die Auswahl
window.renderActivitiesManagement = function() {
    const list = document.getElementById('activities-management-content');
    if (!list) return;
    if (!window.activities || window.activities.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Angebote vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.activities.map((a, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3><span style="color:${a.color}">${a.icon || '🎯'}</span> ${a.name}</h3>
                <p>Kategorie: ${a.category || '-'}</p>
                <p>30 Min: $${a.halfHourRate?.toFixed(2) ?? '0.00'} | 60 Min: $${a.fullHourRate?.toFixed(2) ?? '0.00'}</p>
                <p>Max. Teilnehmer: ${a.maxCapacity ?? '-'}</p>
                <p>Status: ${(a.active === false) ? 'Inaktiv' : 'Aktiv'}</p>
                <p>Ausrüstung: ${a.equipment || '-'}</p>
                <p>Beschreibung: ${a.description || '-'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editActivity(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteActivity(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Neue Buchung hinzufügen
window.addTimeBooking = function() {
    const customerSelect = document.getElementById('newBookingCustomer');
    const isWalkIn = !customerSelect.value;
    const walkInName = document.getElementById('newBookingWalkInName').value.trim();
    const customerName = isWalkIn ? '' : customerSelect.value;
    const date = document.getElementById('newBookingDate').value;
    const startTime = document.getElementById('newBookingStartTime').value;
    const activity = document.getElementById('newBookingActivity').value;
    const duration = parseInt(document.getElementById('newBookingDuration').value);
    const participants = parseInt(document.getElementById('newBookingParticipants').value) || 1;
    const notes = document.getElementById('newBookingNotes').value.trim();
    if (!date || !startTime || !activity || !duration) {
        showNotification('Alle Pflichtfelder ausfüllen!', 'error');
        return;
    }
    window.timeBookings.push({
        customerName, isWalkIn, walkInName, date, startTime, activity, duration, participants, notes, paid: false, completed: false
    });
    saveTimeBookings();
    renderTimeBookings();
    clearNewBookingFields();
    showNotification('Buchung hinzugefügt!', 'success');
};

// Bearbeiten einer Buchung
window.editTimeBooking = function(idx) {
    const b = window.timeBookings[idx];
    if (!b) return;
    document.getElementById('editBookingCustomer').value = b.customerName || '';
    document.getElementById('editBookingWalkInName').value = b.walkInName || '';
    document.getElementById('editBookingDate').value = b.date || '';
    document.getElementById('editBookingStartTime').value = b.startTime || '';
    document.getElementById('editBookingActivity').value = b.activity || '';
    document.getElementById('editBookingDuration').value = b.duration || '';
    document.getElementById('editBookingParticipants').value = b.participants || 1;
    document.getElementById('editBookingPaid').checked = b.paid || false;
    document.getElementById('editBookingCompleted').checked = b.completed || false;
    document.getElementById('editBookingNotes').value = b.notes || '';
    window._editingBookingIndex = idx;
    showModal('editTimeBookingModal');
};

// Speichern nach Bearbeitung
window.saveTimeBookingEdit = function() {
    const idx = window._editingBookingIndex;
    if (idx === undefined) return;
    const customerName = document.getElementById('editBookingCustomer').value;
    const walkInName = document.getElementById('editBookingWalkInName').value.trim();
    const isWalkIn = !customerName;
    const date = document.getElementById('editBookingDate').value;
    const startTime = document.getElementById('editBookingStartTime').value;
    const activity = document.getElementById('editBookingActivity').value;
    const duration = parseInt(document.getElementById('editBookingDuration').value);
    const participants = parseInt(document.getElementById('editBookingParticipants').value) || 1;
    const paid = document.getElementById('editBookingPaid').checked;
    const completed = document.getElementById('editBookingCompleted').checked;
    const notes = document.getElementById('editBookingNotes').value.trim();
    if (!date || !startTime || !activity || !duration) {
        showNotification('Alle Pflichtfelder ausfüllen!', 'error');
        return;
    }
    window.timeBookings[idx] = {
        customerName, isWalkIn, walkInName, date, startTime, activity, duration, participants, paid, completed, notes
    };
    saveTimeBookings();
    renderTimeBookings();
    hideModal('editTimeBookingModal');
    showNotification('Buchung gespeichert!', 'success');
    window._editingBookingIndex = undefined;
};

// Buchung löschen
window.deleteTimeBooking = function(idx) {
    if (!confirm('Wirklich löschen?')) return;
    window.timeBookings.splice(idx, 1);
    saveTimeBookings();
    renderTimeBookings();
    showNotification('Buchung gelöscht!', 'success');
};

// Angebote/Activities: Hinzufügen
window.addActivity = function() {
    const name = document.getElementById('newActivityName').value.trim();
    const category = document.getElementById('newActivityCategory').value;
    const icon = document.getElementById('newActivityIcon').value || '🎯';
    const color = document.getElementById('newActivityColor').value || '#3498db';
    const halfHourRate = parseFloat(document.getElementById('newActivityHalfHourRate').value) || 0;
    const fullHourRate = parseFloat(document.getElementById('newActivityFullHourRate').value) || 0;
    const maxCapacity = parseInt(document.getElementById('newActivityMaxCapacity').value) || 1;
    const description = document.getElementById('newActivityDescription').value.trim();
    const equipment = document.getElementById('newActivityEquipment').value.trim();
    const rules = document.getElementById('newActivityRules').value.trim();
    if (!name) {
        showNotification('Name der Aktivität fehlt!', 'error');
        return;
    }
    window.activities.push({
        name, category, icon, color, halfHourRate, fullHourRate, maxCapacity, description, equipment, rules, active: true
    });
    saveActivities();
    renderActivitiesManagement();
    clearNewActivityFields();
    hideModal('activityModal');
    showNotification('Aktivität hinzugefügt!', 'success');
};

// Angebote bearbeiten
window.editActivity = function(idx) {
    const a = window.activities[idx];
    if (!a) return;
    document.getElementById('editActivityName').value = a.name;
    document.getElementById('editActivityCategory').value = a.category || '';
    document.getElementById('editActivityIcon').value = a.icon || '';
    document.getElementById('editActivityColor').value = a.color || '#3498db';
    document.getElementById('editActivityHalfHourRate').value = a.halfHourRate || 0;
    document.getElementById('editActivityFullHourRate').value = a.fullHourRate || 0;
    document.getElementById('editActivityMaxCapacity').value = a.maxCapacity || 1;
    document.getElementById('editActivityActive').checked = a.active !== false;
    document.getElementById('editActivityDescription').value = a.description || '';
    document.getElementById('editActivityEquipment').value = a.equipment || '';
    document.getElementById('editActivityRules').value = a.rules || '';
    window._editingActivityIndex = idx;
    showModal('editActivityModal');
};

// Aktivität speichern
window.saveActivityEdit = function() {
    const idx = window._editingActivityIndex;
    if (idx === undefined) return;
    const name = document.getElementById('editActivityName').value.trim();
    const category = document.getElementById('editActivityCategory').value;
    const icon = document.getElementById('editActivityIcon').value || '🎯';
    const color = document.getElementById('editActivityColor').value || '#3498db';
    const halfHourRate = parseFloat(document.getElementById('editActivityHalfHourRate').value) || 0;
    const fullHourRate = parseFloat(document.getElementById('editActivityFullHourRate').value) || 0;
    const maxCapacity = parseInt(document.getElementById('editActivityMaxCapacity').value) || 1;
    const active = document.getElementById('editActivityActive').checked;
    const description = document.getElementById('editActivityDescription').value.trim();
    const equipment = document.getElementById('editActivityEquipment').value.trim();
    const rules = document.getElementById('editActivityRules').value.trim();
    if (!name) {
        showNotification('Name der Aktivität fehlt!', 'error');
        return;
    }
    window.activities[idx] = { name, category, icon, color, halfHourRate, fullHourRate, maxCapacity, active, description, equipment, rules };
    saveActivities();
    renderActivitiesManagement();
    hideModal('editActivityModal');
    showNotification('Aktivität gespeichert!', 'success');
    window._editingActivityIndex = undefined;
};

// Aktivität löschen
window.deleteActivity = function(idx) {
    if (!confirm('Wirklich löschen?')) return;
    window.activities.splice(idx, 1);
    saveActivities();
    renderActivitiesManagement();
    showNotification('Aktivität gelöscht!', 'success');
};

// Hilfsfunktionen
function saveTimeBookings() {
    localStorage.setItem('company-os-timeBookings', JSON.stringify(window.timeBookings));
    if (typeof saveData === 'function') saveData();
}
function saveActivities() {
    localStorage.setItem('company-os-activities', JSON.stringify(window.activities));
    if (typeof saveData === 'function') saveData();
}
function clearNewBookingFields() {
    document.getElementById('newBookingCustomer').selectedIndex = 0;
    document.getElementById('newBookingWalkInName').value = '';
    document.getElementById('newBookingDate').value = '';
    document.getElementById('newBookingStartTime').value = '';
    document.getElementById('newBookingActivity').selectedIndex = 0;
    document.getElementById('newBookingDuration').selectedIndex = 0;
    document.getElementById('newBookingParticipants').value = 1;
    document.getElementById('newBookingNotes').value = '';
    document.getElementById('pricePreview').innerText = '';
}
function clearNewActivityFields() {
    document.getElementById('newActivityName').value = '';
    document.getElementById('newActivityCategory').value = 'Tischspiele';
    document.getElementById('newActivityIcon').value = '🎯';
    document.getElementById('newActivityColor').value = '#3498db';
    document.getElementById('newActivityHalfHourRate').value = 5.00;
    document.getElementById('newActivityFullHourRate').value = 10.00;
    document.getElementById('newActivityMaxCapacity').value = 2;
    document.getElementById('newActivityDescription').value = '';
    document.getElementById('newActivityEquipment').value = '';
    document.getElementById('newActivityRules').value = '';
}

// Helper für Preisvorschau (kann bei Bedarf im Modal genutzt werden)
window.updatePricePreview = function() {
    const activityName = document.getElementById('newBookingActivity').value;
    const duration = parseInt(document.getElementById('newBookingDuration').value);
    const participants = parseInt(document.getElementById('newBookingParticipants').value) || 1;
    const activity = window.activities.find(a => a.name === activityName);
    if (!activity) {
        document.getElementById('pricePreview').innerText = '';
        return;
    }
    let price = 0;
    if (duration === 30) price = activity.halfHourRate;
    else if (duration === 60) price = activity.fullHourRate;
    else if (duration === 120) price = activity.fullHourRate * 2;
    else price = (activity.fullHourRate / 60) * duration;
    price = price * participants;
    document.getElementById('pricePreview').innerText = `Gesamt: $${price.toFixed(2)}`;
};

// Helper für Teilnehmer-Limit und Kundenwahl (Optional)
window.updateParticipantLimits = function() {
    const activityName = document.getElementById('newBookingActivity').value;
    const activity = window.activities.find(a => a.name === activityName);
    if (!activity) return;
    document.getElementById('newBookingParticipants').max = activity.maxCapacity || 10;
    document.getElementById('participantsHint').innerText = `Max. Teilnehmer: ${activity.maxCapacity || 10}`;
};

// Kundenfelder ein-/ausblenden
window.handleCustomerChange = function(sel) {
    const walkInName = document.getElementById('newBookingWalkInName');
    if (!sel.value) {
        walkInName.style.display = 'block';
    } else {
        walkInName.style.display = 'none';
    }
};

// Beim Laden direkt Listen füllen
document.addEventListener('DOMContentLoaded', function() {
    renderTimeBookings();
    renderActivitiesManagement();
});

console.log('✅ timeBookings.js geladen');
