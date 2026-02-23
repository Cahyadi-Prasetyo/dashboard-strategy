<template>
  <div ref="mapContainer" class="relative w-full h-[calc(100vh-80px)] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex">

    <!-- Loading Overlay -->
    <div v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-500 dark:text-gray-400">Memuat data dari BPS API...</span>
      </div>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-3 py-1.5 rounded-lg shadow-sm">
      ⚠️ {{ error }} (menggunakan data fallback)
    </div>

    <!-- Global Tooltip Overlay (Fixed Position) -->
    <div 
      v-if="tooltip.visible"
      class="fixed z-[9999] pointer-events-none bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl px-4 py-3 min-w-[280px] transition-all duration-150"
      :style="tooltipStyle"
    >
      <div class="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">{{ tooltip.name }}</div>
      <div v-if="tooltip.subName" class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 pb-1 border-b border-gray-100 dark:border-gray-700">{{ tooltip.subName }}</div>
      
      <div class="flex flex-col gap-0.5">
        <div 
          v-for="ind in tooltipDisplayList" 
          :key="ind.key"
          class="flex justify-between items-center text-xs py-1 border-b border-gray-100 dark:border-gray-800 last:border-0 px-1 rounded transition-colors"
          :class="ind.isActive ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold' : ''"
        >
          <span class="mr-3 text-left" :class="ind.isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'">
            {{ ind.shortLabel }}
          </span>
          <span class="text-right font-medium whitespace-nowrap" :class="ind.isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'">
            {{ ind.displayValue }}
          </span>
        </div>
      </div>
    </div>

    <!-- Triwulan Detail Card (appears below main tooltip) -->
    <div 
      v-if="tooltip.visible"
      class="fixed z-[9999] pointer-events-none bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl px-4 py-3 min-w-[280px] transition-all duration-150"
      :style="triwulanCardStyle"
    >
      <div class="font-bold text-gray-800 dark:text-gray-100 text-xs mb-2 flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        Detail Triwulan — Pertumbuhan Ekonomi
      </div>

      <!-- Table Header -->
      <div class="grid grid-cols-5 gap-0 text-[10px] font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-1">
        <div class="text-left">Metrik</div>
        <div v-for="tw in triwulanOptions" :key="tw.key" class="text-center" :class="selectedTriwulan === tw.key ? 'text-blue-600 dark:text-blue-400' : ''">
          {{ tw.label }}
        </div>
      </div>

      <!-- Data Rows -->
      <div 
        v-for="row in triwulanDetailData" 
        :key="row.key"
        class="grid grid-cols-5 gap-0 text-[11px] py-1 border-b border-gray-50 dark:border-gray-800 last:border-0 rounded transition-colors"
      >
        <div class="text-left text-xs text-gray-600 dark:text-gray-300">
          {{ row.shortLabel }}
        </div>
        <div 
          v-for="tw in triwulanOptions" 
          :key="tw.key" 
          class="text-center tabular-nums"
          :class="selectedTriwulan === tw.key 
            ? 'text-blue-700 dark:text-blue-300 font-bold' 
            : 'text-gray-500 dark:text-gray-400'"
        >
          {{ row.values[tw.key] ?? '-' }}%
        </div>
      </div>
    </div>

    <!-- Visual Cursor Pointer (Blue Dot) -->
    <div 
      v-if="tooltip.visible"
      class="fixed z-[10000] w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
      :style="{ left: cursorPos.x + 'px', top: cursorPos.y + 'px' }"
    ></div>

    <!-- Triwulan Selector Dropdown -->
    <div class="absolute top-4 left-4 z-500 flex items-center gap-2 flex-wrap">
      <span class="text-xs font-medium text-gray-600 dark:text-gray-300 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2">Triwulan:</span>
      <select 
        v-model="selectedTriwulan"
        class="text-xs bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 font-medium text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="tw in triwulanOptions" :key="tw.key" :value="tw.key">
          {{ tw.label }}
        </option>
      </select>
    </div>

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

// --- Types & Data ---
type IndicatorConfig = {
  key: string;
  label: string;
  unit: string;
  isInverse: boolean;
  format?: (val: number) => string;
};

// Reactive state for API data
const loading = ref(true);
const error = ref<string | null>(null);
const regionsData = ref<any[]>([]);
const indicatorsList = ref<IndicatorConfig[]>([]);

const selectedIndicatorKey = ref('pertumbuhan_ekonomi_ctoc');
const selectedTriwulan = ref('tw4'); // Default to latest quarter

// Triwulan options
const triwulanOptions = [
  { key: 'tw1', label: 'TW I' },
  { key: 'tw2', label: 'TW II' },
  { key: 'tw3', label: 'TW III' },
  { key: 'tw4', label: 'TW IV' }
];

// Check if current indicator is triwulanan
const isTriwulananIndicator = computed(() => {
  const ind = indicatorsList.value.find(i => i.key === selectedIndicatorKey.value);
  return (ind as any)?.isTriwulanan === true;
});

// Dropdown: only pertumbuhan ekonomi variants
const pertumbuhanOptions = computed(() => {
  return indicatorsList.value.filter(i => i.key.startsWith('pertumbuhan_ekonomi'));
});

// Tooltip: 8 concise indicators for display
const tooltipDisplayList = computed(() => {
  const regionId = tooltip.value.id;
  if (!regionId) return [];
  
  // The 8 strategic indicators with short labels
  const items = [
    { 
      key: 'pertumbuhan_ekonomi', 
      shortLabel: 'Pertumbuhan Ekonomi', 
      unit: '%',
      // Show value from the currently active sub-indicator
      getValue: () => getIndicatorValue(regionId, selectedIndicatorKey.value),
      isActive: true // always highlighted since it's the map indicator
    },
    { key: 'pengangguran_tpt', shortLabel: 'Tingkat Pengangguran (TPT)', unit: '%' },
    { key: 'pendapatan_per_kapita', shortLabel: 'PDRB Per Kapita', unit: '', format: (v: number) => `Rp ${(v / 1000).toFixed(1)} Jt` },
    { key: 'ipm', shortLabel: 'IPM', unit: 'Poin' },
    { key: 'aps', shortLabel: 'APS', unit: '%' },
    { key: 'ipg', shortLabel: 'IPG', unit: 'Poin' },
    { key: 'kemiskinan', shortLabel: 'Penduduk Miskin', unit: '%' },
    { key: 'gini_ratio', shortLabel: 'Rasio Gini', unit: 'Koefisien' }
  ];
  
  return items.map(item => {
    const value = item.getValue ? item.getValue() : getIndicatorValue(regionId, item.key);
    const displayValue = (value === null || value === undefined || value === 0) 
      ? '-' 
      : (item.format ? item.format(value) : `${value} ${item.unit}`);
    return {
      key: item.key,
      shortLabel: item.shortLabel,
      displayValue,
      isActive: item.isActive || false
    };
  });
});

//get raw triwulanan object for a region
const getRawTriwulanData = (regionId: string, key: string) => {
  const regionData = regionsData.value.find(d => d.id === regionId);
  const rawValue = regionData?.indicators?.[key];
  if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
    return rawValue;
  }
  return null;
};

// Triwulan detail rows for the second card
const triwulanDetailData = computed(() => {
  const regionId = tooltip.value.id;
  if (!regionId) return [];
  
  const metrics = [
    { key: 'pertumbuhan_ekonomi_ctoc', shortLabel: 'C-to-C' },
    { key: 'pertumbuhan_ekonomi_qtq', shortLabel: 'Q-to-Q' },
    { key: 'pertumbuhan_ekonomi_yoy', shortLabel: 'Y-on-Y' }
  ];
  
  return metrics.map(m => ({
    key: m.key,
    shortLabel: m.shortLabel,
    values: getRawTriwulanData(regionId, m.key) || {}
  }));
});

// Style for the triwulan detail card (positioned below the main tooltip)
const triwulanCardStyle = computed(() => {
  const { x, y, align, anchorBottom } = tooltip.value;
  const style: Record<string, string> = {};
  const MAIN_CARD_WIDTH = 310; // approximate width of main tooltip card
  
  // Position beside the main card (same vertical, offset horizontal)
  if (align === 'left') {
    // Main card is to the left of anchor — put detail card further left
    style.left = (x - MAIN_CARD_WIDTH - 25) + 'px';
    style.transform = 'translateX(-100%)';
  } else {
    // Main card is to the right of anchor — put detail card further right
    style.left = (x + MAIN_CARD_WIDTH + 25) + 'px';
    style.transform = 'none';
  }
  
  // Same vertical position as the main tooltip
  if (anchorBottom) {
    style.bottom = (window.innerHeight - y + 15) + 'px';
  } else {
    style.top = (y + 15) + 'px';
  }
  
  return style;
});

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

// --- Tooltip State (fixed position) ---
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  name: '',
  subName: '',
  id: '',
  align: 'right' as 'left' | 'right',
  anchorBottom: false
});

// Separate cursor position for blue dot
const cursorPos = ref({ x: 0, y: 0 });

// Tooltip estimated dimensions for boundary checking
const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT = 420;

// Computed tooltip style with smart boundary detection
const tooltipStyle = computed(() => {
  const { x, y, align, anchorBottom } = tooltip.value;
  const style: Record<string, string> = {};
  
  // Horizontal positioning
  if (align === 'left') {
    style.left = (x - 15) + 'px';
    style.transform = 'translateX(-100%)';
  } else {
    style.left = (x + 15) + 'px';
    style.transform = 'none';
  }
  
  // Vertical positioning — anchor from bottom if it would clip
  if (anchorBottom) {
    style.bottom = (window.innerHeight - y + 15) + 'px';
  } else {
    style.top = (y + 15) + 'px';
  }
  
  return style;
});

/**
 * Calculate a fixed screen position from the layer's geographic bounds center.
 * Ensures the tooltip won't be clipped by viewport edges.
 */
const calcFixedTooltipPos = (layer: any, mapInstance: any) => {
  const bounds = layer.getBounds();
  const center = bounds.getCenter();
  const containerPoint = mapInstance.latLngToContainerPoint(center);
  const mapRect = mapInstance.getContainer().getBoundingClientRect();
  
  const screenX = mapRect.left + containerPoint.x;
  const screenY = mapRect.top + containerPoint.y;
  
  // Smart horizontal alignment
  const spaceRight = window.innerWidth - screenX;
  const spaceLeft = screenX;
  const align: 'left' | 'right' = spaceRight < TOOLTIP_WIDTH + 30 ? 'left' : 'right';
  
  // Smart vertical: if tooltip would clip bottom, anchor from bottom instead
  const anchorBottom = (screenY + TOOLTIP_HEIGHT + 30) > window.innerHeight;
  
  return { x: screenX, y: screenY, align, anchorBottom };
};

// --- Fetch data from BPS API ---
const fetchMapData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await $fetch<any>('/api/bps/map-indicators');
    
    if (response.status === 'success') {
      regionsData.value = response.regions;
      
      // Build indicatorsList from config
      if (response.indicators && response.indicators.length > 0) {
        indicatorsList.value = response.indicators.map((ind: any) => {
          const config: any = {
            key: ind.id,
            label: ind.label,
            unit: ind.unit,
            isInverse: ind.isInverse,
            isTriwulanan: ind.isTriwulanan || false
          };
          // Add special format for currency
          if (ind.formatType === 'currency') {
            config.format = (v: number) => `Rp ${(v / 1000).toFixed(1)} Jt`;
          }
          return config;
        });
      }
      
      // Show warning if using fallback
      if (response.source === 'fallback') {
        error.value = 'BPS API tidak tersedia';
      }
    } else {
      error.value = 'Gagal memuat data';
    }
  } catch (err: any) {
    console.error('Failed to fetch map data:', err);
    error.value = 'Gagal menghubungi server';
  } finally {
    loading.value = false;
  }
};

// ... watch/lifecycle ...
onMounted(async () => {
  // Fetch data from API
  await fetchMapData();
  
  if (process.client) {
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
  indicatorsList.value.find(i => i.key === selectedIndicatorKey.value) || indicatorsList.value[0]
);

const currentGeoData = computed(() => detailedGeoData);

// Helper to get indicator value for a region ID
// Handles both flat values and nested triwulanan objects
const getIndicatorValue = (regionId: string, key: string) => {
  let regionData = regionsData.value.find(d => d.id === regionId);
  const rawValue = regionData?.indicators?.[key];
  
  // If the value is an object (triwulanan), pick the selected triwulan
  if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
    return rawValue[selectedTriwulan.value] ?? 0;
  }
  
  return rawValue || 0;
};

const currentMinMax = computed(() => {
  const values = regionsData.value.map(d => {
    const rawValue = d.indicators?.[selectedIndicatorKey.value];
    // Handle nested triwulanan objects
    if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
      return (rawValue[selectedTriwulan.value] as number) ?? 0;
    }
    return (rawValue as number) || 0;
  });
  if (values.length === 0) return { min: 0, max: 1 };
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

  if (currentIndicator.value?.isInverse) {
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
    fillOpacity: 1,
    className: 'cursor-pointer'
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
      
      // Global Tooltip Logic (Fixed Position)
      layer.on({
        mouseover: (e: any) => {
          const layer = e.target;
          layer.setStyle({
            weight: 2,
            color: '#333', 
            fillOpacity: 1
          });
          layer.bringToFront();
          
          // Calculate fixed position from layer bounds center
          const pos = calcFixedTooltipPos(layer, mapInstance);
          
          // Set cursor position
          cursorPos.value = {
            x: e.originalEvent.clientX,
            y: e.originalEvent.clientY
          };

          tooltip.value = {
            visible: true,
            x: pos.x,
            y: pos.y,
            name: regionName,
            subName: subName,
            id: id,
            align: pos.align,
            anchorBottom: pos.anchorBottom
          };
        },
        mousemove: (e: any) => {
          // Only update blue dot cursor position, NOT tooltip position
          cursorPos.value = {
            x: e.originalEvent.clientX,
            y: e.originalEvent.clientY
          };
        },
        mouseout: (e: any) => {
            const originalStyle = styleFeature(feature);
            layer.setStyle(originalStyle);
            tooltip.value.visible = false;
        },
        click: (e: any) => {
          mapInstance.fitBounds(e.target.getBounds());
        }
      });
    }
  }).addTo(mapInstance);

  if (autoFit && newLayer.getLayers().length > 0) {
     mapInstance.fitBounds(newLayer.getBounds(), { padding: [20, 20] });
  }

  return newLayer;
};

const updateAllMaps = () => {
  mainLayer = updateLayerForMap(mainMap, isMainIsland, mainLayer, false);
  if (mainMap) {
      mainMap.setView([0.30, 103.75], 8.7); 
  }

  natunaLayer = updateLayerForMap(natunaMap, isNatuna, natunaLayer, false);
  if (natunaMap) {
      natunaMap.setView([3.95, 108.20], 8.8);
  }

  anambasLayer = updateLayerForMap(anambasMap, isAnambas, anambasLayer, true);
};

// Cleanup maps on unmount
onUnmounted(() => {
  if (mainMap) mainMap.remove();
  if (natunaMap) natunaMap.remove();
  if (anambasMap) anambasMap.remove();
});

watch([selectedIndicatorKey, selectedTriwulan], () => {
  updateAllMaps();
});
</script>

<style>
/* Override Leaflet background to be transparent/white for the "No Tile" look */
.leaflet-container {
    background: transparent !important; /* Or white */
}
</style>
