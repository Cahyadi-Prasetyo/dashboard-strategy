<template>
  <div class="flex flex-col w-full h-full relative bg-gray-100">
    <div
      class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-30 shadow-sm"
    >
      <div class="flex items-center gap-4">
        <h2 class="text-base font-bold text-gray-800">
          Peta Dampak Bencana Sumatera
        </h2>

        <div v-if="viewMode === 'focus'" class="flex items-center gap-2">
          <div class="flex bg-gray-100 p-1 rounded-lg">
            <button
              @click="manualSwitchMap('pasca')"
              class="px-3 py-1 text-xs font-bold rounded-md transition-all"
              :class="
                focusedMap === 'pasca'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              "
            >
              Pasca Bencana
            </button>
            <button
              @click="manualSwitchMap('pra')"
              class="px-3 py-1 text-xs font-bold rounded-md transition-all"
              :class="
                focusedMap === 'pra'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              "
            >
              Data Statistik Wilayah
            </button>
          </div>

          <button
            @click="triggerExport"
            class="flex items-center justify-center p-1 bg-white hover:bg-green-50 text-green-600 border border-gray-200 hover:border-green-200 rounded-lg transition-colors shadow-sm"
            title="Export Data Excel"
          >
            <UIcon name="i-heroicons-document-arrow-down" class="w-5 h-5" />
            <!-- <span class="hidden sm:inline">Export</span> -->
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-500 font-medium hidden sm:block"
          >Mode Tampilan:</span
        >
        <div class="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            @click="setMode('focus')"
            class="p-1.5 rounded transition-all"
            :class="
              viewMode === 'focus'
                ? 'bg-white shadow text-amber-600'
                : 'text-gray-400 hover:text-gray-600'
            "
            title="Mode Fokus"
          >
            <UIcon name="i-heroicons-viewfinder-circle" class="w-5 h-5" />
          </button>
          <button
            @click="setMode('split')"
            class="p-1.5 rounded transition-all"
            :class="
              viewMode === 'split'
                ? 'bg-white shadow text-slate-800'
                : 'text-gray-400 hover:text-gray-600'
            "
            title="Mode Komparasi (Split)"
          >
            <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 relative w-full overflow-hidden">
      <div
        class="absolute top-0 bottom-0 transition-all duration-300 ease-in-out flex flex-col bg-white border-r border-gray-300"
        :class="getLayoutClass('pra')"
      >
        <div v-if="viewMode === 'split'" class="absolute top-4 left-4 z-[400]">
          <UBadge color="neutral" variant="solid" size="sm"
            >Kondisi Pra Bencana</UBadge
          >
        </div>

        <MapSpatialGeneric
          ref="mapPraRef"
          map-id="map-pra"
          map-type="pra"
          :wilayah="wilayah"
          :view-mode="viewMode"
          :datasets="praDatasets"
          :available-sektors="tersediaSektorPra"
          :layer-config="LAYER_CONFIG_PRA"
          :layer-types="LAYER_TYPES_PRA"
          :condition-layer-component="MapSpatialConditionLayerPra"
          default-sektor-tab="Infrastruktur"
          @panel-opened="handleAutoFokus('pra')"
        />
      </div>

      <div
        class="absolute top-0 bottom-0 transition-all duration-300 ease-in-out flex flex-col bg-white"
        :class="getLayoutClass('pasca')"
      >
        <div v-if="viewMode === 'split'" class="absolute top-4 left-4 z-[400]">
          <UBadge color="neutral" variant="solid" size="sm"
            >Kondisi Pasca Bencana</UBadge
          >
        </div>

        <MapSpatialGeneric
          ref="mapPascaRef"
          map-id="map-pasca"
          map-type="pasca"
          :wilayah="wilayah"
          :view-mode="viewMode"
          :datasets="pascaDatasets"
          :available-sektors="tersediaSektorPasca"
          :layer-config="LAYER_CONFIG_PASCA"
          :layer-types="LAYER_TYPES_PASCA"
          :condition-layer-component="MapSpatialConditionLayerPasca"
          :initial-dataset-id="138"
          :initial-indikator-id="310"
          default-sektor-tab="Profil Dampak Bencana"
          @panel-opened="handleAutoFokus('pasca')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, ref } from "vue";
import MapSpatialGeneric from "~/components/map/SpatialGeneric.vue";
import MapSpatialConditionLayerPra from "~/components/map/spatial/ConditionLayerPra.vue";
import MapSpatialConditionLayerPasca from "~/components/map/spatial/ConditionLayerPasca.vue";
import {
  praDatasets,
  pascaDatasets,
  tersediaSektorPra,
  tersediaSektorPasca,
} from "~/constants/insight-spatial-data.ts";
import {
  LAYER_CONFIG_PRA,
  LAYER_TYPES_PRA,
  LAYER_CONFIG_PASCA,
  LAYER_TYPES_PASCA,
} from "~/constants/map-config";

const props = defineProps({
  wilayah: { type: Object, default: () => ({}) },
  viewMode: { type: String, default: "focus" },
  focusedMap: { type: String, default: "pasca" },
});

const emit = defineEmits(["update:viewMode", "update:focusedMap"]);

// REF untuk mengakses komponen anak
const mapPraRef = ref(null);
const mapPascaRef = ref(null);

// FUNGSI UNTUK MENTRIGGER EXPORT PADA MAP YANG SEDANG FOKUS
const triggerExport = () => {
  if (props.focusedMap === "pra" && mapPraRef.value) {
    mapPraRef.value.handleExportExcel();
  } else if (props.focusedMap === "pasca" && mapPascaRef.value) {
    mapPascaRef.value.handleExportExcel();
  }
};

const setMode = (mode) => {
  emit("update:viewMode", mode);
  setTimeout(() => window.dispatchEvent(new Event("resize")), 300);
};

const handleAutoFokus = (mapType) => {
  if (props.viewMode === "split") return;
  emit("update:viewMode", "focus");
  emit("update:focusedMap", mapType);
};

const manualSwitchMap = (targetMap) => {
  emit("update:focusedMap", targetMap);
};

const getLayoutClass = (mapType) => {
  if (props.viewMode === "split") {
    return mapType === "pra" ? "left-0 w-1/2" : "left-1/2 w-1/2";
  }
  const isTarget = props.focusedMap === mapType;
  if (isTarget) {
    return "left-0 w-full z-20";
  } else {
    return "opacity-0 pointer-events-none -z-10 absolute w-full";
  }
};
</script>
