<template>
  <div id="map" class="h-full w-full z-0 relative bg-slate-100"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import maplibregl, { type Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MOCK_REGION_DATA } from '~/constants/indicators';
import { useDashboardState } from '~/composables/useDashboardState';

// Import local GeoJSON
import kepriGeoJson from '~/assets/data/kepri-district.json';

const { selectedIndicatorId } = useDashboardState();
const map = ref<Map | null>(null);

// Function to get color based on value (Simple linear interpolation for now)
// In a real app, use chroma.js or similar
const getColor = (value: number, min: number, max: number) => {
  const percent = (value - min) / (max - min);
  // Blue scale: Light Blue -> Dark Blue
  if (percent < 0.2) return '#dbeafe';
  if (percent < 0.4) return '#bfdbfe';
  if (percent < 0.6) return '#93c5fd';
  if (percent < 0.8) return '#60a5fa';
  return '#2563eb';
};

const updateMapLayer = () => {
  if (!map.value || !map.value.getLayer('kepri-fill')) return;

  const indicatorId = selectedIndicatorId.value;
  
  // Extract values to find min/max for scale
  const values = Object.values(MOCK_REGION_DATA).map(r => r.values[indicatorId] || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Construct match expression
  const matchExpression: any[] = ['match', ['get', 'id']];
  
  Object.entries(MOCK_REGION_DATA).forEach(([regionId, data]) => {
    const value = data.values[indicatorId];
    if (value !== undefined) {
      matchExpression.push(regionId);
      matchExpression.push(getColor(value, min, max));
    }
  });

  // Default color
  matchExpression.push('#cbd5e1');

  map.value.setPaintProperty('kepri-fill', 'fill-color', matchExpression);
};

onMounted(() => {
  if (process.client) {
    try {
      map.value = new maplibregl.Map({
        container: 'map',
        // Style: Positron (CartoDB) - clean and light
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', 
        center: [106.5, 2.5], // Centered between Batam and Natuna
        zoom: 6,
        minZoom: 5,
        maxZoom: 14,
        attributionControl: false
      });

      map.value.addControl(new maplibregl.NavigationControl(), 'bottom-right');
      map.value.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      map.value.on('load', () => {
        if (!map.value) return;

        // Add Source for Kepri Districts
        map.value.addSource('kepri-districts', {
          type: 'geojson',
          data: kepriGeoJson as any
        });

        // Add Fill Layer (Initial empty/default)
        map.value.addLayer({
          id: 'kepri-fill',
          type: 'fill',
          source: 'kepri-districts',
          paint: {
            'fill-color': '#cbd5e1', // Default gray
            'fill-opacity': 0.7,
            'fill-outline-color': '#ffffff'
          }
        });

        // Add Line Layer (Borders)
        map.value.addLayer({
          id: 'kepri-line',
          type: 'line',
          source: 'kepri-districts',
          paint: {
            'line-color': '#ffffff',
            'line-width': 1.5
          }
        });

        // Add Symbol Layer (Labels) with conditional text color based on background? 
        // For now keep simple dark text
        map.value.addLayer({
          id: 'kepri-label',
          type: 'symbol',
          source: 'kepri-districts',
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-anchor': 'center',
            'text-offset': [0, 0]
          },
          paint: {
            'text-color': '#334155',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
          }
        });

        // Hover effect cursor
        map.value.on('mouseenter', 'kepri-fill', () => {
          if (map.value) map.value.getCanvas().style.cursor = 'pointer';
        });
        map.value.on('mouseleave', 'kepri-fill', () => {
          if (map.value) map.value.getCanvas().style.cursor = '';
        });

        // Initial update
        updateMapLayer();
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }
});

watch(selectedIndicatorId, () => {
  updateMapLayer();
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});
</script>


<style>
/* Ensure map takes full height */
#map {
  outline: none;
}
</style>
