<template>
  <div
    class="flex flex-col h-full w-full bg-white relative font-sans overflow-hidden"
  >
    <div
      class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-[2000] shadow-sm"
    >
      <div class="flex items-center gap-4 min-w-0">
        <div class="p-2 bg-amber-50 rounded-lg border border-amber-100">
          <UIcon name="i-heroicons-map" class="w-6 h-6 text-amber-600" />
        </div>

        <div class="flex flex-col">
          <h3
            class="text-sm font-bold text-gray-900 leading-tight line-clamp-1"
          >
            {{ selectedDatasetLabel }}
          </h3>

          <div class="flex items-center gap-2 mt-0.5">
            <div
              v-if="
                datasetMeta.instansi !== '-' &&
                datasetMeta.instansi !== 'Memuat...'
              "
              class="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600"
            >
              <UIcon name="i-heroicons-building-office-2" class="w-3 h-3" />
              <span class="truncate max-w-[150px]">{{
                datasetMeta.instansi
              }}</span>
            </div>

            <div
              v-if="datasetMeta.sumber !== '-'"
              class="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600"
            >
              <UIcon name="i-heroicons-link" class="w-3 h-3" />
              <span class="truncate max-w-[300px]">{{
                datasetMeta.sumber
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="$emit('export')"
          class="flex items-center justify-center p-2 bg-white hover:bg-green-50 text-green-600 border border-gray-200 hover:border-green-200 rounded-lg transition-colors shadow-sm"
          title="Export Data Excel"
        >
          <UIcon name="i-heroicons-document-arrow-down" class="w-5 h-5" />
        </button>

        <button
          v-if="isMapReady"
          @click="$emit('reset-map')"
          class="flex items-center justify-center p-2 bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 rounded-lg transition-colors shadow-sm"
          title="Reset Peta"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5" />
        </button>
        <button
          @click="$emit('close')"
          class="flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors shadow-md"
          title="Keluar Fullscreen"
        >
          <UIcon name="i-heroicons-x-mark" class="block w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden relative bg-gray-100">
      <div
        class="absolute top-0 bottom-0 left-0 w-[320px] bg-white border-r border-gray-200 z-[1500] flex flex-col shadow-xl transition-transform duration-300 ease-in-out"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div
          class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50"
        >
          <h2
            class="flex items-center gap-2 text-xs font-extrabold text-gray-800 uppercase tracking-wider"
          >
            <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4" />
            Layer & Data
          </h2>
          <button
            v-if="selectedDatasetId"
            @click="$emit('reset-choropleth')"
            class="text-[10px] flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2 py-1 rounded transition-colors"
            title="Hapus layer statistik (Choropleth) saja"
          >
            <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
            <span>Reset Data</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
          <MapSpatialLeftSidebar
            :is-map-ready="isMapReady"
            :disabled="!isRegionFilterActive"
            :show-pendataan="isMapReady"
            :dataset-props="{
              activeSektorTab,
              availableSektors,
              groupedDatasets,
              selectedDatasetId,
              selectedIndikatorId,
              selectedDatasetLabel,
              isLoading,
              variantId: null,
            }"
            :layer2-props="{ modelValue: localIndikatorList }"
            :condition-layer-component="conditionLayerComponent"
            :condition-props="{
              activeLayer: activeConditionLayer,
              opacity: conditionLayerOpacity,
            }"
            :dampak-props="{
              brinLayers: additionalLayersConfig,
              activeBrin: activeAdditionalLayers,
              pmssConfig: pmssLayersConfig,
              activePmss: activePMSSLayerObjects,
              opacity: dampakLayerOpacity,
            }"
            @dataset-change="$emit('dataset-change', $event)"
            @update:activeSektorTab="$emit('update:activeSektorTab', $event)"
            @update:layer2="$emit('update-pendataan')"
            @update-condition="$emit('toggle-condition-layer', $event)"
            @update:conditionOpacity="
              $emit('update:conditionLayerOpacity', $event)
            "
            @update-brin="$emit('toggle-additional-layer', $event)"
            @update-pmss="$emit('toggle-pmss-layer', $event)"
            @update:dampakOpacity="$emit('update:dampakLayerOpacity', $event)"
          />
        </div>

        <button
          @click="isSidebarOpen = !isSidebarOpen"
          class="absolute top-1/2 -translate-y-1/2 -right-6 w-6 h-16 bg-white border-y border-r border-gray-200 rounded-r-lg shadow-[2px_0_5px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:text-amber-600 text-gray-400 transition-all z-[1501] group"
          :title="isSidebarOpen ? 'Tutup Panel' : 'Buka Panel'"
        >
          <UIcon
            :name="
              isSidebarOpen
                ? 'i-heroicons-chevron-left'
                : 'i-heroicons-chevron-right'
            "
            class="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
          />
        </button>
      </div>

      <div class="flex-1 relative h-full overflow-hidden">
        <div
          :id="mapId + '-fullscreen'"
          class="absolute inset-0 w-full h-full z-0"
        ></div>

        <div
          class="absolute top-4 z-[1000] transition-all duration-300"
          :class="isSidebarOpen ? 'left-4' : 'left-16'"
        >
          <MapSpatialDrillBreadcrumb
            v-if="breadcrumbPath.length > 0"
            :breadcrumb-items="breadcrumbPath"
            :current-level="currentLevel"
            @reset="$emit('drill-reset')"
            @drill-to-level="$emit('drill-to-level', $event)"
          />
        </div>

        <div
          class="absolute bottom-8 right-6 z-[1000] flex flex-col items-end gap-3 pointer-events-none"
        >
          <div class="pointer-events-auto flex flex-row items-end gap-3">
            <div class="flex flex-row gap-2 items-end">
              <MapSpatialControlBoundary
                v-if="isMapReady && mapInstance && isMapFullyMounted"
                :map="mapInstance"
                :geo-json-data="activeGeoJsonForBoundary"
                :current-level="currentLevel || 'prov'"
                position-class="relative z-[1001]"
                :active="isBoundaryActive"
                @update:active="$emit('update:isBoundaryActive', $event)"
                :opacity-val="boundaryOpacity"
                @update:opacity-val="$emit('update:boundaryOpacity', $event)"
                :show-labels="showBoundaryLabels"
                @update:showLabels="$emit('update:showBoundaryLabels', $event)"
              />

              <MapSpatialLegend
                :dampak-pmss-layers="activePMSSLayerObjects"
                :dampak-brin-layers="activeAdditionalLayers"
                :sebaran-items="localIndikatorList"
                :show-photos-only="showPhotosOnly"
                @update:showPhotosOnly="$emit('update:showPhotosOnly', $event)"
                :choropleth-items="legendItems"
                :choropleth-unit="currentUnit"
                :choropleth-opacity="mapOpacity"
                @update:choroplethOpacity="$emit('update:mapOpacity', $event)"
                :show-pendataan="isShowPendataan"
              />
            </div>
          </div>
        </div>

        <div
          v-if="
            hoverInfo &&
            (!selectedInfo ||
              !isRightSidebarOpen ||
              hoverInfo.id !== selectedInfo.id)
          "
          class="absolute z-[2000] pointer-events-none transform -translate-x-1/2 -translate-y-[105%]"
          :style="{ top: tooltipPos.y + 'px', left: tooltipPos.x + 'px' }"
        >
          <MapSpatialInfoPanel
            :info="hoverInfo"
            :dataset-label="currentIndikatorName"
            :unit="currentUnit"
            :description="currentIndikatorDesc"
            class="min-w-[250px] shadow-2xl border-none ring-1 ring-black/5"
            :is-hover-mode="true"
          />
        </div>

        <div
          v-if="isPendataanReady"
          class="absolute bottom-3 left-4 z-[500] pointer-events-none opacity-80"
        >
          <MapSpatialLastUpdate :text="lastUpdateText" />
        </div>
      </div>

      <div
        class="shrink-0 z-[1500] h-full shadow-2xl transition-[width] duration-300 ease-in-out relative flex flex-col"
        :class="[
          (selectedLocation || selectedInfo) && isRightSidebarOpen
            ? 'w-[300px] border-l border-gray-200'
            : 'w-0 border-none',
        ]"
      >
        <button
          v-if="selectedLocation || selectedInfo"
          @click="isRightSidebarOpen = !isRightSidebarOpen"
          class="absolute top-1/2 -translate-y-1/2 -left-6 w-6 h-16 bg-white border-y border-l border-gray-200 rounded-l-lg shadow-[-2px_0_5px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:text-amber-600 text-gray-400 transition-all z-[1502] group"
          :title="isRightSidebarOpen ? 'Tutup Panel' : 'Buka Panel'"
        >
          <UIcon
            :name="
              isRightSidebarOpen
                ? 'i-heroicons-chevron-right'
                : 'i-heroicons-chevron-left'
            "
            class="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
          />
        </button>

        <div class="w-[300px] h-full overflow-hidden bg-white flex flex-col">
          <MapSpatialRightSidebar
            :info="selectedInfo"
            :location="selectedLocation"
            :dataset-label="currentIndikatorName"
            :unit="currentUnit"
            :description="currentIndikatorDesc"
            :related-indicators="relatedIndicatorsData"
            :is-loading-related="isLoadingRelated"
            :is-filter-complete="true"
            @close="handleCloseSidebar"
            @close-location="$emit('close-detail')"
            @switch-indicator="$emit('switch-indicator', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  mapId: { type: String, default: "" },
  mapType: { type: String, default: "pra" },
  mapInstance: { type: Object, default: null },

  // Data State
  selectedDatasetLabel: { type: String, default: "-" },
  datasetMeta: {
    type: Object,
    default: () => ({ instansi: "-", sumber: "-", label: null, sektor: null }),
  },
  selectedDatasetId: { type: [Number, String], default: null },
  isLoading: { type: Boolean, default: false },
  breadcrumbPath: { type: Array, default: () => [] },
  currentLevel: { type: String, default: "prov" },

  // UI States
  isMapReady: { type: Boolean, default: false },
  selectedInfo: { type: Object, default: null },
  activeSektorTab: { type: String, default: "" },
  availableSektors: { type: Array, default: () => [] },
  groupedDatasets: { type: Array, default: () => [] },
  selectedIndikatorId: { type: [Number, String], default: null },

  // Data Lists
  localIndikatorList: { type: Array, default: () => [] },

  // Layer Configurations
  conditionLayerComponent: { type: Object, default: null },
  isRegionFilterActive: { type: Boolean, default: false },
  activeConditionLayer: { type: String, default: null },
  conditionLayerOpacity: { type: Number, default: 0.8 },

  additionalLayersConfig: { type: Array, default: () => [] },
  activeAdditionalLayers: { type: Array, default: () => [] },
  pmssLayersConfig: { type: Array, default: () => [] },
  activePMSSLayerIds: { type: Array, default: () => [] },
  activePMSSLayerObjects: { type: Array, default: () => [] },
  dampakLayerOpacity: { type: Number, default: 0.8 },

  // Tooltips & Info
  currentIndikatorName: { type: String, default: "" },
  currentUnit: { type: String, default: "" },
  currentIndikatorDesc: { type: String, default: "" },
  hoverInfo: { type: Object, default: null },
  tooltipPos: { type: Object, default: () => ({ x: 0, y: 0 }) },

  // Data Indikator Terkait
  relatedIndicatorsData: { type: Array, default: () => [] },
  isLoadingRelated: { type: Boolean, default: false },

  // Bottom Controls
  isPendataanReady: { type: Boolean, default: false },
  mapOpacity: { type: Number, default: 0.7 },
  legendItems: { type: Array, default: () => [] },
  activeGeoJsonForBoundary: { type: Object, default: null },
  isBoundaryActive: { type: Boolean, default: true },
  boundaryOpacity: { type: Number, default: 1.0 },
  showBoundaryLabels: { type: Boolean, default: false },
  lastUpdateText: { type: String, default: "-" },
  showPhotosOnly: { type: Boolean, default: false },
  // Selection Marker
  selectedLocation: { type: Object, default: null },
  isMapFullyMounted: { type: Boolean, default: false },
});

const emit = defineEmits([
  "close",
  "export",
  "reset-map",
  "drill-reset",
  "drill-to-level",
  "dataset-change",
  "update:activeSektorTab",
  "update:filter",
  "update-pendataan",
  "update:localIndikatorList",
  "toggle-condition-layer",
  "update:conditionLayerOpacity",
  "toggle-additional-layer",
  "toggle-pmss-layer",
  "update:dampakLayerOpacity",
  "update:mapOpacity",
  "update:isBoundaryActive",
  "update:boundaryOpacity",
  "update:showBoundaryLabels",
  "update:showPhotosOnly",
  "close-detail",
  "close-sidebar",
  "switch-indicator",
  "reset-choropleth",
]);

// Local State for Sidebars
const isSidebarOpen = ref(true); // Left
const isRightSidebarOpen = ref(true); // Right

// Watcher
watch(
  () => [props.selectedLocation, props.selectedInfo],
  ([newLoc, newInfo]) => {
    if (newLoc || newInfo) {
      isRightSidebarOpen.value = true;
    }
  },
);
watch(isRightSidebarOpen, () => {
  if (!props.mapInstance) return;
  props.mapInstance.invalidateSize();
  setTimeout(() => {
    props.mapInstance.invalidateSize();
  }, 300);
  setTimeout(() => {
    props.mapInstance.invalidateSize();
  }, 450);
});
const handleCloseSidebar = () => {
  emit("close-detail");
  emit("close-sidebar");
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
