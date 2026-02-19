<template>
  <div ref="mapContainer" class="relative w-full h-[calc(100vh-80px)] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex">

    <!-- Global Tooltip Overlay -->
    <div 
      v-if="tooltip.visible"
      class="fixed z-[9999] pointer-events-none bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl px-4 py-3 min-w-[300px] transition-opacity duration-75"
      :style="{ 
        top: tooltip.isAnambas ? anambasTopY + 'px' : (tooltip.y + 15) + 'px', 
        left: tooltip.align === 'left' ? (tooltip.x - 15) + 'px' : (tooltip.x + 15) + 'px',
        transform: tooltip.align === 'left' ? 'translateX(-100%)' : 'none'
      }"
    >
      <div class="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">{{ tooltip.name }}</div>
      <div v-if="tooltip.subName" class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 pb-1 border-b border-gray-100 dark:border-gray-700">{{ tooltip.subName }}</div>
      
      <div class="flex flex-col gap-1">
        <div 
          v-for="ind in indicatorsList" 
          :key="ind.key"
          class="flex justify-between items-center text-xs py-1 border-b border-gray-100 dark:border-gray-800 last:border-0 px-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          :class="ind.key === selectedIndicatorKey ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold' : ''"
        >
          <span class="mr-3 text-left w-36 truncate" :class="ind.key === selectedIndicatorKey ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'">
            {{ ind.label }}
          </span>
          <span class="text-right font-medium whitespace-nowrap" :class="ind.key === selectedIndicatorKey ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'">
            {{ ind.format ? ind.format(getIndicatorValue(tooltip.id, ind.key)) : `${getIndicatorValue(tooltip.id, ind.key)} ${ind.unit}` }}
          </span>
        </div>
      </div>
    </div>

    <!-- Visual Cursor Pointer (Blue Dot) -->
    <div 
      v-if="tooltip.visible"
      class="fixed z-[10000] w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    ></div>

    <!-- Main Map Container (Left/Center - Batam, Bintan, Lingga, Karimun) -->
    <div id="main-map" class="flex-1 h-full z-0 relative"></div>

    <!-- Right Panel for Insets -->
    <div class="w-1/4 h-full flex flex-col border-l border-gray-200 dark:border-gray-800">
      
      <!-- Inset 1: Natuna -->
      <div class="flex-1 relative border-b border-gray-200 dark:border-gray-800">
        <div class="absolute top-2 right-2 z-400 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded shadow-sm backdrop-blur-sm">
          Natuna
        </div>
        <div id="natuna-map" class="w-full h-full"></div>
      </div>

      <!-- Inset 2: Anambas -->
      <div class="flex-1 relative">
        <div class="absolute top-2 right-2 z-400 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded shadow-sm backdrop-blur-sm">
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
  { key: 'gini_ratio', label: 'Rasio Gini', unit: 'Ratio', isInverse: true },
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

const mapContainer = ref<HTMLElement | null>(null);
const anambasTopY = ref(0);

// Update Anambas Top Position on resize/mount
const updateLayoutMetrics = () => {
  if (mapContainer.value) {
    const rect = mapContainer.value.getBoundingClientRect();
    // Anambas is the bottom half of the container
    anambasTopY.value = rect.top + (rect.height / 2) + 12; // +12 for perfect alignment with border/padding
  }
};

// --- Tooltip State ---
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  name: '',
  subName: '',
  id: '',
  align: 'right',
  isAnambas: false // New flag
});


// ... watch/lifecycle ...
onMounted(async () => {
  if (process.client) {
    window.addEventListener('resize', updateLayoutMetrics);
    // Initial metric update after a small delay to ensure render
    setTimeout(updateLayoutMetrics, 500);

    const leafletModule = await import('leaflet');
    L = leafletModule.default || leafletModule;

    const commonOptions = { 
      zoomControl: false, 
      attributionControl: false,
      zoomSnap: 0.1 
    };

    // Initialize 3 Maps
    mainMap = L.map('main-map', commonOptions);
    natunaMap = L.map('natuna-map', commonOptions);
    anambasMap = L.map('anambas-map', commonOptions);

    // Initial Load
    updateAllMaps();
  }
});

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
};

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
    fillOpacity: 1, // Full opacity for "No Tiles" look
    className: 'cursor-pointer' // Add pointer cursor
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
      
      // Global Tooltip Logic (Instead of bindTooltip)
      layer.on({
        mouseover: (e: any) => {
          const layer = e.target;
          layer.setStyle({
            weight: 2,
            color: '#333', 
            fillOpacity: 1
          });
          layer.bringToFront();
          
          const clientX = e.originalEvent.clientX;
          const isRightSide = clientX > window.innerWidth / 2;
          // CheckAnambas
          const isAnambasFeature = isAnambas(feature);

          // Show Tooltip
          tooltip.value = {
            visible: true,
            x: clientX,
            y: e.originalEvent.clientY,
            name: regionName,
            subName: subName,
            id: id,
            align: isRightSide ? 'left' : 'right',
            isAnambas: isAnambasFeature
          };
        },
        mousemove: (e: any) => {
          const clientX = e.originalEvent.clientX;
          const isRightSide = clientX > window.innerWidth / 2;
          
          // Update position to follow mouse
          tooltip.value.x = clientX;
          tooltip.value.y = e.originalEvent.clientY;
          tooltip.value.align = isRightSide ? 'left' : 'right';
          tooltip.value.isAnambas = isAnambas(feature);
        },
        mouseout: (e: any) => {
            const originalStyle = styleFeature(feature);
            layer.setStyle(originalStyle);
            // Hide Tooltip
            tooltip.value.visible = false;
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
  // Main Map: Manual view for better focus on Batam/Bintan/Lingga
  mainLayer = updateLayerForMap(mainMap, isMainIsland, mainLayer, false);
  if (mainMap) {
      // Shifted slightly down-right to center the group better
      mainMap.setView([0.30, 103.75], 8.7); 
  }

  // Natuna: Manual focus on "Big Island" (Natuna Besar)
  natunaLayer = updateLayerForMap(natunaMap, isNatuna, natunaLayer, false); // false = no auto fit
  if (natunaMap) {
      natunaMap.setView([3.95, 108.20], 8.8); // Focus on Ranai/Natuna Besar
  }

  // Anambas: Auto Fit is fine, but maybe zoom out slightly? Keep auto for now.
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
</script>

<style>
/* Override Leaflet background to be transparent/white for the "No Tile" look */
.leaflet-container {
    background: transparent !important; /* Or white */
}
</style>
