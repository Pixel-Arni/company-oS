// ===================================================================
// EMPLOYEES.JS - Company OS Mitarbeiter Management
// Employee CRUD Operations, Time Tracking, Salary Calculations
// ===================================================================

// Global employee data (Verwende die globalen Variablen aus database.js)
// let employees = []; // Entfernt - wird von database.js verwaltet
// let workSessions = []; // Entfernt - wird von database.js verwaltet
let editingEmployeeId = null;
let editingSessionId = null;

// Employee ranks with default hourly rates
const employeeRanks = {
    'Praktikant': { hourlyRate: 8.50, color: '#95a5a6' },
    'Auszubildender': { hourlyRate: 12.00, color: '#3498db' },
    'Junior': { hourlyRate: 18.00, color: '#2ecc71' },
    'Mitarbeiter': { hourlyRate: 25.00, color: '#f39c12' },
    'Senior': { hourlyRate: 35.00, color: '#e74c3c' },
    'Teamleiter': { hourlyRate: 45.00, color: '#9b59b6' },
    'Manager': { hourlyRate: 60.00, color: '#1abc9c' },
    'Direktor': { hourlyRate: 80.00, color: '#34495e' }
};

// ===================================================================
// EMPLOYEE MANAGEMENT
// ===================================================================

/**
 * Fügt einen neuen Mitarbeiter hinzu
 */
function addEmployee() {
    console.log('👤 Füge neuen Mitarbeiter hinzu...');
    
    const firstNameField = document.getElementById('newEmployeeFirstName');
    const lastNameField = document.getElementById('newEmployeeLastName');
    const rankField = document.getElementById('newEmployeeRank');
    const hourlyRateField = document.getElementById('newEmployeeHourlyRate');
    
    if (!firstNameField || !lastNameField || !rankField || !hourlyRateField) {
        console.error('❌ Mitarbeiter-Eingabefelder nicht gefunden');
        if (typeof showNotification === 'function') {
            showNotification('Fehler: Eingabefelder nicht gefunden', 'error');
        }
        return;
    }
    
    const firstName = firstNameField.value.trim();
    const lastName = lastNameField.value.trim();
    const rank = rankField.value;
    const hourlyRate = parseFloat(hourlyRateField.value);
    
    // Validierung
    if (!validateEmployeeInput(firstName, lastName, rank, hourlyRate)) {
        return;
    }
    
    // Duplikat-Prüfung
    if (employees.some(emp => 
        emp.firstName.toLowerCase() === firstName.toLowerCase() && 
        emp.lastName.toLowerCase() === lastName.toLowerCase()
    )) {
        if (typeof showNotification === 'function') {
            showNotification('Ein Mitarbeiter mit diesem Namen existiert bereits!', 'warning');
        }
        return;
    }
    
    // Mitarbeiter erstellen
    const employee = {
        id: generateEmployeeId(),
        firstName: firstName,
        lastName: lastName,
        rank: rank,
        hourlyRate: hourlyRate,
        registeredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
    };
    
    // Hinzufügen und speichern
    employees.push(employee);
    saveEmployeeData();
    updateEmployeeDisplay();
    
    // Eingabefelder leeren
    firstNameField.value = '';
    lastNameField.value = '';
    rankField.value = Object.keys(employeeRanks)[0];
    hourlyRateField.value = employeeRanks[Object.keys(employeeRanks)[0]].hourlyRate.toFixed(2);
    firstNameField.focus();
    
    if (typeof showNotification === 'function') {
        showNotification(`Mitarbeiter "${firstName} ${lastName}" wurde hinzugefügt!`, 'success');
    }
    console.log(`✅ Mitarbeiter hinzugefügt: ${firstName} ${lastName} (${rank})`);
}

/**
 * Validiert Mitarbeiter-Eingaben
 */
function validateEmployeeInput(firstName, lastName, rank, hourlyRate) {
    if (!firstName || firstName.length < 2) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie einen gültigen Vornamen ein (min. 2 Zeichen)!', 'warning');
        }
        const field = document.getElementById('newEmployeeFirstName');
        if (field) field.focus();
        return false;
    }
    
    if (!lastName || lastName.length < 2) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie einen gültigen Nachnamen ein (min. 2 Zeichen)!', 'warning');
        }
        const field = document.getElementById('newEmployeeLastName');
        if (field) field.focus();
        return false;
    }
    
    if (firstName.length > 50 || lastName.length > 50) {
        if (typeof showNotification === 'function') {
            showNotification('Name ist zu lang (max. 50 Zeichen pro Feld)!', 'warning');
        }
        return false;
    }
    
    if (!rank || !employeeRanks[rank]) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte wählen Sie einen gültigen Rang aus!', 'warning');
        }
        return false;
    }
    
    if (isNaN(hourlyRate) || hourlyRate < 0) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie einen gültigen Stundenlohn ein!', 'warning');
        }
        const field = document.getElementById('newEmployeeHourlyRate');
        if (field) field.focus();
        return false;
    }
    
    if (hourlyRate > 999.99) {
        if (typeof showNotification === 'function') {
            showNotification('Stundenlohn ist zu hoch (max. 999,99€)!', 'warning');
        }
        return false;
    }
    
    return true;
}

/**
 * Öffnet das Mitarbeiter-Bearbeitung Modal
 */
function editEmployee(id) {
    const employee = employees.find(emp => emp.id == id);
    if (!employee) {
        console.error(`❌ Mitarbeiter mit ID ${id} nicht gefunden`);
        if (typeof showNotification === 'function') {
            showNotification('Mitarbeiter nicht gefunden!', 'error');
        }
        return;
    }
    
    console.log(`✏️ Bearbeite Mitarbeiter: ${employee.firstName} ${employee.lastName}`);
    
    editingEmployeeId = id;
    
    // Modal-Felder füllen
    const firstNameField = document.getElementById('editEmployeeFirstName');
    const lastNameField = document.getElementById('editEmployeeLastName');
    const rankField = document.getElementById('editEmployeeRank');
    const hourlyRateField = document.getElementById('editEmployeeHourlyRate');
    const activeField = document.getElementById('editEmployeeActive');
    
    if (firstNameField && lastNameField && rankField && hourlyRateField && activeField) {
        firstNameField.value = employee.firstName;
        lastNameField.value = employee.lastName;
        rankField.value = employee.rank;
        hourlyRateField.value = employee.hourlyRate.toFixed(2);
        activeField.checked = employee.isActive;
        firstNameField.focus();
    }
    
    if (typeof showModal === 'function') {
        showModal('editEmployeeModal');
    }
}

/**
 * Speichert die Mitarbeiter-Bearbeitung
 */
function saveEmployeeEdit() {
    if (!editingEmployeeId) {
        console.error('❌ Keine Mitarbeiter-ID zum Bearbeiten gefunden');
        return;
    }
    
    const employee = employees.find(emp => emp.id == editingEmployeeId);
    if (!employee) {
        console.error(`❌ Mitarbeiter mit ID ${editingEmployeeId} nicht gefunden`);
        if (typeof showNotification === 'function') {
            showNotification('Mitarbeiter nicht gefunden!', 'error');
        }
        return;
    }
    
    const firstNameField = document.getElementById('editEmployeeFirstName');
    const lastNameField = document.getElementById('editEmployeeLastName');
    const rankField = document.getElementById('editEmployeeRank');
    const hourlyRateField = document.getElementById('editEmployeeHourlyRate');
    const activeField = document.getElementById('editEmployeeActive');
    
    if (!firstNameField || !lastNameField || !rankField || !hourlyRateField || !activeField) {
        console.error('❌ Bearbeitungsfelder nicht gefunden');
        return;
    }
    
    const firstName = firstNameField.value.trim();
    const lastName = lastNameField.value.trim();
    const rank = rankField.value;
    const hourlyRate = parseFloat(hourlyRateField.value);
    const isActive = activeField.checked;
    
    // Validierung
    if (!validateEmployeeInput(firstName, lastName, rank, hourlyRate)) {
        return;
    }
    
    // Duplikat-Prüfung (außer für den aktuellen Mitarbeiter)
    if (employees.some(emp => 
        emp.id != editingEmployeeId && 
        emp.firstName.toLowerCase() === firstName.toLowerCase() && 
        emp.lastName.toLowerCase() === lastName.toLowerCase()
    )) {
        if (typeof showNotification === 'function') {
            showNotification('Ein Mitarbeiter mit diesem Namen existiert bereits!', 'warning');
        }
        return;
    }
    
    // Mitarbeiter aktualisieren
    const oldName = `${employee.firstName} ${employee.lastName}`;
    employee.firstName = firstName;
    employee.lastName = lastName;
    employee.rank = rank;
    employee.hourlyRate = hourlyRate;
    employee.isActive = isActive;
    employee.updatedAt = new Date().toISOString();
    
    saveEmployeeData();
    updateEmployeeDisplay();
    closeEmployeeEditModal();
    
    if (typeof showNotification === 'function') {
        showNotification(`Mitarbeiter "${oldName}" wurde aktualisiert!`, 'success');
    }
    console.log(`✅ Mitarbeiter aktualisiert: ${firstName} ${lastName}`);
}

/**
 * Schließt das Mitarbeiter-Bearbeitung Modal
 */
function closeEmployeeEditModal() {
    if (typeof hideModal === 'function') {
        hideModal('editEmployeeModal');
    }
    editingEmployeeId = null;
    
    // Felder leeren
    const fields = ['editEmployeeFirstName', 'editEmployeeLastName', 'editEmployeeRank', 'editEmployeeHourlyRate'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const activeField = document.getElementById('editEmployeeActive');
    if (activeField) activeField.checked = true;
}

/**
 * Löscht einen Mitarbeiter
 */
function deleteEmployee(id) {
    const employee = employees.find(emp => emp.id == id);
    if (!employee) {
        console.error(`❌ Mitarbeiter mit ID ${id} nicht gefunden`);
        return;
    }
    
    // Prüfen ob Mitarbeiter Arbeitsstunden hat
    const hasWorkSessions = workSessions.some(session => session.employeeId == id);
    
    let confirmMessage = `Mitarbeiter "${employee.firstName} ${employee.lastName}" wirklich löschen?`;
    if (hasWorkSessions) {
        confirmMessage += `\n\nWarnung: Der Mitarbeiter hat aufgezeichnete Arbeitsstunden. Diese werden ebenfalls gelöscht.`;
    }
    
    if (confirm(confirmMessage)) {
        // Arbeitsstunden des Mitarbeiters löschen
        for (let i = workSessions.length - 1; i >= 0; i--) {
            if (workSessions[i].employeeId == id) {
                workSessions.splice(i, 1);
            }
        }
        
        // Mitarbeiter löschen
        for (let i = employees.length - 1; i >= 0; i--) {
            if (employees[i].id == id) {
                employees.splice(i, 1);
            }
        }
        
        saveEmployeeData();
        updateEmployeeDisplay();
        
        if (typeof showNotification === 'function') {
            showNotification(`Mitarbeiter "${employee.firstName} ${employee.lastName}" wurde gelöscht!`, 'success');
        }
        console.log(`🗑️ Mitarbeiter gelöscht: ${employee.firstName} ${employee.lastName}`);
    }
}

// ===================================================================
// WORK SESSION MANAGEMENT
// ===================================================================

/**
 * Fügt eine neue Arbeitssession hinzu
 */
function addWorkSession() {
    console.log('⏰ Füge neue Arbeitssession hinzu...');
    
    const employeeField = document.getElementById('newSessionEmployee');
    const dateField = document.getElementById('newSessionDate');
    const startTimeField = document.getElementById('newSessionStartTime');
    const endTimeField = document.getElementById('newSessionEndTime');
    const descriptionField = document.getElementById('newSessionDescription');
    
    if (!employeeField || !dateField || !startTimeField || !endTimeField) {
        console.error('❌ Session-Eingabefelder nicht gefunden');
        if (typeof showNotification === 'function') {
            showNotification('Fehler: Eingabefelder nicht gefunden', 'error');
        }
        return;
    }
    
    const employeeId = employeeField.value;
    const date = dateField.value;
    const startTime = startTimeField.value;
    const endTime = endTimeField.value;
    const description = descriptionField ? descriptionField.value.trim() : '';
    
    // Validierung
    if (!validateWorkSessionInput(employeeId, date, startTime, endTime)) {
        return;
    }
    
    // Arbeitszeit berechnen
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    const hoursWorked = (endDateTime - startDateTime) / (1000 * 60 * 60);
    
    if (hoursWorked <= 0) {
        if (typeof showNotification === 'function') {
            showNotification('Endzeit muss nach der Startzeit liegen!', 'warning');
        }
        return;
    }
    
    if (hoursWorked > 24) {
        if (typeof showNotification === 'function') {
            showNotification('Arbeitszeit kann nicht mehr als 24 Stunden betragen!', 'warning');
        }
        return;
    }
    
    // Mitarbeiter finden für Stundenlohn
    const employee = employees.find(emp => emp.id == employeeId);
    if (!employee) {
        if (typeof showNotification === 'function') {
            showNotification('Mitarbeiter nicht gefunden!', 'error');
        }
        return;
    }
    
    const totalPay = hoursWorked * employee.hourlyRate;
    
    // Session erstellen
    const session = {
        id: generateEmployeeId(),
        employeeId: employeeId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        hoursWorked: Number(hoursWorked.toFixed(2)),
        hourlyRate: employee.hourlyRate,
        totalPay: Number(totalPay.toFixed(2)),
        description: description,
        isPaid: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Hinzufügen und speichern
    workSessions.push(session);
    saveEmployeeData();
    updateWorkSessionDisplay();
    
    // Eingabefelder leeren
    dateField.value = '';
    startTimeField.value = '';
    endTimeField.value = '';
    if (descriptionField) descriptionField.value = '';
    employeeField.focus();
    
    if (typeof showNotification === 'function') {
        showNotification(`Arbeitssession für ${employee.firstName} ${employee.lastName} hinzugefügt!`, 'success');
    }
    console.log(`✅ Arbeitssession hinzugefügt: ${hoursWorked}h für ${employee.firstName} ${employee.lastName}`);
}

/**
 * Validiert Arbeitssession-Eingaben
 */
function validateWorkSessionInput(employeeId, date, startTime, endTime) {
    if (!employeeId) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte wählen Sie einen Mitarbeiter aus!', 'warning');
        }
        return false;
    }
    
    if (!date) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie ein Datum ein!', 'warning');
        }
        const field = document.getElementById('newSessionDate');
        if (field) field.focus();
        return false;
    }
    
    if (!startTime) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie eine Startzeit ein!', 'warning');
        }
        const field = document.getElementById('newSessionStartTime');
        if (field) field.focus();
        return false;
    }
    
    if (!endTime) {
        if (typeof showNotification === 'function') {
            showNotification('Bitte geben Sie eine Endzeit ein!', 'warning');
        }
        const field = document.getElementById('newSessionEndTime');
        if (field) field.focus();
        return false;
    }
    
    return true;
}

/**
 * Setzt Standard-Datum für Arbeitssession
 */
function setDefaultDate() {
    const dateField = document.getElementById('newSessionDate');
    if (dateField && !dateField.value) {
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;
    }
}

/**
 * Markiert eine Session als bezahlt/unbezahlt
 */
function toggleSessionPaid(sessionId) {
    const session = workSessions.find(s => s.id == sessionId);
    if (!session) {
        console.error(`❌ Session mit ID ${sessionId} nicht gefunden`);
        return;
    }
    
    session.isPaid = !session.isPaid;
    session.updatedAt = new Date().toISOString();
    
    saveEmployeeData();
    updateWorkSessionDisplay();
    
    const employee = employees.find(emp => emp.id == session.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Unbekannt';
    const status = session.isPaid ? 'bezahlt' : 'unbezahlt';
    
    if (typeof showNotification === 'function') {
        showNotification(`Session von ${employeeName} als ${status} markiert!`, 'success');
    }
}

/**
 * Löscht eine Arbeitssession
 */
function deleteWorkSession(sessionId) {
    const session = workSessions.find(s => s.id == sessionId);
    if (!session) {
        console.error(`❌ Session mit ID ${sessionId} nicht gefunden`);
        return;
    }
    
    const employee = employees.find(emp => emp.id == session.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Unbekannt';
    
    if (confirm(`Arbeitssession von ${employeeName} (${session.date}) wirklich löschen?`)) {
        // Session löschen
        for (let i = workSessions.length - 1; i >= 0; i--) {
            if (workSessions[i].id == sessionId) {
                workSessions.splice(i, 1);
                break;
            }
        }
        
        saveEmployeeData();
        updateWorkSessionDisplay();
        
        if (typeof showNotification === 'function') {
            showNotification('Arbeitssession wurde gelöscht!', 'success');
        }
        console.log(`🗑️ Arbeitssession gelöscht: ${sessionId}`);
    }
}

// ===================================================================
// CALCULATIONS & STATISTICS
// ===================================================================

/**
 * Berechnet Statistiken für einen Mitarbeiter
 */
function calculateEmployeeStats(employeeId) {
    const employeeSessions = workSessions.filter(session => session.employeeId == employeeId);
    
    const totalHours = employeeSessions.reduce((sum, session) => sum + (session.hoursWorked || 0), 0);
    const totalPay = employeeSessions.reduce((sum, session) => sum + (session.totalPay || 0), 0);
    const paidSessions = employeeSessions.filter(session => session.isPaid);
    const unpaidSessions = employeeSessions.filter(session => !session.isPaid);
    const totalPaidAmount = paidSessions.reduce((sum, session) => sum + (session.totalPay || 0), 0);
    const totalUnpaidAmount = unpaidSessions.reduce((sum, session) => sum + (session.totalPay || 0), 0);
    
    return {
        totalHours: Number(totalHours.toFixed(2)),
        totalPay: Number(totalPay.toFixed(2)),
        totalSessions: employeeSessions.length,
        paidSessions: paidSessions.length,
        unpaidSessions: unpaidSessions.length,
        totalPaidAmount: Number(totalPaidAmount.toFixed(2)),
        totalUnpaidAmount: Number(totalUnpaidAmount.toFixed(2))
    };
}

/**
 * Berechnet Gesamtstatistiken
 */
function calculateOverallEmployeeStats() {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.isActive).length;
    const totalSessions = workSessions.length;
    const totalHours = workSessions.reduce((sum, session) => sum + (session.hoursWorked || 0), 0);
    const totalPay = workSessions.reduce((sum, session) => sum + (session.totalPay || 0), 0);
    const unpaidAmount = workSessions
        .filter(session => !session.isPaid)
        .reduce((sum, session) => sum + (session.totalPay || 0), 0);
    
    return {
        totalEmployees,
        activeEmployees,
        totalSessions,
        totalHours: Number(totalHours.toFixed(2)),
        totalPay: Number(totalPay.toFixed(2)),
        unpaidAmount: Number(unpaidAmount.toFixed(2))
    };
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Formatiert Zahlen als Währung für Mitarbeiter (Euro)
 */
function formatEmployeeCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '€0.00';
    }
    return `€${amount.toFixed(2)}`;
}

/**
 * Escape HTML für sichere Ausgabe
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================================================
// DATA MANAGEMENT
// ===================================================================

/**
 * Speichert Mitarbeiterdaten (verwendet database.js saveData)
 */
function saveEmployeeData() {
    console.log('💾 Speichere Mitarbeiterdaten über database.js...');
    
    // Verwende die globale saveData Funktion aus database.js
    if (typeof saveData === 'function') {
        saveData();
    } else {
        console.error('❌ saveData Funktion nicht verfügbar');
    }
}

/**
 * Aktualisiert Stundenlohn basierend auf ausgewähltem Rang (für HTML onchange)
 */
function updateHourlyRateFromRank(rank, targetFieldId) {
    console.log(`🔄 Aktualisiere Stundenlohn für Rang: ${rank}`);
    const targetField = document.getElementById(targetFieldId);
    if (targetField && employeeRanks[rank]) {
        targetField.value = employeeRanks[rank].hourlyRate.toFixed(2);
        console.log(`✅ Stundenlohn gesetzt: ${employeeRanks[rank].hourlyRate}€`);
    }
}

/**
 * Aktualisiert Stundenlohn für einen Rang (optional)
 */
function updateRankHourlyRate(rank, newRate) {
    if (employeeRanks[rank]) {
        employeeRanks[rank].hourlyRate = newRate;
        
        // Alle Mitarbeiter mit diesem Rang aktualisieren (optional)
        const confirmUpdate = confirm(`Stundenlohn für Rang "${rank}" auf ${formatEmployeeCurrency(newRate)} ändern?\n\nSollen alle Mitarbeiter mit diesem Rang automatisch aktualisiert werden?`);
        
        if (confirmUpdate) {
            employees.forEach(employee => {
                if (employee.rank === rank) {
                    employee.hourlyRate = newRate;
                    employee.updatedAt = new Date().toISOString();
                }
            });
            
            saveEmployeeData();
            updateEmployeeDisplay();
            
            if (typeof showNotification === 'function') {
                showNotification(`Stundenlohn für Rang "${rank}" aktualisiert!`, 'success');
            }
        }
    }
}

/**
 * Hilfsfunktion für generateId (lokale Implementation)
 */
function generateEmployeeId() {
    return 'emp_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===================================================================
// DISPLAY UPDATE FUNCTIONS (Placeholder)
// ===================================================================

/**
 * Aktualisiert die Mitarbeiter-Anzeige (wird in ui.js implementiert)
 */
function updateEmployeeDisplay() {
    if (typeof updateEmployeesDisplay === 'function') {
        updateEmployeesDisplay();
    }
    
    // Fallback: Aktualisiere alle Employee-bezogenen Displays
    if (typeof updateEmployeesOverviewDisplay === 'function') {
        updateEmployeesOverviewDisplay();
    }
    
    if (typeof updateEmployeesManagementDisplay === 'function') {
        updateEmployeesManagementDisplay();
    }
}

/**
 * Aktualisiert die Arbeitssession-Anzeige (wird in ui.js implementiert)
 */
function updateWorkSessionDisplay() {
    if (typeof updateWorkSessionsDisplay === 'function') {
        updateWorkSessionsDisplay();
    }
    
    // Fallback: Aktualisiere Time-Tracking Display
    if (typeof updateTimeTrackingDisplay === 'function') {
        updateTimeTrackingDisplay();
    }
}

/**
 * Aktualisiert Employee-Dropdowns
 */
function updateEmployeeDropdowns() {
    const dropdowns = document.querySelectorAll('#newSessionEmployee');
    
    dropdowns.forEach(dropdown => {
        if (!dropdown) return;
        
        const activeEmployees = employees.filter(emp => emp.isActive);
        
        if (activeEmployees.length === 0) {
            dropdown.innerHTML = '<option value="">Keine aktiven Mitarbeiter</option>';
            return;
        }
        
        dropdown.innerHTML = '<option value="">Mitarbeiter auswählen...</option>';
        
        activeEmployees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${employee.firstName} ${employee.lastName} (${employee.rank})`;
            dropdown.appendChild(option);
        });
    });
}

// ===================================================================
// INITIALIZATION
// ===================================================================

/**
 * Initialisiert das Mitarbeiter-System
 */
function initializeEmployeeSystem() {
    console.log('👥 Initialisiere Mitarbeiter-System...');
    
    // Warte bis database.js initialisiert ist
    if (typeof waitForInitialization === 'function') {
        waitForInitialization(() => {
            // Rang-Dropdown mit aktuellen Daten füllen
            updateRankDropdowns();
            updateEmployeeDropdowns();
            setDefaultDate();
            console.log(`✅ Mitarbeiter-System initialisiert - ${employees.length} Mitarbeiter, ${workSessions.length} Sessions`);
        });
    } else {
        // Fallback ohne Warten
        updateRankDropdowns();
        updateEmployeeDropdowns();
        setDefaultDate();
        console.log(`✅ Mitarbeiter-System initialisiert - Fallback-Modus`);
    }
}

/**
 * Aktualisiert alle Rang-Dropdowns
 */
function updateRankDropdowns() {
    console.log('🔄 Aktualisiere Rang-Dropdowns...');
    
    // Alle Select-Elemente mit Rang-Bezug finden
    const rankDropdowns = [
        document.getElementById('newEmployeeRank'),
        document.getElementById('editEmployeeRank')
    ].filter(dropdown => dropdown !== null);
    
    rankDropdowns.forEach(dropdown => {
        if (dropdown) {
            dropdown.innerHTML = '';
            Object.keys(employeeRanks).forEach(rank => {
                const option = document.createElement('option');
                option.value = rank;
                option.textContent = rank;
                if (rank === 'Mitarbeiter') {
                    option.selected = true;
                }
                dropdown.appendChild(option);
            });
            console.log(`✅ Dropdown ${dropdown.id} aktualisiert mit ${Object.keys(employeeRanks).length} Rängen`);
        }
    });
    
    // Standard-Stundenlohn setzen
    const hourlyRateField = document.getElementById('newEmployeeHourlyRate');
    if (hourlyRateField && !hourlyRateField.value) {
        hourlyRateField.value = employeeRanks['Mitarbeiter'].hourlyRate.toFixed(2);
    }
}

// Auto-Initialisierung (verzögert nach database.js)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Verzögerung um sicherzustellen, dass database.js zuerst lädt
        setTimeout(initializeEmployeeSystem, 500);
    });
} else {
    setTimeout(initializeEmployeeSystem, 500);
}

console.log('👥 Employees.js geladen');