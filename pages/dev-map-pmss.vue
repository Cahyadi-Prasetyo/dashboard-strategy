<template>
  <div class="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">
    <!-- Sidebar -->
    <div
      class="w-96 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10"
    >
      <div
        class="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50"
      >
        <h1 class="font-bold text-lg text-gray-800">PMSS Map Playground</h1>
        <p class="text-xs text-gray-500 mt-1">
          BPS GeoServer - FloodMap Sumatera 2025
        </p>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <!-- Filter Wilayah Multi-Select -->
        <div class="border border-indigo-200 rounded-lg p-3 bg-indigo-50/50">
          <h3
            class="font-bold text-sm text-indigo-900 mb-3 flex items-center gap-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter Wilayah (Multi-Select)
          </h3>

          <div class="space-y-2">
            <!-- Info Current Level -->
            <div
              class="text-[10px] bg-blue-50 border border-blue-200 rounded p-2"
            >
              <strong>Level aktif:</strong> {{ currentFilterLevel }}
              <br />
              <strong>Total dipilih:</strong> {{ selectedRegions.length }}
            </div>

            <!-- Provinsi Multi-Select -->
            <div>
              <label class="text-[10px] font-semibold text-gray-600 mb-1 block">
                Provinsi (bisa pilih banyak)
              </label>
              <div
                class="max-h-32 overflow-y-auto border border-gray-300 rounded p-2 bg-white space-y-1"
              >
                <label
                  v-for="prov in provList"
                  :key="prov.code"
                  class="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    :value="prov.code"
                    v-model="selectedProvs"
                    @change="onProvChange"
                    class="rounded"
                  />
                  <span>{{ prov.name }}</span>
                </label>
              </div>
            </div>

            <!-- Kabupaten Multi-Select -->
            <div v-if="selectedProvs.length > 0 && kabList.length > 0">
              <label class="text-[10px] font-semibold text-gray-600 mb-1 block">
                Kabupaten/Kota (bisa pilih banyak)
              </label>
              <div
                class="max-h-32 overflow-y-auto border border-gray-300 rounded p-2 bg-white space-y-1"
              >
                <label
                  v-for="kab in kabList"
                  :key="kab.code"
                  class="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    :value="kab.code"
                    v-model="selectedKabs"
                    @change="onKabChange"
                    class="rounded"
                  />
                  <span>{{ kab.name }}</span>
                </label>
              </div>
            </div>

            <!-- Kecamatan Multi-Select -->
            <div v-if="selectedKabs.length > 0 && kecList.length > 0">
              <label class="text-[10px] font-semibold text-gray-600 mb-1 block">
                Kecamatan (bisa pilih banyak)
              </label>
              <div
                class="max-h-32 overflow-y-auto border border-gray-300 rounded p-2 bg-white space-y-1"
              >
                <label
                  v-for="kec in kecList"
                  :key="kec.code"
                  class="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    :value="kec.code"
                    v-model="selectedKecs"
                    @change="onKecChange"
                    class="rounded"
                  />
                  <span>{{ kec.name }}</span>
                </label>
              </div>
            </div>

            <!-- Desa Multi-Select -->
            <div v-if="selectedKecs.length > 0 && desList.length > 0">
              <label class="text-[10px] font-semibold text-gray-600 mb-1 block">
                Desa/Kelurahan (bisa pilih banyak)
              </label>
              <div
                class="max-h-32 overflow-y-auto border border-gray-300 rounded p-2 bg-white space-y-1"
              >
                <label
                  v-for="des in desList"
                  :key="des.code"
                  class="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    :value="des.code"
                    v-model="selectedDess"
                    @change="onDesChange"
                    class="rounded"
                  />
                  <span>{{ des.name }}</span>
                </label>
              </div>
            </div>

            <!-- Selected Regions Display -->
            <div
              v-if="selectedRegions.length > 0"
              class="mt-3 p-2 bg-white rounded border border-indigo-200"
            >
              <div class="text-[10px] font-semibold text-gray-600 mb-1">
                Kode Filter ({{ currentFilterLevel }}):
              </div>
              <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                <span
                  v-for="code in selectedRegions"
                  :key="code"
                  class="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-mono"
                >
                  {{ code }}
                  <button
                    @click="removeRegion(code)"
                    class="hover:text-indigo-900 font-bold"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2 mt-3">
              <button
                @click="applyFilter"
                class="flex-1 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="selectedRegions.length === 0"
              >
                ✓ Terapkan Filter ({{ selectedRegions.length }})
              </button>
              <button
                @click="clearAllFilter"
                class="px-3 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Batas Wilayah Group -->
        <div class="border border-blue-100 rounded-lg p-3 bg-blue-50/30">
          <h3
            class="font-bold text-sm text-blue-900 mb-2 flex items-center gap-2"
          >
            <span class="w-3 h-3 bg-blue-500 rounded"></span>
            Batas Wilayah
          </h3>
          <div class="space-y-2">
            <LayerButton
              v-for="layer in boundaryLayers"
              :key="layer.id"
              :layer="layer"
              :active="isLayerActive(layer.id)"
              @toggle="toggleLayer"
            />
          </div>
        </div>

        <!-- Desa Tematik Group -->
        <div class="border border-purple-100 rounded-lg p-3 bg-purple-50/30">
          <h3
            class="font-bold text-sm text-purple-900 mb-2 flex items-center gap-2"
          >
            <span class="w-3 h-3 bg-purple-500 rounded"></span>
            Desa Tematik
          </h3>
          <div class="space-y-2">
            <LayerButton
              v-for="layer in desaTematikLayers"
              :key="layer.id"
              :layer="layer"
              :active="isLayerActive(layer.id)"
              @toggle="toggleLayer"
            />
          </div>
        </div>

        <!-- Geotagging Group -->
        <div class="border border-orange-100 rounded-lg p-3 bg-orange-50/30">
          <h3
            class="font-bold text-sm text-orange-900 mb-2 flex items-center gap-2"
          >
            <span class="w-3 h-3 bg-orange-500 rounded"></span>
            Geotagging
          </h3>
          <div class="space-y-2">
            <LayerButton
              v-for="layer in geotaggingLayers"
              :key="layer.id"
              :layer="layer"
              :active="isLayerActive(layer.id)"
              @toggle="toggleLayer"
            />
          </div>
        </div>

        <!-- Poligon Tambahan Group -->
        <div class="border border-emerald-100 rounded-lg p-3 bg-emerald-50/30">
          <h3
            class="font-bold text-sm text-emerald-900 mb-2 flex items-center gap-2"
          >
            <span class="w-3 h-3 bg-emerald-500 rounded"></span>
            Poligon Tambahan
          </h3>
          <div class="space-y-2">
            <LayerButton
              v-for="layer in poligonLayers"
              :key="layer.id"
              :layer="layer"
              :active="isLayerActive(layer.id)"
              @toggle="toggleLayer"
            />
          </div>
        </div>

        <!-- Logs -->
        <div
          class="bg-gray-900 text-green-400 p-3 rounded-lg text-[10px] font-mono h-32 overflow-y-auto"
        >
          <div v-if="logs.length === 0" class="text-gray-600 italic">
            Ready...
          </div>
          <div v-for="(log, i) in logs" :key="i" class="mb-1">
            <span class="text-gray-500">[{{ log.time }}]</span> {{ log.msg }}
          </div>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="flex-1 relative bg-slate-200">
      <div ref="mapContainer" class="w-full h-full"></div>

      <!-- Active Layers Panel -->
      <div
        class="absolute top-5 right-5 bg-white p-3 rounded-lg shadow-lg z-[1000] max-w-xs text-xs"
      >
        <h4 class="font-bold mb-2">Layer Aktif ({{ activeLayers.length }}):</h4>
        <ul
          v-if="activeLayers.length > 0"
          class="space-y-1 max-h-48 overflow-y-auto"
        >
          <li
            v-for="l in activeLayers"
            :key="l.id"
            class="flex justify-between items-center gap-2 border-b border-gray-100 pb-1"
          >
            <div class="flex flex-col flex-1 min-w-0">
              <span class="font-semibold truncate">{{ l.name }}</span>
              <span v-if="l.filtered" class="text-[9px] text-indigo-600">
                Filtered: {{ appliedFilterCodes.length }} region(s)
              </span>
            </div>
            <UButton
              icon="i-heroicons-trash"
              size="2xs"
              color="red"
              variant="ghost"
              @click="removeLayer(l.id)"
            />
          </li>
        </ul>
        <span v-else class="text-gray-400 italic">Belum ada layer</span>
      </div>

      <!-- Legend Panel -->
      <div
        v-if="activeLayers.length > 0"
        class="absolute bottom-5 left-5 bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg z-[1000] max-w-sm max-h-96 overflow-y-auto"
      >
        <h4 class="font-bold mb-3 text-sm flex items-center gap-2">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          Legend
        </h4>
        <div class="space-y-3">
          <div
            v-for="layer in activeLayers"
            :key="layer.id"
            class="border-b border-gray-200 pb-3 last:border-0"
          >
            <div class="font-semibold text-xs mb-2 text-gray-700">
              {{ layer.name }}
            </div>
            <div class="relative">
              <img
                v-if="layer.legendUrl"
                :src="layer.legendUrl"
                :alt="`Legend ${layer.name}`"
                class="w-full rounded border border-gray-200"
                @error="onLegendError(layer.id)"
              />
              <div
                v-else
                class="text-[10px] text-gray-400 italic p-2 bg-gray-50 rounded"
              >
                Loading legend...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

// Map instance
const mapContainer = ref(null);
let map = null;
let L = null;

// State
const activeLayers = ref([]);
const logs = ref([]);

// Filter State - Multi Select
const selectedProvs = ref([]);
const selectedKabs = ref([]);
const selectedKecs = ref([]);
const selectedDess = ref([]);
const appliedFilterCodes = ref([]);

// Wilayah Lists
const provList = ref([
  { code: "11", name: "Aceh" },
  { code: "12", name: "Sumatera Utara" },
  { code: "13", name: "Sumatera Barat" },
  { code: "14", name: "Riau" },
  { code: "15", name: "Jambi" },
  { code: "16", name: "Sumatera Selatan" },
  { code: "17", name: "Bengkulu" },
  { code: "18", name: "Lampung" },
  { code: "19", name: "Kepulauan Bangka Belitung" },
  { code: "21", name: "Kepulauan Riau" },
]);

const kabList = ref([]);
const kecList = ref([]);
const desList = ref([]);

// Mock data kabupaten (sesuaikan dengan data real)
const mockKabData = {
  11: [
    { code: "1101", name: "Kab. Simeulue" },
    { code: "1102", name: "Kab. Aceh Singkil" },
    { code: "1103", name: "Kab. Aceh Selatan" },
    { code: "1104", name: "Kab. Aceh Tenggara" },
    { code: "1171", name: "Kota Banda Aceh" },
    { code: "1173", name: "Kota Langsa" },
  ],
  13: [
    { code: "1301", name: "Kab. Kepulauan Mentawai" },
    { code: "1302", name: "Kab. Pesisir Selatan" },
    { code: "1303", name: "Kab. Solok" },
    { code: "1304", name: "Kab. Sijunjung" },
    { code: "1371", name: "Kota Padang" },
    { code: "1375", name: "Kota Bukittinggi" },
  ],
};

// Mock data kecamatan
const mockKecData = {
  1101: [
    { code: "110101", name: "Teupah Selatan" },
    { code: "110102", name: "Simeulue Timur" },
  ],
  1103: [
    { code: "110301", name: "Bakongan" },
    { code: "110302", name: "Kluet Utara" },
  ],
  1304: [
    { code: "130401", name: "Sijunjung" },
    { code: "130402", name: "IV Nagari" },
  ],
};

// Mock data desa
const mockDesData = {
  110101: [
    { code: "1101012001", name: "Lugu" },
    { code: "1101012002", name: "Labuhan Bajau" },
  ],
  130401: [
    { code: "1304012001", name: "Sijunjung" },
    { code: "1304012002", name: "Tanjung Gadang" },
  ],
};

// Base GeoServer URL
const GEOSERVER_BASE = "https://geoserver.bps.go.id";

// Computed: Current Filter Level and Selected Regions
const currentFilterLevel = computed(() => {
  if (selectedDess.value.length > 0) return "Desa/Kelurahan";
  if (selectedKecs.value.length > 0) return "Kecamatan";
  if (selectedKabs.value.length > 0) return "Kabupaten/Kota";
  if (selectedProvs.value.length > 0) return "Provinsi";
  return "Belum ada";
});

const selectedRegions = computed(() => {
  // Return yang paling detail
  if (selectedDess.value.length > 0) return selectedDess.value;
  if (selectedKecs.value.length > 0) return selectedKecs.value;
  if (selectedKabs.value.length > 0) return selectedKabs.value;
  if (selectedProvs.value.length > 0) return selectedProvs.value;
  return [];
});

// Layer Definitions
const boundaryLayers = [
  {
    id: "provinsi",
    name: "Batas Provinsi",
    layerName: "floodmap_sumatera_2025:batas_wilayah_provinsi",
    filterAttr: "kdprov",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:batas_wilayah_provinsi&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
  {
    id: "kabkota",
    name: "Batas Kab/Kota",
    layerName: "floodmap_sumatera_2025:batas_wilayah_kabupaten_kota",
    filterAttr: "kdkab",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:batas_wilayah_kabupaten_kota&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
  {
    id: "kecamatan",
    name: "Batas Kecamatan",
    layerName: "floodmap_sumatera_2025:batas_wilayah_kecamatan",
    filterAttr: "kdkec",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:batas_wilayah_kecamatan&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
  {
    id: "deskel",
    name: "Batas Desa/Kelurahan",
    layerName: "floodmap_sumatera_2025:batas_wilayah_desa_kelurahan",
    filterAttr: "idkec",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:batas_wilayah_desa_kelurahan&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
];

const desaTematikLayers = [
  {
    id: "desa_sampel_pkl",
    name: "Desa Sampel PKL Polstat STIS",
    layerName: "floodmap_sumatera_2025:desa_sampel_pkl_polstat_stis_2026",
    filterAttr: "idkec",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:desa_sampel_pkl_polstat_stis_2026&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
  {
    id: "desa_terdampak",
    name: "Perkiraan Desa Terdampak",
    layerName: "floodmap_sumatera_2025:perkiraan_desa_terdampak",
    filterAttr: "idkec",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:perkiraan_desa_terdampak&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
  {
    id: "keluarga_terdampak",
    name: "Perkiraan Jumlah Keluarga Terdampak",
    layerName: "floodmap_sumatera_2025:perkiraan_jumlah_keluarga_terdampak",
    filterAttr: "idkec",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:perkiraan_jumlah_keluarga_terdampak&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
  {
    id: "kk_dtsen",
    name: "Jumlah KK DTSEN",
    layerName: "floodmap_sumatera_2025:jumlah_kk_dtsen",
    filterAttr: "idkec",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:jumlah_kk_dtsen&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
];

const geotaggingLayers = [
  {
    id: "rt_dtsen",
    name: "Rumah Tangga DTSEN",
    layerName: "floodmap_sumatera_2025:rumah_tangga_dtsen",
    filterAttr: "idkec",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:rumah_tangga_dtsen&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
  {
    id: "rt_pertanian",
    name: "Rumah Tangga Pertanian",
    layerName: "floodmap_sumatera_2025:rumah_tangga_pertanian",
    filterAttr: "idkec",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:rumah_tangga_pertanian&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
  {
    id: "infrastruktur",
    name: "Infrastruktur Terdampak",
    layerName:
      "floodmap_sumatera_2025:infrastruktur_yang_diperkirakan_terdampak",
    filterAttr: "idkec",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:infrastruktur_yang_diperkirakan_terdampak&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
];

const poligonLayers = [
  {
    id: "prediksi_banjir",
    name: "Prediksi Wilayah Banjir",
    layerName: "floodmap_sumatera_2025:prediksi_wilayah_banjir",
    filterAttr: "idkec",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:prediksi_wilayah_banjir&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
  {
    id: "lbs",
    name: "Lahan Baku Sawah",
    layerName: "floodmap_sumatera_2025:lahan_baku_sawah__lbs_",
    filterAttr: "idkec",
    url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:lahan_baku_sawah__lbs_&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
  },
];

// Utils
const addLog = (msg) => {
  const time = new Date().toLocaleTimeString();
  logs.value.unshift({ time, msg });
  if (logs.value.length > 50) logs.value.pop();
};

const isLayerActive = (id) => {
  return activeLayers.value.some((l) => l.id === id);
};

// Filter Handlers
const onProvChange = () => {
  // Reset child selections
  selectedKabs.value = [];
  selectedKecs.value = [];
  selectedDess.value = [];
  kecList.value = [];
  desList.value = [];

  // Load kabupaten untuk provinsi yang dipilih
  const uniqueKabs = [];
  selectedProvs.value.forEach((provCode) => {
    const kabs = mockKabData[provCode] || [];
    kabs.forEach((kab) => {
      if (!uniqueKabs.find((k) => k.code === kab.code)) {
        uniqueKabs.push(kab);
      }
    });
  });
  kabList.value = uniqueKabs.sort((a, b) => a.code.localeCompare(b.code));

  addLog(`Selected ${selectedProvs.value.length} provinsi`);
};

const onKabChange = () => {
  selectedKecs.value = [];
  selectedDess.value = [];
  desList.value = [];

  const uniqueKecs = [];
  selectedKabs.value.forEach((kabCode) => {
    const kecs = mockKecData[kabCode] || [];
    kecs.forEach((kec) => {
      if (!uniqueKecs.find((k) => k.code === kec.code)) {
        uniqueKecs.push(kec);
      }
    });
  });
  kecList.value = uniqueKecs.sort((a, b) => a.code.localeCompare(b.code));

  addLog(`Selected ${selectedKabs.value.length} kabupaten`);
};

const onKecChange = () => {
  selectedDess.value = [];

  const uniqueDess = [];
  selectedKecs.value.forEach((kecCode) => {
    const dess = mockDesData[kecCode] || [];
    dess.forEach((des) => {
      if (!uniqueDess.find((d) => d.code === des.code)) {
        uniqueDess.push(des);
      }
    });
  });
  desList.value = uniqueDess.sort((a, b) => a.code.localeCompare(b.code));

  addLog(`Selected ${selectedKecs.value.length} kecamatan`);
};

const onDesChange = () => {
  addLog(`Selected ${selectedDess.value.length} desa`);
};

const removeRegion = (code) => {
  selectedDess.value = selectedDess.value.filter((c) => c !== code);
  selectedKecs.value = selectedKecs.value.filter((c) => c !== code);
  selectedKabs.value = selectedKabs.value.filter((c) => c !== code);
  selectedProvs.value = selectedProvs.value.filter((c) => c !== code);
};

const applyFilter = () => {
  if (selectedRegions.value.length === 0) {
    addLog("No regions selected!");
    return;
  }

  appliedFilterCodes.value = [...selectedRegions.value];
  addLog(
    `✓ Filter applied: [${appliedFilterCodes.value.join(", ")}] at ${currentFilterLevel.value} level`,
  );

  // Refresh all active layers
  refreshActiveLayers();
};

const clearAllFilter = () => {
  selectedProvs.value = [];
  selectedKabs.value = [];
  selectedKecs.value = [];
  selectedDess.value = [];
  appliedFilterCodes.value = [];
  kabList.value = [];
  kecList.value = [];
  desList.value = [];

  addLog("✓ All filters cleared");
  refreshActiveLayers();
};

const refreshActiveLayers = () => {
  const activeLayerIds = activeLayers.value.map((l) => l.id);

  if (activeLayerIds.length === 0) {
    addLog("No active layers to refresh");
    return;
  }

  activeLayers.value.forEach((layer) => {
    if (map) map.removeLayer(layer.instance);
  });
  activeLayers.value = [];

  activeLayerIds.forEach((layerId) => {
    const layerDef = [
      ...boundaryLayers,
      ...desaTematikLayers,
      ...geotaggingLayers,
      ...poligonLayers,
    ].find((l) => l.id === layerId);
    if (layerDef) {
      addLayerToMap(layerDef);
    }
  });
};

// Build CQL Filter
const buildCQLFilter = (filterAttr) => {
  if (!appliedFilterCodes.value || appliedFilterCodes.value.length === 0)
    return null;

  // Tentukan filter attribute berdasarkan level
  let actualAttr = filterAttr;
  const codeLength = appliedFilterCodes.value[0].length;

  // Auto-detect level based on code length
  if (codeLength === 2) {
    actualAttr = "kdprov";
  } else if (codeLength === 4) {
    actualAttr = "kdkab";
  } else if (codeLength === 6) {
    actualAttr = "kdkec";
  } else if (codeLength >= 10) {
    actualAttr = "idkec";
  }

  const codes = appliedFilterCodes.value.map((c) => `'${c}'`).join(",");
  const cqlFilter = `${actualAttr} IN (${codes})`;
  return cqlFilter;
};

// Get Legend URL
const getLegendUrl = (layerName) => {
  return `${GEOSERVER_BASE}/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=${layerName}&LEGEND_OPTIONS=fontAntiAliasing:true;fontSize:11;fontName:Arial`;
};

const onLegendError = (layerId) => {
  const layer = activeLayers.value.find((l) => l.id === layerId);
  if (layer) {
    addLog(`Legend not available: ${layer.name}`);
  }
};

// Initialize Map
onMounted(async () => {
  if (process.server) return;

  try {
    L = (await import("leaflet")).default;
    await import("leaflet/dist/leaflet.css");

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    map = L.map(mapContainer.value, {
      center: [0.5, 101.5],
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    addLog("Map initialized");
  } catch (error) {
    console.error("Error initializing map:", error);
    addLog(`Error: ${error.message}`);
  }
});

// Add Layer to Map
const addLayerToMap = (layerDef) => {
  if (!map || !L) return;

  try {
    let layerInstance;

    if (appliedFilterCodes.value.length > 0 && layerDef.filterAttr) {
      const cqlFilter = buildCQLFilter(layerDef.filterAttr);

      addLog(`Adding filtered layer: ${layerDef.name}`);
      addLog(`CQL: ${cqlFilter}`);

      layerInstance = L.tileLayer.wms(`${GEOSERVER_BASE}/wms`, {
        layers: layerDef.layerName,
        format: "image/png",
        transparent: true,
        version: "1.1.0",
        cql_filter: cqlFilter,
        attribution: "BPS GeoServer",
        maxZoom: 19,
        opacity: 0.7,
      });

      layerInstance.addTo(map);

      activeLayers.value.push({
        id: layerDef.id,
        name: layerDef.name,
        instance: layerInstance,
        legendUrl: getLegendUrl(layerDef.layerName),
        filtered: true,
      });

      addLog(`✓ Added (filtered)`);
    } else {
      addLog(`Adding layer: ${layerDef.name}`);

      layerInstance = L.tileLayer(layerDef.url, {
        attribution: "BPS GeoServer",
        maxZoom: 19,
        opacity: 0.7,
      });

      layerInstance.addTo(map);

      activeLayers.value.push({
        id: layerDef.id,
        name: layerDef.name,
        instance: layerInstance,
        legendUrl: getLegendUrl(layerDef.layerName),
        filtered: false,
      });

      addLog(`✓ Added`);
    }
  } catch (error) {
    console.error("Error adding layer:", error);
    addLog(`✗ Error: ${error.message}`);
  }
};

// Toggle Layer
const toggleLayer = (layerDef) => {
  if (!map || !L) return;

  const existingIdx = activeLayers.value.findIndex((l) => l.id === layerDef.id);

  if (existingIdx >= 0) {
    const layer = activeLayers.value[existingIdx];
    map.removeLayer(layer.instance);
    activeLayers.value.splice(existingIdx, 1);
    addLog(`✗ Removed: ${layerDef.name}`);
  } else {
    addLayerToMap(layerDef);
  }
};

// Remove Layer
const removeLayer = (id) => {
  if (!map) return;

  const idx = activeLayers.value.findIndex((l) => l.id === id);
  if (idx >= 0) {
    const layer = activeLayers.value[idx];
    map.removeLayer(layer.instance);
    activeLayers.value.splice(idx, 1);
    addLog(`✗ Removed: ${layer.name}`);
  }
};

// Cleanup
onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
/* Ensure map container has proper height */
</style>
