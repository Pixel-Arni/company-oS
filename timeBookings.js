// ===================================================================
// TIMEBOOKINGS.JS - Company OS Zeitliche Buchungen (ERWEITERT)
// Billard Sessions, Activity Booking, Time-based Revenue, Activity Management
// ===================================================================

// Global timeBookings data (wird von database.js verwaltet)
// let timeBookings = []; // Wird in database.js definiert
// let customers = []; // Wird in database.js definiert
let editingBookingId = null;
let editingActivityId = null;

// Standard-Aktivitätstypen (können verwaltet werden)
let activityTypes = {
    'Billard': { 
        id: 'billard_default',
        halfHourRate: 8.00, 
        fullHourRate: 15.00, 
        color: '#2ecc71', 
        icon: '🎱',
        description: 'Billard-Tisch pro Zeiteinheit',
        isActive: true,
        maxCapacity: 4,
        equipment: ['Billardkugeln', 'Queues', 'Kreide'],
        category: 'Tischspiele',
        rules: 'Standard Billard Regeln',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    'Pool': { 
        id: 'pool_default',
        halfHourRate: 6.00, 
        fullHourRate: 11.00, 
        color: '#3498db', 
        icon: '🎯',
        description: 'Pool-Tisch pro Zeiteinheit',
        isActive: true,
        maxCapacity: 4,
        equipment: ['Pool-Kugeln', 'Queues'],
        category: 'Tischspiele',
        rules: '8-Ball oder 9-Ball Pool',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    'Snooker': { 
        id: 'snooker_default',
        halfHourRate: 10.00, 
        fullHourRate: 18.00, 
        color: '#e74c3c', 
        icon: '🔴',
        description: 'Snooker-Tisch pro Zeiteinheit',
        isActive: true,
        maxCapacity: 2,
        equipment: ['Snooker-Kugeln', 'Queues', 'Scoreboard'],
        category: 'Tischspiele',
        rules: 'Offizielle Snooker Regeln',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    'Dart': { 
        id: 'dart_default',
        halfHourRate: 4.00, 
        fullHourRate: 7.00, 
        color: '#f39c12', 
        icon: '🎯',
        description: 'Dart-Bereich pro Zeiteinheit',
        isActive: true,
        maxCapacity: 6,
        equipment: ['Dartpfeile', 'Dartscheibe'],
        category: 'Wurfspiele',
        rules: '501 oder 301 Standard',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
};

// Aktivitäts-Kategorien
const activityCategories = {
    'Tischspiele': { icon: '🎱', color: '#2ecc71', description: 'Billard, Pool, Snooker' },
    'Wurfspiele': { icon: '🎯', color: '#f39c12', description: 'Dart, Axtwurf' },
    'Ballspiele': { icon: '🏓', color: '#9b59b6', description: 'Tischtennis, Kicker' },
    'Gaming': { icon: '🎮', color: '#3498db', description: 'Konsolen, VR, Arcade' },
    'Sport': { icon: '🏃', color: '#e74c3c', description: 'Fitness, Bowling' },
    'Entspannung': { icon: '🛋️', color: '#1abc9c', description: 'Lounge, Massage' }
};

// Zeiteinheiten (erweitert)
const timeUnits = {
    'quarter': { label: '15 Minuten', multiplier: 0.25, description: 'Viertelstunde' },
    'halfHour': { label: '30 Minuten', multiplier: 0.5, description: 'Halbe Stunde' },
    'fullHour': { label: '60 Minuten', multiplier: 1.0, description: 'Volle Stunde' },
    'oneAndHalf': { label: '90 Minuten', multiplier: 1.5, description: 'Eineinhalb Stunden' },
    'twoHours': { label: '120 Minuten', multiplier: 2.0, description: 'Zwei Stunden' },
    'threeHours': { label: '180 Minuten', multiplier: 3.0, description: 'Drei Stunden' },
    'fourHours': { label: '240 Minuten', multiplier: 4.0, description: 'Vier Stunden' }
};

// ===================================================================
// ACTIVITY MANAGEMENT (NEU)
// ===================================================================

/**
 * Fügt eine neue Aktivität hinzu
 */
function addActivity() {
    console.log('🎯 Füge neue Aktivität hinzu...');
    
    const nameField = document.getElementById('newActivityName');
    const categoryField = document.getElementById('newActivityCategory');
    const iconField = document.getElementById('newActivityIcon');
    const colorField = document.getElementById('newActivityColor');
    const halfHourRateField = document.getElementById('newActivityHalfHourRate');
    const fullHourRateField = document.getElementById('newActivityFullHourRate');
    const descriptionField = document.getElementById('newActivityDescription');
    const maxCapacityField = document.getElementById('newActivityMaxCapacity');
    const equipmentField = document.getElementById('newActivityEquipment');
    const rulesField = document.getElementById('newActivityRules');
    
    if (!nameField || !categoryField || !halfHourRateField || !fullHourRateField) {
        console.error('❌ Aktivitäts-Eingabefelder nicht gefunden');
        if (typeof showNotification === 'function') {
            showNotification('Fehler: Eingabefelder nicht gefunden', 'error');
        }
        return;
    }
    
    const name = nameField.value.trim();
    const category = categoryField.value;
    const icon = iconField.value.trim() || '🎯';
    const color = colorField.value || '#3498db';
    const halfHourRate = parseFloat(halfHourRateField.value) || 0;
    const fullHourRate = parseFloat(fullHourRateField.value) || 0;
    const description = descriptionField.value.trim();
    const maxCapacity = parseInt(maxCapacityField.value) || 1;
    const equipment = equipmentField.value.trim().split(',').map(e => e.trim()).filter(e => e);
    const rules = rulesField.value.trim();
    
    // Validierung
    if (!validateActivityInput(name, category, halfHourRate, fullHourRate, maxCapacity)) {
        return;
    }
    
    // Duplikat-Prüfung
    if (activityTypes[name]) {
        if (typeof showNotification === 'function') {
            showNotification('Eine Aktivität mit diesem Namen existiert bereits!', 'warning');
        }
        return;
    }
    
    // Aktivität erstellen
    const activity = {
        id: generateActivityId(),
        halfHourRate: halfHourRate,
        fullHourRate: fullHourRate,
        color: color,
        icon: icon,
        description: description,
        isActive: true,
        maxCapacity: maxCapacity,
        equipment: equipment,
        category: category,
        rules: rules,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Hinzufügen und speichern
    activityTypes[name] = activity;
    saveActivityTypes();
    updateActivityDisplay();
    updateActivityDropdowns();
    
    // Eingabefelder leeren
    clearActivityInputs();
    
    if (typeof showNotification === 'function') {
        showNotification(`Aktivität "${name}" wurde hinzugefügt!`, 'success');
    }
    console.log(`✅ Aktivität hinzugefügt: ${name}`);
}

/**
 * Validiert Aktivitäts-Eingaben
 */
function validateActivityInput(name, category, halfHourRate, fullHourRate, maxCapacity) {
    if (!name || name.length < 2) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie einen gültigen Aktivitätsnamen ein (min. 2 Zeichen)!', 'warning');
        }
        const nameField = document.getElementById('newActivityName');
        if (nameField) nameField.focus();
        return false;
    }
    
    if (name.length > 50) {
        if (typeof showNotification === 'function') {
            showNotification('Aktivitätsname ist zu lang (max. 50 Zeichen)!', 'warning');
        }
        return false;
    }
    
    if (!category) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte wählen Sie eine Kategorie aus!', 'warning');
        }
        return false;
    }
    
    if (isNaN(halfHourRate) || halfHourRate < 0) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie einen gültigen 30-Minuten-Preis ein!', 'warning');
        }
        const rateField = document.getElementById('newActivityHalfHourRate');
        if (rateField) rateField.focus();
        return false;
    }
    
    if (isNaN(fullHourRate) || fullHourRate < 0) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie einen gültigen 60-Minuten-Preis ein!', 'warning');
        }
        const rateField = document.getElementById('newActivityFullHourRate');
        if (rateField) rateField.focus();
        return false;
    }
    
    if (halfHourRate > fullHourRate) {
        if (typeof showNotification === 'function') {
            showNotification('Der 30-Minuten-Preis darf nicht höher als der 60-Minuten-Preis sein!', 'warning');
        }
        return false;
    }
    
    if (maxCapacity < 1 || maxCapacity > 50) {
        if (typeof showNotification === 'function') {
            showNotification('Maximale Kapazität muss zwischen 1 und 50 liegen!', 'warning');
        }
        return false;
    }
    
    return true;
}

/**
 * Öffnet das Aktivitäts-Bearbeitung Modal
 */
function editActivity(activityName) {
    const activity = activityTypes[activityName];
    if (!activity) {
        console.error(`❌ Aktivität "${activityName}" nicht gefunden`);
        if (typeof showNotification === 'function') {
            showNotification('Aktivität nicht gefunden!', 'error');
        }
        return;
    }
    
    console.log(`✏️ Bearbeite Aktivität: ${activityName}`);
    
    editingActivityId = activityName;
    
    // Modal-Felder füllen
    const fields = {
        'editActivityName': activityName,
        'editActivityCategory': activity.category || 'Tischspiele',
        'editActivityIcon': activity.icon || '🎯',
        'editActivityColor': activity.color || '#3498db',
        'editActivityHalfHourRate': activity.halfHourRate || 0,
        'editActivityFullHourRate': activity.fullHourRate || 0,
        'editActivityDescription': activity.description || '',
        'editActivityMaxCapacity': activity.maxCapacity || 1,
        'editActivityEquipment': (activity.equipment || []).join(', '),
        'editActivityRules': activity.rules || '',
        'editActivityActive': activity.isActive !== false
    };
    
    Object.entries(fields).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = value;
            } else {
                field.value = value;
            }
        }
    });
    
    if (typeof showModal === 'function') {
        showModal('editActivityModal');
    }
}

/**
 * Speichert die Aktivitäts-Bearbeitung
 */
function saveActivityEdit() {
    if (!editingActivityId) {
        console.error('❌ Keine Aktivitäts-ID zum Bearbeiten gefunden');
        return;
    }
    
    const activity = activityTypes[editingActivityId];
    if (!activity) {
        console.error(`❌ Aktivität mit ID ${editingActivityId} nicht gefunden`);
        if (typeof showNotification === 'function') {
            showNotification('Aktivität nicht gefunden!', 'error');
        }
        return;
    }
    
    // Hole aktuelle Werte
    const nameField = document.getElementById('editActivityName');
    const categoryField = document.getElementById('editActivityCategory');
    const iconField = document.getElementById('editActivityIcon');
    const colorField = document.getElementById('editActivityColor');
    const halfHourRateField = document.getElementById('editActivityHalfHourRate');
    const fullHourRateField = document.getElementById('editActivityFullHourRate');
    const descriptionField = document.getElementById('editActivityDescription');
    const maxCapacityField = document.getElementById('editActivityMaxCapacity');
    const equipmentField = document.getElementById('editActivityEquipment');
    const rulesField = document.getElementById('editActivityRules');
    const activeField = document.getElementById('editActivityActive');
    
    const newName = nameField ? nameField.value.trim() : editingActivityId;
    const category = categoryField ? categoryField.value : activity.category;
    const icon = iconField ? iconField.value.trim() || '🎯' : activity.icon;
    const color = colorField ? colorField.value || '#3498db' : activity.color;
    const halfHourRate = halfHourRateField ? parseFloat(halfHourRateField.value) || 0 : activity.halfHourRate;
    const fullHourRate = fullHourRateField ? parseFloat(fullHourRateField.value) || 0 : activity.fullHourRate;
    const description = descriptionField ? descriptionField.value.trim() : activity.description;
    const maxCapacity = maxCapacityField ? parseInt(maxCapacityField.value) || 1 : activity.maxCapacity;
    const equipment = equipmentField ? equipmentField.value.trim().split(',').map(e => e.trim()).filter(e => e) : activity.equipment;
    const rules = rulesField ? rulesField.value.trim() : activity.rules;
    const isActive = activeField ? activeField.checked : activity.isActive;
    
    // Validierung
    if (!validateActivityInput(newName, category, halfHourRate, fullHourRate, maxCapacity)) {
        return;
    }
    
    // Prüfe ob Name geändert wurde und bereits existiert
    if (newName !== editingActivityId && activityTypes[newName]) {
        if (typeof showNotification === 'function') {
            showNotification('Eine Aktivität mit diesem Namen existiert bereits!', 'warning');
        }
        return;
    }
    
    // Aktivität aktualisieren
    const updatedActivity = {
        ...activity,
        halfHourRate: halfHourRate,
        fullHourRate: fullHourRate,
        color: color,
        icon: icon,
        description: description,
        isActive: isActive,
        maxCapacity: maxCapacity,
        equipment: equipment,
        category: category,
        rules: rules,
        updatedAt: new Date().toISOString()
    };
    
    // Wenn Name geändert wurde, lösche alte und erstelle neue
    if (newName !== editingActivityId) {
        delete activityTypes[editingActivityId];
        activityTypes[newName] = updatedActivity;
        
        // Aktualisiere alle bestehenden Buchungen mit dem neuen Namen
        timeBookings.forEach(booking => {
            if (booking.activityType === editingActivityId) {
                booking.activityType = newName;
                booking.updatedAt = new Date().toISOString();
            }
        });
    } else {
        activityTypes[editingActivityId] = updatedActivity;
    }
    
    saveActivityTypes();
    updateActivityDisplay();
    updateActivityDropdowns();
    closeActivityEditModal();
    
    if (typeof showNotification === 'function') {
        showNotification(`Aktivität "${newName}" wurde aktualisiert!`, 'success');
    }
    console.log(`✅ Aktivität aktualisiert: ${newName}`);
}

/**
 * Schließt das Aktivitäts-Bearbeitung Modal
 */
function closeActivityEditModal() {
    if (typeof hideModal === 'function') {
        hideModal('editActivityModal');
    }
    editingActivityId = null;
    
    // Felder leeren
    const fields = [
        'editActivityName', 'editActivityCategory', 'editActivityIcon', 'editActivityColor',
        'editActivityHalfHourRate', 'editActivityFullHourRate', 'editActivityDescription',
        'editActivityMaxCapacity', 'editActivityEquipment', 'editActivityRules'
    ];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const activeField = document.getElementById('editActivityActive');
    if (activeField) activeField.checked = true;
}

/**
 * Löscht eine Aktivität
 */
function deleteActivity(activityName) {
    const activity = activityTypes[activityName];
    if (!activity) {
        console.error(`❌ Aktivität "${activityName}" nicht gefunden`);
        return;
    }
    
    // Prüfen ob Aktivität in Buchungen verwendet wird
    const usedInBookings = timeBookings.filter(booking => booking.activityType === activityName);
    
    let confirmMessage = `Aktivität "${activityName}" wirklich löschen?`;
    if (usedInBookings.length > 0) {
        confirmMessage += `\n\nWarnung: Die Aktivität wird in ${usedInBookings.length} Buchung(en) verwendet. Diese werden mit gelöscht.`;
    }
    
    if (confirm(confirmMessage)) {
        // Entferne zugehörige Buchungen
        if (usedInBookings.length > 0) {
            timeBookings = timeBookings.filter(booking => booking.activityType !== activityName);
        }
        
        // Aktivität löschen
        delete activityTypes[activityName];
        
        saveActivityTypes();
        updateActivityDisplay();
        updateActivityDropdowns();
        
        if (typeof showNotification === 'function') {
            showNotification(`Aktivität "${activityName}" wurde gelöscht!`, 'success');
        }
        console.log(`🗑️ Aktivität gelöscht: ${activityName}`);
    }
}

/**
 * Leert die Aktivitäts-Eingabefelder
 */
function clearActivityInputs() {
    const fields = [
        'newActivityName', 'newActivityDescription', 'newActivityEquipment', 'newActivityRules'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    // Standardwerte setzen
    const categoryField = document.getElementById('newActivityCategory');
    if (categoryField) categoryField.value = 'Tischspiele';
    
    const iconField = document.getElementById('newActivityIcon');
    if (iconField) iconField.value = '🎯';
    
    const colorField = document.getElementById('newActivityColor');
    if (colorField) colorField.value = '#3498db';
    
    const halfHourField = document.getElementById('newActivityHalfHourRate');
    if (halfHourField) halfHourField.value = '5.00';
    
    const fullHourField = document.getElementById('newActivityFullHourRate');
    if (fullHourField) fullHourField.value = '10.00';
    
    const capacityField = document.getElementById('newActivityMaxCapacity');
    if (capacityField) capacityField.value = '2';
}

/**
 * Aktiviert/Deaktiviert eine Aktivität
 */
function toggleActivityActive(activityName) {
    const activity = activityTypes[activityName];
    if (!activity) {
        console.error(`❌ Aktivität "${activityName}" nicht gefunden`);
        return;
    }
    
    activity.isActive = !activity.isActive;
    activity.updatedAt = new Date().toISOString();
    
    saveActivityTypes();
    updateActivityDisplay();
    updateActivityDropdowns();
    
    const status = activity.isActive ? 'aktiviert' : 'deaktiviert';
    if (typeof showNotification === 'function') {
        showNotification(`Aktivität "${activityName}" wurde ${status}!`, 'success');
    }
}

/**
 * Generiert Activity-ID
 */
function generateActivityId() {
    return 'activity_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===================================================================
// TIME BOOKING MANAGEMENT (Erweitert)
// ===================================================================

/**
 * Fügt eine neue zeitliche Buchung hinzu
 */
function addTimeBooking() {
    console.log('🎱 Füge neue zeitliche Buchung hinzu...');
    
    const customerField = document.getElementById('newBookingCustomer');
    const walkInNameField = document.getElementById('newBookingWalkInName');
    const dateField = document.getElementById('newBookingDate');
    const startTimeField = document.getElementById('newBookingStartTime');
    const activityField = document.getElementById('newBookingActivity');
    const durationField = document.getElementById('newBookingDuration');
    const notesField = document.getElementById('newBookingNotes');
    const participantsField = document.getElementById('newBookingParticipants');
    
    if (!dateField || !startTimeField || !activityField || !durationField) {
        console.error('❌ Buchungs-Eingabefelder nicht gefunden');
        if (typeof showNotification === 'function') {
            showNotification('Fehler: Eingabefelder nicht gefunden', 'error');
        }
        return;
    }
    
    const customerId = customerField ? customerField.value : '';
    const walkInName = walkInNameField ? walkInNameField.value.trim() : '';
    const date = dateField.value;
    const startTime = startTimeField.value;
    const activityType = activityField.value;
    const duration = durationField.value;
    const notes = notesField ? notesField.value.trim() : '';
    const participants = participantsField ? parseInt(participantsField.value) || 1 : 1;
    
    // Validierung
    if (!validateTimeBookingInput(customerId, walkInName, date, startTime, activityType, duration, participants)) {
        return;
    }
    
    // Berechne Endzeit und Preis
    const { endTime, totalPrice, discountedPrice } = calculateBookingDetails(
        startTime, duration, activityType, customerId, participants
    );
    
    // Prüfe Zeitkonflikt
    if (hasTimeConflict(date, startTime, endTime, activityType)) {
        if (typeof showNotification === 'function') {
            showNotification('Zeitkonflikt! Es gibt bereits eine Buchung zu dieser Zeit für diese Aktivität.', 'warning');
        }
        return;
    }
    
    // Buchung erstellen
    const booking = {
        id: generateTimeBookingId(),
        customerId: customerId || null,
        walkInName: customerId ? null : walkInName,
        date: date,
        startTime: startTime,
        endTime: endTime,
        activityType: activityType,
        duration: duration,
        participants: participants,
        basePrice: totalPrice,
        finalPrice: discountedPrice,
        notes: notes,
        isPaid: false,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Hinzufügen und speichern
    timeBookings.push(booking);
    
    // Kundendaten aktualisieren wenn vorhanden
    if (customerId) {
        updateCustomerBookingStats(customerId, discountedPrice);
    }
    
    saveTimeBookingData();
    updateTimeBookingDisplay();
    
    // Eingabefelder leeren
    clearTimeBookingInputs();
    
    const customerName = customerId ? getCustomerName(customerId) : walkInName;
    if (typeof showNotification === 'function') {
        showNotification(`Buchung für ${customerName} wurde hinzugefügt!`, 'success');
    }
    console.log(`✅ Zeitbuchung hinzugefügt: ${activityType} für ${customerName}`);
}

/**
 * Validiert Zeitbuchungs-Eingaben (erweitert)
 */
function validateTimeBookingInput(customerId, walkInName, date, startTime, activityType, duration, participants) {
    if (!customerId && !walkInName) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte wählen Sie einen Kunden aus oder geben Sie einen Namen für Laufkundschaft ein!', 'warning');
        }
        return false;
    }
    
    if (!date) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie ein Datum ein!', 'warning');
        }
        const dateField = document.getElementById('newBookingDate');
        if (dateField) dateField.focus();
        return false;
    }
    
    if (!startTime) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie eine Startzeit ein!', 'warning');
        }
        const timeField = document.getElementById('newBookingStartTime');
        if (timeField) timeField.focus();
        return false;
    }
    
    if (!activityType || !activityTypes[activityType]) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte wählen Sie eine gültige Aktivität aus!', 'warning');
        }
        return false;
    }
    
    if (!duration || !timeUnits[duration]) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte wählen Sie eine gültige Dauer aus!', 'warning');
        }
        return false;
    }
    
    // Prüfe Teilnehmerzahl
    const activity = activityTypes[activityType];
    if (participants > activity.maxCapacity) {
        if (typeof showNotification === 'function') {
            showNotification(`Zu viele Teilnehmer! Maximum für ${activityType}: ${activity.maxCapacity}`, 'warning');
        }
        return false;
    }
    
    if (participants < 1) {
        if (typeof showNotification === 'function') {
            showNotification('Mindestens ein Teilnehmer erforderlich!', 'warning');
        }
        return false;
    }
    
    // Prüfe ob Datum nicht in der Vergangenheit liegt (außer heute)
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
        if (typeof showNotification === 'function') {
            showNotification('Buchungsdatum kann nicht in der Vergangenheit liegen!', 'warning');
        }
        return false;
    }
    
    // Prüfe Laufkundschaft-Name
    if (!customerId && walkInName.length < 2) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie einen gültigen Namen für Laufkundschaft ein (min. 2 Zeichen)!', 'warning');
        }
        const walkInField = document.getElementById('newBookingWalkInName');
        if (walkInField) walkInField.focus();
        return false;
    }
    
    return true;
}

/**
 * Berechnet Buchungsdetails (erweitert mit Teilnehmern)
 */
function calculateBookingDetails(startTime, duration, activityType, customerId, participants = 1) {
    const activity = activityTypes[activityType];
    const timeUnit = timeUnits[duration];
    
    if (!activity || !timeUnit) {
        return { endTime: '', totalPrice: 0, discountedPrice: 0 };
    }
    
    // Endzeit berechnen
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const durationMinutes = timeUnit.multiplier * 60;
    const endMinutes = startMinutes + durationMinutes;
    
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    
    // Preis berechnen basierend auf Dauer
    let baseRate;
    if (timeUnit.multiplier <= 0.5) {
        baseRate = activity.halfHourRate;
    } else {
        // Für längere Zeiten: Verhältnismäßige Berechnung
        baseRate = activity.fullHourRate * timeUnit.multiplier;
    }
    
    // Teilnehmer-Multiplikator (optional: Gruppenrabatt)
    let participantMultiplier = 1;
    if (participants > 1) {
        // Beispiel: Ab 2 Teilnehmern leichter Rabatt pro zusätzlicher Person
        participantMultiplier = 1 + (participants - 1) * 0.8;
    }
    
    const totalPrice = baseRate * participantMultiplier;
    
    // Kundenrabatt anwenden
    let discountedPrice = totalPrice;
    if (customerId) {
        const customer = customers.find(c => c.id == customerId);
        if (customer && customer.discount > 0) {
            const discountAmount = totalPrice * (customer.discount / 100);
            discountedPrice = totalPrice - discountAmount;
        }
    }
    
    return {
        endTime: endTime,
        totalPrice: Number(totalPrice.toFixed(2)),
        discountedPrice: Number(discountedPrice.toFixed(2))
    };
}

/**
 * Prüft auf Zeitkonflikte
 */
function hasTimeConflict(date, startTime, endTime, activityType) {
    const existingBookings = timeBookings.filter(booking => 
        booking.date === date && 
        booking.activityType === activityType
    );
    
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);
    
    return existingBookings.some(booking => {
        const existingStart = timeToMinutes(booking.startTime);
        const existingEnd = timeToMinutes(booking.endTime);
        
        // Prüfe Überschneidung
        return (newStart < existingEnd && newEnd > existingStart);
    });
}

/**
 * Konvertiert Zeit zu Minuten
 */
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Aktualisiert Kundenbuchungsstatistiken
 */
function updateCustomerBookingStats(customerId, amount) {
    const customer = customers.find(c => c.id == customerId);
    if (customer) {
        customer.totalSpent = (customer.totalSpent || 0) + amount;
        customer.totalVisits = (customer.totalVisits || 0) + 1;
        customer.lastVisit = new Date().toISOString();
        customer.updatedAt = new Date().toISOString();
    }
}

/**
 * Leert die Zeitbuchungs-Eingabefelder
 */
function clearTimeBookingInputs() {
    const fields = [
        'newBookingWalkInName',
        'newBookingNotes'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    // Dropdowns auf Standard setzen
    const customerField = document.getElementById('newBookingCustomer');
    if (customerField) customerField.value = '';
    
    const activityField = document.getElementById('newBookingActivity');
    if (activityField) {
        const activeActivities = Object.keys(activityTypes).filter(name => activityTypes[name].isActive !== false);
        if (activeActivities.length > 0) {
            activityField.value = activeActivities[0];
        }
    }
    
    const durationField = document.getElementById('newBookingDuration');
    if (durationField) durationField.value = 'fullHour';
    
    const participantsField = document.getElementById('newBookingParticipants');
    if (participantsField) participantsField.value = '1';
    
    // Datum auf heute setzen
    setDefaultBookingDate();
}

/**
 * Setzt Standard-Datum und -Zeit für Buchungen
 */
function setDefaultBookingDate() {
    const dateField = document.getElementById('newBookingDate');
    const timeField = document.getElementById('newBookingStartTime');
    
    if (dateField && !dateField.value) {
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;
    }
    
    if (timeField && !timeField.value) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = Math.ceil(now.getMinutes() / 30) * 30; // Runde auf nächste halbe Stunde
        const roundedMinutes = (minutes === 60 ? 0 : minutes).toString().padStart(2, '0');
        const roundedHours = (minutes === 60 ? parseInt(hours) + 1 : hours).toString().padStart(2, '0');
        timeField.value = `${roundedHours}:${roundedMinutes}`;
    }
}

/**
 * Bearbeitet eine Zeitbuchung (erweitert)
 */
function editTimeBooking(id) {
    const booking = timeBookings.find(b => b.id == id);
    if (!booking) {
        console.error(`❌ Buchung mit ID ${id} nicht gefunden`);
        if (typeof showNotification === 'function') {
            showNotification('Buchung nicht gefunden!', 'error');
        }
        return;
    }
    
    console.log(`✏️ Bearbeite Buchung: ${booking.activityType}`);
    
    editingBookingId = id;
    
    // Modal-Felder füllen
    const fields = {
        'editBookingCustomer': booking.customerId || '',
        'editBookingWalkInName': booking.walkInName || '',
        'editBookingDate': booking.date,
        'editBookingStartTime': booking.startTime,
        'editBookingActivity': booking.activityType,
        'editBookingDuration': booking.duration,
        'editBookingParticipants': booking.participants || 1,
        'editBookingNotes': booking.notes || '',
        'editBookingPaid': booking.isPaid || false,
        'editBookingCompleted': booking.isCompleted || false
    };
    
    Object.entries(fields).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = value;
            } else {
                field.value = value;
            }
        }
    });
    
    if (typeof showModal === 'function') {
        showModal('editTimeBookingModal');
    }
}

/**
 * Speichert die Buchungs-Bearbeitung (erweitert)
 */
function saveTimeBookingEdit() {
    if (!editingBookingId) {
        console.error('❌ Keine Buchungs-ID zum Bearbeiten gefunden');
        return;
    }
    
    const booking = timeBookings.find(b => b.id == editingBookingId);
    if (!booking) {
        console.error(`❌ Buchung mit ID ${editingBookingId} nicht gefunden`);
        if (typeof showNotification === 'function') {
            showNotification('Buchung nicht gefunden!', 'error');
        }
        return;
    }
    
    // Hole aktuelle Werte
    const customerField = document.getElementById('editBookingCustomer');
    const walkInNameField = document.getElementById('editBookingWalkInName');
    const dateField = document.getElementById('editBookingDate');
    const startTimeField = document.getElementById('editBookingStartTime');
    const activityField = document.getElementById('editBookingActivity');
    const durationField = document.getElementById('editBookingDuration');
    const participantsField = document.getElementById('editBookingParticipants');
    const notesField = document.getElementById('editBookingNotes');
    const paidField = document.getElementById('editBookingPaid');
    const completedField = document.getElementById('editBookingCompleted');
    
    const customerId = customerField ? customerField.value : '';
    const walkInName = walkInNameField ? walkInNameField.value.trim() : '';
    const date = dateField ? dateField.value : booking.date;
    const startTime = startTimeField ? startTimeField.value : booking.startTime;
    const activityType = activityField ? activityField.value : booking.activityType;
    const duration = durationField ? durationField.value : booking.duration;
    const participants = participantsField ? parseInt(participantsField.value) || 1 : booking.participants;
    const notes = notesField ? notesField.value.trim() : booking.notes;
    const isPaid = paidField ? paidField.checked : booking.isPaid;
    const isCompleted = completedField ? completedField.checked : booking.isCompleted;
    
    // Validierung
    if (!validateTimeBookingInput(customerId, walkInName, date, startTime, activityType, duration, participants)) {
        return;
    }
    
    // Berechne neue Details
    const { endTime, totalPrice, discountedPrice } = calculateBookingDetails(
        startTime, duration, activityType, customerId, participants
    );
    
    // Prüfe Zeitkonflikt (außer mit sich selbst)
    const otherBookings = timeBookings.filter(b => b.id != editingBookingId);
    const hasConflict = otherBookings.some(b => 
        b.date === date && 
        b.activityType === activityType &&
        timeToMinutes(startTime) < timeToMinutes(b.endTime) &&
        timeToMinutes(endTime) > timeToMinutes(b.startTime)
    );
    
    if (hasConflict) {
        if (typeof showNotification === 'function') {
            showNotification('Zeitkonflikt! Es gibt bereits eine Buchung zu dieser Zeit für diese Aktivität.', 'warning');
        }
        return;
    }
    
    // Buchung aktualisieren
    booking.customerId = customerId || null;
    booking.walkInName = customerId ? null : walkInName;
    booking.date = date;
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.activityType = activityType;
    booking.duration = duration;
    booking.participants = participants;
    booking.basePrice = totalPrice;
    booking.finalPrice = discountedPrice;
    booking.notes = notes;
    booking.isPaid = isPaid;
    booking.isCompleted = isCompleted;
    booking.updatedAt = new Date().toISOString();
    
    saveTimeBookingData();
    updateTimeBookingDisplay();
    closeTimeBookingEditModal();
    
    const customerName = customerId ? getCustomerName(customerId) : walkInName;
    if (typeof showNotification === 'function') {
        showNotification(`Buchung für ${customerName} wurde aktualisiert!`, 'success');
    }
    console.log(`✅ Zeitbuchung aktualisiert: ${activityType}`);
}

/**
 * Schließt das Buchungs-Bearbeitung Modal
 */
function closeTimeBookingEditModal() {
    if (typeof hideModal === 'function') {
        hideModal('editTimeBookingModal');
    }
    editingBookingId = null;
}

/**
 * Löscht eine Zeitbuchung
 */
function deleteTimeBooking(id) {
    const booking = timeBookings.find(b => b.id == id);
    if (!booking) {
        console.error(`❌ Buchung mit ID ${id} nicht gefunden`);
        return;
    }
    
    const customerName = booking.customerId ? getCustomerName(booking.customerId) : booking.walkInName;
    const bookingInfo = `${booking.activityType} am ${booking.date} (${booking.startTime}-${booking.endTime})`;
    
    if (confirm(`Buchung "${bookingInfo}" für ${customerName} wirklich löschen?`)) {
        timeBookings = timeBookings.filter(b => b.id != id);
        
        saveTimeBookingData();
        updateTimeBookingDisplay();
        
        if (typeof showNotification === 'function') {
            showNotification('Zeitbuchung wurde gelöscht!', 'success');
        }
        console.log(`🗑️ Zeitbuchung gelöscht: ${id}`);
    }
}

/**
 * Markiert eine Buchung als bezahlt/unbezahlt
 */
function toggleBookingPaid(bookingId) {
    const booking = timeBookings.find(b => b.id == bookingId);
    if (!booking) {
        console.error(`❌ Buchung mit ID ${bookingId} nicht gefunden`);
        return;
    }
    
    booking.isPaid = !booking.isPaid;
    booking.updatedAt = new Date().toISOString();
    
    saveTimeBookingData();
    updateTimeBookingDisplay();
    
    const customerName = booking.customerId ? getCustomerName(booking.customerId) : booking.walkInName;
    const status = booking.isPaid ? 'bezahlt' : 'unbezahlt';
    
    if (typeof showNotification === 'function') {
        showNotification(`Buchung von ${customerName} als ${status} markiert!`, 'success');
    }
}

/**
 * Markiert eine Buchung als abgeschlossen/nicht abgeschlossen
 */
function toggleBookingCompleted(bookingId) {
    const booking = timeBookings.find(b => b.id == bookingId);
    if (!booking) {
        console.error(`❌ Buchung mit ID ${bookingId} nicht gefunden`);
        return;
    }
    
    booking.isCompleted = !booking.isCompleted;
    booking.updatedAt = new Date().toISOString();
    
    saveTimeBookingData();
    updateTimeBookingDisplay();
    
    const customerName = booking.customerId ? getCustomerName(booking.customerId) : booking.walkInName;
    const status = booking.isCompleted ? 'abgeschlossen' : 'nicht abgeschlossen';
    
    if (typeof showNotification === 'function') {
        showNotification(`Buchung von ${customerName} als ${status} markiert!`, 'success');
    }
}

// ===================================================================
// CUSTOMER & ACTIVITY HELPERS (Erweitert)
// ===================================================================

/**
 * Ermittelt Kundenname anhand ID
 */
function getCustomerName(customerId) {
    const customer = customers.find(c => c.id == customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unbekannt';
}

/**
 * Aktualisiert Aktivitäts- und Dauer-Dropdowns (erweitert)
 */
function updateActivityDropdowns() {
    console.log('🔄 Aktualisiere Aktivitäts-Dropdowns...');
    
    const activityDropdowns = [
        document.getElementById('newBookingActivity'),
        document.getElementById('editBookingActivity')
    ].filter(dropdown => dropdown !== null);
    
    activityDropdowns.forEach(dropdown => {
        if (dropdown) {
            dropdown.innerHTML = '';
            Object.entries(activityTypes).forEach(([activity, config]) => {
                // Zeige nur aktive Aktivitäten
                if (config.isActive !== false) {
                    const option = document.createElement('option');
                    option.value = activity;
                    option.textContent = `${config.icon} ${activity} (${formatCurrency(config.halfHourRate)}/30min, ${formatCurrency(config.fullHourRate)}/h)`;
                    dropdown.appendChild(option);
                }
            });
        }
    });
    
    const durationDropdowns = [
        document.getElementById('newBookingDuration'),
        document.getElementById('editBookingDuration')
    ].filter(dropdown => dropdown !== null);
    
    durationDropdowns.forEach(dropdown => {
        if (dropdown) {
            dropdown.innerHTML = '';
            Object.entries(timeUnits).forEach(([duration, config]) => {
                const option = document.createElement('option');
                option.value = duration;
                option.textContent = config.label;
                if (duration === 'fullHour') {
                    option.selected = true;
                }
                dropdown.appendChild(option);
            });
        }
    });
}

/**
 * Aktualisiert Kategorie-Dropdowns für Aktivitäten
 */
function updateCategoryDropdowns() {
    const categoryDropdowns = [
        document.getElementById('newActivityCategory'),
        document.getElementById('editActivityCategory')
    ].filter(dropdown => dropdown !== null);
    
    categoryDropdowns.forEach(dropdown => {
        if (dropdown) {
            dropdown.innerHTML = '';
            Object.entries(activityCategories).forEach(([categoryId, category]) => {
                const option = document.createElement('option');
                option.value = categoryId;
                option.textContent = `${category.icon} ${categoryId}`;
                dropdown.appendChild(option);
            });
        }
    });
}

/**
 * Aktualisiert Kunden-Dropdowns für Buchungen
 */
function updateBookingCustomerDropdowns() {
    const dropdowns = [
        document.getElementById('newBookingCustomer'),
        document.getElementById('editBookingCustomer')
    ].filter(dropdown => dropdown !== null);
    
    dropdowns.forEach(dropdown => {
        if (!dropdown) return;
        
        const activeCustomers = customers.filter(c => c.isActive);
        
        dropdown.innerHTML = '<option value="">Laufkundschaft (Name eingeben)</option>';
        
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

/**
 * Behandelt Kundenwechsel in Dropdown
 */
function handleCustomerChange(selectElement) {
    const walkInField = selectElement.id.replace('Customer', 'WalkInName');
    const walkInInput = document.getElementById(walkInField);
    
    if (walkInInput) {
        if (selectElement.value) {
            // Kunde ausgewählt - verstecke Walk-in Feld
            walkInInput.style.display = 'none';
            walkInInput.value = '';
        } else {
            // Laufkundschaft - zeige Walk-in Feld
            walkInInput.style.display = 'block';
            walkInInput.focus();
        }
    }
    
    // Aktualisiere Preis-Vorschau
    updatePricePreview();
}

/**
 * Aktualisiert Preis-Vorschau bei Aktivitäts-/Dauer-Änderung (erweitert)
 */
function updatePricePreview() {
    const activityField = document.getElementById('newBookingActivity');
    const durationField = document.getElementById('newBookingDuration');
    const customerField = document.getElementById('newBookingCustomer');
    const participantsField = document.getElementById('newBookingParticipants');
    const previewDiv = document.getElementById('pricePreview');
    
    if (!activityField || !durationField || !previewDiv) return;
    
    const activityType = activityField.value;
    const duration = durationField.value;
    const customerId = customerField ? customerField.value : null;
    const participants = participantsField ? parseInt(participantsField.value) || 1 : 1;
    
    if (activityType && duration) {
        const { totalPrice, discountedPrice } = calculateBookingDetails('12:00', duration, activityType, customerId, participants);
        
        let priceText = `Preis: ${formatCurrency(totalPrice)}`;
        if (participants > 1) {
            priceText += ` (${participants} Teilnehmer)`;
        }
        if (customerId && totalPrice !== discountedPrice) {
            const customer = customers.find(c => c.id == customerId);
            priceText += ` → ${formatCurrency(discountedPrice)} (${customer.discount}% Rabatt)`;
        }
        
        previewDiv.textContent = priceText;
        previewDiv.style.color = customerId && totalPrice !== discountedPrice ? 'var(--success-color)' : 'var(--text-secondary)';
    } else {
        previewDiv.textContent = '';
    }
}

/**
 * Aktualisiert Teilnehmer-Limits basierend auf Aktivität
 */
function updateParticipantLimits() {
    const activityField = document.getElementById('newBookingActivity');
    const participantsField = document.getElementById('newBookingParticipants');
    
    if (!activityField || !participantsField) return;
    
    const activityType = activityField.value;
    if (activityType && activityTypes[activityType]) {
        const maxCapacity = activityTypes[activityType].maxCapacity;
        participantsField.max = maxCapacity;
        
        if (parseInt(participantsField.value) > maxCapacity) {
            participantsField.value = maxCapacity;
        }
        
        // Zeige Hinweis
        const hintElement = document.getElementById('participantsHint');
        if (hintElement) {
            hintElement.textContent = `Max. ${maxCapacity} Teilnehmer`;
        }
    }
    
    updatePricePreview();
}

// ===================================================================
// STATISTICS & CALCULATIONS (Erweitert)
// ===================================================================

/**
 * Berechnet Statistiken für Zeitbuchungen (erweitert)
 */
function calculateTimeBookingStats(dateRange = null) {
    let filteredBookings = timeBookings;
    
    if (dateRange) {
        filteredBookings = timeBookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate >= dateRange.start && bookingDate <= dateRange.end;
        });
    }
    
    const totalBookings = filteredBookings.length;
    const paidBookings = filteredBookings.filter(b => b.isPaid).length;
    const unpaidBookings = totalBookings - paidBookings;
    const completedBookings = filteredBookings.filter(b => b.isCompleted).length;
    
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.finalPrice, 0);
    const paidRevenue = filteredBookings.filter(b => b.isPaid).reduce((sum, booking) => sum + booking.finalPrice, 0);
    const unpaidRevenue = totalRevenue - paidRevenue;
    
    const totalParticipants = filteredBookings.reduce((sum, booking) => sum + (booking.participants || 1), 0);
    
    // Aktivitäts-Statistiken (erweitert)
    const activityStats = {};
    Object.keys(activityTypes).forEach(activity => {
        activityStats[activity] = {
            count: 0,
            revenue: 0,
            hours: 0,
            participants: 0,
            completionRate: 0
        };
    });
    
    filteredBookings.forEach(booking => {
        const activity = activityStats[booking.activityType];
        if (activity) {
            activity.count++;
            activity.revenue += booking.finalPrice;
            activity.hours += timeUnits[booking.duration]?.multiplier || 1;
            activity.participants += booking.participants || 1;
            if (booking.isCompleted) {
                activity.completionRate++;
            }
        }
    });
    
    // Berechne Completion-Rate Prozentsatz
    Object.keys(activityStats).forEach(activity => {
        const stats = activityStats[activity];
        stats.completionRate = stats.count > 0 ? Number(((stats.completionRate / stats.count) * 100).toFixed(1)) : 0;
    });
    
    return {
        totalBookings,
        paidBookings,
        unpaidBookings,
        completedBookings,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        paidRevenue: Number(paidRevenue.toFixed(2)),
        unpaidRevenue: Number(unpaidRevenue.toFixed(2)),
        totalParticipants,
        activityStats,
        averageBookingValue: totalBookings > 0 ? Number((totalRevenue / totalBookings).toFixed(2)) : 0,
        averageParticipants: totalBookings > 0 ? Number((totalParticipants / totalBookings).toFixed(1)) : 0,
        completionRate: totalBookings > 0 ? Number(((completedBookings / totalBookings) * 100).toFixed(1)) : 0
    };
}

/**
 * Berechnet tägliche Zeitbuchungsstatistiken
 */
function calculateDailyTimeBookingStats(date) {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    return calculateTimeBookingStats({
        start: new Date(dateStr),
        end: new Date(dateStr)
    });
}

/**
 * Berechnet wöchentliche Zeitbuchungsstatistiken
 */
function calculateWeeklyTimeBookingStats(weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return calculateTimeBookingStats({
        start: weekStart,
        end: weekEnd
    });
}

/**
 * Berechnet Aktivitäts-Performance
 */
function calculateActivityPerformance() {
    const performance = {};
    
    Object.entries(activityTypes).forEach(([activityName, activity]) => {
        const bookings = timeBookings.filter(b => b.activityType === activityName);
        const revenue = bookings.reduce((sum, b) => sum + b.finalPrice, 0);
        const totalHours = bookings.reduce((sum, b) => sum + (timeUnits[b.duration]?.multiplier || 1), 0);
        
        performance[activityName] = {
            totalBookings: bookings.length,
            totalRevenue: Number(revenue.toFixed(2)),
            totalHours: Number(totalHours.toFixed(1)),
            averageRevenuePerHour: totalHours > 0 ? Number((revenue / totalHours).toFixed(2)) : 0,
            utilizationRate: 0, // Kann erweitert werden basierend auf verfügbaren Slots
            popularityRank: 0
        };
    });
    
    // Popularitäts-Ranking berechnen
    const sortedByBookings = Object.entries(performance).sort((a, b) => b[1].totalBookings - a[1].totalBookings);
    sortedByBookings.forEach(([activityName], index) => {
        performance[activityName].popularityRank = index + 1;
    });
    
    return performance;
}

// ===================================================================
// DATA MANAGEMENT (Erweitert)
// ===================================================================

/**
 * Speichert Aktivitätstypen in LocalStorage
 */
function saveActivityTypes() {
    console.log('💾 Speichere Aktivitätstypen...');
    
    try {
        localStorage.setItem('company-os-activity-types', JSON.stringify(activityTypes));
        console.log('✅ Aktivitätstypen gespeichert');
    } catch (error) {
        console.error('❌ Fehler beim Speichern der Aktivitätstypen:', error);
    }
    
    // Auch über database.js speichern wenn verfügbar
    if (typeof saveData === 'function') {
        saveData();
    }
}

/**
 * Lädt Aktivitätstypen aus LocalStorage
 */
function loadActivityTypes() {
    console.log('📖 Lade Aktivitätstypen...');
    
    try {
        const saved = localStorage.getItem('company-os-activity-types');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge mit Standard-Aktivitäten
            activityTypes = { ...activityTypes, ...parsed };
            console.log(`✅ ${Object.keys(parsed).length} Aktivitätstypen geladen`);
        }
    } catch (error) {
        console.error('❌ Fehler beim Laden der Aktivitätstypen:', error);
    }
}

/**
 * Exportiert Aktivitätstypen als JSON
 */
function exportActivityTypes() {
    const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        activityTypes: activityTypes,
        categories: activityCategories,
        exportedFrom: 'Company OS'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `Activity-Types-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
    
    if (typeof showNotification === 'function') {
        showNotification('✅ Aktivitätstypen exportiert!', 'success');
    }
}

/**
 * Speichert Zeitbuchungsdaten (verwendet database.js saveData)
 */
function saveTimeBookingData() {
    console.log('💾 Speichere Zeitbuchungsdaten über database.js...');
    
    if (typeof saveData === 'function') {
        saveData();
    } else {
        console.error('❌ saveData Funktion nicht verfügbar');
    }
}

/**
 * Hilfsfunktion für generateId (lokale Implementation)
 */
function generateTimeBookingId() {
    return 'booking_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Formatiert Währung
 */
function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

// ===================================================================
// DISPLAY UPDATE FUNCTIONS (Placeholder)
// ===================================================================

/**
 * Aktualisiert die Zeitbuchungs-Anzeige (wird in ui.js implementiert)
 */
function updateTimeBookingDisplay() {
    if (typeof updateTimeBookingsDisplay === 'function') {
        updateTimeBookingsDisplay();
    }
}

/**
 * Aktualisiert die Aktivitäts-Anzeige (wird in ui.js implementiert)
 */
function updateActivityDisplay() {
    if (typeof updateActivitiesDisplay === 'function') {
        updateActivitiesDisplay();
    }
}

// ===================================================================
// INITIALIZATION (Erweitert)
// ===================================================================

/**
 * Initialisiert das Zeitbuchungs-System (erweitert)
 */
function initializeTimeBookingSystem() {
    console.log('🎱 Initialisiere Zeitbuchungs-System...');
    
    // Lade gespeicherte Aktivitätstypen
    loadActivityTypes();
    
    // Warte bis database.js initialisiert ist
    if (typeof waitForInitialization === 'function') {
        waitForInitialization(() => {
            updateActivityDropdowns();
            updateCategoryDropdowns();
            updateBookingCustomerDropdowns();
            setDefaultBookingDate();
            console.log(`✅ Zeitbuchungs-System initialisiert - ${timeBookings.length} Buchungen, ${Object.keys(activityTypes).length} Aktivitäten`);
        });
    } else {
        // Fallback ohne Warten
        updateActivityDropdowns();
        updateCategoryDropdowns();
        updateBookingCustomerDropdowns();
        setDefaultBookingDate();
        console.log(`✅ Zeitbuchungs-System initialisiert - Fallback-Modus`);
    }
    
    // Event Listeners für Aktivitäts-Formulare
    setupActivityFormListeners();
}

/**
 * Setzt Event Listeners für Aktivitäts-Formulare auf
 */
function setupActivityFormListeners() {
    // Aktivitäts-Änderung für Teilnehmer-Limits
    const activityField = document.getElementById('newBookingActivity');
    if (activityField) {
        activityField.addEventListener('change', function() {
            updateParticipantLimits();
            updatePricePreview();
        });
    }
    
    // Teilnehmer-Änderung für Preis-Update
    const participantsField = document.getElementById('newBookingParticipants');
    if (participantsField) {
        participantsField.addEventListener('input', updatePricePreview);
    }
    
    // Dauer-Änderung für Preis-Update
    const durationField = document.getElementById('newBookingDuration');
    if (durationField) {
        durationField.addEventListener('change', updatePricePreview);
    }
    
    // Kunden-Änderung für Preis-Update
    const customerField = document.getElementById('newBookingCustomer');
    if (customerField) {
        customerField.addEventListener('change', function() {
            handleCustomerChange(this);
        });
    }
}

/**
 * Hilfsfunktion für Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-Initialisierung (verzögert nach database.js)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Verzögerung um sicherzustellen, dass database.js zuerst lädt
        setTimeout(initializeTimeBookingSystem, 700);
    });
} else {
    setTimeout(initializeTimeBookingSystem, 700);
}

console.log('🎱 TimeBookings.js (Erweitert) geladen');