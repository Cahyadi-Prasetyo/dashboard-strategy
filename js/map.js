// ============================================================
// MAP — Leaflet 3-panel: Main, Natuna, Anambas
// Distinct colors per region (not choropleth)
// ============================================================

let mainMap, natunaMap, anambasMap;
let mainLayer, natunaLayer, anambasLayer;
let geoData = null;
let selectedRegionId = null;

// Feature identification
function getFeatureId(feature) {
    return feature.properties.kdprov + feature.properties.kdkab;
}

function getRegionName(feature) {
    return feature.properties.nmkab;
}

// Style — distinct color per region
function styleFeature(feature) {
    const id = getFeatureId(feature);
    const color = REGION_COLORS[id] || '#475569';
    const isSelected = selectedRegionId === id;

    return {
        fillColor: color,
        weight: isSelected ? 3 : 1,
        opacity: 1,
        color: isSelected ? '#fff' : 'rgba(255,255,255,0.3)',
        fillOpacity: isSelected ? 1 : 0.75,
        className: 'cursor-pointer'
    };
}

// Filter helpers
function isNatuna(feature) {
    return (getRegionName(feature) || '').toUpperCase().includes('NATUNA');
}

function isAnambas(feature) {
    return (getRegionName(feature) || '').toUpperCase().includes('ANAMBAS');
}

function isMainIsland(feature) {
    return !isNatuna(feature) && !isAnambas(feature);
}

// Create/update layer on a map
function updateLayerForMap(mapInstance, filterFn, existingLayer) {
    if (!mapInstance || !geoData) return null;

    if (existingLayer) {
        mapInstance.removeLayer(existingLayer);
    }

    const newLayer = L.geoJSON(geoData, {
        filter: filterFn,
        style: styleFeature,
        onEachFeature: function (feature, layer) {
            const id = getFeatureId(feature);
            const regionName = getRegionName(feature);

            layer.on({
                mouseover: function (e) {
                    const target = e.target;
                    target.setStyle({
                        weight: 3,
                        color: '#fff',
                        fillOpacity: 1
                    });
                    target.bringToFront();
                },
                mouseout: function (e) {
                    const target = e.target;
                    target.setStyle(styleFeature(feature));
                },
                click: function (e) {
                    selectRegion(id);
                }
            });

            // Tooltip with name
            layer.bindTooltip(regionName, {
                sticky: true,
                className: 'region-tooltip'
            });
        }
    }).addTo(mapInstance);

    return newLayer;
}

// Select a region (called from map click or filter)
function selectRegion(regionId) {
    selectedRegionId = regionId;

    // Update kab/kota filter dropdown
    const filterKabkot = document.getElementById('filter-kabkot');
    if (filterKabkot) {
        filterKabkot.value = regionId || 'semua';
    }

    // Re-render map styles
    refreshMapStyles();

    // Update cards
    renderCards(regionId);
}

// Refresh styles on all layers without reloading GeoJSON
function refreshMapStyles() {
    if (mainLayer) {
        mainLayer.eachLayer(function (layer) {
            if (layer.feature) layer.setStyle(styleFeature(layer.feature));
        });
    }
    if (natunaLayer) {
        natunaLayer.eachLayer(function (layer) {
            if (layer.feature) layer.setStyle(styleFeature(layer.feature));
        });
    }
    if (anambasLayer) {
        anambasLayer.eachLayer(function (layer) {
            if (layer.feature) layer.setStyle(styleFeature(layer.feature));
        });
    }
}

// Update all maps
function updateAllMaps() {
    mainLayer = updateLayerForMap(mainMap, isMainIsland, mainLayer);
    if (mainMap && mainLayer) {
        // We use setView manually here because Bintan's Tambelan islands stretch very far east,
        // which makes fitBounds zoom out way too far and cuts off the main islands.
        // Center near Tanjungpinang/Batam [0.70, 104.2] zoom 8.5
        mainMap.setView([0.5, 104.2], 8.5);
    }

    natunaLayer = updateLayerForMap(natunaMap, isNatuna, natunaLayer);
    if (natunaMap && natunaLayer) {
        // Zoom manual agar lebih membesar
        natunaMap.setView([3.95, 108.20], 8.7);
    }

    anambasLayer = updateLayerForMap(anambasMap, isAnambas, anambasLayer);
    if (anambasMap && anambasLayer) {
        // Zoom manual agar lebih membesar
        anambasMap.setView([3.05, 106.20], 8.45);
    }
}

// Create map instances
function createMapInstance(containerId, center, zoom) {
    const map = L.map(containerId, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        dragging: true,
        touchZoom: true
    }).setView(center, zoom);

    return map;
}

// Build legend
function buildLegend() {
    const container = document.getElementById('map-legend');
    if (!container) return;

    container.innerHTML = '';

    REGIONS.forEach(function (region) {
        const item = document.createElement('div');
        item.className = 'legend-item' + (selectedRegionId === region.id ? ' active' : '');
        item.innerHTML = '<span class="legend-dot" style="background:' + REGION_COLORS[region.id] + '"></span>' + region.name;
        item.addEventListener('click', function () {
            selectRegion(region.id);
        });
        container.appendChild(item);
    });

    // "Semua" button
    const allItem = document.createElement('div');
    allItem.className = 'legend-item' + (!selectedRegionId ? ' active' : '');
    allItem.innerHTML = '<span class="legend-dot" style="background:#475569"></span>Semua';
    allItem.addEventListener('click', function () {
        selectRegion(null);
    });
    container.insertBefore(allItem, container.firstChild);
}

// Initialize maps
async function initMaps() {
    const isMobile = window.innerWidth <= 768;

    // Create map instances (no tile layer — clean background)
    // Mobile view needs a different center (shifted North-West) and zoom to fit Batam, Bintan, Lingga, Karimun
    mainMap = createMapInstance('map-main', isMobile ? [0.9, 103.9] : [0.5, 104.2], isMobile ? 8.0 : 8.5);
    natunaMap = createMapInstance('map-natuna', [3.95, 108.20], isMobile ? 9.0 : 9.2);
    anambasMap = createMapInstance('map-anambas', [3.05, 106.20], isMobile ? 9.4 : 8.45);

    // Handle Window Resize for responsiveness
    window.addEventListener('resize', function () {
        const mobile = window.innerWidth <= 768;
        if (mainMap) {
            mainMap.invalidateSize();
            if (mobile) {
                mainMap.setView([0.9, 103.9], 8.0); // Center more North-West for mobile
            } else {
                mainMap.setView([0.5, 104.2], 8.5);
            }
        }
        if (natunaMap) {
            natunaMap.invalidateSize();
            natunaMap.setView([3.95, 108.20], mobile ? 9.0 : 9.2);
        }
        if (anambasMap) {
            anambasMap.invalidateSize();
            anambasMap.setView([3.05, 106.20], mobile ? 9.4 : 8.45);
        }
    });

    // Load GeoJSON natively from local JS file (KABKOT_GEOJSON) for offline support
    try {
        geoData = KABKOT_GEOJSON;
        updateAllMaps();
        buildLegend();
    } catch (err) {
        console.error('Failed to load GeoJSON:', err);
    }
}
