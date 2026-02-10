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
import {
  pascaDatasets,
  tersediaSektor,
  additionalLayersConfig,
  pmssLayersConfig,
} from "~/constants/insight-spatial-data.ts";
import {
  DAMAGE_CONFIG,
  LAYER_CONFIG_PASCA,
  LAYER_TYPES_PASCA,
  MAP_VIEW_CONFIG,
} from "~/constants/map-config";

import {
  getInfraIconSvg,
  getMarkerColor,
  formatNumber,
  getId,
  highlightMarkerInGroup,
  resetAllMarkers,
  getPhotoIconSvg,
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
const toast = useToast();
const mapRef = shallowRef(null);
const mapFullscreenRef = shallowRef(null);

const hoverDataCache = ref({});
const dampakLayerOpacity = ref(0.8);
const props = defineProps({
  wilayah: { type: Object, default: () => ({ provinsi: [], kabupaten: [] }) },
  viewMode: { type: String, default: "split" },
  datasetIdParams: { type: Number },
  indikatorIdParams: { type: Number },
  activeSektorParams: { type: String },
});

// Tambahkan di script setup
const emit = defineEmits(["update:activeTab", "panel-opened"]);
const lastUpdateText = ref("-");
const showFullscreenHint = ref(false);
const activePanel = ref(null);
const showPhotosOnly = ref(false); // Default matikan filter
const isLevelProvinsi = ref(true); // Default False (Kabupaten)
const isLevelDesa = ref(false); // Default False (Kabupaten)
const isLevelKecamatan = ref(false); // Default False (Kabupaten)
const isLevelKabkot = ref(false);
const geoJsonKabkot = shallowRef(null); // Lazy load container
const geoJsonDesa = shallowRef(null); // Lazy load container
const geoJsonKecamatan = shallowRef(null); // Lazy load container
const geoJsonProvinsi = shallowRef(null);
const activeAdditionalLayers = ref([]); // Array ID layer yang aktif
const cachedAdditionalData = shallowRef({}); // Cache GeoJSON mentah
const additionalLayerInstances = shallowRef({}); // Simpan instance L.geoJSON
const isBrinMenuOpen = ref(false); // State untuk menu BRIN
const relatedIndicatorsData = ref([]); // Menyimpan list indikator lain + nilainya
const isLoadingRelated = ref(false);
const isBoundaryActive = ref(true); // Default mati
const boundaryOpacity = ref(1.0);

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

// State Sentinel-2 Pasca
// === UNIFIED LAYER STATE (Radio Button Logic) ===
const isConditionMenuOpen = ref(false); // Menu "Kondisi Wilayah"
const activeConditionLayer = ref(null); // 'sentinel', 'dem', 'viirs', atau null
const conditionLayerOpacity = ref(0.8);
const conditionLayerInstance = shallowRef(null); // Simpan instance Leaflet

// === STATE PMSS & DAMPAK ===
const isDampakMenuOpen = ref(false);
const isPMSSMenuOpen = ref(false); // Opsional jika ingin dipisah (tapi kita pakai Dampak gabungan)
const activePMSSLayerIds = ref([]); // Simpan ID (string) untuk checkbox
const activePMSSLayerObjects = ref([]); // Simpan Object lengkap untuk Legend
const pmssLayerInstances = shallowRef({}); // Simpan Instance Leaflet L.tileLayer

const sidebarOrder = ref(["kondisi_wilayah", "dampak"]); // Simplified

const getSidebarPositionClass = (layerId) => {
  const index = sidebarOrder.value.indexOf(layerId);
  const positions = ["bottom-[20rem]", "bottom-[14rem]"];
  return positions[index] || "bottom-[14rem]";
};

const bringToFront = (layerId) => {
  const otherLayers = sidebarOrder.value.filter((id) => id !== layerId);
  sidebarOrder.value = [layerId, ...otherLayers];
};

const prefetchAllChildren = async () => {
  // Ambil semua ID wilayah yang sedang tampil di peta
  const currentIds = Object.keys(groupedData.value);

  if (currentIds.length === 0) return;

  // console.log(
  //   `[Prefetch] Memulai background fetch untuk ${currentIds.length} wilayah...`,
  // );

  // Kita gunakan Promise.allSettled agar permintaan jalan parallel
  // Jika terlalu banyak (misal level desa), browser bisa hang.
  // Untuk level Provinsi (34-38 item) dan Kabupaten per-Provinsi (~20-40 item), ini aman.

  const promises = currentIds.map(async (id) => {
    // Cek dulu, kalau sudah ada di cache, skip
    if (hoverDataCache.value[id]) return;

    try {
      // Panggil API fetch children
      const childData = await fetchChildrenForHover(id, currentLevel.value, {
        id_dataset: selectedDatasetId.value,
        id_indikator: selectedIndikatorId.value,
        filter_state: selectedFilters.value,
      });

      // Simpan ke Cache
      hoverDataCache.value[id] = childData;
    } catch (e) {
      console.warn(`[Prefetch] Gagal fetch child untuk ${id}`, e);
    }
  });

  // Jalankan semua request secara paralel di background
  await Promise.allSettled(promises);
  // console.log(`[Prefetch] Selesai. Data hover siap.`);
};

// Reset drill ke provinsi
const handleDrillReset = () => {
  selectedInfo.value = null;
  selectedLocation.value = null;

  resetDrill();
  fetchAgregatData();
};

// Jump ke level tertentu di breadcrumb
const handleDrillToLevel = (levelIndex) => {
  selectedInfo.value = null;
  selectedLocation.value = null; // Reset juga titik lokasi jika ada

  // 2. Potong stack sampai index yang diklik
  while (drillDownStack.value.length > levelIndex + 1) {
    drillUp();
  }

  // 3. Fetch ulang
  fetchAgregatData();
};

// Export Excel
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
    // Ambil semua data dari rawRecords yang sudah ter-filter
    const dataToExport = rawRecords.value.map((rec) => {
      const row = {
        Provinsi: rec.kd_prov?.nama || "",
        "Kode Provinsi": rec.kd_prov?.kode || "",
      };

      // Tambahkan kolom kabupaten jika ada
      if (rec.kd_kab) {
        row["Kabupaten"] = rec.kd_kab.nama || "";
        row["Kode Kabupaten"] = rec.kd_kab.kode || "";
      }

      // Tambahkan kolom kecamatan jika ada
      if (rec.kd_kec) {
        row["Kecamatan"] = rec.kd_kec.nama || "";
        row["Kode Kecamatan"] = rec.kd_kec.kode || "";
      }

      // Tambahkan kolom desa jika ada
      if (rec.kd_desa) {
        row["Desa"] = rec.kd_desa.nama || "";
        row["Kode Desa"] = rec.kd_desa.kode || "";
      }

      // Tambahkan kategori dinamis
      for (let i = 1; i <= 5; i++) {
        const key = `itemCategory${i}`;
        if (rec[key]) {
          const val = rec[key]?.nama || rec[key]?.kode || rec[key];
          if (val) row[`Kategori ${i}`] = val;
        }
      }

      // Tambahkan nilai dan satuan
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

    // Export menggunakan utility yang sudah ada
    const success = await exportHierarchicalExcel(
      dataToExport,
      `Data_${selectedDatasetLabel.value.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`,
      {
        datasetName: selectedDatasetLabel.value,
        unit: currentUnit.value,
        filters: selectedFilters.value,
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
    // --- TAMBAHAN BARU (MULAI) ---

    // 1. Reset Drill Down Stack (Ini yang bikin breadcrumb hilang)
    resetDrill();

    // 2. Reset Level Flag ke Default (Ini yang bikin batas wilayah balik ke Provinsi)
    isLevelProvinsi.value = true;
    isLevelKabkot.value = false;
    isLevelKecamatan.value = false;
    isLevelDesa.value = false;

    // 3. Reset View Peta ke Posisi Awal (Opsional, biar zoom out otomatis)
    if (map) {
      map.setView(MAP_VIEW_CONFIG.initialCenter, MAP_VIEW_CONFIG.initialZoom);
    }
    // --- TAMBAHAN BARU (SELESAI) ---

    // 1. Tutup semua panel menu
    activePanel.value = null;
    isConditionMenuOpen.value = false;
    isDampakMenuOpen.value = false;
    isBrinMenuOpen.value = false;

    // 2. Bersihkan Info Panel & Seleksi
    closeInfoPanel();
    selectedInfo.value = null;

    // 3. Matikan Layer Kondisi (Sentinel/DEM/VIIRS)
    if (activeConditionLayer.value) {
      await toggleConditionLayer(activeConditionLayer.value);
    }

    // 4. Bersihkan Additional Layers (BRIN/Spectra)
    const activeAdditional = [...activeAdditionalLayers.value];
    for (const layerId of activeAdditional) {
      await toggleAdditionalLayer(layerId);
    }

    // 5. Bersihkan PMSS Layers
    const activePMSS = [...activePMSSLayerObjects.value];
    for (const layerObj of activePMSS) {
      await togglePMSSLayer(layerObj);
    }

    // 6. Reset Layer Utama (Choropleth)
    if (selectedDatasetId.value) {
      selectedDatasetId.value = null;
      selectedIndikatorId.value = null;

      if (geoJsonLayer && map) map.removeLayer(geoJsonLayer);
      if (geoJsonLayerFullscreen && mapFullscreen)
        mapFullscreen.removeLayer(geoJsonLayerFullscreen);

      groupedData.value = {};
      legendItems.value = [];
      dynamicFilterConfigs.value = [];
      selectedFilters.value = {};
    }

    // 7. Reset Layer 2 (Pendataan)
    localIndikatorList.value.forEach((ind) => {
      ind.checked = false;
      ind.isOpen = false;
      ind.selectedJenisInfra = [];
    });

    if (markerLayer) markerLayer.clearLayers();
    if (markerLayerFullscreen) markerLayerFullscreen.clearLayers();
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
// === GENERIC LAYER TOGGLE FUNCTION ===
const toggleConditionLayer = async (layerType) => {
  const L = await import("leaflet");

  // Jika layer yang sama diklik, matikan
  if (activeConditionLayer.value === layerType) {
    // Remove dari map
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

  // Hapus layer lama jika ada
  if (conditionLayerInstance.value) {
    if (map) map.removeLayer(conditionLayerInstance.value);
    if (mapFullscreen && conditionLayerInstance.value._fs) {
      mapFullscreen.removeLayer(conditionLayerInstance.value._fs);
    }
  }

  // Set layer baru
  activeConditionLayer.value = layerType;
  const config = LAYER_CONFIG_PASCA[layerType];
  if (!config) {
    console.warn(
      `[MapError] Konfigurasi tidak ditemukan untuk layer: ${layerType}`,
    );
    return;
  }
  // Set opacity default sesuai config
  conditionLayerOpacity.value = config.defaultOpacity;

  // Render URL dinamis untuk VIIRS (perlu timestamp)
  let finalUrl = config.url;
  if (layerType === LAYER_TYPES_PASCA.VIIRS) {
    // VIIRS butuh parameter {time} di URL
    // Gunakan tanggal 1 minggu lalu sebagai default
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const timeParam = oneWeekAgo.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    finalUrl = config.url.replace("{time}", timeParam);
  }

  // Create tile layer untuk map utama
  const tileLayer = L.tileLayer(finalUrl, {
    attribution: config.attribution,
    minZoom: config.minZoom,
    maxZoom: config.maxZoom,
    opacity: conditionLayerOpacity.value,
    zIndex: layerType === LAYER_TYPES_PASCA.DEM ? 5 : 3,
    bounds: config.bounds || MAP_VIEW_CONFIG.bounds,
  });

  if (map) {
    tileLayer.addTo(map);
    conditionLayerInstance.value = tileLayer;
  }

  // Create untuk fullscreen map (jika ada)
  if (mapFullscreen) {
    const fsLayer = L.tileLayer(finalUrl, {
      attribution: config.attribution,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      opacity: conditionLayerOpacity.value,
      zIndex: layerType === LAYER_TYPES_PASCA.DEM ? 5 : 3,
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

// --- SPASIAL STATE ---
const activeSektorTab = ref(props.activeSektorParams);
const datasetMeta = ref({
  instansi: "-",
  sumber: "-",
  label: null,
  sektor: null,
});
const availableDatasets = ref([]);

// === COMPUTED: GROUPING LOGIC ===
const groupedDatasets = computed(() => {
  const filtered = availableDatasets.value.filter(
    (d) => d.sektor === activeSektorTab.value,
  );

  const groups = {};
  filtered.forEach((item) => {
    if (!groups[item.id_dataset]) {
      groups[item.id_dataset] = {
        id_dataset: item.id_dataset,
        dataset_label:
          item.dataset_label || item.label || `Dataset ${item.id_dataset}`,
        sektor: item.sektor,
        indicators: [],
      };
    }
    groups[item.id_dataset].indicators.push({
      id_indikator: item.id_indikator,
      label: item.indikator_label || `Indikator ${item.id_indikator}`,
    });
  });

  return Object.values(groups);
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

  // === PERBAIKAN LOGIKA PARAMETER ===
  const regionParams = {};

  // Gunakan 'level' yang dikirim dari selectedInfo, jangan pake state global
  if (level === "desa") {
    regionParams.id_desa = regionId;
  } else if (level === "kec") {
    regionParams.id_kec = regionId;
  } else if (level === "kab") {
    regionParams.id_kab = regionId;
  } else {
    // Default atau 'prov'
    regionParams.id_prov = regionId;
  }
  // ==================================

  try {
    const promises = others.map((ind) =>
      $fetch("/api/agregat-insight", {
        params: {
          id_dataset: selectedDatasetId.value,
          id_indikator_insight: ind.id_indikator,
          ...regionParams, // Parameter sudah benar (misal: id_prov: 11)
        },
      }),
    );

    const results = await Promise.all(promises);

    relatedIndicatorsData.value = others.map((ind, index) => {
      const res = results[index];
      let val = 0;
      let unit = "Satuan";

      if (res.success && res.data?.records?.length > 0) {
        // PERBAIKAN: Lakukan Sum (Penjumlahan) semua record yang kembali
        // Karena jika request id_prov, API return list kabupaten
        val = res.data.records.reduce((acc, curr) => {
          return acc + (parseFloat(curr.value) || 0);
        }, 0);

        // Ambil satuan dari record pertama saja
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
          opacity: dampakLayerOpacity.value, // GUNAKAN VARIABEL
          fillOpacity: dampakLayerOpacity.value,
        });
      },
      style: {
        color: config.color,
        weight: 1.5,
        opacity: dampakLayerOpacity.value, // GUNAKAN VARIABEL
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
const dynamicFilterConfigs = ref([]);
const selectedFilters = ref({});
const currentUnit = ref("");
const currentIndikatorName = ref("");
const currentIndikatorDesc = ref("");

const isLoading = ref(false);
const showDatasetList = ref(false);
const openFullscreen = ref(false);

const selectedDatasetId = ref(props.datasetIdParams);
const selectedIndikatorId = ref(props.indikatorIdParams);
const hoverInfo = ref(null);
const tooltipPos = ref({ x: 0, y: 0 });
const selectedInfo = ref(null);
const groupedData = ref({});
const legendItems = ref([]);

// const geoJsonProvinsi = shallowRef(null);
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

// --- PENDATAAN STATE ---
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

const loadLabelsFromDB = async () => {
  availableDatasets.value = pascaDatasets.map((c) => ({
    ...c,
    label: "Memuat...",
    dataset_label: "Memuat Dataset...",
    indikator_label: "Memuat Indikator...",
  }));

  const dummyParams = {};
  const promises = pascaDatasets.map(async (config) => {
    try {
      const res = await $fetch("/api/agregat-insight", {
        params: {
          id_dataset: config.id_dataset,
          id_indikator_insight: config.id_indikator,
          ...dummyParams,
        },
      });

      if (res.success && res.data?.meta?.dataset?.judul) {
        const dsLabel = res.data.meta.dataset.judul;
        const firstRec = res.data.records?.[0];
        const indLabel = firstRec?.indikator?.nama || dsLabel;
        return {
          ...config,
          label: indLabel,
          dataset_label: dsLabel,
          indikator_label: indLabel,
        };
      }
      return {
        ...config,
        label: "Data Insight",
        dataset_label: "Data Insight",
        indikator_label: "Indikator",
      };
    } catch (e) {
      console.warn(`Gagal load label ID ${config.id_dataset}:`, e);
      return {
        ...config,
        label: "Gagal memuat",
        dataset_label: "Gagal memuat",
        indikator_label: "Gagal memuat",
      };
    }
  });

  const results = await Promise.all(promises);
  availableDatasets.value = results;
};

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
  selectedInfo.value = null;
  locationsData.value = {};
  selectedLocation.value = null;

  if (activePanel.value === "layer2") {
    activePanel.value = "layer1";
  }

  if (markerLayer) markerLayer.clearLayers();
  if (markerLayerFullscreen) markerLayerFullscreen.clearLayers();

  if (geoJsonLayer) geoJsonLayer.eachLayer((l) => geoJsonLayer.resetStyle(l));
  if (geoJsonLayerFullscreen)
    geoJsonLayerFullscreen.eachLayer((l) =>
      geoJsonLayerFullscreen.resetStyle(l),
    );
};

const onDatasetChange = (dataset) => {
  activePanel.value = null;
  if (
    selectedDatasetId.value === dataset.id_dataset &&
    selectedIndikatorId.value === dataset.id_indikator
  ) {
    selectedDatasetId.value = null;
    selectedIndikatorId.value = null;
    groupedData.value = {};
    legendItems.value = [];
    dynamicFilterConfigs.value = [];
    selectedFilters.value = {};
    activePanel.value = null;
    if (geoJsonLayer && map) map.removeLayer(geoJsonLayer);
    if (geoJsonLayerFullscreen && mapFullscreen)
      mapFullscreen.removeLayer(geoJsonLayerFullscreen);
    closeInfoPanel();
    return;
  }

  selectedDatasetId.value = dataset.id_dataset;
  selectedIndikatorId.value = dataset.id_indikator;
  dynamicFilterConfigs.value = [];
  locationsData.value = {};
  selectedLocation.value = null;
  selectedInfo.value = null;

  if (localIndikatorList.value.length > 0) {
    localIndikatorList.value.forEach((ind) => {
      ind.checked = false;
      ind.isOpen = false;
      ind.selectedJenisInfra = [];
    });
  }

  if (markerLayer) markerLayer.clearLayers();
  if (markerLayerFullscreen) markerLayerFullscreen.clearLayers();

  fetchAgregatData();
  if (props.viewMode === "split") {
    showFullscreenHint.value = true;
    setTimeout(() => {
      showFullscreenHint.value = false;
    }, 5000);
  }
};

const updateFilterState = (key, value) => {
  selectedFilters.value[key] = value;
  processDataForMap();
};

const fetchIndikatorList = async () => {
  try {
    const response = await $fetch("/api/list");
    if (response.success) {
      localIndikatorList.value = response.data.map((ind, index) => ({
        ...ind,
        checked: index === 0,
        isOpen: index === 0,
        selectedJenisInfra:
          index === 0 && ind.jenis_infra ? [...ind.jenis_infra] : [],
      }));
    }
  } catch (error) {
    console.error("Err fetch list:", error);
  }
};

const fetchLocationData = async (regionId) => {
  if (!regionId) return;
  const cacheKey = `loc-${regionId}`;
  if (cachedLocationsData.value[cacheKey]) {
    locationsData.value = cachedLocationsData.value[cacheKey];
    updatePendataanMarkers();
    return;
  }

  const loadToast = toast.add({
    title: "Memuat titik pendataan...",
    icon: "i-heroicons-arrow-path",
  });

  try {
    // Tentukan payload berdasarkan panjang regionId
    const regionIdLength = String(regionId).length;
    let payload;

    if (regionIdLength === 10) {
      // Desa (10 digit)
      payload = { kode_desa: regionId };
    } else if (regionIdLength === 7) {
      // Kecamatan (7 digit) - INI YANG KURANG!
      payload = { kode_kec: regionId };
    } else if (regionIdLength === 4) {
      // Kabupaten (4 digit)
      payload = { kode_kab: regionId };
    } else if (regionIdLength === 2) {
      payload = { kode_prov: regionId };
    } else {
      throw new Error("Invalid region ID format");
    }

    const response = await $fetch("/api/koordinat", {
      method: "POST",
      body: payload,
    });

    if (response.success) {
      const resultData = response.data.data || response.data;
      cachedLocationsData.value[cacheKey] = resultData;
      locationsData.value = resultData;
      updatePendataanMarkers();
    }
  } catch (error) {
    console.error("Err fetch loc:", error);
    locationsData.value = {};
  } finally {
    toast.remove(loadToast.id);
  }
};

// ============================================
// FULL fetchAgregatData() DENGAN DRILL-DOWN
// Paste ini ke SpatialPra.vue dan SpatialPasca.vue
// ============================================

const fetchAgregatData = async () => {
  if (!isMapReady.value || !selectedDatasetId.value) return;

  isLoading.value = true;
  const loadingToast = toast.add({
    title: "Memuat data...",
    icon: "i-heroicons-arrow-path",
    color: "amber",
  });

  // Reset state (JANGAN reset drillDownStack)
  rawRecords.value = [];
  groupedData.value = {};
  legendItems.value = [];

  // JANGAN reset selectedInfo jika sedang drill-down
  if (drillDownStack.value.length === 0) {
    selectedInfo.value = null;
    selectedFilters.value = {};
  }

  // Find dataset config
  const dataset = availableDatasets.value.find(
    (d) =>
      d.id_dataset === selectedDatasetId.value &&
      d.id_indikator === selectedIndikatorId.value,
  );

  if (!dataset) {
    isLoading.value = false;
    toast.remove(loadingToast.id);
    return;
  }

  hoverDataCache.value = {};

  try {
    // ============================================
    // STEP 1: CEK FLAG AGREGASI DARI API
    // ============================================
    let flagAgregasi = null;

    // Fetch minimal 1 record untuk cek flag_agregasi
    const sampleParams = {
      id_dataset: dataset.id_dataset,
      id_indikator_insight: dataset.id_indikator,
      limit: 1,
    };

    // Tambahkan filter wilayah untuk sample
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
      setAggregationFlag(flagAgregasi); // Update composable state
    }

    // ============================================
    // STEP 2: TENTUKAN LEVEL & PARAMS FETCH
    // ============================================
    let fetchLevel = currentLevel.value; // dari composable
    let params = {
      id_dataset: dataset.id_dataset,
      id_indikator_insight: dataset.id_indikator,
    };

    // Jika flag_agregasi = 0 atau null, skip drill-down logic
    if (flagAgregasi !== 1) {
      // Reset drill stack
      resetDrill();

      // Fetch data normal berdasarkan wilayah props
      let requests = [];

      if (props.wilayah.kabupaten?.length > 0) {
        requests = props.wilayah.kabupaten
          .map((k) => {
            const id = getId(k);
            return id
              ? $fetch("/api/agregat-insight", {
                  params: { ...params, id_kab: id },
                })
              : null;
          })
          .filter(Boolean);
      } else if (props.wilayah.provinsi?.length > 0) {
        requests = props.wilayah.provinsi
          .map((p) => {
            const id = getId(p);
            return id
              ? $fetch("/api/agregat-insight", {
                  params: { ...params, id_prov: id },
                })
              : null;
          })
          .filter(Boolean);
      }

      if (requests.length === 0) throw new Error("No requests");

      const responses = await Promise.all(requests);
      const validRes = responses.find(
        (r) => r.success && r.data?.records?.length > 0,
      );

      if (!validRes) {
        toast.remove(loadingToast.id);
        legendItems.value = [{ label: "Data tidak tersedia", color: "#EEE" }];
        isLoading.value = false;
        return;
      }

      // Process metadata
      const metaDs = validRes.data.meta.dataset;
      const metaSektor = validRes.data.meta.sektor;
      datasetMeta.value = {
        instansi: metaDs.instansi || "-",
        sumber: metaDs.sumber || "-",
        label: metaDs.judul || dataset.label,
        sektor: metaSektor?.nama || dataset.sektor,
      };

      const firstRec = validRes.data.records[0];

      // Tentukan level berdasarkan data
      if (firstRec.kd_desa && firstRec.kd_desa.kode) {
        setBaseLevel("desa"); // ← TAMBAH
        isLevelDesa.value = true;
        isLevelKecamatan.value = false;
        isLevelKabkot.value = false;
        isLevelProvinsi.value = false;
        currentLevel.value = "desa"; // ← TAMBAHKAN INI
        if (!geoJsonDesa.value) await loadGeoJsonDesa();
      } else if (firstRec.kd_kec && firstRec.kd_kec.kode) {
        setBaseLevel("kec"); // ← TAMBAH
        isLevelDesa.value = false;
        isLevelKecamatan.value = true;
        isLevelProvinsi.value = false;
        isLevelKabkot.value = false;
        currentLevel.value = "kec"; // ← TAMBAHKAN INI
        if (!geoJsonKecamatan.value) await loadGeoJsonKecamatan();
      } else if (firstRec.kd_kab && firstRec.kd_kab.kode) {
        setBaseLevel("kab"); // ← TAMBAH
        isLevelDesa.value = false;
        isLevelKecamatan.value = false;
        isLevelProvinsi.value = false;
        isLevelKabkot.value = true;
        currentLevel.value = "kab"; // ← TAMBAHKAN INI
      } else if (firstRec.kd_prov && firstRec.kd_prov.kode) {
        setBaseLevel("prov"); // ← TAMBAH
        isLevelDesa.value = false;
        isLevelProvinsi.value = true;
        isLevelKecamatan.value = false;
        isLevelKabkot.value = false;
        currentLevel.value = "prov"; // ← TAMBAHKAN INI
        if (!geoJsonProvinsi.value) await loadGeoJsonProvinsi();
      }

      // Set indikator info
      currentIndikatorName.value =
        firstRec.indikator?.nama || datasetMeta.value.label;
      currentIndikatorDesc.value = firstRec.indikator?.deskripsi || "";

      const rawDesc = firstRec.indikator?.deskripsi || "";
      if (
        rawDesc.trim().toLowerCase() ===
        currentIndikatorName.value.trim().toLowerCase()
      ) {
        currentIndikatorDesc.value = "";
      } else {
        currentIndikatorDesc.value = rawDesc;
      }

      currentUnit.value = firstRec.indikator?.satuan || "Satuan";
      // console.log("Before processDataForMap:", {
      //   currentLevel: currentLevel.value,
      //   isLevelDesa: isLevelDesa.value,
      //   firstRecordKdDesa: firstRec.kd_desa,
      //   agregat: flagAgregasi,
      // });

      if (currentUnit.value === "Satuan") {
        const lowerLabel = currentIndikatorName.value.toLowerCase();
        if (lowerLabel.includes("pdrb")) currentUnit.value = "Miliar Rupiah";
        else if (lowerLabel.includes("desa")) currentUnit.value = "Desa";
        else if (datasetMeta.value.sektor === "Akses Darat")
          currentUnit.value = "Desa";
      }

      // Combine all responses
      let combined = [];
      responses.forEach((r) => {
        if (r.success && r.data?.records) combined.push(...r.data.records);
      });
      rawRecords.value = combined;

      // Generate dynamic filters
      const configs = [];
      for (let i = 1; i <= 5; i++) {
        const key = `itemCategory${i}`;
        const uniqueVals = [
          ...new Set(
            combined
              .map((r) => r[key]?.nama || r[key]?.kode || r[key])
              .filter(Boolean),
          ),
        ].sort();

        if (uniqueVals.length > 0) {
          let label = `Kategori ${i}`;
          const isYear = uniqueVals.some((v) => /^\d{4}$/.test(v));

          if (isYear) {
            label = "Tahun";
            const latestYear = uniqueVals[uniqueVals.length - 1];
            selectedFilters.value[key] = latestYear;
            continue;
          } else if (uniqueVals.some((v) => v.includes("Triwulan"))) {
            label = "Periode";
          } else if (uniqueVals.length > 1) {
            label = "Filter";
          }

          configs.push({
            key: key,
            label: label,
            options: uniqueVals,
          });
          selectedFilters.value[key] = uniqueVals[0];
        }
      }
      dynamicFilterConfigs.value = configs;

      processDataForMap();
      toast.remove(loadingToast.id);
      isLoading.value = false;
      return; // EXIT EARLY untuk non-aggregated data
    }

    // ============================================
    // STEP 3: FETCH DATA HIERARKI (flag_agregasi = 1)
    // ============================================

    // Gunakan fetchHierarchicalData utility
    const hierarchicalRecords = await fetchHierarchicalData({
      id_dataset: dataset.id_dataset,
      id_indikator: dataset.id_indikator,
      level: fetchLevel,
      parent_id: currentParentId.value, // dari composable
      filter_state: selectedFilters.value,
    });

    if (hierarchicalRecords.length === 0) {
      toast.remove(loadingToast.id);
      legendItems.value = [
        { label: "Data tidak tersedia di level ini", color: "#EEE" },
      ];
      isLoading.value = false;
      return;
    }

    // Process metadata dari first record
    const firstHierRec = hierarchicalRecords[0];

    // Set metadata (sama seperti non-aggregated)
    const metaDs = firstHierRec.indikator?.dataset || {};
    const metaSektor = firstHierRec.indikator?.sektor || {};

    datasetMeta.value = {
      instansi: metaDs.instansi || "-",
      sumber: metaDs.sumber || "-",
      label: metaDs.judul || dataset.label,
      sektor: metaSektor?.nama || dataset.sektor,
    };

    currentIndikatorName.value =
      firstHierRec.indikator?.nama || datasetMeta.value.label;
    currentIndikatorDesc.value = firstHierRec.indikator?.deskripsi || "";

    const rawDesc = firstHierRec.indikator?.deskripsi || "";
    if (
      rawDesc.trim().toLowerCase() ===
      currentIndikatorName.value.trim().toLowerCase()
    ) {
      currentIndikatorDesc.value = "";
    } else {
      currentIndikatorDesc.value = rawDesc;
    }

    currentUnit.value = firstHierRec.indikator?.satuan || "Satuan";

    if (currentUnit.value === "Satuan") {
      const lowerLabel = currentIndikatorName.value.toLowerCase();
      if (lowerLabel.includes("pdrb")) currentUnit.value = "Miliar Rupiah";
      else if (lowerLabel.includes("desa")) currentUnit.value = "Desa";
      else if (datasetMeta.value.sektor === "Akses Darat")
        currentUnit.value = "Desa";
    }

    // ============================================
    // STEP 4: LOAD GEOJSON SESUAI LEVEL
    // ============================================
    if (fetchLevel === "desa") {
      isLevelDesa.value = true;
      isLevelKecamatan.value = false;
      isLevelProvinsi.value = false;
      isLevelKabkot.value = false;
      currentLevel.value = "desa"; // ← TAMBAHKAN
      if (!geoJsonDesa.value) await loadGeoJsonDesa();
    } else if (fetchLevel === "kec") {
      isLevelDesa.value = false;
      isLevelKecamatan.value = true;
      isLevelProvinsi.value = false;
      isLevelKabkot.value = false;
      currentLevel.value = "kec"; // ← TAMBAHKAN
      if (!geoJsonKecamatan.value) await loadGeoJsonKecamatan();
    } else if (fetchLevel === "kab") {
      isLevelDesa.value = false;
      isLevelKecamatan.value = false;
      isLevelProvinsi.value = false;
      isLevelKabkot.value = true;
      currentLevel.value = "kab"; // ← TAMBAHKAN
      if (!geoJsonKecamatan.value) await loadGeoJsonKabkot();
    } else if (fetchLevel === "prov") {
      isLevelDesa.value = false;
      isLevelKecamatan.value = false;
      isLevelProvinsi.value = true;
      isLevelKabkot.value = false;
      currentLevel.value = "prov"; // ← TAMBAHKAN
      if (!geoJsonProvinsi.value) await loadGeoJsonProvinsi();
    }

    // ============================================
    // STEP 5: GROUP DATA & GENERATE FILTERS
    // ============================================
    rawRecords.value = hierarchicalRecords;

    // Group by region untuk current level
    const tempGrouped = groupRecordsByRegion(hierarchicalRecords, fetchLevel);
    groupedData.value = tempGrouped;

    // Generate dynamic filters (hanya sekali di awal)
    if (drillDownStack.value.length === 0) {
      const configs = [];
      for (let i = 1; i <= 5; i++) {
        const key = `itemCategory${i}`;
        const uniqueVals = [
          ...new Set(
            hierarchicalRecords
              .map((r) => r[key]?.nama || r[key]?.kode || r[key])
              .filter(Boolean),
          ),
        ].sort();

        if (uniqueVals.length > 0) {
          let label = `Kategori ${i}`;
          const isYear = uniqueVals.some((v) => /^\d{4}$/.test(v));

          if (isYear) {
            label = "Tahun";
            const latestYear = uniqueVals[uniqueVals.length - 1];
            selectedFilters.value[key] = latestYear;
            continue;
          } else if (uniqueVals.some((v) => v.includes("Triwulan"))) {
            label = "Periode";
          } else if (uniqueVals.length > 1) {
            label = "Filter";
          }

          configs.push({
            key: key,
            label: label,
            options: uniqueVals,
          });
          selectedFilters.value[key] = uniqueVals[0];
        }
      }
      dynamicFilterConfigs.value = configs;
    }

    // ============================================
    // STEP 6: PROCESS & RENDER
    // ============================================
    processDataForMap();
    toast.remove(loadingToast.id);

    // === TAMBAHAN BARU ===
    // Jalankan prefetch TANPA await agar user bisa langsung interaksi dengan peta
    // sementara data hover di-load di background.
    if (canDrillDown.value) {
      prefetchAllChildren();
    }
  } catch (error) {
    console.error("Error fetchAgregatData:", error);
    toast.add({ title: "Gagal memuat data", color: "red" });
    toast.remove(loadingToast.id);
  } finally {
    isLoading.value = false;
  }
};

// ============================================
// FULL FIXED processDataForMap() FUNCTION
// Replace di SpatialPasca.vue mulai line 1847
// ============================================

const processDataForMap = () => {
  // 1. Reset Data Awal
  groupedData.value = {};
  legendItems.value = [];
  if (rawRecords.value.length === 0) return;

  // 2. Filter Data Berdasarkan Dropdown (Tahun/Kategori)
  const filtered = rawRecords.value.filter((rec) => {
    let isValid = true;
    for (const conf of dynamicFilterConfigs.value) {
      const recordVal =
        rec[conf.key]?.nama || rec[conf.key]?.kode || rec[conf.key];
      const selectedVal = selectedFilters.value[conf.key];
      if (recordVal !== selectedVal) {
        isValid = false;
        break;
      }
    }
    return isValid;
  });

  const tempGrouped = {};

  // 3. Grouping Data Berdasarkan Level Wilayah (Prov/Kab/Kec/Desa)
  filtered.forEach((rec) => {
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
      if (kode === "00") return; // Skip kode nasional
      namaRegion = rec.kd_prov?.nama || "";
      detailRegion = {
        provinsi: rec.kd_prov?.nama || "",
      };
    }

    if (!kode) return;

    let val = 0;
    if (rec.value !== null && rec.value !== undefined) {
      val = typeof rec.value === "string" ? parseFloat(rec.value) : rec.value;
    }

    // Agregasi: Sum value jika regionId sama
    if (tempGrouped[kode]) {
      tempGrouped[kode].value += val;
      // Ambil metadata indikator dari record pertama yang punya
      if (!tempGrouped[kode].fullRecord.indikator && rec.indikator) {
        tempGrouped[kode].fullRecord = rec;
      }
    } else {
      tempGrouped[kode] = {
        id: kode,
        name: namaRegion,
        details: detailRegion,
        value: val,
        fullRecord: rec,
      };
    }
  });

  groupedData.value = tempGrouped;

  // 4. Generate Legend (Jenks Natural Breaks)
  const valuesForJenks = Object.values(groupedData.value)
    .map((g) => g.value)
    .filter((v) => v > 0);

  if (valuesForJenks.length > 0) {
    const targetClasses = 4;
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
    legendItems.value = [
      { label: "Data Kosong pada Filter ini", color: "#FFFFFF" },
    ];
  }

  // 5. Render Layer Peta
  if (map) renderLayerForMap(map, false);
  if (mapFullscreen) renderLayerForMap(mapFullscreen, true);

  // 6. Handle Selected Info & Drill Down Persistence [PERBAIKAN DISINI]
  if (selectedInfo.value && selectedInfo.value.id) {
    const currentRegion = groupedData.value[selectedInfo.value.id];

    if (currentRegion) {
      // Skenario A: Region yang dipilih masih ADA di peta saat ini (misal ganti filter tahun)
      // Update nilai statistiknya
      selectedInfo.value = {
        ...selectedInfo.value,
        value: formatNumber(currentRegion.value),
      };
      // Opsional: Refresh lokasi titik jika perlu
      // fetchLocationData(selectedInfo.value.id);
    } else {
      // Skenario B: Region yang dipilih TIDAK ADA di peta saat ini.
      // Ini bisa terjadi karena:
      // 1. Filter membuat data nol/hilang.
      // 2. Kita sedang Drill Down (Masuk ke dalam wilayah anak).

      // Cek apakah ID yang dipilih adalah PARENT dari view saat ini?
      // Jika YA, berarti kita sedang melihat detail dalam wilayah tersebut.
      // JANGAN HAPUS selectedInfo agar tombol toggle tetap muncul.
      const isParentOfCurrentView =
        String(selectedInfo.value.id) === String(currentParentId.value);

      if (isParentOfCurrentView) {
        // Biarkan selectedInfo apa adanya.
        return;
      }

      // Jika bukan parent (benar-benar hilang/reset), baru bersihkan info.
      selectedInfo.value = null;
      selectedLocation.value = null;
      locationsData.value = {};
      if (markerLayer) markerLayer.clearLayers();
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
    // Adjust the path if necessary
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
    // Adjust the path if necessary
    const module = await import("~/assets/data/map/gdf_kec.json");
    geoJsonKecamatan.value = module.default || module;
  } catch (e) {
    console.error("Gagal load geojson kecamatan", e);
  }
};

const updatePendataanMarkers = async () => {
  const L = await import("leaflet");

  const updateGroup = (targetMap, group) => {
    if (!targetMap || !group || typeof group.clearLayers !== "function") return;
    group.clearLayers();

    localIndikatorList.value
      .filter((i) => i.checked)
      .forEach((ind) => {
        let locs = locationsData.value[ind.data_key] || [];

        // 1. FILTER JENIS KERUSAKAN
        if (ind.selectedJenisInfra?.length > 0) {
          locs = locs.filter((l) => {
            if (ind.data_key === "keluarga") {
              const kId = l.jenis_kerusakan || 5;
              const label = DAMAGE_CONFIG[kId]?.label || "Tidak Diketahui";
              return ind.selectedJenisInfra.includes(label);
            } else {
              return ind.selectedJenisInfra.includes(l.kode_jenis_infra);
            }
          });
        }

        const isKeluarga = ind.data_key === "keluarga";

        locs.forEach((loc) => {
          // 2. CEK KELENGKAPAN FOTO (AND Logic)
          const hasPra = !!loc.url_photo_sebelum; // Foto sebelum wajib ada
          const hasPasca =
            !!loc.url_photo1 || !!loc.url_photo2 || !!loc.url_photo3; // Salah satu foto pasca wajib ada
          const hasCompletePhotos = hasPra && hasPasca; // HARUS KEDUANYA (AND)

          // 3. FILTER TOGGLE (Hanya Tampilkan yang lengkap jika aktif)
          if (showPhotosOnly.value && !hasCompletePhotos) {
            return; // Skip marker ini
          }

          let damageVal = loc.jenis_kerusakan;
          if (isKeluarga && !damageVal) {
            damageVal = 5;
          }

          const color = getMarkerColor(ind.data_key, damageVal);

          // 4. GENERATE ICON HTML
          let innerContent = "";
          let iconSize = [28, 28];
          let iconAnchor = [14, 14];
          let iconHtml = "";

          if (isKeluarga) {
            // Jika foto lengkap, tambahkan icon di tengah
            if (hasCompletePhotos) {
              innerContent = getPhotoIconSvg();
            }

            // Gunakan Flexbox untuk centering icon
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
            // Logic Infrastruktur (Tidak berubah)
            const newSize = 32;
            const newAnchor = 16;
            const svgIcon = getInfraIconSvg(ind.data_key);
            iconHtml = `
              <div style="
                background-color: ${color};
                width: ${newSize}px; height: ${newSize}px;
                border-radius: 6px; border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex; align-items: center; justify-content: center;
              ">
                ${svgIcon}
              </div>`;
            iconSize = [newSize, newSize];
            iconAnchor = [newAnchor, newAnchor];
          }

          const icon = L.divIcon({
            className: "custom-marker",
            html: iconHtml,
            iconSize: iconSize,
            iconAnchor: iconAnchor,
          });

          const m = L.marker([loc.lat, loc.lng], { icon: icon });
          m.originalColor = color;
          m.dataType = ind.data_key;
          m.hasCompletePhotos = hasCompletePhotos; // Simpan property untuk highlight logic

          m.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            selectedLocation.value = loc;
          });
          m.addTo(group);
        });
      });

    if (selectedLocation.value) {
      highlightMarkerInGroup(L, group, selectedLocation.value);
    }
  };

  if (markerLayer) updateGroup(map, markerLayer);
  if (markerLayerFullscreen) updateGroup(mapFullscreen, markerLayerFullscreen);
};

// ============================================
// FULL renderLayerForMap() DENGAN DRILL-DOWN & HOVER TABLE
// Paste ini ke SpatialPra.vue dan SpatialPasca.vue
// ============================================

const renderLayerForMap = (
  mapInstance,
  isFullscreen,
  shouldFitBounds = true,
) => {
  if (!mapInstance) return;

  // 1. TENTUKAN GEOJSON & KEY SESUAI LEVEL
  let activeGeoJson = geoJsonProvinsi.value;
  let geoJsonKey = "kdprov";

  // Tentukan level render
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

  // Guard clause
  if (!activeGeoJson) return;

  // 2. BERSIHKAN LAYER LAMA
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

  // 3. RENDER LAYER BARU
  const layer = L.geoJSON(activeGeoJson, {
    pane: "choroplethPane",
    filter: (feature) => {
      const kode = String(feature.properties[geoJsonKey] || "");
      return !!groupedData.value[kode];
    },
    style: (feature) => {
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
        // ----------------------------------------
        // CLICK EVENT: DRILL DOWN & TOAST LOGIC
        // ----------------------------------------
        click: async (e) => {
          L.DomEvent.stopPropagation(e);

          const id = String(f.properties[geoJsonKey]);
          const data = groupedData.value[id];
          if (!data) return;

          // Reset selection indikator (checkboxes)
          const hasActiveSelection = localIndikatorList.value.some(
            (i) => i.checked,
          );
          if (!hasActiveSelection && localIndikatorList.value.length > 0) {
            localIndikatorList.value.forEach((ind, index) => {
              if (index === 0) {
                ind.checked = true;
                ind.isOpen = true;
                ind.selectedJenisInfra = ind.jenis_infra
                  ? [...ind.jenis_infra]
                  : [];
              } else {
                ind.checked = false;
                ind.isOpen = false;
                ind.selectedJenisInfra = [];
              }
            });
          }

          // Set Selected Info
          fetchLocationData(id);
          selectedInfo.value = {
            id: id,
            name: data.name,
            details: data.details,
            value: formatNumber(data.value),
            context: selectedFilters.value,
            level: renderLevel,
          };

          // --- LOGIKA DRILL DOWN ---
          if (canDrillDown.value) {
            const success = drillDown(renderLevel, id, data.name);

            if (success) {
              // Fetch data level bawahnya
              await fetchAgregatData();

              // CEK APAKAH DATA KOSONG?
              if (Object.keys(groupedData.value).length === 0) {
                // Toast: Data tidak tersedia untuk level lebih dalam
                toast.add({
                  title: "Info Wilayah",
                  description:
                    "Data pada level penyajian yang lebih kecil tidak tersedia untuk dataset ini. Menampilkan titik pendataan.",
                  color: "blue",
                  icon: "i-heroicons-information-circle",
                  timeout: 2500,
                });

                // Undo Drill Down (Kembali ke parent)
                drillUp();
                await fetchAgregatData(); // Restore peta sebelumnya

                // Code akan lanjut ke bawah untuk membuka panel Layer 2
              } else {
                // Sukses Drill Down: Update Peta & Zoom
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

                mapInstance.fitBounds(e.target.getBounds(), {
                  padding: [50, 50],
                  maxZoom: 20,
                  animate: true,
                });

                // Return agar tidak membuka panel Layer 2 (tetap di mode Choropleth)
                return;
              }
            }
          } else {
            // Toast: Sudah level paling bawah (misal Desa)
            toast.add({
              title: "Batas Wilayah",
              description: "Ini adalah level wilayah terkecil.",
              color: "blue",
              icon: "i-heroicons-information-circle",
              timeout: 2000,
            });
          }

          // --- LOGIKA FALLBACK (BUKA PANEL LAYER 2) ---
          // Dijalankan jika: Tidak bisa drill down ATAU Data drill down kosong
          // activePanel.value = "layer2";

          // Highlight region
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

          mapInstance.fitBounds(e.target.getBounds(), {
            padding: [50, 50],
            maxZoom: 20,
            animate: true,
          });
        },

        // ----------------------------------------
        // MOUSEOVER (HOVER TABLE)
        // ----------------------------------------
        mouseover: async (e) => {
          L.DomEvent.stopPropagation(e);
          const id = String(f.properties[geoJsonKey]);
          const data = groupedData.value[id];

          if (data) {
            hoverInfo.value = {
              id: id,
              name: data.name,
              details: data.details,
              value: formatNumber(data.value),
              context: selectedFilters.value,
            };

            if (canDrillDown.value) {
              hoverTableVisible.value = true;
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
                      filter_state: selectedFilters.value,
                    },
                  );
                  hoverDataCache.value[id] = childData;
                  if (hoverInfo.value?.id === id) {
                    hoverTableData.value = childData;
                  }
                } catch (err) {
                  hoverTableData.value = [];
                } finally {
                  hoverTableLoading.value = false;
                }
              }
            }
          }

          if (selectedInfo.value?.id !== id) {
            e.target.setStyle({
              weight: 2,
              color: "#666",
              dashArray: "",
            });
            e.target.bringToFront();
          }
        },

        // ----------------------------------------
        // MOUSEMOVE (TOOLTIP POS)
        // ----------------------------------------
        mousemove: (e) => {
          L.DomEvent.stopPropagation(e);
          tooltipPos.value = {
            x: e.containerPoint.x,
            y: e.containerPoint.y,
          };
          if (hoverTableVisible.value) {
            hoverTablePos.value = {
              x: e.containerPoint.x,
              y: e.containerPoint.y,
            };
          }
        },

        // ----------------------------------------
        // MOUSEOUT
        // ----------------------------------------
        mouseout: (e) => {
          hoverInfo.value = null;
          hoverTableVisible.value = false;
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

  // Bring markers to front
  if (markerLayer) markerLayer.bringToFront();
  if (markerLayerFullscreen) markerLayerFullscreen.bringToFront();

  // 4. GENERATE LABEL LAYER
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

  // 5. RESTORE HIGHLIGHT SELECTED REGION
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

  // 6. SAVE LAYER REFERENCES
  if (isFullscreen) {
    geoJsonLayerFullscreen = layer;
    labelLayerFullscreen = newLabelLayer;
    updateLabelVisibility(mapInstance, labelLayerFullscreen);
  } else {
    geoJsonLayer = layer;
    labelLayer = newLabelLayer;
    updateLabelVisibility(mapInstance, labelLayer);
  }

  // 7. FIT BOUNDS
  if (shouldFitBounds && layer.getLayers().length > 0 && !selectedInfo.value) {
    mapInstance.fitBounds(layer.getBounds(), { padding: [20, 20] });
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

  const mGroup = LModule.featureGroup().addTo(m);

  if (elementId.includes("fullscreen")) {
    markerLayerFullscreen = mGroup;

    // Assign ke variabel raw (untuk script internal)
    mapFullscreen = m;

    // Assign ke variabel reactive (untuk komponen boundary)
    mapFullscreenRef.value = m;
  } else {
    markerLayer = mGroup;

    // Assign ke variabel raw (untuk script internal)
    map = m;

    // Assign ke variabel reactive (untuk komponen boundary)
    mapRef.value = m;
  }

  m.on("zoomend", () => {
    if (elementId === "map-pasca-fullscreen") {
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
          ? "kec"
          : "prov"); // Default ke 'prov' bukan 'kab'

  switch (level) {
    case "desa":
      return geoJsonDesa.value || geoJsonProvinsi.value;
    case "kec":
      return geoJsonKecamatan.value || geoJsonProvinsi.value;
    case "prov":
      return geoJsonProvinsi.value || geoJsonProvinsi.value;
    case "kab":
      return geoJsonKabkot.value || geoJsonProvinsi.value;
    default:
      return geoJsonProvinsi.value; // Default Provinsi
  }
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
      const isNotLoaded =
        availableDatasets.value.length === 0 ||
        availableDatasets.value[0]?.label === "Memuat...";

      if (isNotLoaded) {
        await loadLabelsFromDB();
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
      dynamicFilterConfigs.value = [];
      selectedFilters.value = {};
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

watch(selectedLocation, async (newLoc) => {
  const L = await import("leaflet");
  if (newLoc) {
    if (markerLayer) highlightMarkerInGroup(L, markerLayer, newLoc);
    if (markerLayerFullscreen)
      highlightMarkerInGroup(L, markerLayerFullscreen, newLoc);
  } else {
    if (markerLayer) resetAllMarkers(markerLayer, L);
    if (markerLayerFullscreen) resetAllMarkers(markerLayerFullscreen, L);
    await nextTick();
    setTimeout(() => {
      if (map) map.invalidateSize();
      if (mapFullscreen) mapFullscreen.invalidateSize();
    }, 200);
  }
});
watch(selectedInfo, async (newInfo) => {
  if (newInfo && newInfo.id) {
    // Kalo user klik wilayah, ambil data teman-temannya
    await fetchRelatedIndicatorValues(newInfo.id, newInfo.level);
  } else {
    relatedIndicatorsData.value = [];
  }
});
watch(dampakLayerOpacity, (newVal) => {
  // Update PMSS Layers (TileLayers)
  if (pmssLayerInstances.value) {
    Object.values(pmssLayerInstances.value).forEach((layer) => {
      if (layer && typeof layer.setOpacity === "function") {
        layer.setOpacity(newVal);
      }
    });
  }

  // Update BRIN/Additional Layers (GeoJSON)
  if (additionalLayerInstances.value) {
    Object.values(additionalLayerInstances.value).forEach((layer) => {
      if (layer && typeof layer.setStyle === "function") {
        // Update style untuk fill dan stroke
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
    let center, zoom;
    if (map) {
      center = map.getCenter();
      zoom = map.getZoom();
    }
    await nextTick();
    setTimeout(async () => {
      const elementId = "map-pasca-fullscreen";
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

      // 1. Pane untuk Layer 1 (Choropleth) - Z-Index 350
      mapFullscreen.createPane("choroplethPane");
      mapFullscreen.getPane("choroplethPane").style.zIndex = 350;

      // 2. Pane untuk Layer Dampak - Z-Index 450 (Pasti di atas layer 1)
      mapFullscreen.createPane("dampakPane");
      mapFullscreen.getPane("dampakPane").style.zIndex = 450;

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

      // Restore Kondisi Wilayah layer di fullscreen
      if (activeConditionLayer.value && conditionLayerInstance.value) {
        const config = LAYER_CONFIG_PASCA[activeConditionLayer.value];

        let finalUrl = config.url;
        if (activeConditionLayer.value === LAYER_TYPES_PASCA.VIIRS) {
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
          zIndex: activeConditionLayer.value === LAYER_TYPES_PASCA.DEM ? 5 : 3,
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
        }
      });
    }, 500);
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
      // Cleanup Kondisi Wilayah layers
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
// Watch untuk update opacity
watch(conditionLayerOpacity, (newVal) => {
  if (conditionLayerInstance.value) {
    conditionLayerInstance.value.setOpacity(newVal);
  }
  if (conditionLayerInstance.value?._fs) {
    conditionLayerInstance.value._fs.setOpacity(newVal);
  }
});

onActivated(async () => {
  await nextTick();
  setTimeout(() => {
    if (map) {
      map.invalidateSize();
    }
  }, 300);
});

// onMounted(async () => {
//   await fetchIndikatorList();
//   loadLabelsFromDB();
//   fetchLastUpdateDate();
//   await loadGeoJsonProvinsi();

//   // Inisialisasi Map
//   map = await initMap("map-pasca");

//   await nextTick();

//   if (rawRecords.value.length > 0) {
//     processDataForMap();
//   }

//   // Auto-activate Sentinel-2 layer
//   setTimeout(() => {
//     if (!activeConditionLayer.value) {
//       toggleConditionLayer(LAYER_TYPES_PASCA.SENTINEL);
//     }
//   }, 600);
// });
onMounted(async () => {
  await fetchIndikatorList();
  loadLabelsFromDB();
  fetchLastUpdateDate();
  await loadGeoJsonProvinsi();

  // Inisialisasi Map
  map = await initMap("map-pasca");

  await nextTick();

  // ⭐ TAMBAHKAN KODE INI - AUTO-LOAD DEFAULT DATASET ⭐
  if (
    isMapReady.value &&
    selectedDatasetId.value === props.datasetIdParams &&
    selectedIndikatorId.value === props.indikatorIdParams
  ) {
    // Tunggu sebentar agar map sudah siap sepenuhnya
    setTimeout(async () => {
      await fetchAgregatData();
    }, 500);
  }

  // Auto-activate Sentinel-2 layer
  // setTimeout(() => {
  //   if (!activeConditionLayer.value) {
  //     toggleConditionLayer(LAYER_TYPES_PASCA.SENTINEL);
  //   }
  // }, 600);
});
</script>

<style scoped>
#map-pasca,
#map-pasca-fullscreen {
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
<template>
  <div
    class="grid grid-cols-1 gap-4 h-full"
    :class="selectedLocation ? 'lg:grid-cols-4' : ''"
  >
    <div
      class="relative h-full"
      :class="selectedLocation ? 'lg:col-span-3' : 'lg:col-span-4'"
    >
      <div
        class="relative w-full h-full rounded-xl border-2 border-gray-200 overflow-hidden"
      >
        <div
          class="absolute top-4 -ml-0 left-0 z-[1500] flex flex-row items-start font-sans"
        >
          <div class="flex flex-col gap-3 w-9 shrink-0 z-20">
            <MapSpatialStickyToggle
              v-if="activePanel !== 'layer1'"
              label="Statistik"
              color="amber"
              :disabled="!isMapReady"
              @click="togglePanel('layer1')"
            />

            <MapSpatialStickyToggle
              v-if="activePanel !== 'layer2' && selectedInfo"
              label="Pendataan"
              color="blue"
              tooltipText="Filter Data Pendataan"
              :disabled="!isMapReady"
              @click="togglePanel('layer2')"
            />
            <button
              v-if="isMapReady"
              @click="handleResetMap"
              class="w-9 h-9 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all group"
              title="Reset Tampilan (Bersihkan Layer)"
            >
              <span
                class="text-[8px] font-extrabold text-gray-500 group-hover:text-red-600 leading-none tracking-tighter"
              >
                Reset
              </span>
            </button>
          </div>

          <div
            v-if="activePanel"
            class="animate-fade-in-left z-[1500] transition-all duration-300"
            :class="
              activePanel === 'layer1' && !selectedInfo ? '-ml-0' : 'ml-3'
            "
          >
            <div v-if="activePanel === 'layer1'" class="flex flex-col gap-1">
              <MapSpatialControlDataset
                class="w-60"
                :disabled="!isMapReady"
                :show-list="true"
                :active-sektor-tab="activeSektorTab"
                :available-sektors="tersediaSektor"
                :grouped-datasets="groupedDatasets"
                :selected-dataset-id="selectedDatasetId"
                :selected-indikator-id="selectedIndikatorId"
                :filter-configs="dynamicFilterConfigs"
                :filter-state="selectedFilters"
                :is-loading-data="isLoading"
                :button-label="selectedDatasetLabel"
                @toggle-list="togglePanel('layer1')"
                @update:active-sektor-tab="activeSektorTab = $event"
                @dataset-change="onDatasetChange"
                @update:filter="updateFilterState"
              />
            </div>

            <div v-if="activePanel === 'layer2'" class="flex flex-col gap-1">
              <button
                @click="togglePanel('layer2')"
                class="h-[42px] w-60 px-3 rounded-lg flex items-center justify-between transition-all border shadow-lg bg-white border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-heroicons-adjustments-horizontal"
                    class="w-5 h-5 text-gray-500"
                  />
                  <p class="font-semibold text-gray-900 text-sm">
                    Pilih Layer 2
                  </p>
                </div>
                <UIcon
                  name="i-heroicons-chevron-up"
                  class="w-4 h-4 text-gray-600 transition-transform"
                />
              </button>

              <MapSpatialLayer2
                v-model="localIndikatorList"
                @change="updatePendataanMarkers"
              />
            </div>
          </div>
        </div>
        <!-- KONDISI WILAYAH (Unified: Sentinel, DEM, VIIRS) -->
        <div
          class="absolute left-0 z-[1000] w-9 flex flex-col items-start font-sans transition-all duration-500 ease-in-out pointer-events-none"
          :class="getSidebarPositionClass('kondisi_wilayah')"
        >
          <div class="pointer-events-auto">
            <MapSpatialConditionLayerPasca
              :is-open="isConditionMenuOpen"
              :disabled="!isRegionFilterActive"
              :active-layer="activeConditionLayer"
              :opacity="conditionLayerOpacity"
              @toggle-menu="handleConditionMenuToggle"
              @layer-change="toggleConditionLayer"
              @update:opacity="conditionLayerOpacity = $event"
            />
          </div>
        </div>

        <div
          class="absolute left-0 z-[1000] w-9 flex flex-col items-start font-sans transition-all duration-500 ease-in-out"
          :class="getSidebarPositionClass('dampak')"
        >
          <MapSpatialDampakLayer
            :is-open="isDampakMenuOpen"
            :disabled="!isRegionFilterActive"
            :brin-layers="additionalLayersConfig"
            :active-brin-layers="activeAdditionalLayers"
            :pmss-config="pmssLayersConfig"
            :active-pmss-layers="activePMSSLayerIds"
            :opacity="dampakLayerOpacity"
            @toggle-menu="handleDampakToggle"
            @update:brin="toggleAdditionalLayer"
            @update:pmss="togglePMSSLayer"
            @update:opacity="dampakLayerOpacity = $event"
          />
        </div>

        <!-- === BREADCRUMB DRILL-DOWN === -->
        <!-- Breadcrumb container sendiri -->
        <div class="absolute top-0 left-20 z-[1100] pointer-events-auto">
          <MapSpatialDrillBreadcrumb
            v-if="breadcrumbPath.length > 0"
            :breadcrumb-items="breadcrumbPath"
            :current-level="currentLevel"
            @reset="handleDrillReset"
            @drill-to-level="handleDrillToLevel"
          />
        </div>

        <div
          class="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2 pointer-events-none"
        >
          <div class="flex flex-row items-center gap-2 pointer-events-auto">
            <UBadge
              v-if="selectedDatasetId"
              variant="solid"
              size="md"
              class="bg-white shadow-lg hidden sm:flex items-center gap-1.5 text-gray-700"
            >
              <UIcon
                name="i-heroicons-document-chart-bar"
                class="w-4 h-4 text-amber-600"
              />
              <span
                class="pl-1 font-semibold text-[13px] text-left leading-tight"
                :class="
                  viewMode === 'split'
                    ? 'max-w-[300px] line-clamp-2'
                    : 'max-w-[400px] whitespace-normal'
                "
              >
                {{ selectedDatasetLabel }}
              </span>
            </UBadge>

            <UBadge
              v-if="
                (datasetMeta.sumber !== '-' || datasetMeta.instansi !== '-') &&
                viewMode === 'focus'
              "
              variant="solid"
              size="md"
              class="bg-white shadow-lg hidden sm:flex flex-col items-start gap-1 py-1.5 h-auto text-gray-600"
            >
              <div
                v-if="datasetMeta.sumber !== '-'"
                class="flex items-center gap-1.5"
              >
                <UIcon
                  name="i-heroicons-link"
                  class="w-3.5 h-3.5 text-gray-400"
                />
                <span class="leading-none"
                  >Sumber: {{ datasetMeta.sumber }}</span
                >
              </div>

              <div
                v-if="datasetMeta.instansi !== '-'"
                class="flex items-center gap-1.5"
              >
                <UIcon
                  name="i-heroicons-building-office-2"
                  class="w-3.5 h-3.5 text-gray-400"
                />
                <span class="leading-none">{{ datasetMeta.instansi }}</span>
              </div>
            </UBadge>
            <!-- TAMBAHKAN BUTTON EXPORT EXCEL DI SINI -->

            <button
              @click="handleExportExcel"
              :disabled="!selectedDatasetId || isLoading"
              class="h-[42px] w-[42px] rounded-lg flex items-center justify-center transition-all border bg-white border-gray-200 shadow-lg hover:bg-gray-50 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <UIcon
                name="i-heroicons-arrow-down-tray"
                class="w-5 h-5 text-gray-700"
              />
            </button>

            <!-- <button
                            @click="openFullscreen = true"
                            class="h-[42px] w-[42px] rounded-lg flex items-center justify-center transition-all border bg-white border-gray-200 shadow-lg hover:bg-gray-50 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            <UIcon
                                name="i-heroicons-arrows-pointing-out"
                                class="w-5 h-5 text-gray-700"
                            />
                        </button> -->
            <MapSpatialFullscreenHint :show="showFullscreenHint" />
          </div>

          <div
            v-if="selectedInfo"
            class="animate-fade-in-up pointer-events-auto"
          >
            <MapSpatialInfoPanel
              :info="selectedInfo"
              :dataset-label="currentIndikatorName"
              :filter-state="selectedFilters"
              :unit="currentUnit"
              :description="currentIndikatorDesc"
              :related-indicators="relatedIndicatorsData"
              :is-loading-related="isLoadingRelated"
              @switch-indicator="handleSwitchRelatedIndicator"
              class="w-60"
              :can-export="selectedInfo !== null"
            />
          </div>
        </div>

        <div
          v-if="hoverInfo && !selectedInfo"
          class="absolute z-[1000] pointer-events-none transform -translate-x-1/2 -translate-y-[105%]"
          :style="{
            top: tooltipPos.y + 'px',
            left: tooltipPos.x + 'px',
          }"
        >
          <MapSpatialInfoPanel
            :info="hoverInfo"
            :dataset-label="currentIndikatorName"
            :filter-state="selectedFilters"
            :unit="currentUnit"
            :description="currentIndikatorDesc"
            class="min-w-[250px]"
          />
        </div>

        <div
          class="absolute bottom-4 right-4 z-[400] flex flex-row gap-3 items-end pointer-events-none"
        >
          <MapSpatialLegendDampak
            v-if="
              activePMSSLayerObjects.length > 0 ||
              activeAdditionalLayers.length > 0
            "
            :active-pmss-layers="activePMSSLayerObjects"
            :active-brin-layers="activeAdditionalLayers"
          />
          <div v-if="isPendataanReady">
            <MapSpatialLegendSebaran
              :items="localIndikatorList"
              v-model:showPhotosOnly="showPhotosOnly"
            />
          </div>

          <MapSpatialOpacityControl
            v-if="legendItems.length > 0"
            v-model="mapOpacity"
          />

          <div class="flex flex-col gap-2 items-end">
            <MapSpatialControlBoundary
              v-if="isMapReady"
              :map="map"
              :geo-json-data="activeGeoJsonForBoundary"
              :current-level="
                currentLevel ||
                (isLevelDesa
                  ? 'desa'
                  : isLevelKecamatan
                    ? 'kec'
                    : isLevelKabkot
                      ? 'kab'
                      : 'prov')
              "
              position-class="top-20 right-4"
              v-model:active="isBoundaryActive"
              v-model:opacity-val="boundaryOpacity"
            />
            <MapSpatialLegend
              v-if="legendItems.length > 0"
              :items="legendItems"
              :unit="currentUnit"
            />
          </div>
        </div>

        <div
          v-if="isPendataanReady"
          class="absolute bottom-4 left-4 z-[400] pointer-events-none animate-fade-in-up"
        >
          <MapSpatialLastUpdate :text="lastUpdateText" />
        </div>

        <div id="map-pasca" class="w-full h-full z-0"></div>
      </div>
    </div>

    <div
      v-if="selectedLocation"
      class="h-full overflow-y-auto bg-white rounded-xl border-2 border-gray-200 relative"
    >
      <DetailKoordinat
        :selected-location="selectedLocation"
        :is-filter-complete="true"
        @close="selectedLocation = null"
      />
    </div>

    <UModal v-model:open="openFullscreen" fullscreen>
      <template #content>
        <div class="flex flex-col h-full bg-white relative">
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white z-[500] shadow-sm"
          >
            <h3
              class="min-w-0 font-bold text-gray-900 flex items-start gap-3 max-w-[600px] leading-tight"
            >
              <UIcon
                name="i-heroicons-map"
                class="w-6 h-6 text-amber-600 shrink-0"
              />

              <span class="line-clamp-2">
                Statistik: {{ selectedDatasetLabel }}
              </span>
            </h3>

            <div class="flex items-center gap-3">
              <MapSpatialDisasterBadge type="pasca" />
              <template v-if="datasetMeta.instansi !== '-'">
                <UBadge
                  variant="solid"
                  size="md"
                  class="text-white bg-primary hidden sm:flex items-center gap-1.5"
                >
                  <UIcon name="i-heroicons-link" class="w-4 h-4 text-white" />
                  <span class="font-medium text-white"
                    >Sumber: {{ datasetMeta.sumber }}</span
                  >
                </UBadge>
                <UBadge
                  variant="solid"
                  size="md"
                  class="bg-primary text-white hidden sm:flex items-center gap-1.5"
                >
                  <UIcon
                    name="i-heroicons-building-office-2"
                    class="w-4 h-4 text-white"
                  />
                  <span class="font-medium text-white">{{
                    datasetMeta.instansi
                  }}</span>
                </UBadge>
              </template>

              <button
                @click="handleExportExcel"
                :disabled="!selectedDatasetId || isLoading"
                class="h-[42px] w-[42px] rounded-lg flex items-center justify-center transition-all border bg-white border-gray-200 shadow-lg hover:bg-gray-50 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <UIcon
                  name="i-heroicons-arrow-down-tray"
                  class="w-5 h-5 text-gray-700"
                />
              </button>

              <UButton
                variant="solid"
                icon="i-heroicons-x-mark"
                class="text-gray-100 hover:bg-primary/80 cursor-pointer"
                @click="openFullscreen = false"
              />
            </div>
          </div>
          <div class="absolute top-5 left-25 z-[1100] pointer-events-auto">
            <MapSpatialDrillBreadcrumb
              v-if="breadcrumbPath.length > 0"
              :breadcrumb-items="breadcrumbPath"
              :current-level="currentLevel"
              @reset="handleDrillReset"
              @drill-to-level="handleDrillToLevel"
            />
          </div>
          <div class="flex-1 flex overflow-hidden relative">
            <div class="relative flex-1 bg-slate-100 overflow-hidden">
              <div
                class="absolute top-6 left-0 z-[1000] flex flex-row items-start font-sans pointer-events-auto"
              >
                <div class="flex flex-col gap-3 w-9 shrink-0 z-20">
                  <MapSpatialStickyToggle
                    v-if="activePanel !== 'layer1'"
                    label="Statistik"
                    color="amber"
                    :disabled="!isMapReady"
                    @click="togglePanel('layer1')"
                  />

                  <MapSpatialStickyToggle
                    v-if="activePanel !== 'layer2' && selectedInfo"
                    label="Pendataan"
                    color="blue"
                    tooltipText="Filter Data Pendataan"
                    :disabled="!isMapReady"
                    @click="togglePanel('layer2')"
                  />
                  <button
                    v-if="isMapReady"
                    @click="handleResetMap"
                    class="w-9 h-9 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all group"
                    title="Reset Tampilan (Bersihkan Layer)"
                  >
                    <span
                      class="text-[8px] font-extrabold text-gray-500 group-hover:text-red-600 leading-none tracking-tighter"
                    >
                      Reset
                    </span>
                  </button>
                </div>

                <div
                  v-if="activePanel"
                  class="ml-2 animate-fade-in-left z-10 pointer-events-auto"
                >
                  <div
                    v-if="activePanel === 'layer1'"
                    class="flex flex-col gap-1"
                  >
                    <MapSpatialControlDataset
                      class="w-60"
                      :disabled="!isMapReady"
                      :show-list="true"
                      :active-sektor-tab="activeSektorTab"
                      :available-sektors="tersediaSektor"
                      :grouped-datasets="groupedDatasets"
                      :selected-dataset-id="selectedDatasetId"
                      :selected-indikator-id="selectedIndikatorId"
                      :filter-configs="dynamicFilterConfigs"
                      :filter-state="selectedFilters"
                      :is-loading-data="isLoading"
                      :button-label="selectedDatasetLabel"
                      @toggle-list="togglePanel('layer1')"
                      @update:active-sektor-tab="activeSektorTab = $event"
                      @dataset-change="onDatasetChange"
                      @update:filter="updateFilterState"
                    />
                  </div>

                  <div
                    v-if="activePanel === 'layer2'"
                    class="flex flex-col gap-1"
                  >
                    <button
                      @click="togglePanel('layer2')"
                      class="h-[42px] w-60 px-3 rounded-lg flex items-center justify-between transition-all border shadow-lg bg-white border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <div class="flex items-center gap-2 overflow-hidden">
                        <UIcon
                          name="i-heroicons-adjustments-horizontal"
                          class="w-5 h-5 text-gray-500 flex-shrink-0"
                        />
                        <span
                          class="font-semibold text-gray-900 text-sm truncate"
                          >Pilih Layer 2</span
                        >
                      </div>
                      <UIcon
                        name="i-heroicons-chevron-up"
                        class="w-4 h-4 text-gray-600 flex-shrink-0"
                      />
                    </button>

                    <MapSpatialLayer2
                      v-model="localIndikatorList"
                      @change="updatePendataanMarkers"
                    />
                  </div>
                </div>
              </div>
              <!-- KONDISI WILAYAH (Unified: Sentinel, DEM, VIIRS) -->
              <div
                class="absolute left-0 z-[1000] w-9 flex flex-col items-start font-sans transition-all duration-500 ease-in-out pointer-events-none"
                :class="getSidebarPositionClass('kondisi_wilayah')"
              >
                <div class="pointer-events-auto">
                  <MapSpatialConditionLayerPasca
                    :is-open="isConditionMenuOpen"
                    :disabled="!isRegionFilterActive"
                    :active-layer="activeConditionLayer"
                    :opacity="conditionLayerOpacity"
                    @toggle-menu="handleConditionMenuToggle"
                    @layer-change="toggleConditionLayer"
                    @update:opacity="conditionLayerOpacity = $event"
                  />
                </div>
              </div>

              <div
                class="absolute left-0 z-[1000] w-9 flex flex-col items-start font-sans transition-all duration-500 ease-in-out"
                :class="getSidebarPositionClass('dampak')"
              >
                <MapSpatialDampakLayer
                  :is-open="isDampakMenuOpen"
                  :disabled="!isRegionFilterActive"
                  :brin-layers="additionalLayersConfig"
                  :active-brin-layers="activeAdditionalLayers"
                  :pmss-config="pmssLayersConfig"
                  :active-pmss-layers="activePMSSLayerIds"
                  :opacity="dampakLayerOpacity"
                  @toggle-menu="handleDampakToggle"
                  @update:brin="toggleAdditionalLayer"
                  @update:pmss="togglePMSSLayer"
                  @update:opacity="dampakLayerOpacity = $event"
                />
              </div>
              <div
                class="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2 pointer-events-none"
              >
                <div
                  v-if="selectedInfo"
                  class="animate-fade-in-up pointer-events-auto"
                >
                  <MapSpatialInfoPanel
                    :info="selectedInfo"
                    :dataset-label="currentIndikatorName"
                    :filter-state="selectedFilters"
                    :unit="currentUnit"
                    :description="currentIndikatorDesc"
                    :related-indicators="relatedIndicatorsData"
                    :is-loading-related="isLoadingRelated"
                    @switch-indicator="handleSwitchRelatedIndicator"
                    class="w-60 shadow-xl border-amber-200 bg-white/95 backdrop-blur"
                  />
                </div>
              </div>

              <div
                v-if="hoverInfo && !selectedInfo"
                class="absolute z-[2000] pointer-events-none transform -translate-x-1/2 -translate-y-[105%]"
                :style="{
                  top: tooltipPos.y + 'px',
                  left: tooltipPos.x + 'px',
                }"
              >
                <MapSpatialInfoPanel
                  :info="hoverInfo"
                  :dataset-label="currentIndikatorName"
                  :filter-state="selectedFilters"
                  :unit="currentUnit"
                  :description="currentIndikatorDesc"
                  class="min-w-[250px]"
                />
              </div>

              <div
                class="absolute bottom-4 right-4 z-[1500] flex flex-row gap-3 items-end pointer-events-none"
              >
                <MapSpatialLegendDampak
                  v-if="
                    activePMSSLayerObjects.length > 0 ||
                    activeAdditionalLayers.length > 0
                  "
                  :active-pmss-layers="activePMSSLayerObjects"
                  :active-brin-layers="activeAdditionalLayers"
                />
                <div v-if="isPendataanReady">
                  <MapSpatialLegendSebaran
                    :items="localIndikatorList"
                    v-model:showPhotosOnly="showPhotosOnly"
                  />
                </div>

                <MapSpatialOpacityControl
                  v-if="legendItems.length > 0"
                  v-model="mapOpacity"
                />

                <div class="flex flex-col gap-2 items-end">
                  <MapSpatialControlBoundary
                    v-if="isMapReady"
                    :map="mapFullscreen"
                    :geo-json-data="activeGeoJsonForBoundary"
                    :current-level="
                      currentLevel ||
                      (isLevelDesa
                        ? 'desa'
                        : isLevelKecamatan
                          ? 'kec'
                          : isLevelKabkot
                            ? 'kab'
                            : 'prov')
                    "
                    position-class="top-24 right-6"
                    v-model:active="isBoundaryActive"
                    v-model:opacity-val="boundaryOpacity"
                  />
                  <MapSpatialLegend
                    v-if="legendItems.length > 0"
                    :items="legendItems"
                    :unit="currentUnit"
                  />
                </div>
              </div>
              <div
                v-if="isPendataanReady"
                class="absolute bottom-4 left-4 z-[400] pointer-events-none animate-fade-in-up"
              >
                <MapSpatialLastUpdate :text="lastUpdateText" />
              </div>

              <div
                id="map-pasca-fullscreen"
                class="absolute inset-0 w-full h-full z-0"
              ></div>
            </div>

            <div
              v-if="selectedLocation"
              class="w-80 border-l border-gray-200 bg-white h-full overflow-y-auto shadow-xl z-[450]"
            >
              <DetailKoordinat
                :selected-location="selectedLocation"
                :is-filter-complete="true"
                @close="selectedLocation = null"
              />
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
