// database.js
// Zentrale Verwaltung der Speicherung (LocalStorage) & Backups für Company OS

// Datenbank-Initialisierung (lädt alle Daten ins window)
window.initDatabase = function() {
    window.items = JSON.parse(localStorage.getItem('company-os-items') || '[]');
    window.materials = JSON.parse(localStorage.getItem('company-os-materials') || '[]');
    window.customers = JSON.parse(localStorage.getItem('company-os-customers') || '[]');
    window.employees = JSON.parse(localStorage.getItem('company-os-employees') || '[]');
    window.timeBookings = JSON.parse(localStorage.getItem('company-os-timeBookings') || '[]');
    window.sales = JSON.parse(localStorage.getItem('company-os-sales') || '[]');
    window.materialPurchases = JSON.parse(localStorage.getItem('company-os-materialPurchases') || '[]');
    window.workSessions = JSON.parse(localStorage.getItem('company-os-workSessions') || '[]');
    window.activities = JSON.parse(localStorage.getItem('company-os-activities') || '[]');
    window.bilanzData = JSON.parse(localStorage.getItem('company-os-bilanzData') || '[]');
};

// Zentrale Speicherfunktion (wird von jedem Modul aufgerufen!)
window.saveData = function() {
    localStorage.setItem('company-os-items', JSON.stringify(window.items || []));
    localStorage.setItem('company-os-materials', JSON.stringify(window.materials || []));
    localStorage.setItem('company-os-customers', JSON.stringify(window.customers || []));
    localStorage.setItem('company-os-employees', JSON.stringify(window.employees || []));
    localStorage.setItem('company-os-timeBookings', JSON.stringify(window.timeBookings || []));
    localStorage.setItem('company-os-sales', JSON.stringify(window.sales || []));
    localStorage.setItem('company-os-materialPurchases', JSON.stringify(window.materialPurchases || []));
    localStorage.setItem('company-os-workSessions', JSON.stringify(window.workSessions || []));
    localStorage.setItem('company-os-activities', JSON.stringify(window.activities || []));
    localStorage.setItem('company-os-bilanzData', JSON.stringify(window.bilanzData || []));
};

// Backup als Datei exportieren
window.exportData = function() {
    const backup = {
        items: window.items || [],
        materials: window.materials || [],
        customers: window.customers || [],
        employees: window.employees || [],
        timeBookings: window.timeBookings || [],
        sales: window.sales || [],
        materialPurchases: window.materialPurchases || [],
        workSessions: window.workSessions || [],
        activities: window.activities || [],
        bilanzData: window.bilanzData || []
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company-os-backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    showNotification('Backup exportiert!', 'success');
};

// Backup in Zwischenablage kopieren
window.copyBackupToClipboard = function() {
    const backup = {
        items: window.items || [],
        materials: window.materials || [],
        customers: window.customers || [],
        employees: window.employees || [],
        timeBookings: window.timeBookings || [],
        sales: window.sales || [],
        materialPurchases: window.materialPurchases || [],
        workSessions: window.workSessions || [],
        activities: window.activities || [],
        bilanzData: window.bilanzData || []
    };
    navigator.clipboard.writeText(JSON.stringify(backup, null, 2)).then(() => {
        showNotification('Backup in Zwischenablage kopiert!', 'success');
    }).catch(() => {
        showNotification('Fehler beim Kopieren!', 'error');
    });
};

// Import-Funktionen (Datei oder Text)
window.importFromFile = function() {
    const input = document.getElementById('importFile');
    if (!input.files.length) return showNotification('Keine Datei gewählt!', 'warning');
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            restoreDatabase(data);
            showNotification('Backup importiert!', 'success');
        } catch {
            showNotification('Ungültige Datei!', 'error');
        }
    };
    reader.readAsText(file);
};
window.importFromText = function() {
    const textarea = document.getElementById('importText');
    if (!textarea.value.trim()) return showNotification('Keine Daten eingegeben!', 'warning');
    try {
        const data = JSON.parse(textarea.value);
        restoreDatabase(data);
        showNotification('Backup importiert!', 'success');
    } catch {
        showNotification('Ungültiges JSON!', 'error');
    }
};

// Daten zurücksetzen (alles löschen)
window.resetAllData = function() {
    if (!confirm('Wirklich ALLE Daten löschen? Das kann NICHT rückgängig gemacht werden!')) return;
    [
        'company-os-items',
        'company-os-materials',
        'company-os-customers',
        'company-os-employees',
        'company-os-timeBookings',
        'company-os-sales',
        'company-os-materialPurchases',
        'company-os-workSessions',
        'company-os-activities',
        'company-os-bilanzData'
    ].forEach(key => localStorage.removeItem(key));
    window.initDatabase();
    if (window.updateDisplay) window.updateDisplay('calculator');
    showNotification('Alle Daten gelöscht!', 'success');
    location.reload();
};

// Hilfsfunktion für Import/Restore
function restoreDatabase(data) {
    window.items = data.items || [];
    window.materials = data.materials || [];
    window.customers = data.customers || [];
    window.employees = data.employees || [];
    window.timeBookings = data.timeBookings || [];
    window.sales = data.sales || [];
    window.materialPurchases = data.materialPurchases || [];
    window.workSessions = data.workSessions || [];
    window.activities = data.activities || [];
    window.bilanzData = data.bilanzData || [];
    window.saveData();
    if (window.updateDisplay) window.updateDisplay('calculator');
}

// Status-Anzeige für Backup-Tab
window.renderDataStatus = function() {
    const el = document.getElementById('data-status');
    if (!el) return;
    el.innerHTML = `
        <div class="stats-header">
            <div class="stat-card"><div class="stat-value">${window.items?.length || 0}</div><div class="stat-label">Items</div></div>
            <div class="stat-card"><div class="stat-value">${window.materials?.length || 0}</div><div class="stat-label">Materialien</div></div>
            <div class="stat-card"><div class="stat-value">${window.customers?.length || 0}</div><div class="stat-label">Kunden</div></div>
            <div class="stat-card"><div class="stat-value">${window.sales?.length || 0}</div><div class="stat-label">Verkäufe</div></div>
            <div class="stat-card"><div class="stat-value">${window.materialPurchases?.length || 0}</div><div class="stat-label">Einkäufe</div></div>
            <div class="stat-card"><div class="stat-value">${window.employees?.length || 0}</div><div class="stat-label">Mitarbeiter</div></div>
            <div class="stat-card"><div class="stat-value">${window.timeBookings?.length || 0}</div><div class="stat-label">Zeitbuchungen</div></div>
            <div class="stat-card"><div class="stat-value">${window.workSessions?.length || 0}</div><div class="stat-label">Arbeitssessions</div></div>
            <div class="stat-card"><div class="stat-value">${window.activities?.length || 0}</div><div class="stat-label">Angebote</div></div>
            <div class="stat-card"><div class="stat-value">${window.bilanzData?.length || 0}</div><div class="stat-label">Bilanz-Datensätze</div></div>
        </div>
    `;
};

// Datenbank beim Laden initialisieren
document.addEventListener('DOMContentLoaded', function() {
    window.initDatabase();
    if (window.renderDataStatus) window.renderDataStatus();
});

console.log('✅ database.js geladen');
