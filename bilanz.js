// ===================================================================
// BILANZ.JS - Company OS Bilanz-Modul
// Financial Overview, Revenue/Expense Tracking, Profit/Loss Analysis
// ===================================================================

// Global bilanz data (verwendet alle anderen Module)
// Verwendet: sales, timeBookings, workSessions, materialPurchases aus database.js
let currentBilanzView = 'daily'; // daily, weekly, monthly
let currentBilanzDate = new Date();

// Bilanz-Kategorien
const bilanzCategories = {
    revenue: {
        label: 'Einnahmen',
        color: '#2ecc71',
        icon: '📈',
        subcategories: {
            sales: { label: 'Verkäufe', icon: '💰', color: '#27ae60' },
            timeBookings: { label: 'Zeitbuchungen', icon: '🎱', color: '#2ecc71' },
            other: { label: 'Sonstige', icon: '💵', color: '#16a085' }
        }
    },
    expenses: {
        label: 'Ausgaben',
        color: '#e74c3c',
        icon: '📉',
        subcategories: {
            materialPurchases: { label: 'Materialeinkäufe', icon: '🛒', color: '#c0392b' },
            employeeSalaries: { label: 'Mitarbeiterlöhne', icon: '👥', color: '#e74c3c' },
            other: { label: 'Sonstige', icon: '💸', color: '#a93226' }
        }
    }
};

// ===================================================================
// BILANZ CALCULATIONS
// ===================================================================

/**
 * Berechnet Bilanz für einen bestimmten Zeitraum
 */
function calculateBilanz(startDate, endDate) {
    console.log(`📊 Berechne Bilanz für ${startDate.toDateString()} bis ${endDate.toDateString()}`);
    
    const bilanz = {
        period: {
            start: startDate,
            end: endDate,
            type: getBilanzPeriodType(startDate, endDate)
        },
        revenue: {
            sales: calculateSalesRevenue(startDate, endDate),
            timeBookings: calculateTimeBookingsRevenue(startDate, endDate),
            total: 0
        },
        expenses: {
            materialPurchases: calculateMaterialPurchasesExpenses(startDate, endDate),
            employeeSalaries: calculateEmployeeSalariesExpenses(startDate, endDate),
            total: 0
        },
        profit: 0,
        profitMargin: 0,
        details: {
            salesDetails: getSalesDetails(startDate, endDate),
            timeBookingsDetails: getTimeBookingsDetails(startDate, endDate),
            materialPurchasesDetails: getMaterialPurchasesDetails(startDate, endDate),
            employeeSalariesDetails: getEmployeeSalariesDetails(startDate, endDate)
        }
    };
    
    // Gesamtsummen berechnen
    bilanz.revenue.total = bilanz.revenue.sales + bilanz.revenue.timeBookings;
    bilanz.expenses.total = bilanz.expenses.materialPurchases + bilanz.expenses.employeeSalaries;
    bilanz.profit = bilanz.revenue.total - bilanz.expenses.total;
    bilanz.profitMargin = bilanz.revenue.total > 0 ? (bilanz.profit / bilanz.revenue.total) * 100 : 0;
    
    // Werte auf 2 Dezimalstellen runden
    Object.keys(bilanz.revenue).forEach(key => {
        if (typeof bilanz.revenue[key] === 'number') {
            bilanz.revenue[key] = Number(bilanz.revenue[key].toFixed(2));
        }
    });
    
    Object.keys(bilanz.expenses).forEach(key => {
        if (typeof bilanz.expenses[key] === 'number') {
            bilanz.expenses[key] = Number(bilanz.expenses[key].toFixed(2));
        }
    });
    
    bilanz.profit = Number(bilanz.profit.toFixed(2));
    bilanz.profitMargin = Number(bilanz.profitMargin.toFixed(1));
    
    console.log(`✅ Bilanz berechnet: Gewinn ${bilanz.profit}€ (${bilanz.profitMargin}%)`);
    return bilanz;
}

/**
 * Ermittelt Zeitraum-Typ der Bilanz
 */
function getBilanzPeriodType(startDate, endDate) {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'daily';
    if (diffDays <= 7) return 'weekly';
    if (diffDays <= 31) return 'monthly';
    return 'custom';
}

/**
 * Berechnet Verkaufs-Einnahmen für Zeitraum
 */
function calculateSalesRevenue(startDate, endDate) {
    if (!sales || sales.length === 0) return 0;
    
    const relevantSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate && sale.isPaid;
    });
    
    return relevantSales.reduce((total, sale) => total + sale.totalAmount, 0);
}

/**
 * Berechnet Zeitbuchungs-Einnahmen für Zeitraum
 */
function calculateTimeBookingsRevenue(startDate, endDate) {
    if (!timeBookings || timeBookings.length === 0) return 0;
    
    const relevantBookings = timeBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= startDate && bookingDate <= endDate && booking.isPaid;
    });
    
    return relevantBookings.reduce((total, booking) => total + booking.finalPrice, 0);
}

/**
 * Berechnet Materialeinkauf-Ausgaben für Zeitraum
 */
function calculateMaterialPurchasesExpenses(startDate, endDate) {
    if (!materialPurchases || materialPurchases.length === 0) return 0;
    
    const relevantPurchases = materialPurchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= startDate && purchaseDate <= endDate;
    });
    
    return relevantPurchases.reduce((total, purchase) => total + purchase.totalCost, 0);
}

/**
 * Berechnet Mitarbeiterlohn-Ausgaben für Zeitraum
 */
function calculateEmployeeSalariesExpenses(startDate, endDate) {
    if (!workSessions || workSessions.length === 0) return 0;
    
    const relevantSessions = workSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startDate && sessionDate <= endDate && session.isPaid;
    });
    
    return relevantSessions.reduce((total, session) => total + session.totalPay, 0);
}

/**
 * Holt detaillierte Verkaufsinformationen
 */
function getSalesDetails(startDate, endDate) {
    if (!sales || sales.length === 0) return [];
    
    const relevantSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
    });
    
    return relevantSales.map(sale => ({
        id: sale.id,
        date: sale.date,
        amount: sale.totalAmount,
        items: sale.totalQuantity,
        customer: sale.customerId ? getCustomerName(sale.customerId) : 'Laufkundschaft',
        isPaid: sale.isPaid,
        profit: sale.totalProfit
    }));
}

/**
 * Holt detaillierte Zeitbuchungsinformationen
 */
function getTimeBookingsDetails(startDate, endDate) {
    if (!timeBookings || timeBookings.length === 0) return [];
    
    const relevantBookings = timeBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= startDate && bookingDate <= endDate;
    });
    
    return relevantBookings.map(booking => ({
        id: booking.id,
        date: booking.date,
        activity: booking.activityType,
        customer: booking.customerId ? getCustomerName(booking.customerId) : booking.walkInName,
        amount: booking.finalPrice,
        duration: booking.duration,
        isPaid: booking.isPaid,
        time: `${booking.startTime}-${booking.endTime}`
    }));
}

/**
 * Holt detaillierte Materialeinkaufsinformationen
 */
function getMaterialPurchasesDetails(startDate, endDate) {
    if (!materialPurchases || materialPurchases.length === 0) return [];
    
    const relevantPurchases = materialPurchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= startDate && purchaseDate <= endDate;
    });
    
    return relevantPurchases.map(purchase => ({
        id: purchase.id,
        date: purchase.date,
        material: getMaterialName(purchase.materialId),
        quantity: purchase.quantity,
        unitPrice: purchase.unitPrice,
        totalCost: purchase.totalCost,
        supplier: purchase.supplier || 'Unbekannt'
    }));
}

/**
 * Holt detaillierte Mitarbeiterlohn-Informationen
 */
function getEmployeeSalariesDetails(startDate, endDate) {
    if (!workSessions || workSessions.length === 0) return [];
    
    const relevantSessions = workSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startDate && sessionDate <= endDate;
    });
    
    // Gruppiere nach Mitarbeiter
    const employeeGroups = {};
    relevantSessions.forEach(session => {
        if (!employeeGroups[session.employeeId]) {
            employeeGroups[session.employeeId] = {
                employeeId: session.employeeId,
                employeeName: getEmployeeName(session.employeeId),
                sessions: [],
                totalHours: 0,
                totalPay: 0
            };
        }
        
        employeeGroups[session.employeeId].sessions.push(session);
        employeeGroups[session.employeeId].totalHours += session.hoursWorked;
        employeeGroups[session.employeeId].totalPay += session.totalPay;
    });
    
    return Object.values(employeeGroups).map(group => ({
        employeeId: group.employeeId,
        employeeName: group.employeeName,
        totalHours: Number(group.totalHours.toFixed(2)),
        totalPay: Number(group.totalPay.toFixed(2)),
        sessionCount: group.sessions.length,
        sessions: group.sessions
    }));
}

// ===================================================================
// PERIOD CALCULATIONS
// ===================================================================

/**
 * Berechnet Tagesbilanz
 */
function calculateDailyBilanz(date = new Date()) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return calculateBilanz(startDate, endDate);
}

/**
 * Berechnet Wochenbilanz
 */
function calculateWeeklyBilanz(date = new Date()) {
    const startDate = new Date(date);
    const dayOfWeek = startDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Montag als Wochenstart
    startDate.setDate(startDate.getDate() - daysToMonday);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    return calculateBilanz(startDate, endDate);
}

/**
 * Berechnet Monatsbilanz
 */
function calculateMonthlyBilanz(date = new Date()) {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return calculateBilanz(startDate, endDate);
}

/**
 * Berechnet Jahresbilanz
 */
function calculateYearlyBilanz(date = new Date()) {
    const startDate = new Date(date.getFullYear(), 0, 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date.getFullYear(), 11, 31);
    endDate.setHours(23, 59, 59, 999);
    
    return calculateBilanz(startDate, endDate);
}

/**
 * Berechnet Bilanz für benutzerdefinierten Zeitraum
 */
function calculateCustomBilanz(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return calculateBilanz(start, end);
}

// ===================================================================
// COMPARISON & TRENDS
// ===================================================================

/**
 * Vergleicht aktuelle Periode mit vorheriger
 */
function calculateBilanzComparison(currentBilanz) {
    const periodType = currentBilanz.period.type;
    let previousStart, previousEnd;
    
    const current = currentBilanz.period;
    const diffTime = current.end - current.start;
    
    // Berechne vorherige Periode
    previousEnd = new Date(current.start);
    previousEnd.setTime(previousEnd.getTime() - 1); // Ein Tag vor Start
    
    previousStart = new Date(previousEnd);
    previousStart.setTime(previousStart.getTime() - diffTime);
    
    const previousBilanz = calculateBilanz(previousStart, previousEnd);
    
    // Berechne Veränderungen
    const comparison = {
        previous: previousBilanz,
        changes: {
            revenue: {
                absolute: currentBilanz.revenue.total - previousBilanz.revenue.total,
                percentage: previousBilanz.revenue.total > 0 ? 
                    ((currentBilanz.revenue.total - previousBilanz.revenue.total) / previousBilanz.revenue.total) * 100 : 0
            },
            expenses: {
                absolute: currentBilanz.expenses.total - previousBilanz.expenses.total,
                percentage: previousBilanz.expenses.total > 0 ? 
                    ((currentBilanz.expenses.total - previousBilanz.expenses.total) / previousBilanz.expenses.total) * 100 : 0
            },
            profit: {
                absolute: currentBilanz.profit - previousBilanz.profit,
                percentage: previousBilanz.profit !== 0 ? 
                    ((currentBilanz.profit - previousBilanz.profit) / Math.abs(previousBilanz.profit)) * 100 : 0
            }
        }
    };
    
    // Runde Werte
    Object.keys(comparison.changes).forEach(key => {
        comparison.changes[key].absolute = Number(comparison.changes[key].absolute.toFixed(2));
        comparison.changes[key].percentage = Number(comparison.changes[key].percentage.toFixed(1));
    });
    
    return comparison;
}

/**
 * Berechnet Trend-Daten für Charts
 */
function calculateBilanzTrend(periodType = 'daily', periodCount = 30) {
    const trendData = [];
    const today = new Date();
    
    for (let i = periodCount - 1; i >= 0; i--) {
        let periodDate, bilanz;
        
        switch (periodType) {
            case 'daily':
                periodDate = new Date(today);
                periodDate.setDate(periodDate.getDate() - i);
                bilanz = calculateDailyBilanz(periodDate);
                break;
            case 'weekly':
                periodDate = new Date(today);
                periodDate.setDate(periodDate.getDate() - (i * 7));
                bilanz = calculateWeeklyBilanz(periodDate);
                break;
            case 'monthly':
                periodDate = new Date(today);
                periodDate.setMonth(periodDate.getMonth() - i);
                bilanz = calculateMonthlyBilanz(periodDate);
                break;
            default:
                continue;
        }
        
        trendData.push({
            date: periodDate.toISOString().split('T')[0],
            revenue: bilanz.revenue.total,
            expenses: bilanz.expenses.total,
            profit: bilanz.profit,
            profitMargin: bilanz.profitMargin
        });
    }
    
    return trendData;
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Ermittelt Kundenname anhand ID
 */
function getCustomerName(customerId) {
    if (!customers || !customerId) return 'Unbekannt';
    const customer = customers.find(c => c.id == customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unbekannt';
}

/**
 * Ermittelt Mitarbeitername anhand ID
 */
function getEmployeeName(employeeId) {
    if (!employees || !employeeId) return 'Unbekannt';
    const employee = employees.find(e => e.id == employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unbekannt';
}

/**
 * Ermittelt Materialname anhand ID
 */
function getMaterialName(materialId) {
    if (!materials || !materialId) return 'Unbekannt';
    const material = materials.find(m => m.id == materialId);
    return material ? material.name : 'Unbekannt';
}

/**
 * Formatiert Zeitraum für Anzeige
 */
function formatBilanzPeriod(bilanz) {
    const start = bilanz.period.start;
    const end = bilanz.period.end;
    const type = bilanz.period.type;
    
    const startStr = start.toLocaleDateString('de-DE');
    const endStr = end.toLocaleDateString('de-DE');
    
    switch (type) {
        case 'daily':
            return startStr;
        case 'weekly':
            return `KW ${getWeekNumber(start)} (${startStr} - ${endStr})`;
        case 'monthly':
            return start.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
        default:
            return `${startStr} - ${endStr}`;
    }
}

/**
 * Ermittelt Kalenderwoche
 */
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Exportiert Bilanz als CSV
 */
function exportBilanzCSV(bilanz) {
    const periodStr = formatBilanzPeriod(bilanz);
    
    const headers = ['Kategorie', 'Betrag (€)', 'Anteil (%)'];
    const rows = [
        ['=== EINNAHMEN ===', '', ''],
        ['Verkäufe', bilanz.revenue.sales.toFixed(2), ((bilanz.revenue.sales / bilanz.revenue.total) * 100).toFixed(1)],
        ['Zeitbuchungen', bilanz.revenue.timeBookings.toFixed(2), ((bilanz.revenue.timeBookings / bilanz.revenue.total) * 100).toFixed(1)],
        ['Einnahmen Gesamt', bilanz.revenue.total.toFixed(2), '100.0'],
        ['', '', ''],
        ['=== AUSGABEN ===', '', ''],
        ['Materialeinkäufe', bilanz.expenses.materialPurchases.toFixed(2), bilanz.expenses.total > 0 ? ((bilanz.expenses.materialPurchases / bilanz.expenses.total) * 100).toFixed(1) : '0.0'],
        ['Mitarbeiterlöhne', bilanz.expenses.employeeSalaries.toFixed(2), bilanz.expenses.total > 0 ? ((bilanz.expenses.employeeSalaries / bilanz.expenses.total) * 100).toFixed(1) : '0.0'],
        ['Ausgaben Gesamt', bilanz.expenses.total.toFixed(2), '100.0'],
        ['', '', ''],
        ['=== ERGEBNIS ===', '', ''],
        ['Gewinn/Verlust', bilanz.profit.toFixed(2), bilanz.profitMargin.toFixed(1)],
        ['Gewinnmarge (%)', bilanz.profitMargin.toFixed(1), '']
    ];
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bilanz-${periodStr.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
    showNotification('Bilanz als CSV exportiert!', 'success');
}

// ===================================================================
// VIEW MANAGEMENT
// ===================================================================

/**
 * Wechselt Bilanz-Ansicht
 */
function changeBilanzView(viewType, date = new Date()) {
    console.log(`📊 Wechsle Bilanz-Ansicht zu: ${viewType}`);
    
    currentBilanzView = viewType;
    currentBilanzDate = new Date(date);
    
    let bilanz;
    switch (viewType) {
        case 'daily':
            bilanz = calculateDailyBilanz(currentBilanzDate);
            break;
        case 'weekly':
            bilanz = calculateWeeklyBilanz(currentBilanzDate);
            break;
        case 'monthly':
            bilanz = calculateMonthlyBilanz(currentBilanzDate);
            break;
        case 'yearly':
            bilanz = calculateYearlyBilanz(currentBilanzDate);
            break;
        default:
            bilanz = calculateDailyBilanz(currentBilanzDate);
    }
    
    updateBilanzDisplay(bilanz);
    return bilanz;
}

/**
 * Navigiert in der Bilanz (vor/zurück)
 */
function navigateBilanz(direction) {
    const newDate = new Date(currentBilanzDate);
    
    switch (currentBilanzView) {
        case 'daily':
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
            break;
        case 'weekly':
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
            break;
        case 'monthly':
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
            break;
        case 'yearly':
            newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
            break;
    }
    
    return changeBilanzView(currentBilanzView, newDate);
}

// ===================================================================
// DISPLAY UPDATE FUNCTIONS (Placeholder)
// ===================================================================

/**
 * Aktualisiert die Bilanz-Anzeige (wird in ui.js implementiert)
 */
function updateBilanzDisplay(bilanz = null) {
    if (typeof updateBilanzDisplayUI === 'function') {
        updateBilanzDisplayUI(bilanz);
    } else {
        // Fallback: Berechne aktuelle Bilanz wenn keine übergeben
        if (!bilanz) {
            bilanz = changeBilanzView(currentBilanzView, currentBilanzDate);
        }
        console.log('📊 Bilanz-Update:', bilanz);
    }
}

// ===================================================================
// INITIALIZATION
// ===================================================================

/**
 * Initialisiert das Bilanz-System
 */
function initializeBilanzSystem() {
    console.log('📊 Initialisiere Bilanz-System...');
    
    // Warte bis database.js initialisiert ist
    if (typeof waitForInitialization === 'function') {
        waitForInitialization(() => {
            // Starte mit Tagesansicht für heute
            changeBilanzView('daily', new Date());
            console.log(`✅ Bilanz-System initialisiert - Ansicht: ${currentBilanzView}`);
        });
    } else {
        // Fallback ohne Warten
        changeBilanzView('daily', new Date());
        console.log(`✅ Bilanz-System initialisiert - Fallback-Modus`);
    }
}

// Auto-Initialisierung (verzögert nach allen anderen Modulen)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Längste Verzögerung da alle anderen Module geladen sein müssen
        setTimeout(initializeBilanzSystem, 1000);
    });
} else {
    setTimeout(initializeBilanzSystem, 1000);
}

console.log('📊 Bilanz.js geladen');