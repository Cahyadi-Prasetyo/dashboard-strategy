
<template>
  <div class="relative w-full h-[calc(100vh-80px)] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
    <div id="map" class="w-full h-full z-0"></div>

    <!-- Custom Legend Overlay -->
    <div class="absolute bottom-6 right-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 max-w-xs z-[1000]">
      <h3 class="font-bold text-sm mb-2 text-gray-900 dark:text-white">Legenda Wilayah</h3>
      <div class="flex items-center gap-2 mb-1">
        <span class="w-3 h-3 rounded-full bg-blue-500 block"></span>
        <span class="text-xs text-gray-600 dark:text-gray-300">Wilayah Kabupaten/Kota</span>
      </div>
      <p class="text-[10px] text-gray-500 mt-2">
        Hover pada titik wilayah untuk melihat 8 indikator strategis.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet only on client-side
let L: any;

const props = defineProps<{
  data: any[]
}>();

const map = ref<any>(null);

onMounted(async () => {
  if (process.client) {
    // Import Leaflet with type assertion to avoid "has no default export" errors in some TS configs
    // @ts-ignore
    const leafletModule = await import('leaflet');
    L = leafletModule.default || leafletModule;
    
    // Initialize Map centered on Kepri
    // Coordinates roughly center of Kepri (between Batam/Bintan and Natuna)
    // Adjusted to show mostly the main islands, zoom level 8 might be good foundation
    // Natuna is very far north, so center needs to be balanced.
    // Center roughly: 2.5, 106.0
    map.value = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([2.3, 106.0], 7);

    // Add Tile Layer (OpenStreetMap Standard)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.value);

    // Add Custom Zoom Control
    L.control.zoom({
        position: 'topright'
    }).addTo(map.value);

    // Add Markers/Circles
    props.data.forEach((region: any) => {
        const circle = L.circleMarker(region.coords, {
            radius: 12,
            fillColor: '#3b82f6', // blue-500
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map.value);

        // Tooltip Content Construction
        const tooltipContent = `
            <div class="p-3 min-w-[200px]">
                <h4 class="font-bold text-base mb-3 border-b pb-2 border-gray-200">${region.name}</h4>
                <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div class="text-gray-500">Ekonomi:</div>
                    <div class="font-medium text-right text-blue-600">${region.indicators.pertumbuhan_ekonomi}%</div>
                    
                    <div class="text-gray-500">TPT:</div>
                    <div class="font-medium text-right">${region.indicators.pengangguran_tpt}%</div>
                    
                    <div class="text-gray-500">PDRB/Cap:</div>
                    <div class="font-medium text-right text-emerald-600">${(region.indicators.pendapatan_per_kapita / 1000000).toFixed(1)}jt</div>
                    
                    <div class="text-gray-500">IPM:</div>
                    <div class="font-medium text-right">${region.indicators.ipm}</div>
                    
                    <div class="text-gray-500">APS:</div>
                    <div class="font-medium text-right">${region.indicators.aps}</div>
                    
                    <div class="text-gray-500">IPG:</div>
                    <div class="font-medium text-right">${region.indicators.ipg}</div>
                    
                    <div class="text-gray-500">Kemiskinan:</div>
                    <div class="font-medium text-right text-red-500">${region.indicators.kemiskinan}%</div>
                    
                    <div class="text-gray-500">Gini:</div>
                    <div class="font-medium text-right">${region.indicators.gini_ratio}</div>
                </div>
            </div>
        `;

        circle.bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'top',
            offset: [0, -10],
            className: 'custom-leaflet-tooltip'
        });

        // Hover effects
        circle.on('mouseover', function(e: any) {
            e.target.setStyle({
                fillColor: '#2563eb', // blue-600
                radius: 15,
                fillOpacity: 1
            });
            e.target.openTooltip();
        });

        circle.on('mouseout', function(e: any) {
            e.target.setStyle({
                fillColor: '#3b82f6',
                radius: 12,
                fillOpacity: 0.8
            });
            e.target.closeTooltip();
        });
    });
  }
});
</script>

<style>
/* Global overrides for Leaflet in this component */
.custom-leaflet-tooltip {
    background: white;
    border: none;
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    padding: 0;
    overflow: hidden;
}
.custom-leaflet-tooltip .leaflet-tooltip-content {
    margin: 0;
}
.leaflet-container {
    background: #f8fafc; /* slate-50 */
    font-family: inherit;
}
.dark .custom-leaflet-tooltip {
    background: #1e293b; /* slate-800 */
    color: white;
    border: 1px solid #334155;
}
.dark .custom-leaflet-tooltip h4 {
    border-color: #334155;
}
</style>
