// themes.js
// Theme-Management für Company OS

// Preset-Themes (du kannst beliebig erweitern)
window.presetThemes = [
    {
        name: "CompanyOS Classic",
        colors: {
            "--accent-primary": "#ffd700",
            "--accent-secondary": "#1e3c72",
            "--bg-main": "#232946",
            "--card-bg": "#353b5e",
            "--text-primary": "#fff",
            "--text-secondary": "#d1dbe6",
            "--text-muted": "#a2adc0",
            "--border-color": "#484f74",
            "--error-color": "#e74c3c"
        }
    },
    {
        name: "Dark Night",
        colors: {
            "--accent-primary": "#30e3ca",
            "--accent-secondary": "#22223b",
            "--bg-main": "#13131a",
            "--card-bg": "#1c1c2e",
            "--text-primary": "#e0e0e0",
            "--text-secondary": "#b0b0b8",
            "--text-muted": "#7e7e88",
            "--border-color": "#2c2c3e",
            "--error-color": "#ff3e41"
        }
    }
];

// Theme aus LocalStorage laden
window.loadTheme = function() {
    let theme = null;
    try {
        const stored = localStorage.getItem('company-os-theme');
        if (stored) theme = JSON.parse(stored);
    } catch(e) {
        localStorage.removeItem('company-os-theme');
        console.warn('Ungültiges Theme im LocalStorage wurde gelöscht.');
    }
    if (theme && typeof theme === 'object') {
        applyTheme(theme);
    } else {
        applyTheme(window.presetThemes[0].colors);
    }
    renderThemePresets();
    renderColorSettings();
};
// Theme anwenden
window.applyTheme = function(colors) {
    Object.entries(colors).forEach(([k, v]) => {
        document.documentElement.style.setProperty(k, v);
    });
    localStorage.setItem('company-os-theme', JSON.stringify(colors));
};

// Presets rendern
window.renderThemePresets = function() {
    const container = document.getElementById('preset-themes');
    if (!container) return;
    container.innerHTML = window.presetThemes.map((theme, idx) => `
        <div class="theme-preset-card" style="background:${theme.colors['--card-bg']}; color:${theme.colors['--text-primary']}">
            <div style="font-weight:bold; margin-bottom:6px;">${theme.name}</div>
            <div style="display:flex; gap:2px; margin-bottom:8px;">
                ${Object.values(theme.colors).slice(0,6).map(c => `<div style="width:20px; height:16px; background:${c}; border-radius:3px"></div>`).join('')}
            </div>
            <button class="btn btn-success" onclick="applyTheme(window.presetThemes[${idx}].colors)">Anwenden</button>
        </div>
    `).join('');
};

// Custom Color Settings
window.renderColorSettings = function() {
    const container = document.getElementById('color-settings');
    if (!container) return;
    const theme = JSON.parse(localStorage.getItem('company-os-theme') || 'null') || window.presetThemes[0].colors;
    container.innerHTML = Object.entries(theme).map(([k,v]) => `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
            <label style="flex:0 0 160px;">${k.replace('--','')}</label>
            <input type="color" value="${toHexColor(v)}" style="width:42px; height:32px" onchange="updateThemeColor('${k}',this.value)">
            <span style="font-family:monospace">${v}</span>
        </div>
    `).join('');
};

// Color-Konvertierung (Hex oder RGB)
function toHexColor(str) {
    if (!str.startsWith('#')) {
        // Versuche rgb(r,g,b) zu hex zu konvertieren
        const rgb = str.match(/rgb\\((\\d+), ?(\\d+), ?(\\d+)\\)/);
        if (rgb) {
            return "#" + ((1 << 24) + (+rgb[1] << 16) + (+rgb[2] << 8) + +rgb[3]).toString(16).slice(1);
        }
        return "#000000";
    }
    return str;
}

// Einzelne Farbe updaten
window.updateThemeColor = function(varname, value) {
    const theme = JSON.parse(localStorage.getItem('company-os-theme') || 'null') || window.presetThemes[0].colors;
    theme[varname] = value;
    applyTheme(theme);
    renderColorSettings();
};

// Theme speichern
window.saveCustomTheme = function() {
    const theme = JSON.parse(localStorage.getItem('company-os-theme') || 'null') || window.presetThemes[0].colors;
    localStorage.setItem('company-os-theme', JSON.stringify(theme));
    showNotification('Theme gespeichert!', 'success');
};

// Exportieren
window.exportTheme = function() {
    const theme = JSON.parse(localStorage.getItem('company-os-theme') || 'null') || window.presetThemes[0].colors;
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company-os-theme_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    showNotification('Theme exportiert!', 'success');
};

// Importieren
window.importTheme = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function() {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const theme = JSON.parse(e.target.result);
                applyTheme(theme);
                renderColorSettings();
                showNotification('Theme importiert!', 'success');
            } catch {
                showNotification('Fehler beim Import!', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

// Zufälliges Theme
window.generateRandomTheme = function() {
    const theme = Object.fromEntries(
        Object.keys(window.presetThemes[0].colors).map(k => [k, randomColor()])
    );
    applyTheme(theme);
    renderColorSettings();
    showNotification('Zufälliges Theme generiert!', 'success');
};
function randomColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
}

// Auf Default zurücksetzen
window.resetToDefault = function() {
    applyTheme(window.presetThemes[0].colors);
    renderColorSettings();
    showNotification('Theme zurückgesetzt!', 'success');
};

// Beim Laden Theme laden & rendern
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
});

console.log('✅ themes.js geladen');
