 // ============================================================
// APP — Main controller
// Initialize filters, maps, and cards
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    initFilters();
    initMaps().then(function () {
        renderCards(null); // Show all by default
        hideLoading();
    }).catch(function (err) {
        console.error('Init error:', err);
        hideLoading();
    });
});

// === Filter Initialization ===
function initFilters() {
    // Tahun filter (Dynamic from current year down to 2008)
    const tahunSelect = document.getElementById('filter-tahun');
    const currentYear = new Date().getFullYear();

    for (let y = currentYear; y >= 2008; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (y === 2024) opt.selected = true; // Default 2024 (latest data)
        tahunSelect.appendChild(opt);
    }

    // Kab/Kota filter
    const kabkotSelect = document.getElementById('filter-kabkot');
    REGIONS.forEach(function (region) {
        const opt = document.createElement('option');
        opt.value = region.id;
        opt.textContent = region.name;
        kabkotSelect.appendChild(opt);
    });

    // Event listeners
    tahunSelect.addEventListener('change', onFilterChange);
    document.getElementById('filter-triwulan').addEventListener('change', onFilterChange);
    document.getElementById('filter-provinsi').addEventListener('change', onFilterChange);
    kabkotSelect.addEventListener('change', onKabkotChange);
}

// When kab/kota filter changes
function onKabkotChange() {
    const val = document.getElementById('filter-kabkot').value;

    if (val === 'semua') {
        selectedRegionId = null;
    } else {
        selectedRegionId = val;
    }

    refreshMapStyles();
    buildLegend();
    renderCards(selectedRegionId);
}

// When year/triwulan filter changes
function onFilterChange() {
    // Re-render cards with current selection
    renderCards(selectedRegionId);
}

// Hide loading overlay
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
        setTimeout(function () {
            loading.style.display = 'none';
        }, 500);
    }
}
