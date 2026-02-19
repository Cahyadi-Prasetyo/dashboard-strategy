<template>
  <div class="relative w-full h-[calc(100vh-80px)] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex">

    <!-- Main Map Container (Left/Center - Batam, Bintan, Lingga, Karimun) -->
    <div id="main-map" class="flex-1 h-full z-0 relative"></div>

    <!-- Right Panel for Insets -->
    <div class="w-1/4 h-full flex flex-col border-l border-gray-200 dark:border-gray-800">
      
      <!-- Inset 1: Natuna -->
      <div class="flex-1 relative border-b border-gray-200 dark:border-gray-800">
        <div class="absolute top-2 right-2 z-400 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded">
          Natuna
        </div>
        <div id="natuna-map" class="w-full h-full"></div>
      </div>

      <!-- Inset 2: Anambas -->
      <div class="flex-1 relative">
        <div class="absolute top-2 right-2 z-400 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded">
          Kepulauan Anambas
        </div>
        <div id="anambas-map" class="w-full h-full"></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
// Import GeoJSONs
import detailedGeoData from '~/assets/data/kabkot-2100.json';

import kepriIndicatorsData from '~/server/data/kepri-indicators.json';

// --- Types & Data ---
type IndicatorConfig = {
  key: string;
  label: string;
  unit: string;
  isInverse: boolean; // true if lower is better (e.g. poverty, unemployment)
  format?: (val: number) => string;
};

const indicatorsList: IndicatorConfig[] = [
  { key: 'pertumbuhan_ekonomi', label: 'Pertumbuhan Ekonomi', unit: '%', isInverse: false },
  { key: 'pengangguran_tpt', label: 'Tingkat Pengangguran (TPT)', unit: '%', isInverse: true },
  { key: 'pendapatan_per_kapita', label: 'Pendapatan Per Kapita', unit: 'IDR', isInverse: false, format: (v) => `Rp ${(v/1000000).toFixed(1)} Jt` },
  { key: 'ipm', label: 'Indeks Pembangunan Manusia (IPM)', unit: 'Poin', isInverse: false },
  { key: 'aps', label: 'Angka Partisipasi Sekolah (APS)', unit: '%', isInverse: false },
  { key: 'ipg', label: 'Indeks Pembangunan Gender (IPG)', unit: 'Poin', isInverse: false },
  { key: 'kemiskinan', label: 'Tingkat Kemiskinan', unit: '%', isInverse: true },
  { key: 'gini_ratio', label: 'Gini Ratio', unit: 'Ratio', isInverse: true },
];

const selectedIndicatorKey = ref('pertumbuhan_ekonomi');


// 3 Map Instances
let mainMap: any = null;
let natunaMap: any = null;
let anambasMap: any = null;

// Layer References for updates
let mainLayer: any = null;
let natunaLayer: any = null;
let anambasLayer: any = null;

let L: any = null;

// --- Computed ---
const currentIndicator = computed(() => 
  indicatorsList.find(i => i.key === selectedIndicatorKey.value) || indicatorsList[0]
);

const currentGeoData = computed(() => detailedGeoData);

// Helper to get indicator value for a region ID
const getIndicatorValue = (regionId: string, key: string) => {
  let regionData = kepriIndicatorsData.find(d => d.id === regionId);
  return regionData?.indicators?.[key as keyof typeof regionData.indicators] || 0;
};

const currentMinMax = computed(() => {
  const values = kepriIndicatorsData.map(d => 
    d.indicators[selectedIndicatorKey.value as keyof typeof d.indicators] as number
  );
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
});

// --- Color Scale Logic ---
const getColor = (value: number) => {
  const { min, max } = currentMinMax.value;
  const range = max - min || 1; 
  let normalized = (value - min) / range; 

  if (currentIndicator.value.isInverse) {
    normalized = 1 - normalized; 
  }

  const hue = normalized * 120; 
  return `hsl(${hue}, 80%, 45%)`; 
};

// --- Map Logic ---
const getFeatureId = (feature: any) => {
  return feature.properties.kdprov + feature.properties.kdkab;
};

const getRegionName = (feature: any) => {
  return feature.properties.nmkab;
}

const styleFeature = (feature: any) => {
  const id = getFeatureId(feature);
  const value = getIndicatorValue(id, selectedIndicatorKey.value);
  const color = getColor(value);

  return {
    fillColor: color,
    weight: 0.5,
    opacity: 1,
    color: 'white',
    dashArray: '',
    fillOpacity: 1 // Full opacity for "No Tiles" look
  };
};

// Filter Functions
const isNatuna = (feature: any) => {
  const name = getRegionName(feature)?.toUpperCase() || '';
  return name.includes('NATUNA');
};

const isAnambas = (feature: any) => {
  const name = getRegionName(feature)?.toUpperCase() || '';
  return name.includes('ANAMBAS');
};

const isMainIsland = (feature: any) => {
  return !isNatuna(feature) && !isAnambas(feature);
};

// Generic function to create/update a specific map layer
const updateLayerForMap = (mapInstance: any, filterFn: (f: any) => boolean, existingLayer: any, autoFit = true) => {
  if (!mapInstance || !L) return null;
  
  if (existingLayer) {
    mapInstance.removeLayer(existingLayer);
  }

  const newLayer = L.geoJSON(currentGeoData.value as any, {
    filter: filterFn,
    style: styleFeature,
    onEachFeature: (feature: any, layer: any) => {
      const id = getFeatureId(feature);
      const regionName = getRegionName(feature);
      
      const subName = feature.properties.nmdesa; 
      
      // Tooltip Logic
      layer.on({
        mouseover: (e: any) => {
          const layer = e.target;
          layer.setStyle({
            weight: 2,
            color: '#333', // Dark border on hover
            fillOpacity: 1
          });
          layer.bringToFront();
          
          let indicatorsHtml = '';
          indicatorsList.forEach(ind => {
             const v = getIndicatorValue(id, ind.key);
             const fVal = ind.format ? ind.format(v) : `${v} ${ind.unit}`;
             const isSelected = ind.key === selectedIndicatorKey.value;
             // Highlight selected indicator
             const rowClass = isSelected ? 'bg-blue-50 font-semibold' : '';
             const textClass = isSelected ? 'text-blue-700' : 'text-gray-600';

             indicatorsHtml += `
                <div class="flex justify-between items-center text-xs py-1 border-b border-gray-100 last:border-0 ${rowClass} px-1">
                    <span class="text-gray-500 mr-3 text-left w-32 truncate">${ind.label}</span>
                    <span class="${textClass} text-right font-medium whitespace-nowrap">${fVal}</span>
                </div>
             `;
          });
            
          const tooltipContent = `
            <div class="font-sans px-3 py-2 text-left min-w-[280px]">
              <div class="font-bold text-gray-800 text-sm mb-1">${regionName}</div>
              ${subName ? `<div class="text-[10px] text-gray-400 uppercase tracking-wide mb-2 pb-1 border-b border-gray-100">${subName}</div>` : ''}
              <div class="flex flex-col">
                ${indicatorsHtml}
              </div>
            </div>
          `;

          layer.bindTooltip(tooltipContent, {
            permanent: false,
            className: 'custom-leaflet-tooltip',
            direction: 'auto', // Smart positioning
            opacity: 0.95,
            offset: [0, -10]
          }).openTooltip();
        },
        mouseout: (e: any) => {
          // Reset style locally since we don't have easy access to the exact layer group here without passing it
          // Simple reset to styleFeature
          const originalStyle = styleFeature(feature);
          layer.setStyle(originalStyle);
          layer.closeTooltip();
        },
        click: (e: any) => {
          mapInstance.fitBounds(e.target.getBounds());
        }
      });
    }
  }).addTo(mapInstance);

  // Fit bounds if layer has layers 
  if (autoFit && newLayer.getLayers().length > 0) {
     mapInstance.fitBounds(newLayer.getBounds(), { padding: [20, 20] });
  }

  return newLayer;
};

const updateAllMaps = () => {
  // Main Map: No Auto Fit, manual view set
  mainLayer = updateLayerForMap(mainMap, isMainIsland, mainLayer, false);
  if (mainMap) {
      // Focus on "Big Islands" (Batam, Bintan, Karimun, Lingga)
      // Center roughly on south of Bintan to include Lingga
      mainMap.setView([0.35, 104.5], 8.5); 
  }

  // Insets: Auto Fit
  natunaLayer = updateLayerForMap(natunaMap, isNatuna, natunaLayer, true);
  anambasLayer = updateLayerForMap(anambasMap, isAnambas, anambasLayer, true);
};

// Cleanup maps on unmount to separate garbage collection
onUnmounted(() => {
  if (mainMap) mainMap.remove();
  if (natunaMap) natunaMap.remove();
  if (anambasMap) anambasMap.remove();
});

watch([selectedIndicatorKey], () => {
  updateAllMaps();
});

onMounted(async () => {
  if (process.client) {
    const leafletModule = await import('leaflet');
    L = leafletModule.default || leafletModule;

    // Common Map Options for "Plain" look (No Controls, No Zoom interaction by default for insets?)
    // Let's keep zoom/pan enabled but no UI controls for cleaner look
    const commonOptions = { 
      zoomControl: false, 
      attributionControl: false,
      zoomSnap: 0.1 // smoother zoom
    };

    // Initialize 3 Maps
    mainMap = L.map('main-map', commonOptions);
    natunaMap = L.map('natuna-map', commonOptions);
    anambasMap = L.map('anambas-map', commonOptions);

    // Initial Load
    updateAllMaps();
  }
});
</script>

<style>
.custom-leaflet-tooltip {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 0;
}
/* Override Leaflet background to be transparent/white for the "No Tile" look */
.leaflet-container {
    background: transparent !important; /* Or white */
}
</style>
