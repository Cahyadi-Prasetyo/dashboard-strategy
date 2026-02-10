<template>
  <div class="z-[1000] pointer-events-none" :class="positionClass">
    <div
      class="pointer-events-auto bg-white shadow-lg rounded-2xl border border-gray-200 w-[200px]"
    >
      <div class="flex items-center justify-between px-3 py-2">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-map" class="w-5 h-5 text-gray-600" />
          <span class="text-[11px] font-bold text-gray-800">
            Batas Wilayah
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <USwitch v-model="isActive" size="sm" color="primary" />
          <button
            v-if="isActive"
            @click="isExpanded = !isExpanded"
            class="flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            title="Toggle Settings"
          >
            <UIcon
              :name="
                isExpanded
                  ? 'i-heroicons-chevron-up'
                  : 'i-heroicons-chevron-down'
              "
              class="w-4 h-4"
            />
          </button>
        </div>
      </div>

      <div
        class="transition-all duration-300 ease-in-out overflow-hidden bg-gray-50/50"
        :class="
          isActive && isExpanded
            ? 'max-h-32 opacity-100 border-t border-gray-100'
            : 'max-h-0 opacity-0'
        "
      >
        <div class="px-3 py-2 space-y-3">
          <div class="space-y-1">
            <div
              class="flex justify-between items-center text-[10px] text-gray-500"
            >
              <span>Transparansi</span>
              <span>{{ Math.round(localOpacity * 100) }}%</span>
            </div>
            <input
              type="range"
              v-model.number="localOpacity"
              min="0.1"
              max="1"
              step="0.1"
              class="w-full h-1.5 rounded-full appearance-none bg-gray-200 accent-gray-700 cursor-pointer"
            />
          </div>

          <div class="flex items-center justify-between">
            <span class="text-[10px] font-medium text-gray-600"
              >Tampilkan Label</span
            >
            <USwitch
              v-model="localShowLabels"
              size="xs"
              color="primary"
              :ui="{ active: 'bg-gray-700', inactive: 'bg-gray-200' }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onUnmounted, shallowRef, computed } from "vue";
let L = null;
const props = defineProps({
  map: { type: Object, default: null },
  geoJsonData: { type: Object, default: null },
  positionClass: { type: String, default: "top-[4.5rem] right-4" },
  zIndex: { type: Number, default: 650 },
  active: { type: Boolean, default: false },
  opacityVal: { type: Number, default: 1.0 },
  currentLevel: { type: String, default: "kab" },
  showLabels: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:active",
  "update:opacityVal",
  "update:showLabels",
]);

// --- PERUBAHAN 1: State untuk expand/collapse menu settings ---
const isExpanded = ref(false);

const isActive = computed({
  get: () => props.active,
  set: (val) => {
    emit("update:active", val);
    // UX Opsional: Jika user menyalakan layer, otomatis buka menunya.
    // Jika mematikan, otomatis tutup.
    if (val) {
      isExpanded.value = true;
    } else {
      isExpanded.value = false;
    }
  },
});

const localOpacity = computed({
  get: () => props.opacityVal,
  set: (val) => emit("update:opacityVal", parseFloat(val)),
});

const localShowLabels = computed({
  get: () => props.showLabels,
  set: (val) => emit("update:showLabels", val),
});
// --- HELPER: Dapatkan nama label sesuai level ---
const getLabelText = (properties) => {
  if (!properties) return null;
  switch (props.currentLevel) {
    case "prov":
      return properties.nmprov || properties.nama_prov || properties.provinsi;
    case "kab":
      return properties.nmkab || properties.nama_kab || properties.kabupaten;
    case "kec":
      return properties.nmkec || properties.nama_kec || properties.kecamatan;
    case "desa":
      return (
        properties.nmdesa ||
        properties.nama_desa ||
        properties.desa ||
        properties.namobj
      );
    default:
      return (
        properties.nmkab ||
        properties.nmprov ||
        properties.nmkec ||
        properties.nmdesa ||
        properties.nama ||
        properties.namobj
      );
  }
};

const layerInstance = shallowRef(null);
const zoomHandler = ref(null);

const updateLayers = async () => {
  // 1. Cleanup layer lama dulu
  cleanupLayers();

  if (!props.active || !props.geoJsonData || !props.map) {
    return;
  }

  const L = await import("leaflet");
  const targetMap = props.map;
  const paneName = "boundaryPane";

  // 2. Pastikan Pane ada
  if (!targetMap.getPane(paneName)) {
    targetMap.createPane(paneName);
    targetMap.getPane(paneName).style.zIndex = props.zIndex;
    targetMap.getPane(paneName).style.pointerEvents = "none";
  }

  // 3. Persiapkan Layer Group
  const group = L.layerGroup();

  const borders = L.geoJSON(props.geoJsonData, {
    pane: paneName,
    style: {
      color: "#5f5f5f",
      weight: 1.5,
      opacity: props.opacityVal,
      fill: false,
    },
    interactive: false,
  });
  group.addLayer(borders);

  if (localShowLabels.value) {
    borders.eachLayer((layer) => {
      const propsData = layer.feature?.properties;
      const labelText = getLabelText(propsData);
      if (labelText) {
        const center = layer.getBounds().getCenter();
        const labelIcon = L.divIcon({
          className: "bg-transparent",
          html: `<div class="boundary-label-container" style="opacity: ${props.opacityVal}"><span class="boundary-label-text">${labelText}</span></div>`,
          iconSize: [200, 24],
          iconAnchor: [100, 12],
        });
        group.addLayer(
          L.marker(center, {
            icon: labelIcon,
            pane: paneName,
            interactive: false,
          }),
        );
      }
    });
  }

  // === SOLUSI UTAMA DISINI ===
  // Gunakan requestAnimationFrame untuk memastikan DOM modal sudah stabil
  requestAnimationFrame(() => {
    // 1. Paksa Leaflet menghitung ulang ukuran container
    // Ini krusial karena modal mengubah ukuran div peta dari 0 ke full
    targetMap.invalidateSize();

    // 2. Tambahkan layer ke map
    group.addTo(targetMap);
    layerInstance.value = group;

    // 3. Setup font scaling (logika lama)
    const updateFontSize = () => {
      const zoom = targetMap.getZoom();
      let size = Math.max(10, zoom + 2);
      targetMap
        .getContainer()
        .style.setProperty("--boundary-label-size", `${size}px`);
    };

    updateFontSize();

    // Hapus listener lama jika ada (safety check)
    if (zoomHandler.value) {
      targetMap.off("zoomend", zoomHandler.value);
    }

    targetMap.on("zoomend", updateFontSize);
    zoomHandler.value = updateFontSize;
  });
};

const cleanupLayers = () => {
  if (props.map && layerInstance.value) {
    props.map.removeLayer(layerInstance.value);
    layerInstance.value = null;
    props.map.getContainer().style.removeProperty("--boundary-label-size");
  }
  if (props.map && zoomHandler.value) {
    props.map.off("zoomend", zoomHandler.value);
    zoomHandler.value = null;
  }
};

watch(
  [
    () => props.active,
    () => props.opacityVal,
    () => props.map, // Saat map Fullscreen ready, ini trigger
    () => props.geoJsonData,
    () => props.currentLevel,
    () => localShowLabels.value,
  ],
  () => {
    // HAPUS setTimeout 100ms.
    // Gunakan requestAnimationFrame agar sinkron dengan painting browser
    requestAnimationFrame(() => {
      updateLayers();
    });
  },
  { deep: true, immediate: true }, // Immediate memastikan run saat mount
);

onUnmounted(() => cleanupLayers());
</script>
<style>
/* Style tetap sama */
.boundary-label-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  pointer-events: none;
}

.boundary-label-text {
  font-size: var(--boundary-label-size, 11px);
  color: #000000;
  font-weight: 800;
  text-transform: uppercase;
  text-align: center;
  font-family: "Inter", sans-serif;
  white-space: nowrap;
  line-height: 1;
  text-shadow:
    3px 0 0 #fff,
    -3px 0 0 #fff,
    0 3px 0 #fff,
    0 -3px 0 #fff,
    2px 2px 0 #fff,
    -2px -2px 0 #fff,
    2px -2px 0 #fff,
    -2px 2px 0 #fff;
  transition: font-size 0.2s ease-out;
  padding: 2px 4px;
}
</style>
