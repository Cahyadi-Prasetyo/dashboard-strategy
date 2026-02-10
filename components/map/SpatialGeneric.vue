<template>
  <div class="relative w-full h-full flex overflow-hidden font-sans">
    <div
      class="absolute top-0 bottom-0 left-0 w-[320px] bg-white border-r border-gray-200 z-[1000] flex flex-col shadow-xl transition-transform duration-300 ease-in-out"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div
        class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50"
      >
        <h2
          class="flex items-center gap-2 text-sm font-extrabold text-amber-600 uppercase tracking-wider"
        >
          <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
          Layer & Data
        </h2>
        <button
          v-if="selectedDatasetId"
          @click="handleResetChoropleth"
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
          :map-type="mapType"
          :show-pendataan="true"
          :dataset-props="{
            activeSektorTab,
            availableSektors,
            groupedDatasets,
            selectedDatasetId,
            selectedIndikatorId,
            selectedDatasetLabel,
            isLoading,
            variantId: selectedVariantId,
          }"
          :layer2-props="{ modelValue: localIndikatorList }"
          :condition-layer-component="conditionLayerComponent"
          :condition-props="{
            activeLayer: activeConditionLayer,
            opacity: conditionLayerOpacity,
          }"
          :dampak-props="{
            brinLayers: additionalLayersConfigConst,
            activeBrin: activeAdditionalLayers,
            pmssConfig: pmssLayersConfigConst,
            activePmss: activePMSSLayerObjects,
            opacity: dampakLayerOpacity,
          }"
          @dataset-change="onDatasetChange"
          @update:activeSektorTab="activeSektorTab = $event"
          @update:layer2="handleLayer2Change"
          @update-condition="toggleConditionLayer"
          @update:conditionOpacity="conditionLayerOpacity = $event"
          @update-brin="toggleAdditionalLayer"
          @update-pmss="togglePMSSLayer"
          @update:dampakOpacity="dampakLayerOpacity = $event"
        />
      </div>

      <button
        @click="isSidebarOpen = !isSidebarOpen"
        class="absolute top-1/2 -translate-y-1/2 -right-6 w-6 h-16 bg-white border-y border-r border-gray-200 rounded-r-lg shadow-[2px_0_5px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:text-amber-600 text-gray-400 transition-all z-[1001] group"
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

    <!-- <transition name="fade">
      <div v-if="!isSidebarOpen" class="absolute top-4 left-4 z-[800]">
        <button
          @click="isSidebarOpen = true"
          class="bg-white p-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all active:scale-95"
          title="Buka Menu Layer"
        >
          <UIcon name="i-heroicons-bars-3-bottom-left" class="w-5 h-5" />
        </button>
      </div>
    </transition> -->

    <div class="flex-1 relative h-full bg-gray-100 overflow-hidden">
      <div :id="mapId" class="w-full h-full z-0"></div>

      <div
        class="absolute top-4 z-[500] transition-all duration-300"
        :class="isSidebarOpen ? 'left-4' : 'left-16'"
      >
        <MapSpatialDrillBreadcrumb
          v-if="breadcrumbPath.length > 0"
          :breadcrumb-items="breadcrumbPath"
          :current-level="currentLevel"
          @reset="handleDrillReset"
          @drill-to-level="handleDrillToLevel"
        />
      </div>

      <div
        class="absolute top-4 right-4 z-[500] flex flex-col items-end gap-2 pointer-events-none"
      >
        <div class="pointer-events-auto flex items-start gap-2">
          <div v-if="selectedDatasetId" class="flex flex-col items-end gap-1">
            <UBadge
              variant="solid"
              class="bg-white/95 backdrop-blur shadow-lg text-gray-800 px-3 py-1.5 border border-gray-200"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-heroicons-document-chart-bar"
                  class="w-4 h-4 text-amber-600"
                />
                <span class="font-bold text-xs max-w-[500px] truncate">{{
                  selectedDatasetLabel
                }}</span>
              </div>
            </UBadge>
            <div
              v-if="datasetMeta.instansi !== '-' || datasetMeta.sumber !== '-'"
              class="flex flex-row flex-wrap items-center justify-end gap-1.5 mt-1"
            >
              <UBadge
                v-if="
                  datasetMeta.instansi !== '-' &&
                  datasetMeta.instansi !== 'Memuat...'
                "
                variant="subtle"
                color="gray"
                size="sm"
                class="shadow-sm bg-white/95 backdrop-blur border border-gray-200"
              >
                <div class="flex items-center gap-1.5">
                  <UIcon
                    name="i-heroicons-building-office-2"
                    class="w-3 h-3 text-gray-500"
                  />
                  <span class="max-w-[150px] truncate">{{
                    datasetMeta.instansi
                  }}</span>
                </div>
              </UBadge>

              <UBadge
                v-if="datasetMeta.sumber !== '-'"
                variant="subtle"
                color="gray"
                size="sm"
                class="shadow-sm bg-white/95 backdrop-blur border border-gray-200"
              >
                <div class="flex items-center gap-1.5">
                  <UIcon
                    name="i-heroicons-link"
                    class="w-3 h-3 text-gray-500"
                  />
                  <span class="max-w-[300px] truncate"
                    >Sumber: {{ datasetMeta.sumber }}</span
                  >
                </div>
              </UBadge>
            </div>
          </div>

          <button
            v-if="isMapReady"
            @click="handleResetMap"
            class="flex items-center justify-center bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 shadow-lg p-1.5 rounded-lg transition-colors"
            title="Reset Peta"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
          </button>

          <button
            v-if="isFullscreenAvailable"
            @click="openFullscreen = true"
            class="flex items-center justify-center bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 shadow-lg p-1.5 rounded-lg transition-colors tour-fullscreen-btn-target"
            title="Fullscreen"
          >
            <UIcon name="i-heroicons-arrows-pointing-out" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        class="absolute bottom-5 right-4 z-[500] flex flex-col items-end gap-3 pointer-events-none"
      >
        <div class="pointer-events-auto flex flex-row items-end gap-3">
          <div class="flex flex-row gap-2 items-end">
            <MapSpatialControlBoundary
              v-if="isMapReady"
              :map="map"
              :geo-json-data="activeGeoJsonForBoundary"
              :current-level="currentLevel || 'prov'"
              position-class="static"
              :active="isBoundaryActive"
              @update:active="isBoundaryActive = $event"
              :opacity-val="boundaryOpacity"
              @update:opacity-val="boundaryOpacity = $event"
              :show-labels="showBoundaryLabels"
              @update:showLabels="showBoundaryLabels = $event"
            />

            <MapSpatialLegend
              :dampak-pmss-layers="activePMSSLayerObjects"
              :dampak-brin-layers="activeAdditionalLayers"
              :sebaran-items="localIndikatorList"
              v-model:showPhotosOnly="showPhotosOnly"
              :choropleth-items="legendItems"
              :choropleth-unit="currentUnit"
              v-model:choroplethOpacity="mapOpacity"
              :show-pendataan="isMapReady"
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
        class="absolute z-[1000] pointer-events-none transform -translate-x-1/2 -translate-y-[105%]"
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
        class="absolute bottom-5 left-2 z-[400] pointer-events-none"
      >
        <MapSpatialLastUpdate :text="lastUpdateText" />
      </div>
    </div>

    <div
      class="shrink-0 z-[1000] h-full shadow-2xl transition-[width] duration-300 ease-in-out relative flex flex-col"
      :class="[
        // LOGIKA UTAMA:
        // Jika Data Ada & Sidebar Buka = Lebar 400px & Border Ada
        // Jika Data Kosong / Sidebar Tutup = Lebar 0 & Border Hilang
        (selectedLocation || selectedInfo) && isRightSidebarOpen
          ? 'w-[300px] border-l border-gray-200'
          : 'w-0 border-none',
      ]"
    >
      <button
        v-if="selectedLocation || selectedInfo"
        @click="isRightSidebarOpen = !isRightSidebarOpen"
        class="absolute top-1/2 -translate-y-1/2 -left-6 w-6 h-16 bg-white border-y border-l border-gray-200 rounded-l-lg shadow-[-2px_0_5px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:text-amber-600 text-gray-400 transition-all z-[1002] group"
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
          v-if="selectedLocation || selectedInfo"
          :info="selectedInfo"
          :location="selectedLocation"
          :dataset-label="currentIndikatorName"
          :unit="currentUnit"
          :description="currentIndikatorDesc"
          :related-indicators="relatedIndicators"
          :is-loading-related="isLoadingRelated"
          :is-filter-complete="true"
          @close="handleCloseSidebar"
          @close-location="selectedLocation = null"
          @switch-indicator="handleSwitchRelatedIndicator"
        />
      </div>
    </div>
  </div>

  <Teleport to="body">
    <UModal
      v-model:open="openFullscreen"
      fullscreen
      :ui="{ base: 'h-full', width: 'w-full' }"
    >
      <template #content>
        <MapSpatialFullScreenModal
          :map-id="mapId"
          :map-type="mapType"
          :map-instance="mapFullscreen"
          :selected-dataset-label="selectedDatasetLabel"
          :dataset-meta="datasetMeta"
          :selected-dataset-id="selectedDatasetId"
          :is-loading="isLoading"
          :breadcrumb-path="breadcrumbPath"
          :current-level="currentLevel || 'prov'"
          :active-panel="activePanel"
          :is-map-ready="isMapReady"
          :selected-info="selectedInfo"
          :active-sektor-tab="activeSektorTab"
          :available-sektors="availableSektors"
          :grouped-datasets="groupedDatasets"
          :selected-indikator-id="selectedIndikatorId"
          :filter-state="contextInfo"
          :local-indikator-list="localIndikatorList"
          :condition-layer-component="conditionLayerComponent"
          :is-condition-menu-open="isConditionMenuOpen"
          :is-region-filter-active="isRegionFilterActive"
          :active-condition-layer="activeConditionLayer"
          :condition-layer-opacity="conditionLayerOpacity"
          :is-dampak-menu-open="isDampakMenuOpen"
          :additional-layers-config="additionalLayersConfigConst"
          :active-additional-layers="activeAdditionalLayers"
          :pmss-layers-config="pmssLayersConfigConst"
          :active-pmss-layer-ids="activePMSSLayerIds"
          :active-pmss-layer-objects="activePMSSLayerObjects"
          :dampak-layer-opacity="dampakLayerOpacity"
          :current-indikator-name="currentIndikatorName"
          :current-unit="currentUnit"
          :current-indikator-desc="currentIndikatorDesc"
          :related-indicators-data="relatedIndicatorsData"
          :is-loading-related="isLoadingRelated"
          :hover-info="hoverInfo"
          :tooltip-pos="tooltipPos"
          :is-pendataan-ready="isPendataanReady"
          :show-photos-only="showPhotosOnly"
          :map-opacity="mapOpacity"
          :legend-items="legendItems"
          :active-geo-json-for-boundary="activeGeoJsonForBoundary"
          :is-boundary-active="isBoundaryActive"
          :boundary-opacity="boundaryOpacity"
          :last-update-text="lastUpdateText"
          :selected-location="selectedLocation"
          :show-boundary-labels="showBoundaryLabels"
          :is-map-fully-mounted="isMapFullyMounted"
          @update:showBoundaryLabels="showBoundaryLabels = $event"
          @close="openFullscreen = false"
          @export="handleExportExcel"
          @drill-reset="handleDrillReset"
          @drill-to-level="handleDrillToLevel"
          @toggle-panel="togglePanel"
          @reset-map="handleResetMap"
          @reset-choropleth="handleResetChoropleth"
          @update:activeSektorTab="activeSektorTab = $event"
          @dataset-change="onDatasetChange"
          @update:filter="() => {}"
          @update:localIndikatorList="localIndikatorList = $event"
          @update-pendataan="handleLayer2Change"
          @toggle-condition-menu="handleConditionMenuToggle"
          @toggle-condition-layer="toggleConditionLayer"
          @update:conditionLayerOpacity="conditionLayerOpacity = $event"
          @toggle-dampak-menu="handleDampakToggle"
          @toggle-additional-layer="toggleAdditionalLayer"
          @toggle-pmss-layer="togglePMSSLayer"
          @update:dampakLayerOpacity="dampakLayerOpacity = $event"
          @switch-indicator="handleSwitchRelatedIndicator"
          @update:showPhotosOnly="showPhotosOnly = $event"
          @update:mapOpacity="mapOpacity = $event"
          @update:isBoundaryActive="isBoundaryActive = $event"
          @update:boundaryOpacity="boundaryOpacity = $event"
          @close-detail="selectedLocation = null"
        />
      </template>
    </UModal>
  </Teleport>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onActivated,
  nextTick,
  shallowRef,
} from "vue";
const isSidebarOpen = ref(true);
import {
  additionalLayersConfig,
  pmssLayersConfig,
} from "~/constants/insight-spatial-data.ts";
import {
  DAMAGE_CONFIG,
  MAP_VIEW_CONFIG,
  SPECIAL_DATASET_CONFIG,
} from "~/constants/map-config";

import {
  getInfraIconSvg,
  getMarkerColor,
  formatMapNumber as formatNumber,
  getId,
  highlightMarkerInGroup,
  resetAllMarkers,
  getPhotoIconSvg,
  getDamageWeight,
  createClusterIcon,
} from "~/utils/map-visuals";
import {
  isFloat,
  safeRemoveLayer,
  updateLabelVisibility,
  formatDateIndo,
} from "~/utils/map-helpers";
import { useDrillDown } from "~/composables/useDrillDown";
import {
  fetchHierarchicalData,
  groupRecordsByRegion,
  fetchChildrenForHover,
  prepareFlatExportData,
} from "~/utils/hierarchical-data";
import { exportHierarchicalExcel } from "~/utils/export-excel";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// === PROPS DEFINITION (Generic Interface) ===
const props = defineProps({
  // Unique ID for the map div (e.g. 'map-pra', 'map-pasca')
  mapId: { type: String, required: true },
  // Type identifier ('pra' or 'pasca') for badges/logic
  mapType: { type: String, required: true },
  // Region Data
  wilayah: { type: Object, default: () => ({ provinsi: [], kabupaten: [] }) },
  // View mode from parent (focus/split)
  viewMode: { type: String, default: "split" },
  // Dataset Config (praDatasets vs pascaDatasets)
  datasets: { type: Array, required: true },
  // Layer Configuration (LAYER_CONFIG_PRA/PASCA)
  layerConfig: { type: Object, required: true },
  // Layer Types Keys (LAYER_TYPES_PRA/PASCA)
  layerTypes: { type: Object, required: true },
  // Dynamic Component for Condition Sidebar
  conditionLayerComponent: { type: Object, required: true },
  // Initial Defaults (Pasca has specific defaults)
  initialDatasetId: { type: Number, default: null },
  initialIndikatorId: { type: Number, default: null },
  defaultSektorTab: { type: String, default: "" },
  availableSektors: {
    type: Array,
    required: true,
    default: () => [],
  },
  isFullscreenAvailable: { type: Boolean, default: true },
});
const emit = defineEmits(["update:activeTab", "panel-opened"]);

const toast = useToast();
const mapRef = shallowRef(null);
const mapFullscreenRef = shallowRef(null);
const selectedVariantId = ref(null); // Simpan key varian yang aktif
const hoverDataCache = ref({});
const dampakLayerOpacity = ref(0.8);

let markerClusterGroup = null;
let markerClusterGroupFullscreen = null;
const currentTrackedMarker = shallowRef(null);
const activeMarkerHighlight = shallowRef(null);
const lastUpdateText = ref("-");
const showFullscreenHint = ref(false);
const activePanel = ref(null);
const showPhotosOnly = ref(false);
const isLevelProvinsi = ref(true);
const isLevelDesa = ref(false);
const isLevelKecamatan = ref(false);
const isLevelKabkot = ref(false);
const geoJsonKabkot = shallowRef(null);
const geoJsonDesa = shallowRef(null);
const geoJsonKecamatan = shallowRef(null);
const geoJsonProvinsi = shallowRef(null);
const activeAdditionalLayers = ref([]);
const cachedAdditionalData = shallowRef({});
const additionalLayerInstances = shallowRef({});
const isBrinMenuOpen = ref(false);
const relatedIndicatorsData = ref([]);
const isLoadingRelated = ref(false);
const isBoundaryActive = ref(true);
const boundaryOpacity = ref(1.0);
const showBoundaryLabels = ref(false);
const isMapFullyMounted = ref(false);
const additionalLayersConfigConst = additionalLayersConfig;
const pmssLayersConfigConst = pmssLayersConfig;
const isRightSidebarOpen = ref(true);
const togglePanel = (panelName) => {
  if (activePanel.value === panelName) {
    activePanel.value = null;
  } else {
    activePanel.value = panelName;
    isBrinMenuOpen.value = false;
  }
};

const {
  drillDownStack,
  currentLevel,
  currentParentId,
  breadcrumbPath,
  canDrillDown,
  drillDown,
  drillUp,
  resetDrill,
  setAggregationFlag,
  setBaseLevel,
} = useDrillDown();

const hoverTableVisible = ref(false);
const hoverTablePos = ref({ x: 0, y: 0 });
const hoverTableData = ref([]);
const hoverTableLoading = ref(false);
const hoverTableParentName = ref("");
const hoverTableParentLevel = ref("");

const isConditionMenuOpen = ref(false);
const activeConditionLayer = ref(null);
const conditionLayerOpacity = ref(0.8);
const conditionLayerInstance = shallowRef(null);

const isDampakMenuOpen = ref(false);
const isPMSSMenuOpen = ref(false);
const activePMSSLayerIds = ref([]);
const activePMSSLayerObjects = ref([]);
const pmssLayerInstances = shallowRef({});

const sidebarOrder = ref(["kondisi_wilayah", "dampak"]);

const getSidebarPositionClass = (layerId) => {
  const index = sidebarOrder.value.indexOf(layerId);
  const positions = ["bottom-[18rem]", "bottom-[12rem]"];
  return positions[index] || "bottom-[12rem]";
};

const handleCloseSidebar = () => {
  selectedLocation.value = null;
  selectedInfo.value = null;

  if (geoJsonLayer) geoJsonLayer.eachLayer((l) => geoJsonLayer.resetStyle(l));
  if (geoJsonLayerFullscreen)
    geoJsonLayerFullscreen.eachLayer((l) =>
      geoJsonLayerFullscreen.resetStyle(l),
    );
};

const bringToFront = (layerId) => {
  const otherLayers = sidebarOrder.value.filter((id) => id !== layerId);
  sidebarOrder.value = [layerId, ...otherLayers];
};

const handleLayer2Change = async () => {
  const activeKeys = localIndikatorList.value
    .filter((i) => i.checked)
    .map((i) => i.data_key);

  if (activeKeys.length === 0) {
    clearPendataanMarkers();
    return;
  }

  let targetRegionIds = [];

  if (currentParentId.value) {
    targetRegionIds = [currentParentId.value];
  } else {
    // Ambil semua ID yang tersedia di props
    if (props.wilayah.kabupaten?.length > 0) {
      targetRegionIds = props.wilayah.kabupaten.map((k) => getId(k));
    } else if (props.wilayah.provinsi?.length > 0) {
      targetRegionIds = props.wilayah.provinsi.map((p) => getId(p));
    }
  }

  targetRegionIds = targetRegionIds.filter(Boolean);
  if (targetRegionIds.length === 0) return;

  // Cek apakah data sudah ada di local state untuk menghindari fetch ulang (optional optimization)
  const missingKeys = activeKeys.filter(
    (key) => !locationsData.value[key] || locationsData.value[key].length === 0,
  );

  // Panggil SEKALI saja dengan mengirim array ID
  if (missingKeys.length > 0 || targetRegionIds.length > 0) {
    await fetchLocationData(targetRegionIds, activeKeys);
  }

  updatePendataanMarkers();
};

const clearPendataanMarkers = () => {
  locationsData.value = {};
  selectedLocation.value = null;

  if (localIndikatorList.value.length > 0) {
    localIndikatorList.value.forEach((ind) => {
      ind.checked = false;
      ind.isOpen = false;
      ind.selectedJenisInfra = [];
    });
  }

  if (markerLayer) markerLayer.clearLayers();
  if (markerClusterGroup) {
    markerClusterGroup.clearLayers();
    if (map) map.removeLayer(markerClusterGroup);
    markerClusterGroup = null;
  }
  if (markerLayerFullscreen) markerLayerFullscreen.clearLayers();
  if (markerClusterGroupFullscreen) {
    markerClusterGroupFullscreen.clearLayers();
    if (mapFullscreen) mapFullscreen.removeLayer(markerClusterGroupFullscreen);
    markerClusterGroupFullscreen = null;
  }
};
const handleDrillReset = () => {
  selectedInfo.value = null;

  resetDrill();

  isLevelProvinsi.value = true;
  isLevelKabkot.value = false;
  isLevelKecamatan.value = false;
  isLevelDesa.value = false;

  if (map) {
    map.setView(MAP_VIEW_CONFIG.initialCenter, MAP_VIEW_CONFIG.initialZoom);
    map.closePopup();
  }
  if (mapFullscreen) {
    mapFullscreen.setView(
      MAP_VIEW_CONFIG.initialCenter,
      MAP_VIEW_CONFIG.initialZoom,
    );
    mapFullscreen.closePopup();
  }

  // 4. Bersihkan marker & fetch ulang data
  clearPendataanMarkers();
  fetchAgregatData();
};

const handleDrillToLevel = (levelIndex) => {
  selectedInfo.value = null;
  while (drillDownStack.value.length > levelIndex + 1) {
    drillUp();
  }
  clearPendataanMarkers();
  fetchAgregatData();
};
const handleResetChoropleth = () => {
  // 1. Reset variable kunci dataset
  selectedDatasetId.value = null;
  selectedIndikatorId.value = null;
  selectedVariantId.value = null;

  // 2. Bersihkan data statistik & legend
  groupedData.value = {};
  legendItems.value = [];

  // 3. Reset Metadata Badge
  datasetMeta.value = {
    instansi: "-",
    sumber: "-",
    label: null,
    sektor: null,
    tahun: null,
  };

  // 4. Hilangkan Context/Filter Badge
  contextInfo.value = {};

  // 5. Reset Panel Informasi Kanan
  if (selectedInfo.value) {
    selectedInfo.value = null;
    isRightSidebarOpen.value = false; // Opsional: tutup sidebar kanan
  }

  // === [BARU] RESET DRILL DOWN & LEVEL WILAYAH ===
  // Ini akan memaksa MapSpatialControlBoundary kembali ke geojson provinsi
  resetDrill();

  // Reset flag level visual
  isLevelProvinsi.value = true;
  isLevelKabkot.value = false;
  isLevelKecamatan.value = false;
  isLevelDesa.value = false;

  // Reset Base Level (Penting jika ada logika setBaseLevel)
  setBaseLevel("prov");

  // Reset Tampilan Kamera Peta (Zoom Out ke awal)
  if (map) {
    map.setView(MAP_VIEW_CONFIG.initialCenter, MAP_VIEW_CONFIG.initialZoom);
    map.closePopup();
  }
  if (mapFullscreen) {
    mapFullscreen.setView(
      MAP_VIEW_CONFIG.initialCenter,
      MAP_VIEW_CONFIG.initialZoom,
    );
    mapFullscreen.closePopup();
  }
  // ===============================================

  // 6. Reset Style Peta (Choropleth jadi transparan)
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer((l) => geoJsonLayer.resetStyle(l));
  }
  if (geoJsonLayerFullscreen) {
    geoJsonLayerFullscreen.eachLayer((l) =>
      geoJsonLayerFullscreen.resetStyle(l),
    );
  }

  // CATATAN PENTING:
  // Kita TIDAK menghapus marker pendataan (localIndikatorList)
  // atau layer tambahan (activeAdditionalLayers).
  // Mereka akan tetap ada, tapi sekarang dilihat dari zoom level Provinsi.

  toast.add({
    title: "Layer Data Direset",
    description: "Kembali ke tampilan level Provinsi.",
    color: "gray",
    icon: "i-heroicons-arrow-path",
    timeout: 1500,
  });
};
const handleExportExcel = async () => {
  if (!selectedDatasetId.value || !selectedIndikatorId.value) {
    toast.add({
      title: "Silakan pilih dataset terlebih dahulu",
      color: "amber",
    });
    return;
  }
  const exportToast = toast.add({
    title: "Menyiapkan export...",
    icon: "i-heroicons-arrow-path",
    color: "blue",
  });
  try {
    const dataToExport = rawRecords.value.map((rec) => {
      const row = {
        Provinsi: rec.kd_prov?.nama || "",
        "Kode Provinsi": rec.kd_prov?.kode || "",
      };
      if (rec.kd_kab) {
        row["Kabupaten"] = rec.kd_kab.nama || "";
        row["Kode Kabupaten"] = rec.kd_kab.kode || "";
      }
      if (rec.kd_kec) {
        row["Kecamatan"] = rec.kd_kec.nama || "";
        row["Kode Kecamatan"] = rec.kd_kec.kode || "";
      }
      if (rec.kd_desa) {
        row["Desa"] = rec.kd_desa.nama || "";
        row["Kode Desa"] = rec.kd_desa.kode || "";
      }
      for (let i = 1; i <= 5; i++) {
        const key = `itemCategory${i}`;
        if (rec[key]) {
          const val = rec[key]?.nama || rec[key]?.kode || rec[key];
          if (val) row[`Kategori ${i}`] = val;
        }
      }
      row["Nilai"] = rec.value || 0;
      row["Satuan"] = currentUnit.value;
      return row;
    });
    if (dataToExport.length === 0) {
      toast.remove(exportToast.id);
      toast.add({
        title: "Tidak ada data untuk diexport",
        color: "amber",
      });
      return;
    }
    const success = await exportHierarchicalExcel(
      dataToExport,
      `Data_${selectedDatasetLabel.value.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`,
      {
        datasetName: selectedDatasetLabel.value,
        unit: currentUnit.value,
        filters: contextInfo.value,
      },
    );
    toast.remove(exportToast.id);
    if (success) {
      toast.add({
        title: `Berhasil export ${dataToExport.length} baris data`,
        color: "green",
      });
    } else {
      throw new Error("Export failed");
    }
  } catch (error) {
    console.error("Export error:", error);
    toast.remove(exportToast.id);
    toast.add({
      title: "Gagal export Excel",
      description: error.message || "Terjadi kesalahan",
      color: "red",
    });
  }
};

const handleConditionMenuToggle = (isOpen) => {
  isConditionMenuOpen.value = isOpen;
  if (isOpen) {
    activePanel.value = null;
    isDampakMenuOpen.value = false;
    bringToFront("kondisi_wilayah");
  }
};

const handleDampakToggle = (isOpen) => {
  isDampakMenuOpen.value = isOpen;
  if (isOpen) {
    activePanel.value = null;
    isConditionMenuOpen.value = false;
    bringToFront("dampak");
  }
};

const handleResetMap = async () => {
  const loadingReset = toast.add({
    title: "Mereset tampilan...",
    color: "gray",
  });
  try {
    resetDrill();
    isLevelProvinsi.value = true;
    isLevelKabkot.value = false;
    isLevelKecamatan.value = false;
    isLevelDesa.value = false;
    if (map) {
      map.setView(MAP_VIEW_CONFIG.initialCenter, MAP_VIEW_CONFIG.initialZoom);
    }
    activePanel.value = null;
    isConditionMenuOpen.value = false;
    isDampakMenuOpen.value = false;
    isBrinMenuOpen.value = false;
    closeInfoPanel();
    selectedInfo.value = null;

    if (activeMarkerHighlight.value) {
      activeMarkerHighlight.value.remove();
      activeMarkerHighlight.value = null;
    }
    if (activeConditionLayer.value) {
      await toggleConditionLayer(activeConditionLayer.value);
    }
    const activeAdditional = [...activeAdditionalLayers.value];
    for (const layerId of activeAdditional) {
      await toggleAdditionalLayer(layerId);
    }
    const activePMSS = [...activePMSSLayerObjects.value];
    for (const layerObj of activePMSS) {
      await togglePMSSLayer(layerObj);
    }
    if (selectedDatasetId.value) {
      selectedDatasetId.value = null;
      selectedIndikatorId.value = null;
      if (geoJsonLayer && map) map.removeLayer(geoJsonLayer);
      if (geoJsonLayerFullscreen && mapFullscreen)
        mapFullscreen.removeLayer(geoJsonLayerFullscreen);
      groupedData.value = {};
      legendItems.value = [];
    }
    localIndikatorList.value.forEach((ind) => {
      ind.checked = false;
      ind.isOpen = false;
      ind.selectedJenisInfra = [];
    });
    if (markerClusterGroup) markerClusterGroup.clearLayers();
    if (markerClusterGroupFullscreen)
      markerClusterGroupFullscreen.clearLayers();
    locationsData.value = {};
    selectedLocation.value = null;
    toast.remove(loadingReset.id);
    toast.add({
      title: "Map di-reset",
      icon: "i-heroicons-check",
      color: "green",
      timeout: 1500,
    });
  } catch (e) {
    console.error("Gagal reset map", e);
    toast.remove(loadingReset.id);
  }
};

const toggleConditionLayer = async (layerType) => {
  const L = await import("leaflet");
  if (activeConditionLayer.value === layerType) {
    if (map && conditionLayerInstance.value) {
      map.removeLayer(conditionLayerInstance.value);
    }
    if (mapFullscreen && conditionLayerInstance.value?._fs) {
      mapFullscreen.removeLayer(conditionLayerInstance.value._fs);
    }
    conditionLayerInstance.value = null;
    activeConditionLayer.value = null;
    return;
  }
  if (conditionLayerInstance.value) {
    if (map) map.removeLayer(conditionLayerInstance.value);
    if (mapFullscreen && conditionLayerInstance.value._fs) {
      mapFullscreen.removeLayer(conditionLayerInstance.value._fs);
    }
  }
  activeConditionLayer.value = layerType;

  const config = props.layerConfig[layerType];
  if (!config) {
    console.warn(
      `[MapError] Konfigurasi tidak ditemukan untuk layer: ${layerType}`,
    );
    return;
  }
  conditionLayerOpacity.value = config.defaultOpacity;
  let finalUrl = config.url;

  if (layerType === props.layerTypes.VIIRS) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const timeParam = oneWeekAgo.toISOString().split("T")[0];
    finalUrl = config.url.replace("{time}", timeParam);
  }
  const tileLayer = L.tileLayer(finalUrl, {
    attribution: config.attribution,
    minZoom: config.minZoom,
    maxZoom: config.maxZoom,
    opacity: conditionLayerOpacity.value,
    zIndex: layerType === props.layerTypes.DEM ? 5 : 3,
    bounds: config.bounds || MAP_VIEW_CONFIG.bounds,
  });
  if (map) {
    tileLayer.addTo(map);
    conditionLayerInstance.value = tileLayer;
  }
  if (mapFullscreen) {
    const fsLayer = L.tileLayer(finalUrl, {
      attribution: config.attribution,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      opacity: conditionLayerOpacity.value,
      zIndex: layerType === props.layerTypes.DEM ? 5 : 3,
      bounds: config.bounds || MAP_VIEW_CONFIG.bounds,
    });
    fsLayer.addTo(mapFullscreen);
    conditionLayerInstance.value._fs = fsLayer;
  }
};

const fetchLastUpdateDate = async () => {
  try {
    const res = await $fetch("/api/last-update");
    if (res.success && res.data?.updated_date) {
      lastUpdateText.value = formatDateIndo(res.data.updated_date);
    }
  } catch (e) {
    console.error("Gagal load tanggal update", e);
  }
};

const activeSektorTab = ref(props.defaultSektorTab);
const datasetMeta = ref({
  instansi: "-",
  sumber: "-",
  label: null,
  sektor: null,
  tahun: null,
});
const availableDatasets = ref([]);
const isListLoading = ref(false);

const fetchDatasetList = async () => {
  isListLoading.value = true;
  try {
    const uniqueTargets = new Map();
    props.datasets.forEach((d) => {
      const key = `${d.id_dataset}_${d.id_indikator}`;
      if (!uniqueTargets.has(key)) {
        uniqueTargets.set(key, {
          id_dataset: d.id_dataset,
          id_indikator: d.id_indikator,
        });
      }
    });

    const res = await $fetch("/api/dataset-list", {
      method: "POST",
      body: { targets: Array.from(uniqueTargets.values()) },
    });

    if (res.success) {
      availableDatasets.value = props.datasets
        .map((localConf) => {
          const apiData = res.data.find(
            (api) =>
              api.id_dataset == localConf.id_dataset &&
              api.id_indikator == localConf.id_indikator,
          );

          if (!apiData) return null;

          const configKey =
            localConf.variant_id ||
            `${localConf.id_dataset}_${localConf.id_indikator}`;

          const customConfig = SPECIAL_DATASET_CONFIG[configKey];

          const finalLabel =
            customConfig?.label || localConf.label || apiData.dataset_label;

          return {
            ...apiData,
            ...localConf,
            dataset_label: finalLabel,
            label: finalLabel,
          };
        })
        .filter(Boolean);
    }
  } catch (e) {
    console.error("Gagal memuat list dataset", e);
  } finally {
    isListLoading.value = false;
  }
};
const groupedDatasets = computed(() => {
  const filtered = availableDatasets.value.filter(
    (d) => d.sektor === activeSektorTab.value,
  );

  const groupsMap = new Map();

  filtered.forEach((item) => {
    const groupKey = item.variant_id ? item.variant_id : item.id_dataset;

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        id_dataset: item.id_dataset,
        variant_id: item.variant_id || null, // Penting bawa variant_id
        dataset_label:
          item.dataset_label || item.label || `Dataset ${item.id_dataset}`,
        sektor: item.sektor,
        indicators: [],
      });
    }

    const currentGroup = groupsMap.get(groupKey);
    currentGroup.indicators.push({
      id_indikator: item.id_indikator,
      label: item.indikator_label || `Indikator ${item.id_indikator}`,
      variant_id: item.variant_id || null,
    });
  });

  return Array.from(groupsMap.values());
});
const handleSwitchRelatedIndicator = (indikator) => {
  onDatasetChange({
    id_dataset: selectedDatasetId.value,
    id_indikator: indikator.id_indikator,
    label: indikator.label,
    sektor: activeSektorTab.value,
  });
};

const fetchRelatedIndicatorValues = async (regionId, level) => {
  if (!selectedDatasetId.value || !selectedIndikatorId.value) return;
  const currentGroup = groupedDatasets.value.find(
    (g) => g.id_dataset === selectedDatasetId.value,
  );
  if (!currentGroup) {
    relatedIndicatorsData.value = [];
    return;
  }
  const others = currentGroup.indicators.filter(
    (ind) => ind.id_indikator !== selectedIndikatorId.value,
  );
  if (others.length === 0) {
    relatedIndicatorsData.value = [];
    return;
  }
  isLoadingRelated.value = true;
  relatedIndicatorsData.value = others.map((ind) => ({
    ...ind,
    value: null,
    unit: "",
    formattedValue: "...",
  }));
  const regionParams = {};
  if (level === "desa") {
    regionParams.id_desa = regionId;
  } else if (level === "kec") {
    regionParams.id_kec = regionId;
  } else if (level === "kab") {
    regionParams.id_kab = regionId;
  } else {
    regionParams.id_prov = regionId;
  }
  try {
    const promises = others.map((ind) =>
      $fetch("/api/agregat-insight", {
        params: {
          id_dataset: selectedDatasetId.value,
          id_indikator_insight: ind.id_indikator,
          ...regionParams,
        },
      }),
    );
    const results = await Promise.all(promises);
    relatedIndicatorsData.value = others.map((ind, index) => {
      const res = results[index];
      let val = 0;
      let unit = "Satuan";
      if (res.success && res.data?.records?.length > 0) {
        val = res.data.records.reduce((acc, curr) => {
          return acc + (parseFloat(curr.value) || 0);
        }, 0);
        unit = res.data.records[0].indikator?.satuan || "";
      }
      return {
        ...ind,
        value: val,
        unit: unit,
        formattedValue: formatNumber(val),
      };
    });
  } catch (e) {
    console.error("Gagal fetch related values", e);
    relatedIndicatorsData.value = relatedIndicatorsData.value.map((i) => ({
      ...i,
      formattedValue: "-",
    }));
  } finally {
    isLoadingRelated.value = false;
  }
};

const togglePMSSLayer = async (layerDef) => {
  if (!isRegionFilterActive.value) {
    toast.add({
      title: "Silakan pilih wilayah terlebih dahulu",
      color: "amber",
    });
    return;
  }
  const L = await import("leaflet");
  const layerId = layerDef.id;
  const index = activePMSSLayerIds.value.indexOf(layerId);
  if (index !== -1) {
    activePMSSLayerIds.value.splice(index, 1);
    const objIndex = activePMSSLayerObjects.value.findIndex(
      (l) => l.id === layerId,
    );
    if (objIndex !== -1) activePMSSLayerObjects.value.splice(objIndex, 1);
    if (map && pmssLayerInstances.value[layerId]) {
      map.removeLayer(pmssLayerInstances.value[layerId]);
      delete pmssLayerInstances.value[layerId];
    }
    if (mapFullscreen && pmssLayerInstances.value[`${layerId}_fs`]) {
      mapFullscreen.removeLayer(pmssLayerInstances.value[`${layerId}_fs`]);
      delete pmssLayerInstances.value[`${layerId}_fs`];
    }
  } else {
    activePMSSLayerIds.value.push(layerId);
    activePMSSLayerObjects.value.push(layerDef);
    const addTileToMap = (targetMap, key) => {
      if (!targetMap) return;
      const tileLayer = L.tileLayer(layerDef.url, {
        attribution: "BPS GeoServer",
        maxZoom: 19,
        opacity: dampakLayerOpacity.value,
        zIndex: 10,
      });
      tileLayer.addTo(targetMap);
      pmssLayerInstances.value[key] = tileLayer;
    };
    if (map) addTileToMap(map, layerId);
    if (openFullscreen.value && mapFullscreen)
      addTileToMap(mapFullscreen, `${layerId}_fs`);
  }
};

const toggleAdditionalLayer = async (layerId) => {
  if (!isRegionFilterActive.value) {
    toast.add({
      title: "Silakan pilih wilayah terlebih dahulu",
      color: "amber",
    });
    return;
  }
  const L = await import("leaflet");
  const index = activeAdditionalLayers.value.indexOf(layerId);
  if (index !== -1) {
    activeAdditionalLayers.value.splice(index, 1);
    if (map && additionalLayerInstances.value[layerId]) {
      safeRemoveLayer(map, additionalLayerInstances.value[layerId]);
      delete additionalLayerInstances.value[layerId];
    }
    if (mapFullscreen && additionalLayerInstances.value[`${layerId}_fs`]) {
      safeRemoveLayer(
        mapFullscreen,
        additionalLayerInstances.value[`${layerId}_fs`],
      );
      delete additionalLayerInstances.value[`${layerId}_fs`];
    }
    return;
  }
  activeAdditionalLayers.value.push(layerId);
  const config = additionalLayersConfig.find((l) => l.id === layerId);
  if (!config) return;
  let geoData = null;
  if (config.id === "bangunan_terdampak" || config.type === "api") {
    const loadingToast = toast.add({
      title: `Mengambil data ${config.label}...`,
      icon: "i-heroicons-arrow-path",
    });
    try {
      const params = {};
      if (props.wilayah.provinsi?.length > 0) {
        params.id_prov = props.wilayah.provinsi.map((p) => getId(p));
      }
      if (props.wilayah.kabupaten?.length > 0) {
        params.id_kab = props.wilayah.kabupaten.map((k) => getId(k));
      }
      const res = await $fetch("/api/bangunan-terdampak-spectra", {
        params: { ...params, limit: 2000 },
      });
      if (res.success && res.data?.records) {
        geoData = {
          type: "FeatureCollection",
          features: res.data.records.map((rec) => ({
            type: "Feature",
            properties: rec,
            geometry: {
              type: "Point",
              coordinates: [
                parseFloat(rec.longitude),
                parseFloat(rec.latitude),
              ],
            },
          })),
        };
        cachedAdditionalData.value[layerId] = geoData;
      } else {
        throw new Error("Data kosong");
      }
      toast.remove(loadingToast.id);
    } catch (e) {
      console.error(e);
      toast.remove(loadingToast.id);
      toast.add({ title: `Gagal memuat ${config.label}`, color: "red" });
      activeAdditionalLayers.value.pop();
      return;
    }
  } else {
    geoData = cachedAdditionalData.value[layerId];
    if (!geoData && config.loader) {
      const loadingToast = toast.add({
        title: `Memuat ${config.label}...`,
        icon: "i-heroicons-arrow-path",
      });
      try {
        const module = await config.loader();
        geoData = module.default || module;
        cachedAdditionalData.value[layerId] = geoData;
        toast.remove(loadingToast.id);
      } catch (e) {
        console.error(e);
        toast.add({ title: "Gagal memuat layer", color: "red" });
        return;
      }
    }
  }
  const filterLogic = (feature) => {
    if (config.type === "api" || config.id === "bangunan_terdampak")
      return true;
    const propsData = feature.properties;
    if (!propsData) return false;
    const featureIdDesa = String(propsData.iddesa || "");
    if (!featureIdDesa) return false;
    if (props.wilayah.kabupaten?.length > 0) {
      const selectedKabIds = props.wilayah.kabupaten.map((k) =>
        String(getId(k)),
      );
      return selectedKabIds.some((kabId) => featureIdDesa.startsWith(kabId));
    }
    if (props.wilayah.provinsi?.length > 0) {
      const selectedProvIds = props.wilayah.provinsi.map((p) =>
        String(getId(p)),
      );
      return selectedProvIds.some((provId) => featureIdDesa.startsWith(provId));
    }
    return false;
  };
  const renderToMap = (targetMap, instanceKey) => {
    if (!targetMap || !geoData) return;
    if (additionalLayerInstances.value[instanceKey]) {
      targetMap.removeLayer(additionalLayerInstances.value[instanceKey]);
    }
    const layer = L.geoJSON(geoData, {
      pane: "dampakPane",
      filter: filterLogic,
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          pane: "dampakPane",
          radius: 6,
          fillColor: config.color,
          color: "#fff",
          weight: 1,
          opacity: dampakLayerOpacity.value,
          fillOpacity: dampakLayerOpacity.value,
        });
      },
      style: {
        color: config.color,
        weight: 1.5,
        opacity: dampakLayerOpacity.value,
        fillOpacity: Math.max(0.1, dampakLayerOpacity.value - 0.2),
        dashArray: "5, 5",
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          let content = `<div class="font-bold text-xs mb-2 border-b pb-1 text-amber-600">${config.label}</div>`;
          content += `<div class="max-h-[150px] overflow-y-auto custom-scrollbar space-y-0.5">`;
          for (const [k, v] of Object.entries(feature.properties)) {
            const isTechnical = [
              "geometry",
              "id_prov",
              "id_kab",
              "id_kec",
              "id_desa",
              "geometry_type",
              "longitude",
              "latitude",
            ].includes(k);
            if (!isTechnical && v !== null && v !== "") {
              content += `<div class="text-[10px] flex gap-2"><span class="font-semibold text-gray-600 min-w-[80px]">${k}</span><span class="text-gray-800 break-words flex-1">: ${v}</span></div>`;
            }
          }
          content += `</div>`;
          layer.bindPopup(content);
        }
      },
    });
    layer.addTo(targetMap);
    additionalLayerInstances.value[instanceKey] = layer;
  };
  if (map) renderToMap(map, layerId);
  if (openFullscreen.value && mapFullscreen)
    renderToMap(mapFullscreen, `${layerId}_fs`);
};

const rawRecords = ref([]);
const contextInfo = ref({});
const currentUnit = ref("");
const currentIndikatorName = ref("");
const currentIndikatorDesc = ref("");
const isLoading = ref(false);
const showDatasetList = ref(false);
const openFullscreen = ref(false);

const selectedDatasetId = ref(props.initialDatasetId);
const selectedIndikatorId = ref(props.initialIndikatorId);

const hoverInfo = ref(null);
const tooltipPos = ref({ x: 0, y: 0 });
const selectedInfo = ref(null);
const groupedData = ref({});
const legendItems = ref([]);

let map = null;
let mapFullscreen = null;
let geoJsonLayer = null;
let geoJsonLayerFullscreen = null;
let labelLayer = null;
let labelLayerFullscreen = null;
const mapOpacity = ref(0.7);

const isRegionFilterActive = computed(() => {
  const hasProv = props.wilayah?.provinsi && props.wilayah.provinsi.length > 0;
  const hasKab = props.wilayah?.kabupaten && props.wilayah.kabupaten.length > 0;
  return hasProv || hasKab;
});

const localIndikatorList = ref([]);
const locationsData = ref({});
const selectedLocation = ref(null);
const cachedLocationsData = ref({});
let markerLayer = null;
let markerLayerFullscreen = null;

const isMapReady = computed(
  () =>
    props.wilayah &&
    (props.wilayah.provinsi?.length > 0 || props.wilayah.kabupaten?.length > 0),
);

const selectedDatasetLabel = computed(() => {
  if (!selectedDatasetId.value) return "Pilih Indikator";
  const found = availableDatasets.value.find(
    (d) =>
      d.id_dataset === selectedDatasetId.value &&
      d.id_indikator === selectedIndikatorId.value,
  );
  return found?.dataset_label || datasetMeta.value.label || "Insight Data";
});

const isPendataanReady = computed(
  () =>
    localIndikatorList.value.length > 0 &&
    Object.keys(locationsData.value).length > 0,
);

const getDynamicColor = (val) => {
  if (val === 0) return "#FFFFFF";
  const item = legendItems.value.find((l) => val >= l.min && val <= l.max);
  return item ? item.color : "#FFFFFF";
};

const closeInfoPanel = () => {
  // 1. Reset Info Detail Wilayah (ini boleh tetap jalan biar popup wilayah tutup)
  selectedInfo.value = null;
  locationsData.value = {};
  selectedLocation.value = null;

  if (activeMarkerHighlight.value) {
    activeMarkerHighlight.value.remove();
    activeMarkerHighlight.value = null;
  }

  // 4. JANGAN PINDAH PANEL (Opsional: kalau mau tetap di tab layer pendataan)
  // if (activePanel.value === "layer2") {
  //   activePanel.value = "layer1";
  // }

  // 5. JANGAN HAPUS MARKER DARI PETA
  // if (markerClusterGroup) markerClusterGroup.clearLayers(); // <--- Beri komentar

  // if (markerClusterGroupFullscreen) markerClusterGroupFullscreen.clearLayers(); // <--- Beri komentar

  // 6. Reset Style Wilayah (Choropleth) boleh tetap jalan
  if (geoJsonLayer) geoJsonLayer.eachLayer((l) => geoJsonLayer.resetStyle(l));
  if (geoJsonLayerFullscreen)
    geoJsonLayerFullscreen.eachLayer((l) =>
      geoJsonLayerFullscreen.resetStyle(l),
    );
};
const onDatasetChange = async (dataset) => {
  activePanel.value = null;
  if (!dataset || !dataset.id_dataset) {
    handleResetMap();
    return;
  }
  if (
    selectedDatasetId.value === dataset.id_dataset &&
    selectedIndikatorId.value === dataset.id_indikator &&
    selectedVariantId.value === dataset.variant_id
  ) {
    handleResetMap();
    return;
  }

  selectedDatasetId.value = dataset.id_dataset;
  selectedIndikatorId.value = dataset.id_indikator;

  selectedVariantId.value = dataset.variant_id || null;

  datasetMeta.value = {
    ...datasetMeta.value,
    label: dataset.label || dataset.dataset_label,
    sektor: dataset.sektor,
    instansi: "Memuat...",
    sumber: "-",
  };

  locationsData.value = {};
  selectedLocation.value = null;
  selectedInfo.value = null;
  groupedData.value = {};
  legendItems.value = [];

  if (localIndikatorList.value.length > 0) {
    localIndikatorList.value.forEach((ind) => {
      ind.checked = false;
      ind.isOpen = false;
      ind.selectedJenisInfra = [];
    });
  }

  clearPendataanMarkers();
  if (markerLayer) markerLayer.clearLayers();
  if (markerLayerFullscreen) markerLayerFullscreen.clearLayers();

  setBaseLevel("prov");

  // 2. Reset variabel state visual level secara eksplisit
  isLevelProvinsi.value = true;
  isLevelKabkot.value = false;
  isLevelKecamatan.value = false;
  isLevelDesa.value = false;
  resetDrill();
  if (map) {
    map.setView(MAP_VIEW_CONFIG.initialCenter, MAP_VIEW_CONFIG.initialZoom);
    map.closePopup();
  }
  if (mapFullscreen) {
    mapFullscreen.setView(
      MAP_VIEW_CONFIG.initialCenter,
      MAP_VIEW_CONFIG.initialZoom,
    );
    mapFullscreen.closePopup();
  }
  await fetchAgregatData();

  if (props.viewMode === "split") {
    showFullscreenHint.value = true;
    setTimeout(() => {
      showFullscreenHint.value = false;
    }, 5000);
  }
};

const fetchIndikatorList = async () => {
  try {
    const response = await $fetch("/api/list");
    if (response.success) {
      localIndikatorList.value = response.data.map((ind, index) => ({
        ...ind,
        checked: false,
        isOpen: false,
        selectedJenisInfra: [],
      }));
    }
  } catch (error) {
    console.error("Err fetch list:", error);
  }
};

const fetchLocationData = async (regionIdOrArray, types = null) => {
  if (
    !regionIdOrArray ||
    (Array.isArray(regionIdOrArray) && regionIdOrArray.length === 0)
  )
    return;

  // Logic Cache (hanya jika single ID, kalau array skip cache check sederhana)
  const isSingle =
    !Array.isArray(regionIdOrArray) || regionIdOrArray.length === 1;
  const singleId = Array.isArray(regionIdOrArray)
    ? regionIdOrArray[0]
    : regionIdOrArray;
  const cacheKey = `loc-${singleId}`;

  if (isSingle && !types && cachedLocationsData.value[cacheKey]) {
    locationsData.value = {
      ...locationsData.value,
      ...cachedLocationsData.value[cacheKey],
    };
    updatePendataanMarkers();
    return;
  }

  const loadToast = toast.add({
    title: types ? `Memuat data titik pendataan` : "Memuat titik pendataan",
    icon: "i-heroicons-arrow-path",
  });

  try {
    // Tentukan Payload berdasarkan panjang ID sample
    let payload = {};
    const sampleId = String(singleId);
    const len = sampleId.length;

    // Kirim regionIdOrArray langsung (bisa array atau string)
    if (len === 10) payload = { kode_desa: regionIdOrArray };
    else if (len === 7) payload = { kode_kec: regionIdOrArray };
    else if (len === 4) payload = { kode_kab: regionIdOrArray };
    else if (len === 2) payload = { kode_prov: regionIdOrArray };
    else throw new Error("Format ID wilayah tidak valid");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Naikkan timeout karena batch query lebih berat

    const response = await $fetch("/api/koordinat", {
      method: "POST",
      body: {
        ...payload,
        mode: "light",
        types: types,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.success) {
      const resultData = response.data || {};
      const mergedData = { ...locationsData.value };

      Object.keys(resultData).forEach((key) => {
        if (mergedData[key]) {
          // Gunakan Map utk deduplikasi yang efisien
          const map = new Map(mergedData[key].map((i) => [i.id, i]));
          resultData[key].forEach((i) => map.set(i.id, i));
          mergedData[key] = Array.from(map.values());
        } else {
          mergedData[key] = resultData[key];
        }
      });

      locationsData.value = mergedData;

      // Update cache hanya jika single request (opsional)
      if (isSingle && !types) {
        cachedLocationsData.value[cacheKey] = JSON.parse(
          JSON.stringify(resultData),
        );
      }

      updatePendataanMarkers();
    }
  } catch (error) {
    // Error handling...
    console.error("Err fetch loc:", error);
  } finally {
    toast.remove(loadToast.id);
  }
};

const fetchAgregatData = async () => {
  if (!isMapReady.value || !selectedDatasetId.value) return;

  isLoading.value = true;
  rawRecords.value = [];
  groupedData.value = {};
  legendItems.value = [];

  if (drillDownStack.value.length === 0) {
    selectedInfo.value = null;
    contextInfo.value = {};
  }

  const dataset = availableDatasets.value.find(
    (d) =>
      d.id_dataset === selectedDatasetId.value &&
      d.id_indikator === selectedIndikatorId.value,
  );

  if (!dataset) {
    isLoading.value = false;
    return;
  }

  hoverDataCache.value = {};

  try {
    let flagAgregasi = null;
    const sampleParams = {
      id_dataset: dataset.id_dataset,
      id_indikator_insight: dataset.id_indikator,
      limit: 1,
    };

    if (props.wilayah.kabupaten?.length > 0) {
      const firstKab = getId(props.wilayah.kabupaten[0]);
      if (firstKab) sampleParams.id_kab = firstKab;
    } else if (props.wilayah.provinsi?.length > 0) {
      const firstProv = getId(props.wilayah.provinsi[0]);
      if (firstProv) sampleParams.id_prov = firstProv;
    }

    const sampleResponse = await $fetch("/api/agregat-insight", {
      params: sampleParams,
    });

    if (sampleResponse.success && sampleResponse.data?.records?.[0]) {
      flagAgregasi = sampleResponse.data.records[0].flag_agregasi;
      setAggregationFlag(flagAgregasi);

      const metaSample = sampleResponse.data.meta?.dataset;
      const periodSample = sampleResponse.data.meta?.period;

      if (metaSample) {
        datasetMeta.value = {
          ...datasetMeta.value,
          instansi: metaSample.instansi || datasetMeta.value.instansi,
          sumber: metaSample.sumber || datasetMeta.value.sumber,
          tahun: periodSample || datasetMeta.value.tahun,
        };
      }
    }

    let fetchLevel = currentLevel.value;
    let params = {
      id_dataset: dataset.id_dataset,
      id_indikator_insight: dataset.id_indikator,
    };

    // --- LOGIKA UTAMA PERBAIKAN DI SINI (NON-AGREGASI) ---
    if (flagAgregasi !== 1) {
      resetDrill();
      let response = null;

      if (props.wilayah.kabupaten?.length > 0) {
        const kabIds = props.wilayah.kabupaten
          .map((k) => getId(k))
          .filter(Boolean);
        if (kabIds.length > 0) {
          response = await $fetch("/api/agregat-insight", {
            params: { ...params, id_kab: kabIds },
          });
        }
      } else if (props.wilayah.provinsi?.length > 0) {
        const provIds = props.wilayah.provinsi
          .map((p) => getId(p))
          .filter(Boolean);
        if (provIds.length > 0) {
          response = await $fetch("/api/agregat-insight", {
            params: { ...params, id_prov: provIds },
          });
        }
      }

      if (!response || !response.success || !response.data?.records?.length) {
        legendItems.value = [{ label: "Data tidak tersedia", color: "#EEE" }];
        isLoading.value = false;
        return;
      }

      const metaDs = response.data.meta.dataset;
      const metaSektor = response.data.meta.sektor;
      const metaPeriod = response.data.meta.period;

      let tahunData = null;
      if (metaPeriod) {
        const strPeriod = String(metaPeriod).trim();
        tahunData = strPeriod.includes("-")
          ? strPeriod.split("-").pop().trim()
          : strPeriod;
      }

      datasetMeta.value = {
        instansi: metaDs.instansi || "-",
        sumber: metaDs.sumber || "-",
        label: metaDs.judul || dataset.label,
        sektor: metaSektor?.nama || dataset.sektor,
        tahun: tahunData,
      };

      // [FIX] Cari record yang valid (bukan hanya index 0)
      // untuk menghindari kasus baris pertama kosong wilayahnya
      const validRec =
        response.data.records.find(
          (r) => r.kd_desa?.kode || r.kd_kec?.kode || r.kd_kab?.kode,
        ) || response.data.records[0];

      // [FIX] Reset semua flag level terlebih dahulu
      isLevelProvinsi.value = false;
      isLevelKabkot.value = false;
      isLevelKecamatan.value = false;
      isLevelDesa.value = false;

      // Logic level determination yang lebih ketat
      if (validRec.kd_desa?.kode) {
        setBaseLevel("desa");
        isLevelDesa.value = true;
        currentLevel.value = "desa";
        if (!geoJsonDesa.value) await loadGeoJsonDesa();
      } else if (validRec.kd_kec?.kode) {
        setBaseLevel("kec");
        isLevelKecamatan.value = true;
        currentLevel.value = "kec";
        if (!geoJsonKecamatan.value) await loadGeoJsonKecamatan();
      } else if (validRec.kd_kab?.kode) {
        setBaseLevel("kab");
        isLevelKabkot.value = true;
        currentLevel.value = "kab";
        if (!geoJsonKabkot.value) await loadGeoJsonKabkot();
      } else {
        // Fallback ke provinsi hanya jika tidak ada kode wilayah lain
        setBaseLevel("prov");
        isLevelProvinsi.value = true;
        currentLevel.value = "prov";
        if (!geoJsonProvinsi.value) await loadGeoJsonProvinsi();
      }

      currentIndikatorName.value =
        validRec.indikator?.nama || datasetMeta.value.label;
      currentIndikatorDesc.value =
        validRec.indikator?.deskripsi === validRec.indikator?.nama
          ? ""
          : validRec.indikator?.deskripsi || "";
      currentUnit.value = validRec.indikator?.satuan || "Satuan";

      rawRecords.value = response.data.records;
      processDataForMap();
      isLoading.value = false;
      return;
    }

    // --- CASE 2: HIERARCHICAL DATA (DRILL DOWN) ---
    // (Kode di bawah tetap sama, hanya memastikan logic state tidak konflik)
    const hierarchicalRecords = await fetchHierarchicalData({
      id_dataset: dataset.id_dataset,
      id_indikator: dataset.id_indikator,
      level: fetchLevel,
      parent_id: currentParentId.value,
      filter_state: {},
    });

    if (hierarchicalRecords.length === 0) {
      legendItems.value = [
        { label: "Data tidak tersedia di level ini", color: "#EEE" },
      ];
      isLoading.value = false;
      return;
    }

    const firstHierRec = hierarchicalRecords[0];
    const metaDs = firstHierRec.indikator?.dataset || {};
    const metaSektor = firstHierRec.indikator?.sektor || {};
    const hierPeriod = firstHierRec.indikator?.period;

    datasetMeta.value = {
      ...datasetMeta.value,
      instansi: metaDs.instansi || datasetMeta.value.instansi || "-",
      sumber: metaDs.sumber || datasetMeta.value.sumber || "-",
      label: metaDs.judul || dataset.label,
      sektor: metaSektor?.nama || dataset.sektor,
      tahun: hierPeriod || datasetMeta.value.tahun,
    };

    currentIndikatorName.value =
      firstHierRec.indikator?.nama || datasetMeta.value.label;
    currentIndikatorDesc.value =
      firstHierRec.indikator?.deskripsi === firstHierRec.indikator?.nama
        ? ""
        : firstHierRec.indikator?.deskripsi || "";
    currentUnit.value = firstHierRec.indikator?.satuan || "Satuan";

    // Handle level visual states for Hierarchy
    isLevelDesa.value = fetchLevel === "desa";
    isLevelKecamatan.value = fetchLevel === "kec";
    isLevelKabkot.value = fetchLevel === "kab";
    isLevelProvinsi.value = fetchLevel === "prov";

    if (isLevelDesa.value && !geoJsonDesa.value) await loadGeoJsonDesa();
    if (isLevelKecamatan.value && !geoJsonKecamatan.value)
      await loadGeoJsonKecamatan();
    if (isLevelKabkot.value && !geoJsonKabkot.value) await loadGeoJsonKabkot();
    if (isLevelProvinsi.value && !geoJsonProvinsi.value)
      await loadGeoJsonProvinsi();

    rawRecords.value = hierarchicalRecords;
    groupedData.value = groupRecordsByRegion(hierarchicalRecords, fetchLevel);

    processDataForMap();
  } catch (error) {
    console.error("Error fetchAgregatData:", error);
    toast.add({ title: "Gagal memuat data", color: "red" });
  } finally {
    isLoading.value = false;
  }
};

const processDataForMap = () => {
  // 1. Reset State
  groupedData.value = {};
  legendItems.value = [];
  contextInfo.value = {};

  if (rawRecords.value.length === 0) return;

  let processedRecords = [...rawRecords.value];

  for (let i = 1; i <= 5; i++) {
    const key = `itemCategory${i}`;
    const uniqueVals = [
      ...new Set(
        processedRecords
          .map((r) => r[key]?.nama || r[key]?.kode || r[key])
          .filter((v) => v !== null && v !== undefined && v !== ""),
      ),
    ];

    if (uniqueVals.length > 0) {
      // Cek apakah kolom ini isinya tahun semua (4 digit angka)
      const isYearColumn = uniqueVals.every((v) => /^\d{4}$/.test(String(v)));
      if (isYearColumn) {
        // Sort descending (terbaru diatas)
        uniqueVals.sort().reverse();
        const latestYear = uniqueVals[0];

        // Masukkan ke Context Info agar muncul di Badge Biru
        contextInfo.value["Tahun"] = latestYear;

        // Filter records hanya untuk tahun terbaru
        processedRecords = processedRecords.filter((r) => {
          const val = r[key]?.nama || r[key]?.kode || r[key];
          return String(val) === String(latestYear);
        });
      }
    }
  }
  if (!contextInfo.value["Tahun"] && datasetMeta.value.tahun) {
    contextInfo.value["Tahun"] = datasetMeta.value.tahun;
  }
  // === FAILSAFE: Pastikan variant_id ada ===
  if (!selectedVariantId.value && selectedDatasetId.value) {
    const currentDs = availableDatasets.value.find(
      (d) =>
        d.id_dataset === selectedDatasetId.value &&
        d.id_indikator === selectedIndikatorId.value &&
        d.variant_id,
    );
    if (currentDs && currentDs.variant_id) {
      selectedVariantId.value = currentDs.variant_id;
    }
  }

  // 2. Tentukan Config Key
  const configKey =
    selectedVariantId.value ||
    `${selectedDatasetId.value}_${selectedIndikatorId.value}`;

  const customConfig = SPECIAL_DATASET_CONFIG[configKey];

  // 3. Override Metadata & Logic Filter
  if (customConfig) {
    if (customConfig.label) {
      datasetMeta.value.label = customConfig.label;
      currentIndikatorName.value = customConfig.label;
    }
    if (customConfig.unit) {
      currentUnit.value = customConfig.unit;
    }

    const activeFilters = customConfig.filters || customConfig;

    // A. FILTER DATA
    processedRecords = processedRecords.filter((rec) => {
      let isValid = true;
      for (const [catKey, targetValue] of Object.entries(activeFilters)) {
        if (["label", "unit"].includes(catKey)) continue;

        const rawVal = rec[catKey]?.nama || rec[catKey]?.kode || rec[catKey];
        const recVal = rawVal ? String(rawVal).trim() : "";

        if (Array.isArray(targetValue)) {
          // Logic Multi: Cek includes (case insensitive)
          const isMatch = targetValue.some(
            (t) => String(t).toLowerCase() === recVal.toLowerCase(),
          );
          if (!isMatch) {
            isValid = false;
            break;
          }
        } else {
          // Logic Single: Cek exact match
          if (String(targetValue).toLowerCase() !== recVal.toLowerCase()) {
            isValid = false;
            break;
          }
        }
      }
      return isValid;
    });

    // B. SET CONTEXT (Untuk Single Value saja)
    for (const [catKey, targetValue] of Object.entries(activeFilters)) {
      if (["label", "unit"].includes(catKey)) continue;
      if (!Array.isArray(targetValue)) {
        contextInfo.value[catKey] = targetValue;
      }
    }
  }

  // 4. Grouping Data
  const tempGrouped = {};

  processedRecords.forEach((rec) => {
    // --- Penentuan Kode Wilayah ---
    let kode = "";
    let namaRegion = "";
    let detailRegion = {};

    if (currentLevel.value === "desa") {
      kode = String(rec.kd_desa?.kode || "");
      namaRegion = rec.kd_desa?.nama || "";
      detailRegion = {
        kecamatan: rec.kd_kec?.nama || "",
        kabupaten: rec.kd_kab?.nama || "",
        provinsi: rec.kd_prov?.nama || "",
      };
    } else if (currentLevel.value === "kec") {
      kode = String(rec.kd_kec?.kode || "");
      namaRegion = rec.kd_kec?.nama || "";
      detailRegion = {
        kecamatan: rec.kd_kec?.nama || "",
        kabupaten: rec.kd_kab?.nama || "",
        provinsi: rec.kd_prov?.nama || "",
      };
    } else if (currentLevel.value === "kab") {
      kode = String(rec.kd_kab?.kode || "");
      namaRegion = rec.kd_kab?.nama || "";
      detailRegion = {
        kabupaten: rec.kd_kab?.nama || "",
        provinsi: rec.kd_prov?.nama || "",
      };
    } else if (currentLevel.value === "prov") {
      kode = String(rec.kd_prov?.kode || "");
      if (kode === "00") return;
      namaRegion = rec.kd_prov?.nama || "";
      detailRegion = { provinsi: rec.kd_prov?.nama || "" };
    }

    if (!kode) return;

    let val = 0;
    if (rec.value !== null && rec.value !== undefined) {
      val = typeof rec.value === "string" ? parseFloat(rec.value) : rec.value;
    }

    if (!tempGrouped[kode]) {
      tempGrouped[kode] = {
        id: kode,
        name: namaRegion,
        details: detailRegion,
        value: 0,
        breakdown: [],
      };
    }

    tempGrouped[kode].value += val;

    // --- LOGIC BREAKDOWN (PERBAIKAN UTAMA DISINI) ---
    let categories = [];

    // Ambil config ignoreLevels jika ada (default array kosong)
    const ignoredLevels = customConfig?.ignoreLevels || [];

    for (let i = 1; i <= 5; i++) {
      const key = `itemCategory${i}`;

      // 1. Skip jika ini context (Badge)
      if (contextInfo.value[key]) continue;

      // 2. [BARU] Skip jika level ini diminta untuk diabaikan di tampilan
      if (ignoredLevels.includes(i)) continue;

      const catVal = rec[key]?.nama || rec[key]?.kode || rec[key];
      // 3. Skip jika kategori berupa Tahun atau Kosong
      if (catVal && !/^\d{4}$/.test(String(catVal))) {
        categories.push(catVal);
      }
    }

    if (categories.length > 0) {
      const parentLabel = categories[0];
      const childLabel = categories.slice(1).join(" - ");

      let parentNode = tempGrouped[kode].breakdown.find(
        (b) => b.label === parentLabel,
      );

      if (!parentNode) {
        parentNode = { label: parentLabel, value: 0, children: [] };
        tempGrouped[kode].breakdown.push(parentNode);
      }

      parentNode.value += val;

      if (childLabel) {
        let childNode = parentNode.children.find((c) => c.label === childLabel);
        if (!childNode) {
          childNode = { label: childLabel, value: 0 };
          parentNode.children.push(childNode);
        }
        childNode.value += val;
      }
    } else {
      const label = "Total";
      let node = tempGrouped[kode].breakdown.find((b) => b.label === label);
      if (!node) {
        node = { label: label, value: 0, children: [] };
        tempGrouped[kode].breakdown.push(node);
      }
      node.value += val;
    }
  });

  groupedData.value = tempGrouped;

  // 5. Logic Jenks (Pewarnaan)
  const valuesForJenks = Object.values(groupedData.value)
    .map((g) => g.value)
    .filter((v) => v > 0);

  if (valuesForJenks.length > 0) {
    const targetClasses = 5;
    const computedClasses = Math.min(
      targetClasses,
      new Set(valuesForJenks).size,
    );
    const breaks = getJenksBreaks(valuesForJenks, computedClasses);
    const colors = ["#FFEDA0", "#FEB24C", "#FD8D3C", "#F03B20", "#BD0026"];

    let items = [];
    let currentMin = Math.min(...valuesForJenks);

    for (let i = 0; i < breaks.length; i++) {
      let max = breaks[i];
      let label =
        currentMin === max
          ? formatNumber(max)
          : `${formatNumber(currentMin)} - ${formatNumber(max)}`;

      items.unshift({
        min: currentMin,
        max: max,
        color: colors[i] || colors[colors.length - 1],
        label: label,
      });
      currentMin = max + (isFloat(max) ? 0.01 : 1);
    }

    if (Object.values(tempGrouped).some((g) => g.value === 0)) {
      items.push({
        min: 0,
        max: 0,
        color: "#FFFFFF",
        label: "0 / Tidak Ada Data",
      });
    }
    legendItems.value = items;
  } else {
    legendItems.value = [{ label: "Data Kosong", color: "#FFFFFF" }];
  }

  // 6. Render Layer
  if (map) renderLayerForMap(map, false);
  if (mapFullscreen) renderLayerForMap(mapFullscreen, true);

  // 7. Update Selected Info Panel
  if (selectedInfo.value && selectedInfo.value.id) {
    const currentRegion = groupedData.value[selectedInfo.value.id];
    if (currentRegion) {
      selectedInfo.value = {
        ...selectedInfo.value,
        value: formatNumber(currentRegion.value),
        breakdown: currentRegion.breakdown,
        context: contextInfo.value,
      };
    }
  }
};

const loadGeoJsonKabkot = async () => {
  if (geoJsonKabkot.value) return;
  try {
    const module =
      await import("~/assets/data/map/batas_kabupaten_sumatera_20251.json");
    geoJsonKabkot.value = module.default || module;
    return geoJsonKabkot.value;
  } catch (e) {
    console.error("Gagal load geojson", e);
  }
};

const loadGeoJsonDesa = async () => {
  if (geoJsonDesa.value) return;
  try {
    const module =
      await import("~/assets/data/map/batas_wilayah_sumatera_20251.json");
    geoJsonDesa.value = module.default || module;
  } catch (e) {
    console.error("Gagal load geojson desa", e);
  }
};
const loadGeoJsonProvinsi = async () => {
  if (geoJsonProvinsi.value) return;
  try {
    const module =
      await import("~/assets/data/map/batas_provinsi_sumatera_20251.json");
    geoJsonProvinsi.value = module.default || module;
  } catch (e) {
    console.error("Gagal load geojson provinsi", e);
  }
};

const loadGeoJsonKecamatan = async () => {
  if (geoJsonKecamatan.value) return;
  try {
    const module = await import("~/assets/data/map/gdf_kec.json");
    geoJsonKecamatan.value = module.default || module;
  } catch (e) {
    console.error("Gagal load geojson kecamatan", e);
  }
};

const drawMarkerHighlight = (lat, lng, markerInstance = null) => {
  const L = window.L; // Pastikan L tersedia

  // 1. BERSIHKAN Highlight & Listener Lama
  if (activeMarkerHighlight.value) {
    activeMarkerHighlight.value.remove();
    activeMarkerHighlight.value = null;
  }

  if (currentTrackedMarker.value) {
    currentTrackedMarker.value.off("remove", hideHighlight);
    currentTrackedMarker.value.off("add", showHighlight);
    currentTrackedMarker.value = null;
  }

  if (!lat || !lng) return;

  // 2. Buat Highlight Baru
  const highlight = L.circleMarker([lat, lng], {
    radius: 20,
    color: "#fca510",
    weight: 4,
    fillColor: "#fca510",
    fillOpacity: 0.2,
    dashArray: "5, 5",
    pane: "markerPaneCustom",
  });

  // 3. Fungsi Helper untuk Show/Hide
  // Kita simpan di variabel agar bisa di-referensikan saat .off()
  function hideHighlight() {
    highlight.remove();
  }

  function showHighlight() {
    // Tambahkan ke map yang sesuai (Fullscreen atau Biasa)
    const targetMap = openFullscreen.value ? mapFullscreen : map;
    if (targetMap) highlight.addTo(targetMap);
  }

  if (markerInstance) {
    currentTrackedMarker.value = markerInstance;

    markerInstance.on("remove", hideHighlight);
    markerInstance.on("add", showHighlight);

    const targetMap = openFullscreen.value ? mapFullscreen : map;
    if (targetMap && targetMap.hasLayer(markerInstance)) {
      showHighlight();
    }
  } else {
    showHighlight();
  }

  activeMarkerHighlight.value = highlight;
};

const updatePendataanMarkers = async () => {
  const LModule = await import("leaflet");
  const L = LModule.default || LModule;
  if (typeof window !== "undefined") {
    window.L = L;
  }
  await import("leaflet.markercluster");

  let clickTimeout = null;

  const updateGroup = (targetMap, clusterGroupRef, isFullscreen) => {
    // 1. Bersihkan layer lama
    if (clusterGroupRef) {
      clusterGroupRef.clearLayers();
      targetMap.removeLayer(clusterGroupRef);
    }

    const newClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 60,
      clusterPane: "markerPaneCustom",
      pane: "markerPaneCustom",
      iconCreateFunction: (cluster) => createClusterIcon(cluster, L),
    });

    let validMarkersCount = 0;

    // 2. Loop indikator yang dicentang user
    localIndikatorList.value
      .filter((i) => i.checked)
      .forEach((ind) => {
        // Ambil data dari locationsData
        let locs = locationsData.value[ind.data_key] || [];

        // Filter Sub-Jenis
        if (ind.selectedJenisInfra?.length > 0) {
          locs = locs.filter((l) => {
            if (ind.data_key === "keluarga") {
              const kId = l.jenis_kerusakan || 5;
              const label = DAMAGE_CONFIG[kId]?.label || "Tidak Diketahui";
              return ind.selectedJenisInfra.includes(label);
            } else {
              // Pastikan membandingkan label dengan label
              return ind.selectedJenisInfra.some(
                (selected) =>
                  String(l.kode_jenis_infra || "")
                    .toLowerCase()
                    .includes(selected.toLowerCase()) ||
                  String(selected)
                    .toLowerCase()
                    .includes(String(l.kode_jenis_infra || "").toLowerCase()),
              );
            }
          });
        }

        const isKeluarga = ind.data_key === "keluarga";

        locs.forEach((loc) => {
          // [FIX] Pastikan Lat/Lng adalah Number valid
          const lat = parseFloat(loc.lat);
          const lng = parseFloat(loc.lng);

          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

          const hasCompletePhotos = loc.has_photos;

          if (showPhotosOnly.value && !hasCompletePhotos) return;

          let damageVal = loc.jenis_kerusakan;
          if (isKeluarga && !damageVal) damageVal = 5;

          // [FIX] Fallback Color & Icon jika utility gagal
          let color = getMarkerColor(ind.data_key, damageVal);
          if (!color) color = "#6b7280"; // Default Gray jika warna gagal

          const damageWeight = isKeluarga ? getDamageWeight(damageVal) : 0;

          let innerContent = "";
          let iconSize = [28, 28];
          let iconAnchor = [14, 14];
          let iconHtml = "";

          if (isKeluarga) {
            if (hasCompletePhotos) innerContent = getPhotoIconSvg();
            iconHtml = `
                <div style="
                  background-color: ${color};
                  width: 28px; height: 28px;
                  border-radius: 50%;
                  border: 1.5px solid white;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                  display: flex; align-items: center; justify-content: center;
                ">
                  ${innerContent}
                </div>`;
          } else {
            // [FIX] Fallback Icon Infra
            let svgIcon = getInfraIconSvg(ind.data_key);
            if (!svgIcon) {
              // Icon default jika SVG gagal load
              svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.146.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>`;
            }

            iconHtml = `
                  <div style="
                    background-color: ${color}; width: 32px; height: 32px;
                    border-radius: 6px; border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex; align-items: center; justify-content: center;
                  ">
                    <div style="width: 20px; height: 20px; color: white;">
                      ${svgIcon}
                    </div>
                  </div>`;
            iconSize = [32, 32];
            iconAnchor = [16, 16];
          }

          const icon = L.divIcon({
            className: "custom-marker",
            html: iconHtml,
            iconSize: iconSize,
            iconAnchor: iconAnchor,
          });

          const m = L.marker([lat, lng], {
            icon: icon,
            damageWeight: damageWeight,
            originalColor: color,
            pane: "markerPaneCustom",
          });

          m.customData = loc;
          m.isKeluarga = isKeluarga;

          newClusterGroup.addLayer(m);
          validMarkersCount++;
        });
      });

    // Event Handler Klik
    newClusterGroup.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      const marker = e.layer;
      const loc = marker.customData;
      const isKeluarga = marker.isKeluarga;

      if (!loc) return;

      // === PERBAIKAN 2: Logic Toggle / Unselect ===
      // Jika user klik titik yang SAMA, maka unselect (tutup panel)
      if (selectedLocation.value?.id === loc.id) {
        selectedLocation.value = null;
        // Hapus highlight
        if (activeMarkerHighlight.value) {
          activeMarkerHighlight.value.remove();
          activeMarkerHighlight.value = null;
        }
        return;
      }

      const currentPos = marker.getLatLng();

      drawMarkerHighlight(currentPos.lat, currentPos.lng, marker);

      if (clickTimeout) clearTimeout(clickTimeout);

      if (
        selectedLocation.value?.id === loc.id &&
        selectedLocation.value?.isLoading
      )
        return;

      selectedLocation.value = {
        ...loc,
        isLoading: true,
        _isManualClick: true,
      };

      clickTimeout = setTimeout(async () => {
        try {
          const typeParam = loc.type || (isKeluarga ? "keluarga" : "infra");
          const detailRes = await $fetch("/api/detail-lokasi", {
            params: { id: loc.id, type: typeParam },
          });

          if (detailRes.success) {
            // Pertahankan flag _isManualClick agar watcher tidak bingung
            selectedLocation.value = {
              ...detailRes.data,
              isLoading: false,
              _isManualClick: true,
            };
          } else {
            selectedLocation.value = {
              ...loc,
              isLoading: false,
              _isManualClick: true,
            };
          }
        } catch (err) {
          console.error("Gagal load detail:", err);
          selectedLocation.value = {
            ...loc,
            isLoading: false,
            _isManualClick: true,
          };
        }
      }, 100);
    });

    targetMap.addLayer(newClusterGroup);

    // [FIX] Auto Fit Bounds jika ada marker
    if (validMarkersCount > 0 && !isFullscreen) {
      try {
        const bounds = newClusterGroup.getBounds();
        if (bounds.isValid()) {
          targetMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }
      } catch (e) {
        console.log("Fit bounds error", e);
      }
    }

    return newClusterGroup;
  };

  if (map) {
    markerClusterGroup = updateGroup(map, markerClusterGroup, false);
  }
  if (mapFullscreen) {
    markerClusterGroupFullscreen = updateGroup(
      mapFullscreen,
      markerClusterGroupFullscreen,
      true,
    );
  }
};
const renderLayerForMap = (
  mapInstance,
  isFullscreen,
  shouldFitBounds = true,
) => {
  if (!mapInstance) return;
  let activeGeoJson = geoJsonProvinsi.value;
  let geoJsonKey = "kdprov";
  const renderLevel =
    currentLevel.value ||
    (isLevelDesa.value
      ? "desa"
      : isLevelKecamatan.value
        ? "kec"
        : isLevelKabkot.value
          ? "kab"
          : "prov");

  if (renderLevel === "desa") {
    activeGeoJson = geoJsonDesa.value;
    geoJsonKey = "iddesa";
  } else if (renderLevel === "kec") {
    activeGeoJson = geoJsonKecamatan.value;
    geoJsonKey = "id_kec";
  } else if (renderLevel === "kab") {
    activeGeoJson = geoJsonKabkot.value;
    geoJsonKey = "kdkab";
  } else if (renderLevel === "prov") {
    activeGeoJson = geoJsonProvinsi.value;
    geoJsonKey = "kdprov";
  }

  if (!activeGeoJson) return;

  if (isFullscreen) {
    if (geoJsonLayerFullscreen)
      safeRemoveLayer(mapInstance, geoJsonLayerFullscreen);
    if (labelLayerFullscreen)
      safeRemoveLayer(mapInstance, labelLayerFullscreen);
  } else {
    if (geoJsonLayer) safeRemoveLayer(mapInstance, geoJsonLayer);
    if (labelLayer) safeRemoveLayer(mapInstance, labelLayer);
  }

  if (Object.keys(groupedData.value).length === 0) return;

  // === [FIX 1] Tracker Variable untuk mengatasi "membekas" ===
  let currentHoveredLayer = null;

  const layer = L.geoJSON(activeGeoJson, {
    pane: "choroplethPane",
    filter: (feature) => {
      if (!selectedDatasetId.value) return true;
      const kode = String(feature.properties[geoJsonKey] || "");
      return !!groupedData.value[kode];
    },
    style: (feature) => {
      if (!selectedDatasetId.value) {
        return {
          fillColor: "transparent",
          weight: 0,
          opacity: 0,
          color: "transparent",
          fillOpacity: 0,
        };
      }

      const kode = String(feature.properties[geoJsonKey] || "");
      const regionData = groupedData.value[kode];
      const value = regionData ? regionData.value : 0;
      return {
        fillColor: getDynamicColor(value),
        weight: renderLevel === "desa" ? 0.5 : 1,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: mapOpacity.value,
      };
    },
    onEachFeature: (f, l) => {
      l.on({
        click: async (e) => {
          L.DomEvent.stopPropagation(e);
          const id = String(f.properties[geoJsonKey]);
          const data = groupedData.value[id];
          if (!data) return;

          if (renderLevel === "desa" || !canDrillDown.value) {
            // Highlight Selection
            layer.eachLayer((lr) => {
              layer.resetStyle(lr);
            });

            e.target.setStyle({
              weight: 2,
              color: "#333",
              fillOpacity: 0.9,
              dashArray: "",
            });
            e.target.bringToFront();

            selectedInfo.value = {
              id: id,
              name: data.name,
              details: data.details,
              value: formatNumber(data.value),
              context: contextInfo.value,
              breakdown: data.breakdown,
              level: renderLevel,
            };

            mapInstance.fitBounds(e.target.getBounds(), {
              padding: [50, 50],
              maxZoom: 20,
              animate: true,
            });

            toast.add({
              title: "Batas Wilayah",
              description: "Ini adalah level wilayah terkecil.",
              color: "blue",
              icon: "i-heroicons-information-circle",
              timeout: 2000,
            });

            return;
          }

          const parentSelection = {
            id: id,
            name: data.name,
            details: data.details,
            value: formatNumber(data.value),
            context: contextInfo.value,
            breakdown: data.breakdown,
            level: renderLevel,
          };

          selectedInfo.value = parentSelection;

          const success = drillDown(renderLevel, id, data.name);

          if (success) {
            selectedInfo.value = parentSelection;
            isRightSidebarOpen.value = true;
            layer.resetStyle(e.target);

            await fetchAgregatData();

            if (Object.keys(groupedData.value).length === 0) {
              toast.add({
                title: "Mencapai level terkecil",
                description:
                  "Data statistik tidak tersedia untuk level yang lebih detail.",
                color: "amber",
                icon: "i-heroicons-exclamation-circle",
                timeout: 2500,
              });

              drillUp();
              await fetchAgregatData();
              selectedInfo.value = parentSelection;
              return;
            }
            return;
          }
        },

        // === [FIX 2] Ubah mouseover jadi SYNCHRONOUS agar sat-set ===
        mouseover: (e) => {
          L.DomEvent.stopPropagation(e);
          const targetLayer = e.target;
          const id = String(f.properties[geoJsonKey]);

          // 1. CLEANUP: Matikan highlight layer sebelumnya secara paksa
          if (currentHoveredLayer && currentHoveredLayer !== targetLayer) {
            const prevId = String(
              currentHoveredLayer.feature.properties[geoJsonKey],
            );
            // Jika layer yg mau dimatikan adalah yang sedang 'Selected', kembalikan ke style selected
            if (selectedInfo.value?.id === prevId) {
              currentHoveredLayer.setStyle({
                weight: 2,
                color: "#333",
                fillOpacity: 0.9,
                dashArray: "",
              });
            } else {
              // Jika bukan, reset total
              layer.resetStyle(currentHoveredLayer);
            }
          }

          // 2. Set current tracker
          currentHoveredLayer = targetLayer;

          // 3. HIGHLIGHT: Langsung warnai tanpa menunggu data (Sat-set)
          if (selectedInfo.value?.id !== id) {
            targetLayer.setStyle({
              weight: 2,
              color: "#666", // Warna abu tua saat hover
              dashArray: "",
            });
            targetLayer.bringToFront();
          }

          // 4. DATA FETCHING: Dilakukan terpisah (Async IIFE) agar tidak block UI
          const data = groupedData.value[id];
          if (data) {
            hoverInfo.value = {
              id: id,
              name: data.name,
              details: data.details,
              value: formatNumber(data.value),
              context: contextInfo.value,
            };

            if (canDrillDown.value) {
              // Jalankan async fetch di background
              (async () => {
                hoverTableVisible.value = true;
                // Ambil posisi dari event yang masih valid di closure
                hoverTablePos.value = {
                  x: e.containerPoint.x,
                  y: e.containerPoint.y,
                };
                hoverTableParentName.value = data.name;
                hoverTableParentLevel.value = renderLevel;

                if (hoverDataCache.value[id]) {
                  hoverTableData.value = hoverDataCache.value[id];
                  hoverTableLoading.value = false;
                } else {
                  hoverTableLoading.value = true;
                  try {
                    const childData = await fetchChildrenForHover(
                      id,
                      renderLevel,
                      {
                        id_dataset: selectedDatasetId.value,
                        id_indikator: selectedIndikatorId.value,
                        filter_state: {},
                      },
                    );
                    hoverDataCache.value[id] = childData;
                    // Cek apakah user masih hover di tempat yang sama
                    if (hoverInfo.value?.id === id) {
                      hoverTableData.value = childData;
                    }
                  } catch (err) {
                    hoverTableData.value = [];
                  } finally {
                    hoverTableLoading.value = false;
                  }
                }
              })();
            }
          }
        },

        mousemove: (e) => {
          L.DomEvent.stopPropagation(e);
          tooltipPos.value = { x: e.containerPoint.x, y: e.containerPoint.y };
          if (hoverTableVisible.value) {
            hoverTablePos.value = {
              x: e.containerPoint.x,
              y: e.containerPoint.y,
            };
          }
        },

        mouseout: (e) => {
          hoverInfo.value = null;
          hoverTableVisible.value = false;

          // Bersihkan tracker jika mouse keluar dari layer yang sedang aktif
          if (currentHoveredLayer === e.target) {
            currentHoveredLayer = null;
          }

          if (selectedInfo.value?.id !== String(f.properties[geoJsonKey])) {
            layer.resetStyle(e.target);
          } else {
            e.target.setStyle({
              weight: 2,
              color: "#333",
              fillOpacity: 0.9,
              dashArray: "",
            });
          }
        },
      });
    },
  });

  if (mapInstance) layer.addTo(mapInstance);
  if (markerLayer) markerLayer.bringToFront();
  if (markerLayerFullscreen) markerLayerFullscreen.bringToFront();

  const markers = [];
  const shouldGenerateLabels =
    renderLevel !== "desa" || Object.keys(groupedData.value).length < 1000;

  if (shouldGenerateLabels) {
    layer.eachLayer((geoLayer) => {
      const feature = geoLayer.feature;
      const kode = String(feature.properties[geoJsonKey] || "");
      const data = groupedData.value[kode];
      if (data) {
        const center = geoLayer.getBounds().getCenter();
        const labelMarker = L.marker(center, {
          interactive: false,
          icon: L.divIcon({
            className: "bg-transparent",
            html: `
              <div class="flex flex-col items-center justify-center pointer-events-none">
                <span class="text-[10px] font-bold text-gray-800 text-center leading-3 uppercase"
                      style="text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;">
                  ${data.name}
                </span>
              </div>
            `,
            iconSize: [100, 20],
            iconAnchor: [50, 10],
          }),
        });
        markers.push(labelMarker);
      }
    });
  }

  const newLabelLayer = L.layerGroup(markers);

  if (selectedInfo.value) {
    layer.eachLayer((geoLayer) => {
      if (
        String(geoLayer.feature.properties[geoJsonKey]) ===
        String(selectedInfo.value.id)
      ) {
        geoLayer.setStyle({
          weight: 2,
          color: "#333",
          fillOpacity: 0.9,
          dashArray: "",
        });
        geoLayer.bringToFront();
      }
    });
  }

  if (isFullscreen) {
    geoJsonLayerFullscreen = layer;
    labelLayerFullscreen = newLabelLayer;
    updateLabelVisibility(mapInstance, labelLayerFullscreen);
  } else {
    geoJsonLayer = layer;
    labelLayer = newLabelLayer;
    updateLabelVisibility(mapInstance, labelLayer);
  }

  if (shouldFitBounds && layer.getLayers().length > 0) {
    mapInstance.fitBounds(layer.getBounds(), {
      padding: [20, 20],
      animate: true,
      duration: 1,
      maxZoom: 11,
    });
  }
};

const initMap = async (elementId) => {
  if (!process.client) return null;
  const [LModule] = await Promise.all([
    import("leaflet"),
    import("leaflet/dist/leaflet.css"),
    loadGeoJsonProvinsi(),
  ]);
  const m = LModule.map(elementId, {
    zoomControl: false,
    maxBounds: MAP_VIEW_CONFIG.bounds,
    maxBoundsViscosity: MAP_VIEW_CONFIG.maxBoundsViscosity,
    minZoom: MAP_VIEW_CONFIG.minZoom,
  }).setView(MAP_VIEW_CONFIG.initialCenter, MAP_VIEW_CONFIG.initialZoom);
  LModule.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    bounds: MAP_VIEW_CONFIG.bounds,
  }).addTo(m);
  m.createPane("choroplethPane");
  m.getPane("choroplethPane").style.zIndex = 350;
  m.createPane("dampakPane");
  m.getPane("dampakPane").style.zIndex = 450;
  m.createPane("markerPaneCustom");
  m.getPane("markerPaneCustom").style.zIndex = 800;
  const mGroup = LModule.featureGroup().addTo(m);
  if (elementId.includes("fullscreen")) {
    markerLayerFullscreen = mGroup;
    mapFullscreen = m;
    mapFullscreenRef.value = m;
  } else {
    markerLayer = mGroup;
    map = m;
    mapRef.value = m;
  }
  m.on("zoomend", () => {
    if (elementId.includes("fullscreen")) {
      updateLabelVisibility(m, labelLayerFullscreen);
    } else {
      updateLabelVisibility(m, labelLayer);
    }
  });
  m.on("click", () => {
    closeInfoPanel();
  });
  m.on("mousemove", () => {
    if (hoverInfo.value) {
      hoverInfo.value = null;
    }
    if (hoverTableVisible.value) {
      hoverTableVisible.value = false;
    }
  });
  m.on("mouseout", () => {
    hoverInfo.value = null;
    hoverTableVisible.value = false;
  });
  setTimeout(() => {
    m.invalidateSize();
  }, 100);
  return m;
};

const activeGeoJsonForBoundary = computed(() => {
  const level =
    currentLevel.value ||
    (isLevelDesa.value
      ? "desa"
      : isLevelKecamatan.value
        ? "kec"
        : isLevelKabkot.value
          ? "kab"
          : "prov");
  let sourceGeoJson = null;
  let idKey = "";
  if (level === "desa") {
    sourceGeoJson = geoJsonDesa.value;
    idKey = "iddesa";
  } else if (level === "kec") {
    sourceGeoJson = geoJsonKecamatan.value;
    idKey = "id_kec";
  } else if (level === "kab") {
    sourceGeoJson = geoJsonKabkot.value;
    idKey = "kdkab";
  } else {
    sourceGeoJson = geoJsonProvinsi.value;
    idKey = "kdprov";
  }
  if (!sourceGeoJson) return geoJsonProvinsi.value;
  if (!currentParentId.value || level === "prov") {
    return sourceGeoJson;
  }
  const parentCode = String(currentParentId.value);
  const filteredFeatures = sourceGeoJson.features.filter((f) => {
    const featureCode = String(f.properties[idKey] || "");
    return featureCode.startsWith(parentCode);
  });
  return {
    ...sourceGeoJson,
    features: filteredFeatures,
  };
});

watch(mapOpacity, (newVal) => {
  const baseStyle = { fillOpacity: newVal };
  if (geoJsonLayer) {
    geoJsonLayer.setStyle(baseStyle);
    if (selectedInfo.value) restoreHighlight(geoJsonLayer);
  }
  if (geoJsonLayerFullscreen) {
    geoJsonLayerFullscreen.setStyle(baseStyle);
    if (selectedInfo.value) restoreHighlight(geoJsonLayerFullscreen);
  }
});

watch(isMapReady, (ready) => {
  if (ready) {
    setTimeout(() => {
      showFullscreenHint.value = true;
      setTimeout(() => {
        showFullscreenHint.value = false;
      }, 8000);
    }, 1500);
  }
});

watch(showPhotosOnly, () => {
  updatePendataanMarkers();
});

const restoreHighlight = (layerGroup) => {
  if (!selectedInfo.value) return;
  let geoJsonKey = "kdkab";
  if (isLevelDesa.value) geoJsonKey = "iddesa";
  else if (isLevelKecamatan.value) geoJsonKey = "id_kec";
  else if (isLevelProvinsi.value) geoJsonKey = "kdprov";
  const highlightOpacity = Math.min(1, mapOpacity.value + 0.3);
  layerGroup.eachLayer((l) => {
    if (
      String(l.feature.properties[geoJsonKey]) === String(selectedInfo.value.id)
    ) {
      l.setStyle({
        weight: 2,
        color: "#333",
        fillOpacity: highlightOpacity,
        dashArray: "",
      });
      l.bringToFront();
    }
  });
};

watch(
  () => props.wilayah,
  async (newVal) => {
    if (newVal.provinsi?.length > 0 || newVal.kabupaten?.length > 0) {
      const isNotLoaded = availableDatasets.value.length === 0;

      if (isNotLoaded) {
        await fetchDatasetList();
      }

      activePanel.value = "layer1";
      await fetchAgregatData();

      if (activeAdditionalLayers.value.length > 0) {
        const currentActive = [...activeAdditionalLayers.value];
        for (const layerId of currentActive) {
          await toggleAdditionalLayer(layerId);
          await toggleAdditionalLayer(layerId);
        }
      }
    } else {
      groupedData.value = {};
      legendItems.value = [];
      datasetMeta.value = {
        instansi: "-",
        sumber: "-",
        label: null,
        sektor: null,
      };
      if (activeAdditionalLayers.value.length > 0) {
        const layersKey = [...activeAdditionalLayers.value];
        layersKey.forEach(async (id) => {
          await toggleAdditionalLayer(id);
        });
      }
      if (activePMSSLayerIds.value.length > 0) {
        const layersToReset = [...activePMSSLayerObjects.value];
        layersToReset.forEach((l) => togglePMSSLayer(l));
      }
      isDampakMenuOpen.value = false;
      if (geoJsonLayer && map) map.removeLayer(geoJsonLayer);
      if (geoJsonLayerFullscreen && mapFullscreen)
        mapFullscreen.removeLayer(geoJsonLayerFullscreen);
      closeInfoPanel();
      localIndikatorList.value.forEach((ind) => {
        ind.checked = false;
        ind.isOpen = false;
        ind.selectedJenisInfra = [];
      });
    }
  },
  { deep: true, immediate: true },
);

watch(
  () => breadcrumbPath.value,
  async (newPath, oldPath) => {
    const hasActiveLayer2 = localIndikatorList.value.some((i) => i.checked);

    if (hasActiveLayer2) {
      locationsData.value = {};
      if (markerClusterGroup) markerClusterGroup.clearLayers();
      if (markerClusterGroupFullscreen)
        markerClusterGroupFullscreen.clearLayers();

      await handleLayer2Change();
    }
  },
  { deep: true },
);
watch(selectedLocation, async (newLoc) => {
  if (newLoc) {
    // Ambil koordinat (tetap pakai koordinat asli untuk centering jika perlu)
    const lat = parseFloat(newLoc.lat);
    const lng = parseFloat(newLoc.lng);

    const targetGroup = openFullscreen.value
      ? markerClusterGroupFullscreen
      : markerClusterGroup;

    let foundMarker = null;

    if (targetGroup) {
      const allLayers = targetGroup.getLayers();
      foundMarker = allLayers.find(
        (m) => m.customData && String(m.customData.id) === String(newLoc.id),
      );
    }

    if (!newLoc._isManualClick) {
      drawMarkerHighlight(lat, lng, foundMarker);
    } else {
      if (foundMarker && activeMarkerHighlight.value) {
        // Pastikan binding event tetap jalan
        // (Logic drawMarkerHighlight menghandle re-binding)
      }
    }

    if (foundMarker && targetGroup) {
      const targetMap = openFullscreen.value ? mapFullscreen : map;
      const isMarkerVisible = targetMap && targetMap.hasLayer(foundMarker);
      if (!isMarkerVisible && !newLoc._isManualClick) {
        targetGroup.zoomToShowLayer(foundMarker, () => {});
      }
    } else if (map && !newLoc._isManualClick) {
      const targetMap = openFullscreen.value ? mapFullscreen : map;
      if (targetMap) targetMap.setView([lat, lng], 18);
    }
  } else {
    // Logic saat unselect (selectedLocation = null)
    if (activeMarkerHighlight.value) {
      activeMarkerHighlight.value.remove();
      activeMarkerHighlight.value = null;
    }

    if (currentTrackedMarker.value) {
      currentTrackedMarker.value = null;
    }
  }
});

watch(selectedInfo, async (newInfo) => {
  if (newInfo && newInfo.id) {
    await fetchRelatedIndicatorValues(newInfo.id, newInfo.level);
  } else {
    relatedIndicatorsData.value = [];
  }
});

watch(dampakLayerOpacity, (newVal) => {
  if (pmssLayerInstances.value) {
    Object.values(pmssLayerInstances.value).forEach((layer) => {
      if (layer && typeof layer.setOpacity === "function") {
        layer.setOpacity(newVal);
      }
    });
  }
  if (additionalLayerInstances.value) {
    Object.values(additionalLayerInstances.value).forEach((layer) => {
      if (layer && typeof layer.setStyle === "function") {
        layer.setStyle({
          opacity: newVal,
          fillOpacity: newVal,
        });
      }
    });
  }
});

watch(openFullscreen, async (isOpen) => {
  const L = await import("leaflet");
  if (isOpen) {
    isMapFullyMounted.value = false;
    let center, zoom;
    if (map) {
      center = map.getCenter();
      zoom = map.getZoom();
    }
    await nextTick();
    setTimeout(async () => {
      const elementId = props.mapId + "-fullscreen";
      const el = document.getElementById(elementId);
      if (!el) return;
      if (mapFullscreen) {
        mapFullscreen.remove();
        mapFullscreen = null;
      }
      mapFullscreen = L.map(elementId, {
        zoomControl: false,
        maxBounds: MAP_VIEW_CONFIG.bounds,
        maxBoundsViscosity: MAP_VIEW_CONFIG.maxBoundsViscosity,
        minZoom: MAP_VIEW_CONFIG.minZoom,
      });
      mapFullscreen.on("click", () => {
        closeInfoPanel();
      });
      if (center && zoom) {
        mapFullscreen.setView(center, zoom, { animate: false });
      } else {
        mapFullscreen.setView(
          MAP_VIEW_CONFIG.initialCenter,
          MAP_VIEW_CONFIG.initialZoom,
        );
      }
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        bounds: MAP_VIEW_CONFIG.bounds,
      }).addTo(mapFullscreen);
      mapFullscreen.createPane("choroplethPane");
      mapFullscreen.getPane("choroplethPane").style.zIndex = 350;
      mapFullscreen.createPane("dampakPane");
      mapFullscreen.getPane("dampakPane").style.zIndex = 450;
      mapFullscreen.createPane("markerPaneCustom");
      mapFullscreen.getPane("markerPaneCustom").style.zIndex = 800;
      markerLayerFullscreen = L.featureGroup().addTo(mapFullscreen);
      mapFullscreen.invalidateSize();
      if (Object.keys(groupedData.value).length > 0) {
        renderLayerForMap(mapFullscreen, true, false);
      }
      if (isPendataanReady.value) {
        await updatePendataanMarkers();
      }
      if (activeAdditionalLayers.value.length > 0) {
        activeAdditionalLayers.value.forEach((layerId) => {
          const config = additionalLayersConfig.find((l) => l.id === layerId);
          const geoData = cachedAdditionalData.value[layerId];
          if (geoData) {
            const layer = L.geoJSON(geoData, {
              pane: "dampakPane",
              pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, {
                  pane: "dampakPane",
                  radius: 6,
                  fillColor: config.color,
                  color: "#fff",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8,
                });
              },
              style: {
                color: config.color,
                weight: 1.5,
                opacity: 1,
                fillOpacity: 0.2,
                dashArray: "5, 5",
              },
            });
            layer.addTo(mapFullscreen);
            additionalLayerInstances.value[`${layerId}_fs`] = layer;
          }
        });
      }
      if (activePMSSLayerObjects.value.length > 0) {
        activePMSSLayerObjects.value.forEach((layerDef) => {
          const tileLayer = L.tileLayer(layerDef.url, {
            attribution: "BPS GeoServer",
            maxZoom: 19,
            opacity: 0.7,
            zIndex: 10,
          });
          tileLayer.addTo(mapFullscreen);
          pmssLayerInstances.value[`${layerDef.id}_fs`] = tileLayer;
        });
      }
      if (activeConditionLayer.value && conditionLayerInstance.value) {
        const config = props.layerConfig[activeConditionLayer.value];
        let finalUrl = config.url;
        if (activeConditionLayer.value === props.layerTypes.VIIRS) {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const timeParam = oneWeekAgo.toISOString().split("T")[0];
          finalUrl = config.url.replace("{time}", timeParam);
        }
        const fsLayer = L.tileLayer(finalUrl, {
          attribution: config.attribution,
          minZoom: config.minZoom,
          maxZoom: config.maxZoom,
          opacity: conditionLayerOpacity.value,
          zIndex: activeConditionLayer.value === props.layerTypes.DEM ? 5 : 3,
          bounds: config.bounds || MAP_VIEW_CONFIG.bounds,
        });
        fsLayer.addTo(mapFullscreen);
        conditionLayerInstance.value._fs = fsLayer;
      }
      requestAnimationFrame(() => {
        if (mapFullscreen) {
          mapFullscreen.invalidateSize();
          if (center && zoom)
            mapFullscreen.setView(center, zoom, { animate: false });
          setTimeout(() => {
            isMapFullyMounted.value = true;
          }, 50);
        }
      });
    }, 310);
  } else {
    if (mapFullscreen) {
      const lastCenter = mapFullscreen.getCenter();
      const lastZoom = mapFullscreen.getZoom();
      mapFullscreen.remove();
      mapFullscreen = null;
      geoJsonLayerFullscreen = null;
      labelLayerFullscreen = null;
      markerLayerFullscreen = null;
      Object.keys(additionalLayerInstances.value).forEach((key) => {
        if (key.endsWith("_fs")) delete additionalLayerInstances.value[key];
      });
      Object.keys(pmssLayerInstances.value).forEach((key) => {
        if (key.endsWith("_fs")) delete pmssLayerInstances.value[key];
      });
      if (conditionLayerInstance.value?._fs) {
        delete conditionLayerInstance.value._fs;
      }
      if (map && lastCenter && lastZoom) {
        map.setView(lastCenter, lastZoom, { animate: false });
        setTimeout(() => {
          map.invalidateSize();
          if (Object.keys(groupedData.value).length > 0) {
            renderLayerForMap(map, false, false);
          }
          if (activeAdditionalLayers.value.length > 0) {
            const currentIds = [...activeAdditionalLayers.value];
            currentIds.forEach((id) => {
              if (additionalLayerInstances.value[id])
                map.removeLayer(additionalLayerInstances.value[id]);
              delete additionalLayerInstances.value[id];
              toggleAdditionalLayer(id);
            });
          }
          if (activePMSSLayerIds.value.length > 0) {
            const currentObjs = [...activePMSSLayerObjects.value];
            activePMSSLayerIds.value = [];
            activePMSSLayerObjects.value = [];
            currentObjs.forEach((l) => togglePMSSLayer(l));
          }
        }, 200);
      }
    }
    if (props.viewMode === "split") {
      activePanel.value = null;
      closeInfoPanel();
    }
  }
});

watch(
  [isRightSidebarOpen, () => selectedLocation.value, () => selectedInfo.value],
  () => {
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
      if (mapFullscreen) {
        mapFullscreen.invalidateSize();
      }
    }, 310);
  },
);
watch(
  () => props.viewMode,
  (newMode) => {
    if (newMode === "split") {
      closeInfoPanel();
      if (markerLayer) markerLayer.clearLayers();
      activePanel.value = null;
      if (map && Object.keys(groupedData.value).length > 0) {
        renderLayerForMap(map, false, true);
      }
    }
  },
);

watch(conditionLayerOpacity, (newVal) => {
  if (conditionLayerInstance.value) {
    conditionLayerInstance.value.setOpacity(newVal);
  }
  if (conditionLayerInstance.value?._fs) {
    conditionLayerInstance.value._fs.setOpacity(newVal);
  }
});

watch(
  () => [selectedLocation.value, selectedInfo.value],
  ([newLoc, newInfo]) => {
    if (newLoc || newInfo) {
      isRightSidebarOpen.value = true;
    }
  },
);

onActivated(async () => {
  await nextTick();
  setTimeout(() => {
    if (map) {
      map.invalidateSize();
    }
  }, 300);
});

onMounted(async () => {
  await Promise.all([
    fetchIndikatorList(),
    fetchLastUpdateDate(),
    loadGeoJsonProvinsi(),
  ]);

  // 2. Init Map
  map = await initMap(props.mapId);

  await nextTick();

  if (
    isMapReady.value &&
    selectedDatasetId.value &&
    selectedIndikatorId.value
  ) {
    const preSelected = availableDatasets.value.find(
      (d) =>
        d.id_dataset == selectedDatasetId.value &&
        d.id_indikator == selectedIndikatorId.value,
    );

    if (preSelected) {
      datasetMeta.value = {
        ...datasetMeta.value,
        label: preSelected.label || preSelected.dataset_label,
        sektor: preSelected.sektor,
        instansi: "Memuat...",
      };
    }
    setTimeout(async () => {
      await fetchAgregatData();
    }, 500);
  }
});
defineExpose({
  handleExportExcel,
});
</script>

<style scoped>
.w-full {
  z-index: 1;
}

/* Animasi Bounce Halus untuk Hint */
@keyframes bounce-soft {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
.animate-bounce-soft {
  animation: bounce-soft 2s infinite;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
