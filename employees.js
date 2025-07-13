// employees.js
// Mitarbeiterverwaltung für Company OS

// Datenstruktur: 
// [{ firstName, lastName, rank, hourlyRate, active }]

window.employees = JSON.parse(localStorage.getItem('company-os-employees') || '[]');
window.workSessions = JSON.parse(localStorage.getItem('company-os-workSessions') || '[]');

// Mitarbeiter-Übersicht rendern
window.renderEmployeesOverview = function() {
    const list = document.getElementById('employees-overview-content');
    if (!list) return;
    if (!window.employees || window.employees.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Mitarbeiter vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.employees.map((emp, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${emp.firstName} ${emp.lastName}</h3>
                <p>Rang: ${emp.rank || '-'}</p>
                <p>Stundenlohn: $${emp.hourlyRate?.toFixed(2) ?? '0.00'}</p>
                <p>Status: ${(emp.active === false) ? 'Inaktiv' : 'Aktiv'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editEmployee(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteEmployee(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Verwaltungsliste rendern
window.renderEmployeesManagement = function() {
    const list = document.getElementById('employees-management-list');
    if (!list) return;
    if (!window.employees || window.employees.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Mitarbeiter vorhanden.</div>`;
        return;
    }
    list.innerHTML = window.employees.map((emp, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${emp.firstName} ${emp.lastName}</h3>
                <p>Rang: ${emp.rank || '-'}</p>
                <p>Stundenlohn: $${emp.hourlyRate?.toFixed(2) ?? '0.00'}</p>
                <p>Status: ${(emp.active === false) ? 'Inaktiv' : 'Aktiv'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-success" onclick="editEmployee(${idx})">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteEmployee(${idx})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
};

// Neuen Mitarbeiter hinzufügen
window.addEmployee = function() {
    const firstName = document.getElementById('newEmployeeFirstName').value.trim();
    const lastName = document.getElementById('newEmployeeLastName').value.trim();
    const rank = document.getElementById('newEmployeeRank').value;
    const hourlyRate = parseFloat(document.getElementById('newEmployeeHourlyRate').value);
    if (!firstName || !lastName || isNaN(hourlyRate)) {
        showNotification('Bitte alle Felder ausfüllen!', 'error');
        return;
    }
    window.employees.push({
        firstName, lastName, rank, hourlyRate, active: true
    });
    saveEmployees();
    renderEmployeesOverview();
    renderEmployeesManagement();
    // Felder leeren
    document.getElementById('newEmployeeFirstName').value = '';
    document.getElementById('newEmployeeLastName').value = '';
    document.getElementById('newEmployeeHourlyRate').value = '';
    document.getElementById('newEmployeeRank').value = 'Aushilfe';
    hideModal('employeeModal');
    showNotification('Mitarbeiter hinzugefügt!', 'success');
};

// Mitarbeiter bearbeiten (öffnet Modal)
window.editEmployee = function(idx) {
    const emp = window.employees[idx];
    if (!emp) return;
    document.getElementById('editEmployeeFirstName').value = emp.firstName;
    document.getElementById('editEmployeeLastName').value = emp.lastName;
    document.getElementById('editEmployeeRank').value = emp.rank || 'Aushilfe';
    document.getElementById('editEmployeeHourlyRate').value = emp.hourlyRate || '';
    document.getElementById('editEmployeeActive').checked = emp.active !== false;
    window._editingEmployeeIndex = idx;
    showModal('editEmployeeModal');
};

// Mitarbeiter speichern nach Bearbeitung
window.saveEmployeeEdit = function() {
    const idx = window._editingEmployeeIndex;
    if (idx === undefined) return;
    const firstName = document.getElementById('editEmployeeFirstName').value.trim();
    const lastName = document.getElementById('editEmployeeLastName').value.trim();
    const rank = document.getElementById('editEmployeeRank').value;
    const hourlyRate = parseFloat(document.getElementById('editEmployeeHourlyRate').value);
    const active = document.getElementById('editEmployeeActive').checked;
    if (!firstName || !lastName || isNaN(hourlyRate)) {
        showNotification('Bitte alle Felder ausfüllen!', 'error');
        return;
    }
    window.employees[idx] = { firstName, lastName, rank, hourlyRate, active };
    saveEmployees();
    renderEmployeesOverview();
    renderEmployeesManagement();
    hideModal('editEmployeeModal');
    showNotification('Mitarbeiter gespeichert!', 'success');
    window._editingEmployeeIndex = undefined;
};

// Mitarbeiter löschen
window.deleteEmployee = function(idx) {
    if (!confirm('Wirklich löschen?')) return;
    window.employees.splice(idx, 1);
    saveEmployees();
    renderEmployeesOverview();
    renderEmployeesManagement();
    showNotification('Mitarbeiter gelöscht!', 'success');
};

// Stundenerfassung (Sessions) rendern
window.renderTimeTracking = function() {
    const list = document.getElementById('work-sessions-list');
    if (!list) return;
    if (!window.workSessions || window.workSessions.length === 0) {
        list.innerHTML = `<div class="empty-state">Noch keine Arbeitssessions erfasst.</div>`;
        return;
    }
    list.innerHTML = window.workSessions.map((session, idx) => {
        const emp = window.employees.find(e => e.firstName + ' ' + e.lastName === session.employeeName);
        const duration = getSessionDuration(session);
        const pay = emp && emp.hourlyRate ? (duration * emp.hourlyRate).toFixed(2) : '0.00';
        return `
            <div class="list-item">
                <div class="list-item-info">
                    <h3>${session.employeeName}</h3>
                    <p>${session.date} | ${session.startTime} - ${session.endTime}</p>
                    <p>Dauer: ${duration} h</p>
                    <p>Verdienst: $${pay}</p>
                    <p>Notizen: ${session.notes ?? ''}</p>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-danger" onclick="deleteWorkSession(${idx})">🗑️ Löschen</button>
                </div>
            </div>
        `;
    }).join('');
};

// Neue Arbeitssession hinzufügen
window.addWorkSession = function() {
    const empIdx = document.getElementById('newSessionEmployee').selectedIndex - 1;
    const emp = window.employees[empIdx];
    const date = document.getElementById('newSessionDate').value;
    const startTime = document.getElementById('newSessionStartTime').value;
    const endTime = document.getElementById('newSessionEndTime').value;
    const notes = document.getElementById('newSessionDescription').value.trim();
    if (!emp || !date || !startTime || !endTime) {
        showNotification('Bitte alle Felder ausfüllen!', 'error');
        return;
    }
    window.workSessions.push({
        employeeName: emp.firstName + ' ' + emp.lastName,
        date, startTime, endTime, notes
    });
    saveWorkSessions();
    renderTimeTracking();
    // Felder leeren
    document.getElementById('newSessionEmployee').selectedIndex = 0;
    document.getElementById('newSessionDate').value = '';
    document.getElementById('newSessionStartTime').value = '';
    document.getElementById('newSessionEndTime').value = '';
    document.getElementById('newSessionDescription').value = '';
    showNotification('Arbeitssession hinzugefügt!', 'success');
};

// Arbeitssession löschen
window.deleteWorkSession = function(idx) {
    if (!confirm('Wirklich löschen?')) return;
    window.workSessions.splice(idx, 1);
    saveWorkSessions();
    renderTimeTracking();
    showNotification('Session gelöscht!', 'success');
};

// Helper zum Speichern
function saveEmployees() {
    localStorage.setItem('company-os-employees', JSON.stringify(window.employees));
    if (typeof saveData === 'function') saveData();
}
function saveWorkSessions() {
    localStorage.setItem('company-os-workSessions', JSON.stringify(window.workSessions));
    if (typeof saveData === 'function') saveData();
}

// Session-Dauer (in Stunden, gerundet auf 2 Stellen)
function getSessionDuration(session) {
    if (!session || !session.startTime || !session.endTime) return 0;
    const [sh, sm] = session.startTime.split(':').map(Number);
    const [eh, em] = session.endTime.split(':').map(Number);
    let start = sh * 60 + sm;
    let end = eh * 60 + em;
    if (end < start) end += 24 * 60; // Über Mitternacht
    const mins = end - start;
    return Math.round((mins / 60) * 100) / 100;
}

// Beim Laden: Listen füllen
document.addEventListener('DOMContentLoaded', function() {
    renderEmployeesOverview();
    renderEmployeesManagement();
    renderTimeTracking();
});

console.log('✅ employees.js geladen');
