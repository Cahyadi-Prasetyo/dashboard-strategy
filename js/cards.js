// ============================================================
// CARDS — 9 Indicator Cards below the map
// ============================================================

const CARD_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#EC4899', '#6366F1', '#14B8A6'
];

// Format currency (PDRB Per Kapita)
function formatCurrency(value) {
    if (value == null) return '-';
    if (value >= 1000000) {
        return 'Rp ' + (value / 1000000).toFixed(1) + ' Juta';
    }
    if (value >= 1000) {
        return 'Rp ' + (value / 1000).toFixed(0) + ' Ribu';
    }
    return 'Rp ' + value.toLocaleString('id-ID');
}

// Format indicator value
function formatValue(indicator, value, triwulan) {
    if (value == null || value === undefined) return '-';

    // Handle triwulanan PE
    if (indicator.isTriwulanan && typeof value === 'object') {
        const twVal = value[triwulan];
        return twVal != null ? twVal.toFixed(2) : '-';
    }

    if (indicator.formatCurrency) {
        return formatCurrency(value);
    }

    if (typeof value === 'number') {
        return value.toFixed(2);
    }

    return String(value);
}

// Get PE display value (tahunan or triwulanan based on selected triwulan)
function getPEValue(regionData, triwulan, subType) {
    if (!regionData || !regionData.indicators) return null;

    // Get the triwulanan sub-indicator
    const key = 'pertumbuhan_ekonomi_' + subType;
    const twData = regionData.indicators[key];

    if (twData && typeof twData === 'object') {
        return twData[triwulan];
    }

    // Fallback to tahunan
    return regionData.indicators.pertumbuhan_ekonomi;
}

// Create a single card HTML
function createCardHTML(indicator, value, regionName, accentColor) {
    const displayValue = (value == null || value === '-') ? '-' : value;
    const isNoData = displayValue === '-';

    return '<div class="indicator-card" style="--card-accent: ' + accentColor + '">' +
        '<div class="card-header">' +
            '<span class="card-icon">' + indicator.icon + '</span>' +
            '<span class="card-label">' + indicator.label + '</span>' +
        '</div>' +
        '<div class="card-value' + (isNoData ? ' no-data' : '') + '">' + displayValue + '</div>' +
        '<div class="card-unit">' + indicator.unit + '</div>' +
        (regionName ? '<div class="card-region-name">' + regionName + '</div>' : '') +
    '</div>';
}

// Render cards for a specific region
function renderCardsForRegion(regionId, triwulan) {
    const regionData = INDICATOR_DATA.find(function (d) { return d.id === regionId; });
    if (!regionData) return '';

    let html = '';

    INDICATORS_CONFIG.forEach(function (indicator, index) {
        let value;

        if (indicator.id === 'pertumbuhan_ekonomi') {
            // Show tahunan value in the card
            value = regionData.indicators.pertumbuhan_ekonomi;
            if (typeof value === 'number') value = value.toFixed(2);
        } else {
            value = regionData.indicators[indicator.id];
            value = formatValue(indicator, value, triwulan);
        }

        html += createCardHTML(indicator, value, null, CARD_COLORS[index]);
    });

    return html;
}

// Render all cards
function renderCards(regionId) {
    const container = document.getElementById('cards-container');
    const label = document.getElementById('cards-region-label');
    const triwulan = document.getElementById('filter-triwulan').value;

    if (!container) return;

    // Single region selected
    if (regionId) {
        const region = REGIONS.find(function (r) { return r.id === regionId; });
        if (label) {
            label.textContent = region ? region.name : regionId;
            label.style.borderColor = REGION_COLORS[regionId] || 'rgba(6, 182, 212, 0.25)';
            label.style.color = REGION_COLORS[regionId] || 'var(--accent-cyan)';
            label.style.background = (REGION_COLORS[regionId] || 'rgba(6,182,212,') + '15)';
        }

        container.innerHTML = '<div class="cards-grid">' + renderCardsForRegion(regionId, triwulan) + '</div>';
        return;
    }

    // "Semua" — show all regions grouped
    if (label) {
        label.textContent = 'Semua Kabupaten/Kota';
        label.style.borderColor = 'rgba(6, 182, 212, 0.25)';
        label.style.color = 'var(--accent-cyan)';
        label.style.background = 'rgba(6, 182, 212, 0.1)';
    }

    let html = '';
    INDICATOR_DATA.forEach(function (regionData) {
        const color = REGION_COLORS[regionData.id] || '#475569';
        html += '<div class="region-group">';
        html += '<div class="region-group-header">';
        html += '<span class="region-group-dot" style="background:' + color + '"></span>';
        html += '<span class="region-group-name">' + regionData.name + '</span>';
        html += '</div>';
        html += '<div class="cards-grid">' + renderCardsForRegion(regionData.id, triwulan) + '</div>';
        html += '</div>';
    });

    container.innerHTML = html;
}
