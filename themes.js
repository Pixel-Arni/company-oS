// ===================================================================
// THEMES.JS - Company OS Theme-System
// Theme Management, Color Picker, Import/Export
// ===================================================================

// Theme Konfiguration
const themes = {
    default: {
        name: "Standard",
        description: "Klassisches Blau-Gold Design",
        colors: {
            '--primary-bg': '#1e3c72',
            '--secondary-bg': '#2a5298',
            '--card-bg': 'rgba(255, 255, 255, 0.1)',
            '--sidebar-bg': 'rgba(0, 0, 0, 0.3)',
            '--accent-primary': '#ffd700',
            '--accent-secondary': '#ff6b6b',
            '--text-primary': '#ffffff',
            '--text-secondary': '#b0c4de',
            '--text-muted': '#888888',
            '--success-color': '#2ecc71',
            '--error-color': '#e74c3c',
            '--warning-color': '#f39c12',
            '--border-color': 'rgba(255, 255, 255, 0.2)',
            '--shadow-color': 'rgba(0, 0, 0, 0.3)'
        }
    },
    dark: {
        name: "Dunkel",
        description: "Modernes Dark Theme mit Neon-Akzenten",
        colors: {
            '--primary-bg': '#0f0f0f',
            '--secondary-bg': '#1a1a1a',
            '--card-bg': 'rgba(255, 255, 255, 0.05)',
            '--sidebar-bg': 'rgba(0, 0, 0, 0.7)',
            '--accent-primary': '#00ff88',
            '--accent-secondary': '#0099ff',
            '--text-primary': '#ffffff',
            '--text-secondary': '#cccccc',
            '--text-muted': '#666666',
            '--success-color': '#00ff88',
            '--error-color': '#ff4444',
            '--warning-color': '#ffaa00',
            '--border-color': 'rgba(255, 255, 255, 0.1)',
            '--shadow-color': 'rgba(0, 0, 0, 0.5)'
        }
    },
    purple: {
        name: "Violett",
        description: "Elegantes Lila-Theme mit warmen Akzenten",
        colors: {
            '--primary-bg': '#2d1b69',
            '--secondary-bg': '#9b59b6',
            '--card-bg': 'rgba(155, 89, 182, 0.2)',
            '--sidebar-bg': 'rgba(45, 27, 105, 0.8)',
            '--accent-primary': '#e74c3c',
            '--accent-secondary': '#f39c12',
            '--text-primary': '#ffffff',
            '--text-secondary': '#d1c4e9',
            '--text-muted': '#9e9e9e',
            '--success-color': '#27ae60',
            '--error-color': '#e74c3c',
            '--warning-color': '#f39c12',
            '--border-color': 'rgba(155, 89, 182, 0.3)',
            '--shadow-color': 'rgba(45, 27, 105, 0.4)'
        }
    },
    green: {
        name: "Grün",
        description: "Natürliches Grün-Theme für Umweltbewusste",
        colors: {
            '--primary-bg': '#1b5e20',
            '--secondary-bg': '#2e7d32',
            '--card-bg': 'rgba(76, 175, 80, 0.2)',
            '--sidebar-bg': 'rgba(27, 94, 32, 0.8)',
            '--accent-primary': '#ffc107',
            '--accent-secondary': '#ff9800',
            '--text-primary': '#ffffff',
            '--text-secondary': '#c8e6c9',
            '--text-muted': '#81c784',
            '--success-color': '#4caf50',
            '--error-color': '#f44336',
            '--warning-color': '#ff9800',
            '--border-color': 'rgba(76, 175, 80, 0.3)',
            '--shadow-color': 'rgba(27, 94, 32, 0.4)'
        }
    },
    ocean: {
        name: "Ozean",
        description: "Beruhigendes Blau-Theme wie das Meer",
        colors: {
            '--primary-bg': '#0d47a1',
            '--secondary-bg': '#1976d2',
            '--card-bg': 'rgba(33, 150, 243, 0.2)',
            '--sidebar-bg': 'rgba(13, 71, 161, 0.8)',
            '--accent-primary': '#00bcd4',
            '--accent-secondary': '#009688',
            '--text-primary': '#ffffff',
            '--text-secondary': '#b3e5fc',
            '--text-muted': '#90caf9',
            '--success-color': '#4caf50',
            '--error-color': '#f44336',
            '--warning-color': '#ff9800',
            '--border-color': 'rgba(33, 150, 243, 0.3)',
            '--shadow-color': 'rgba(13, 71, 161, 0.4)'
        }
    },
    sunset: {
        name: "Sonnenuntergang",
        description: "Warmes Orange-Theme wie ein Sonnenuntergang",
        colors: {
            '--primary-bg': '#bf360c',
            '--secondary-bg': '#ff5722',
            '--card-bg': 'rgba(255, 87, 34, 0.2)',
            '--sidebar-bg': 'rgba(191, 54, 12, 0.8)',
            '--accent-primary': '#ffc107',
            '--accent-secondary': '#ff9800',
            '--text-primary': '#ffffff',
            '--text-secondary': '#ffccbc',
            '--text-muted': '#ff8a65',
            '--success-color': '#4caf50',
            '--error-color': '#f44336',
            '--warning-color': '#ff9800',
            '--border-color': 'rgba(255, 87, 34, 0.3)',
            '--shadow-color': 'rgba(191, 54, 12, 0.4)'
        }
    },
    cyberpunk: {
        name: "Cyberpunk",
        description: "Futuristisches Neon-Theme",
        colors: {
            '--primary-bg': '#0a0a0a',
            '--secondary-bg': '#1a0033',
            '--card-bg': 'rgba(255, 0, 255, 0.1)',
            '--sidebar-bg': 'rgba(0, 0, 0, 0.8)',
            '--accent-primary': '#ff0080',
            '--accent-secondary': '#00ffff',
            '--text-primary': '#ffffff',
            '--text-secondary': '#ff80ff',
            '--text-muted': '#666666',
            '--success-color': '#00ff00',
            '--error-color': '#ff0040',
            '--warning-color': '#ffff00',
            '--border-color': 'rgba(255, 0, 255, 0.3)',
            '--shadow-color': 'rgba(255, 0, 255, 0.2)'
        }
    },
    minimal: {
        name: "Minimal",
        description: "Reduziertes Design für Fokus aufs Wesentliche",
        colors: {
            '--primary-bg': '#f8f9fa',
            '--secondary-bg': '#e9ecef',
            '--card-bg': 'rgba(255, 255, 255, 0.8)',
            '--sidebar-bg': 'rgba(248, 249, 250, 0.95)',
            '--accent-primary': '#007bff',
            '--accent-secondary': '#6c757d',
            '--text-primary': '#212529',
            '--text-secondary': '#6c757d',
            '--text-muted': '#adb5bd',
            '--success-color': '#28a745',
            '--error-color': '#dc3545',
            '--warning-color': '#ffc107',
            '--border-color': 'rgba(0, 0, 0, 0.125)',
            '--shadow-color': 'rgba(0, 0, 0, 0.15)'
        }
    }
};

// Color settings für Custom Theme Editor
const colorSettings = [
    { key: '--primary-bg', label: 'Primär Hintergrund', category: 'backgrounds' },
    { key: '--secondary-bg', label: 'Sekundär Hintergrund', category: 'backgrounds' },
    { key: '--card-bg', label: 'Karten Hintergrund', category: 'backgrounds' },
    { key: '--sidebar-bg', label: 'Sidebar Hintergrund', category: 'backgrounds' },
    { key: '--accent-primary', label: 'Primär Akzent', category: 'accents' },
    { key: '--accent-secondary', label: 'Sekundär Akzent', category: 'accents' },
    { key: '--text-primary', label: 'Primär Text', category: 'text' },
    { key: '--text-secondary', label: 'Sekundär Text', category: 'text' },
    { key: '--text-muted', label: 'Gedämpfter Text', category: 'text' },
    { key: '--success-color', label: 'Erfolg Farbe', category: 'status' },
    { key: '--error-color', label: 'Fehler Farbe', category: 'status' },
    { key: '--warning-color', label: 'Warnung Farbe', category: 'status' },
    { key: '--border-color', label: 'Rahmen Farbe', category: 'ui' },
    { key: '--shadow-color', label: 'Schatten Farbe', category: 'ui' }
];

// ===================================================================
// THEME MANAGEMENT
// ===================================================================

/**
 * Initialisiert das Theme-System
 */
function initializeSettings() {
    console.log('🎨 Initialisiere Theme-System...');
    
    updatePresetThemes();
    updateColorSettings();
    
    // Theme aus LocalStorage laden
    loadTheme();
    
    console.log('✅ Theme-System initialisiert');
}

/**
 * Aktualisiert die Preset-Theme Anzeige
 */
function updatePresetThemes() {
    const container = document.getElementById('preset-themes');
    if (!container) {
        console.warn('⚠️ Preset-Themes Container nicht gefunden');
        return;
    }
    
    const currentTheme = getCurrentThemeName();
    
    const themesHTML = Object.entries(themes).map(([key, theme]) => {
        const isActive = key === currentTheme;
        
        return `
            <div class="theme-preset ${isActive ? 'active' : ''}" 
                 onclick="applyTheme('${key}')" 
                 style="background: ${theme.colors['--primary-bg']}; border-color: ${theme.colors['--accent-primary']};"
                 title="${theme.description}">
                <h4 style="color: ${theme.colors['--text-primary']}; margin-bottom: 5px;">${theme.name}</h4>
                <div style="display: flex; gap: 3px; justify-content: center; margin-bottom: 8px;">
                    <div style="width: 20px; height: 20px; border-radius: 50%; background: ${theme.colors['--accent-primary']};"></div>
                    <div style="width: 20px; height: 20px; border-radius: 50%; background: ${theme.colors['--accent-secondary']};"></div>
                    <div style="width: 20px; height: 20px; border-radius: 50%; background: ${theme.colors['--success-color']};"></div>
                </div>
                <small style="color: ${theme.colors['--text-secondary']}; font-size: 0.75rem; opacity: 0.8;">
                    ${theme.description}
                </small>
            </div>
        `;
    }).join('');
    
    container.innerHTML = themesHTML;
}

/**
 * Aktualisiert die Color Settings UI
 */
function updateColorSettings() {
    const container = document.getElementById('color-settings');
    if (!container) {
        console.warn('⚠️ Color-Settings Container nicht gefunden');
        return;
    }
    
    // Gruppiere nach Kategorien
    const categories = {
        backgrounds: 'Hintergründe',
        text: 'Text-Farben',
        accents: 'Akzent-Farben',
        status: 'Status-Farben',
        ui: 'UI-Elemente'
    };
    
    const groupedSettings = {};
    colorSettings.forEach(setting => {
        if (!groupedSettings[setting.category]) {
            groupedSettings[setting.category] = [];
        }
        groupedSettings[setting.category].push(setting);
    });
    
    const settingsHTML = Object.entries(categories).map(([categoryKey, categoryName]) => {
        const categorySettings = groupedSettings[categoryKey] || [];
        
        const settingsItems = categorySettings.map(setting => {
            const currentValue = getComputedStyle(document.documentElement).getPropertyValue(setting.key).trim();
            const hexValue = rgbToHex(currentValue);
            
            return `
                <div class="color-picker-group">
                    <label>${setting.label}:</label>
                    <input type="color" class="color-picker" 
                           value="${hexValue}" 
                           onchange="updateCustomColor('${setting.key}', this.value)"
                           title="Farbe für ${setting.label} ändern">
                    <div class="color-preview" style="background: ${currentValue};" title="${currentValue}">
                        ${hexValue.toUpperCase()}
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="color-category">
                <h4 style="color: var(--accent-primary); margin: 15px 0 10px 0; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">
                    ${categoryName}
                </h4>
                ${settingsItems}
            </div>
        `;
    }).join('');
    
    container.innerHTML = settingsHTML;
}

/**
 * Wendet ein Theme an
 */
function applyTheme(themeName) {
    console.log(`🎨 Wende Theme an: ${themeName}`);
    
    const theme = themes[themeName];
    if (!theme) {
        console.error(`❌ Theme nicht gefunden: ${themeName}`);
        showNotification(`Theme "${themeName}" nicht gefunden!`, 'error');
        return;
    }
    
    // CSS Variablen setzen
    Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });
    
    // Theme in LocalStorage speichern
    localStorage.setItem('company-os-theme', themeName);
    
    // UI aktualisieren
    updatePresetThemes();
    updateColorSettings();
    
    // Notification anzeigen
    showNotification(`Theme "${theme.name}" wurde angewendet!`, 'success');
    
    // Theme-Wechsel animieren
    animateThemeChange();
    
    console.log(`✅ Theme "${theme.name}" angewendet`);
}

/**
 * Lädt das gespeicherte Theme
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('company-os-theme');
    const customTheme = localStorage.getItem('company-os-custom-theme');
    
    if (savedTheme === 'custom' && customTheme) {
        console.log('🎨 Lade Custom Theme...');
        try {
            const theme = JSON.parse(customTheme);
            Object.entries(theme).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
            updateColorSettings();
            console.log('✅ Custom Theme geladen');
        } catch (error) {
            console.error('❌ Fehler beim Laden des Custom Themes:', error);
            applyTheme('default');
        }
    } else if (savedTheme && themes[savedTheme]) {
        console.log(`🎨 Lade Theme: ${savedTheme}`);
        applyTheme(savedTheme);
    } else {
        console.log('🎨 Lade Standard-Theme...');
        applyTheme('default');
    }
}

/**
 * Ermittelt den aktuellen Theme-Namen
 */
function getCurrentThemeName() {
    return localStorage.getItem('company-os-theme') || 'default';
}

// ===================================================================
// CUSTOM THEME EDITOR
// ===================================================================

/**
 * Aktualisiert eine einzelne Farbe
 */
function updateCustomColor(property, value) {
    document.documentElement.style.setProperty(property, value);
    updateColorSettings();
    
    // Automatisch als Custom Theme markieren
    localStorage.setItem('company-os-theme', 'custom');
    updatePresetThemes();
    
    console.log(`🎨 Farbe aktualisiert: ${property} = ${value}`);
}

/**
 * Speichert das aktuelle Custom Theme
 */
function saveCustomTheme() {
    console.log('💾 Speichere Custom Theme...');
    
    const customTheme = {};
    colorSettings.forEach(setting => {
        const value = getComputedStyle(document.documentElement).getPropertyValue(setting.key).trim();
        customTheme[setting.key] = value;
    });
    
    localStorage.setItem('company-os-custom-theme', JSON.stringify(customTheme));
    localStorage.setItem('company-os-theme', 'custom');
    
    updatePresetThemes();
    
    showNotification('✅ Individuelles Theme gespeichert!', 'success');
    console.log('✅ Custom Theme gespeichert');
}

/**
 * Setzt das Theme auf Standard zurück
 */
function resetToDefault() {
    if (confirm('Theme auf Standard zurücksetzen?\n\nAlle individuellen Anpassungen gehen verloren.')) {
        console.log('🔄 Setze Theme zurück...');
        
        // Custom Theme löschen
        localStorage.removeItem('company-os-custom-theme');
        
        // Standard Theme anwenden
        applyTheme('default');
        
        showNotification('Theme wurde zurückgesetzt!', 'success');
        console.log('✅ Theme zurückgesetzt');
    }
}

// ===================================================================
// THEME IMPORT/EXPORT
// ===================================================================

/**
 * Exportiert das aktuelle Theme
 */
function exportTheme() {
    console.log('📤 Exportiere aktuelles Theme...');
    
    const currentTheme = {};
    colorSettings.forEach(setting => {
        currentTheme[setting.key] = getComputedStyle(document.documentElement).getPropertyValue(setting.key).trim();
    });
    
    const themeData = {
        name: 'Benutzerdefiniert',
        description: 'Exportiertes Custom Theme',
        colors: currentTheme,
        version: '1.0',
        timestamp: new Date().toISOString(),
        exportedFrom: 'Company OS'
    };
    
    const dataStr = JSON.stringify(themeData, null, 2);
    
    // In Zwischenablage kopieren
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(dataStr).then(() => {
            showNotification('✅ Theme in Zwischenablage kopiert!', 'success');
        }).catch(err => {
            console.error('Clipboard-Fehler:', err);
            fallbackCopyToClipboard(dataStr);
        });
    } else {
        fallbackCopyToClipboard(dataStr);
    }
    
    console.log('✅ Theme exportiert');
}

/**
 * Importiert ein Theme
 */
function importTheme() {
    const themeData = prompt('Fügen Sie die Theme-Daten ein:');
    
    if (!themeData) return;
    
    console.log('📥 Importiere Theme...');
    
    try {
        const theme = JSON.parse(themeData);
        
        // Validierung
        if (!theme.colors || typeof theme.colors !== 'object') {
            throw new Error('Ungültiges Theme-Format: Farben fehlen');
        }
        
        // Mindestens die wichtigsten Farben prüfen
        const requiredColors = ['--primary-bg', '--text-primary', '--accent-primary'];
        const missingColors = requiredColors.filter(color => !theme.colors[color]);
        
        if (missingColors.length > 0) {
            throw new Error(`Fehlende Farben: ${missingColors.join(', ')}`);
        }
        
        // Theme anwenden
        Object.entries(theme.colors).forEach(([key, value]) => {
            if (colorSettings.some(setting => setting.key === key)) {
                document.documentElement.style.setProperty(key, value);
            }
        });
        
        // Als Custom Theme speichern
        saveCustomTheme();
        
        showNotification(`✅ Theme "${theme.name || 'Unbekannt'}" importiert!`, 'success');
        console.log('✅ Theme importiert');
        
    } catch (error) {
        console.error('❌ Import-Fehler:', error);
        showNotification(`❌ Fehler beim Importieren: ${error.message}`, 'error');
    }
}

/**
 * Erstellt ein neues Theme basierend auf einem bestehenden
 */
function createThemeVariant(baseThemeName, variantName, modifications) {
    const baseTheme = themes[baseThemeName];
    if (!baseTheme) {
        console.error(`❌ Basis-Theme nicht gefunden: ${baseThemeName}`);
        return null;
    }
    
    const newTheme = {
        name: variantName,
        description: `Variante von ${baseTheme.name}`,
        colors: { ...baseTheme.colors, ...modifications }
    };
    
    // Theme temporär hinzufügen
    themes[variantName.toLowerCase().replace(/\s+/g, '_')] = newTheme;
    
    return newTheme;
}

// ===================================================================
// UTILITY FUNKTIONEN
// ===================================================================

/**
 * Konvertiert RGB zu Hex
 */
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    
    if (rgb.startsWith('rgba') || rgb.startsWith('rgb')) {
        const values = rgb.match(/rgba?\(([^)]+)\)/)[1].split(',').map(v => parseInt(v.trim()));
        return '#' + values.slice(0, 3).map(v => {
            const hex = v.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    return '#ffffff'; // Fallback
}

/**
 * Konvertiert Hex zu RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Berechnet die Helligkeit einer Farbe
 */
function getColorBrightness(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    // Relative Luminanz berechnen
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

/**
 * Bestimmt ob Text hell oder dunkel sein sollte
 */
function getContrastColor(backgroundColor) {
    const brightness = getColorBrightness(backgroundColor);
    return brightness > 128 ? '#000000' : '#ffffff';
}

/**
 * Animiert Theme-Wechsel
 */
function animateThemeChange() {
    document.body.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

/**
 * Fallback für Zwischenablage
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('✅ Theme in Zwischenablage kopiert!', 'success');
    } catch (err) {
        console.error('Fallback-Copy-Fehler:', err);
        showNotification('❌ Fehler beim Kopieren', 'error');
    }
    
    document.body.removeChild(textArea);
}

/**
 * Generiert ein zufälliges Theme
 */
function generateRandomTheme() {
    console.log('🎲 Generiere zufälliges Theme...');
    
    const randomColors = {
        '--primary-bg': `hsl(${Math.random() * 360}, 70%, 30%)`,
        '--secondary-bg': `hsl(${Math.random() * 360}, 60%, 40%)`,
        '--accent-primary': `hsl(${Math.random() * 360}, 80%, 60%)`,
        '--accent-secondary': `hsl(${Math.random() * 360}, 70%, 55%)`,
        '--success-color': `hsl(120, 70%, 50%)`,
        '--error-color': `hsl(0, 70%, 50%)`,
        '--warning-color': `hsl(45, 80%, 55%)`
    };
    
    // Basis-Farben beibehalten
    const currentTheme = {};
    colorSettings.forEach(setting => {
        currentTheme[setting.key] = randomColors[setting.key] || 
            getComputedStyle(document.documentElement).getPropertyValue(setting.key).trim();
    });
    
    // Theme anwenden
    Object.entries(currentTheme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });
    
    localStorage.setItem('company-os-theme', 'custom');
    updatePresetThemes();
    updateColorSettings();
    
    showNotification('🎲 Zufälliges Theme generiert!', 'success');
    console.log('✅ Zufälliges Theme generiert');
}

/**
 * Erstellt Theme-Vorschau
 */
function previewTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    
    // Temporäre Vorschau ohne Speichern
    Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });
    
    // Nach 3 Sekunden zurück zum ursprünglichen Theme
    setTimeout(() => {
        loadTheme();
    }, 3000);
    
    showNotification(`Vorschau: ${theme.name} (3 Sekunden)`, 'info');
}

// ===================================================================
// AUTO-INITIALISIERUNG
// ===================================================================

// Theme-System beim DOM-Load initialisieren
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeSettings, 100);
    });
} else {
    setTimeout(initializeSettings, 100);
}

console.log('🌈 Themes.js geladen');