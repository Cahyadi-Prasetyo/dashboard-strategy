<template>
  <div class="grid grid-cols-1 gap-8 relative">
    <div class="relative lg:col-span-3">
      <div
        v-if="isLoading"
        class="absolute inset-0 z-[500] bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-xl border border-gray-200"
      >
        <div class="flex flex-col items-center gap-2">
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-8 h-8 text-amber-500 animate-spin"
          />
          <span class="text-sm font-semibold text-gray-600"
            >Sinkronisasi Data Wilayah...</span
          >
        </div>
      </div>

      <div
        class="relative w-full h-96 lg:h-[600px] rounded-xl border-2 border-gray-200 z-0 bg-slate-50 overflow-hidden"
      >
        <div class="absolute top-4 left-4 z-[400] flex flex-col gap-2">
          <UTooltip
            text="Silakan filter sampai Level Kabupaten/Kota terlebih dahulu"
            :prevent="!isMapReady"
            :popper="{ placement: 'top' }"
          >
            <button
              @click="toggleDatasetList"
              :disabled="!isMapReady"
              :class="getBtnClass(!isMapReady)"
            >
              <UIcon
                name="i-heroicons-adjustments-horizontal"
                class="w-5 h-5"
                :class="!isMapReady ? 'text-gray-400' : 'text-gray-700'"
              />
              <span
                class="font-semibold text-gray-900"
                :class="{ 'text-gray-400': !isMapReady }"
              >
                {{ showCategoryList ? "Indikator" : "Indikator" }}
              </span>
              <UIcon
                :name="
                  showDatasetList
                    ? 'i-heroicons-chevron-up'
                    : 'i-heroicons-chevron-down'
                "
                class="w-4 h-4 text-gray-600"
              />
            </button>
          </UTooltip>

          <div
            v-if="showDatasetList && isMapReady"
            class="bg-white rounded-xl shadow-2xl border border-gray-200 w-96 max-h-[28rem] flex flex-col overflow-hidden animate-fade-in"
          >
            <div
              class="flex border-b border-gray-100 bg-gray-50 overflow-x-auto no-scrollbar flex-shrink-0"
            >
              <button
                v-for="sektor in tersediaSektor"
                :key="sektor"
                @click.stop="activeSektorTab = sektor"
                class="px-4 py-3 text-[10px] font-bold uppercase tracking-tight whitespace-nowrap transition-colors"
                :class="
                  activeSektorTab === sektor
                    ? 'text-amber-600 border-b-2 border-amber-600 bg-white'
                    : 'text-gray-400 hover:text-gray-600'
                "
              >
                {{ sektor }}
              </button>
            </div>

            <div class="overflow-y-auto flex-1 custom-scrollbar bg-white">
              <div
                class="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm px-4 py-3 border-b border-gray-100"
              >
                <p
                  class="text-[10px] text-gray-500 font-bold uppercase tracking-wider"
                >
                  Dataset {{ activeSektorTab }}
                </p>
              </div>

              <div class="p-2 space-y-1">
                <div
                  v-for="ind in filteredDatasetsBySektor"
                  :key="ind.id_dataset"
                  class="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all border border-transparent"
                  :class="{
                    'bg-amber-50 text-amber-700 border-amber-100 shadow-sm':
                      selectedDatasetId === ind.id_dataset,
                  }"
                  @click="onDatasetChange(ind)"
                >
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-heroicons-document-chart-bar"
                      class="w-4 h-4 opacity-50"
                    />
                    {{ ind.label }}
                  </div>
                </div>

                <div
                  v-if="filteredDatasetsBySektor.length === 0"
                  class="p-10 text-center"
                >
                  <UIcon
                    name="i-heroicons-folder-open"
                    class="w-10 h-10 text-gray-200 mx-auto mb-2"
                  />
                  <p class="text-xs text-gray-400 font-medium">
                    Belum ada data untuk sektor {{ activeSektorTab }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="availableCategories.length > 0 && !showDatasetList"
            class="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 w-80 overflow-hidden animate-fade-in"
          >
            <div
              class="p-3 border-b border-gray-100 bg-amber-50/50 flex justify-between items-center"
            >
              <p
                class="text-[10px] text-amber-600 font-bold uppercase tracking-wider"
              >
                Pilih Kategori untuk : {{ selectedDatasetLabel }}
              </p>
              <!-- <span class="text-[10px] text-gray-400"
                >{{ availableCategories.length }} opsi</span
              > -->
            </div>
            <div
              class="p-2 max-h-[15rem] overflow-y-auto custom-scrollbar space-y-1"
            >
              <label
                v-for="(cat, idx) in availableCategories"
                :key="idx"
                class="flex items-start gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50"
                :class="{ 'bg-amber-50': selectedCategory === cat }"
              >
                <input
                  type="radio"
                  :value="cat"
                  v-model="selectedCategory"
                  class="mt-1 w-3 h-3 text-amber-600 border-gray-300 focus:ring-amber-500"
                />
                <span class="text-xs text-gray-700 leading-tight">{{
                  cat
                }}</span>
              </label>
            </div>
          </div>
        </div>

        <div
          class="absolute top-4 right-4 z-[400] flex flex-row items-center gap-2"
        >
          <div
            v-if="datasetMeta.instansi !== '-'"
            class="hidden sm:flex flex-col justify-center bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200 shadow-lg text-right h-[42px]"
          >
            <div
              class="text-[10px] font-bold text-gray-700 leading-none mb-0.5"
            >
              Sumber: {{ datasetMeta.sumber }}
            </div>
            <div
              class="text-[9px] text-gray-500 font-medium italic leading-none"
            >
              {{ datasetMeta.instansi }}
            </div>
          </div>

          <button
            @click="openFullscreen = true"
            :disabled="!isMapReady"
            class="h-[42px] w-[42px] rounded-lg flex items-center justify-center transition-all border bg-white border-gray-200 shadow-lg hover:bg-gray-50 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <UIcon
              name="i-heroicons-arrows-pointing-out"
              class="w-5 h-5 text-gray-700"
            />
          </button>
        </div>
        <div
          v-if="selectedInfo"
          class="absolute top-16 right-4 bg-white p-4 rounded-lg shadow-xl max-w-xs z-[1000] border border-gray-100 transition-all duration-300"
        >
          <div class="flex justify-between items-start mb-2 border-b pb-2">
            <div>
              <span
                class="text-[10px] uppercase text-gray-400 font-bold tracking-wider"
                >Wilayah</span
              >
              <h3 class="font-bold text-gray-800 text-lg leading-tight">
                {{ selectedInfo.name }}
              </h3>
            </div>
            <button
              @click="selectedInfo = null"
              class="text-gray-400 hover:text-red-500 transition-colors"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <p class="text-xs text-gray-500 mb-0.5 font-medium">
                Kategori:
                <span class="text-amber-600 font-bold italic"
                  >"{{ selectedCategory }}"</span
                >
              </p>
              <div class="flex items-center gap-2">
                <span class="text-3xl font-bold text-gray-900">{{
                  selectedInfo.value
                }}</span>
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                  >Desa</span
                >
              </div>
            </div>
            <div
              v-if="selectedInfo.breakdown && selectedInfo.breakdown.length > 0"
              class="pt-2 border-t border-gray-100"
            >
              <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">
                Context:
              </p>
              <div class="space-y-1">
                <div
                  v-for="(item, i) in selectedInfo.breakdown.slice(0, 10)"
                  :key="i"
                  class="flex justify-between text-xs"
                >
                  <span class="text-gray-600 truncate max-w-[150px]">{{
                    item.category
                  }}</span>
                  <span class="font-mono font-medium text-gray-800">{{
                    item.value
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="legendItems.length > 0"
          class="absolute bottom-6 right-4 z-[400] bg-white/90 backdrop-blur px-4 py-3 rounded-lg border border-gray-200 shadow-lg min-w-[160px]"
        >
          <h4 class="text-xs font-bold text-gray-700 mb-2">Legenda (Jenks)</h4>
          <div class="space-y-1">
            <div
              v-for="(item, idx) in legendItems"
              :key="idx"
              class="flex items-center gap-2"
            >
              <span
                class="w-3 h-3 border border-black/10 shadow-sm"
                :style="{ backgroundColor: item.color }"
              ></span>
              <span class="text-xs text-gray-600 font-medium">{{
                item.label
              }}</span>
            </div>
          </div>
        </div>

        <div id="map-insight" class="w-full h-full z-0"></div>
      </div>

      <div
        class="mt-4 bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm text-amber-800"
      >
        <strong>Info Peta:</strong> Klasifikasi warna menggunakan metode
        <em>Jenks Natural Breaks</em> berdasarkan sebaran data aktual di
        <span class="font-bold">{{ locationLabel }}</span
        >.
      </div>
    </div>

    <UModal v-model:open="openFullscreen" fullscreen>
      <template #content>
        <div class="flex flex-col h-full bg-white relative">
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white z-[500] shadow-sm"
          >
            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UIcon name="i-heroicons-map" class="w-6 h-6 text-amber-600" />
              {{ selectedDatasetLabel }}
            </h3>

            <div class="flex items-center gap-3">
              <div
                v-if="datasetMeta.instansi !== '-'"
                class="hidden sm:block bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-right"
              >
                <div
                  class="text-[10px] font-bold text-gray-600 uppercase tracking-wide"
                >
                  Sumber: {{ datasetMeta.sumber }}
                </div>
                <div class="text-[10px] text-gray-400 font-medium italic">
                  {{ datasetMeta.instansi }}
                </div>
              </div>

              <UButton
                variant="solid"
                icon="i-heroicons-x-mark"
                class="text-gray-100 hover:bg-primary/80 cursor-pointer"
                @click="openFullscreen = false"
              />
            </div>
          </div>

          <div class="flex-1 relative bg-slate-100 overflow-hidden">
            <div
              v-if="isLoading"
              class="absolute inset-0 z-[2000] bg-white/50 backdrop-blur-sm flex items-center justify-center"
            >
              <div class="flex flex-col items-center gap-2">
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="w-10 h-10 text-amber-500 animate-spin"
                />
                <span
                  class="text-sm font-semibold text-gray-700 bg-white/80 px-3 py-1 rounded-full shadow-sm"
                  >Sinkronisasi Data Wilayah...</span
                >
              </div>
            </div>
            <div class="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
              <button
                @click="toggleDatasetList"
                :disabled="!isMapReady"
                :class="getBtnClass(!isMapReady)"
              >
                <UIcon
                  name="i-heroicons-adjustments-horizontal"
                  class="w-5 h-5"
                  :class="!isMapReady ? 'text-gray-400' : 'text-gray-700'"
                />
                <span
                  class="font-semibold text-gray-900"
                  :class="{ 'text-gray-400': !isMapReady }"
                >
                  {{ showCategoryList ? "Indikator" : "Indikator" }}
                </span>
                <UIcon
                  :name="
                    showDatasetList
                      ? 'i-heroicons-chevron-up'
                      : 'i-heroicons-chevron-down'
                  "
                  class="w-4 h-4 text-gray-600"
                />
              </button>

              <div
                v-if="showDatasetList && isMapReady"
                class="bg-white rounded-xl shadow-2xl border border-gray-200 w-96 max-h-[28rem] flex flex-col overflow-hidden animate-fade-in"
              >
                <div
                  class="flex border-b border-gray-100 bg-gray-50 overflow-x-auto no-scrollbar flex-shrink-0"
                >
                  <button
                    v-for="sektor in tersediaSektor"
                    :key="sektor"
                    @click.stop="activeSektorTab = sektor"
                    class="px-4 py-3 text-[10px] font-bold uppercase tracking-tight whitespace-nowrap transition-colors"
                    :class="
                      activeSektorTab === sektor
                        ? 'text-amber-600 border-b-2 border-amber-600 bg-white'
                        : 'text-gray-400 hover:text-gray-600'
                    "
                  >
                    {{ sektor }}
                  </button>
                </div>

                <div class="overflow-y-auto flex-1 custom-scrollbar bg-white">
                  <div
                    class="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm px-4 py-3 border-b border-gray-100"
                  >
                    <p
                      class="text-[10px] text-gray-500 font-bold uppercase tracking-wider"
                    >
                      Dataset {{ activeSektorTab }}
                    </p>
                  </div>

                  <div class="p-2 space-y-1">
                    <div
                      v-for="ind in filteredDatasetsBySektor"
                      :key="ind.id_dataset"
                      class="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all border border-transparent"
                      :class="{
                        'bg-amber-50 text-amber-700 border-amber-100 shadow-sm':
                          selectedDatasetId === ind.id_dataset,
                      }"
                      @click="onDatasetChange(ind)"
                    >
                      <div class="flex items-center gap-2">
                        <UIcon
                          name="i-heroicons-document-chart-bar"
                          class="w-4 h-4 opacity-50"
                        />
                        {{ ind.label }}
                      </div>
                    </div>

                    <div
                      v-if="filteredDatasetsBySektor.length === 0"
                      class="p-10 text-center"
                    >
                      <UIcon
                        name="i-heroicons-folder-open"
                        class="w-10 h-10 text-gray-200 mx-auto mb-2"
                      />
                      <p class="text-xs text-gray-400 font-medium">
                        Belum ada data untuk sektor {{ activeSektorTab }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="availableCategories.length > 0 && !showDatasetList"
                class="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 w-80 overflow-hidden animate-fade-in"
              >
                <div
                  class="p-3 border-b border-gray-100 bg-amber-50/50 flex justify-between items-center"
                >
                  <p
                    class="text-[10px] text-amber-600 font-bold uppercase tracking-wider"
                  >
                    Pilih Kategori untuk : {{ selectedDatasetLabel }}
                  </p>
                  <!-- <span class="text-[10px] text-gray-400"
                    >{{ availableCategories.length }} opsi</span
                  > -->
                </div>
                <div
                  class="p-2 max-h-[15rem] overflow-y-auto custom-scrollbar space-y-1"
                >
                  <label
                    v-for="(cat, idx) in availableCategories"
                    :key="idx"
                    class="flex items-start gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50"
                    :class="{ 'bg-amber-50': selectedCategory === cat }"
                  >
                    <input
                      type="radio"
                      :value="cat"
                      v-model="selectedCategory"
                      class="mt-1 w-3 h-3 text-amber-600 border-gray-300 focus:ring-amber-500"
                    />
                    <span class="text-xs text-gray-700 leading-tight">{{
                      cat
                    }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div
              v-if="selectedInfo"
              class="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-xl max-w-xs z-[1000] border border-gray-100"
            >
              <div class="flex justify-between items-start mb-2 border-b pb-2">
                <div>
                  <span
                    class="text-[10px] uppercase text-gray-400 font-bold tracking-wider"
                    >Wilayah</span
                  >
                  <h3 class="font-bold text-gray-800 text-lg leading-tight">
                    {{ selectedInfo.name }}
                  </h3>
                </div>
                <button
                  @click="selectedInfo = null"
                  class="text-gray-400 hover:text-red-500"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                </button>
              </div>
              <div class="space-y-3">
                <div>
                  <p class="text-xs text-gray-500 mb-0.5 font-medium">
                    Kategori:
                    <span class="text-amber-600 font-bold italic"
                      >"{{ selectedCategory }}"</span
                    >
                  </p>
                  <div class="flex items-center gap-2">
                    <span class="text-3xl font-bold text-gray-900">{{
                      selectedInfo.value
                    }}</span
                    ><span
                      class="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                      >Desa</span
                    >
                  </div>
                </div>
                <div
                  v-if="
                    selectedInfo.breakdown && selectedInfo.breakdown.length > 0
                  "
                  class="pt-2 border-t border-gray-100"
                >
                  <div class="space-y-1">
                    <div
                      v-for="(item, i) in selectedInfo.breakdown.slice(0, 10)"
                      :key="i"
                      class="flex justify-between text-xs"
                    >
                      <span class="text-gray-600 truncate max-w-[150px]">{{
                        item.category
                      }}</span>
                      <span class="font-mono font-medium text-gray-800">{{
                        item.value
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="legendItems.length > 0"
              class="absolute bottom-8 right-4 z-[1000] bg-white/90 backdrop-blur px-4 py-3 rounded-lg border border-gray-200 shadow-lg min-w-[160px]"
            >
              <h4 class="text-xs font-bold text-gray-700 mb-2">
                Legenda (Jenks)
              </h4>
              <div class="space-y-1">
                <div
                  v-for="(item, idx) in legendItems"
                  :key="idx"
                  class="flex items-center gap-2"
                >
                  <span
                    class="w-3 h-3 border border-black/10 shadow-sm"
                    :style="{ backgroundColor: item.color }"
                  ></span>
                  <span class="text-xs text-gray-600 font-medium">{{
                    item.label
                  }}</span>
                </div>
              </div>
            </div>

            <div id="map-insight-fullscreen" class="w-full h-full z-0"></div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
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

const props = defineProps({
  wilayah: { type: Object, default: () => ({ provinsi: [], kabupaten: [] }) },
});
const activeSektorTab = ref("Layanan publik");
const tersediaSektor = [
  "Pemerintahan",
  "Layanan publik",
  "Ekonomi",
  "Sosial",
  "Akses Darat",
];
const datasetMeta = ref({ instansi: "-", sumber: "-" });
// === CONFIG ===
// Konfigurasi Dataset Insight
const insightDatasets = [
  {
    id_dataset: 12,
    id_indikator: 17,
    label: "Keberadaan Agen/Penjual Bahan Bakar",
    sektor: "Ekonomi",
  },
  {
    id_dataset: 16,
    id_indikator: 17,
    label: "Kegiatan Pelestarian Lingkungan",
    sektor: "Layanan publik",
  },
  {
    id_dataset: 17,
    id_indikator: 17,
    label: "Ketersediaan Angkutan Umum",
    sektor: "Layanan publik",
  },
  {
    id_dataset: 18,
    id_indikator: 17,
    label: "Jenis Permukaan Jalan Darat Terluas",
    sektor: "Akses darat",
  },
  {
    id_dataset: 19,
    id_indikator: 17,
    label: "Keberadaan BTS",
    sektor: "Layanan publik",
  },
  {
    id_dataset: 20,
    id_indikator: 17,
    label: "Kekuatan Sinyal Telepon Seluler",
    sektor: "Layanan publik",
  },
  {
    id_dataset: 21,
    id_indikator: 17,
    label: "Kekuatan Sinyal Internet Seluler",
    sektor: "Layanan publik",
  },
  {
    id_dataset: 22,
    id_indikator: 17,
    label: "Layanan Pos dan Ekspedisi",
    sektor: "Layanan publik",
  },
];

const filteredDatasetsBySektor = computed(() => {
  return insightDatasets.filter((d) => d.sektor === activeSektorTab.value);
});
// === STATE ===
const isLoading = ref(false);
const showDatasetList = ref(false);
const showCategoryList = ref(true);
const openFullscreen = ref(false); // State Fullscreen Modal

const selectedDatasetId = ref(null);
const selectedPeriod = ref("2025");
const selectedCategory = ref("");
const availableCategories = ref([]);
const selectedInfo = ref(null);

const groupedData = ref({});
const legendItems = ref([]);

const geoJsonData = shallowRef(null);
let map = null; // Peta Utama
let mapFullscreen = null; // Peta Fullscreen
let geoJsonLayer = null;
let geoJsonLayerFullscreen = null;

// === COMPUTED ===
const isMapReady = computed(() => props.wilayah?.provinsi?.length > 0);

const selectedDatasetLabel = computed(() => {
  if (!selectedDatasetId.value) return "Pilih Indikator"; // Teks default
  return (
    insightDatasets.find((d) => d.id_dataset === selectedDatasetId.value)
      ?.label || "Insight Data"
  );
});
const locationLabel = computed(() => {
  if (props.wilayah.kabupaten?.length > 0)
    return `${props.wilayah.kabupaten.length} Kabupaten`;
  if (props.wilayah.provinsi?.length > 0)
    return `${props.wilayah.provinsi.length} Provinsi`;
  return "Wilayah";
});

const getBtnClass = (disabled) => [
  "px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all border w-64 justify-between", // Ganti w-50 ke w-64
  disabled
    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-75 shadow-none"
    : "bg-white border-gray-200 shadow-lg hover:bg-gray-50 cursor-pointer",
];

// === ALGORITMA JENKS ===
const getJenksBreaks = (data, numClasses) => {
  if (data.length === 0) return [];
  if (data.length <= numClasses) return data.sort((a, b) => a - b);
  data.sort((a, b) => a - b);
  const matrices = { lower_class_limits: [], variance_combinations: [] };
  const lower_class_limits = matrices.lower_class_limits;
  const variance_combinations = matrices.variance_combinations;
  let i,
    j,
    k = 0;
  for (i = 0; i < data.length + 1; i++) {
    let temp1 = [],
      temp2 = [];
    for (j = 0; j < numClasses + 1; j++) {
      temp1.push(0);
      temp2.push(0);
    }
    lower_class_limits.push(temp1);
    variance_combinations.push(temp2);
  }
  for (i = 1; i < numClasses + 1; i++) {
    lower_class_limits[1][i] = 1;
    variance_combinations[1][i] = 0;
    for (j = 2; j < data.length + 1; j++) {
      variance_combinations[j][i] = Infinity;
    }
  }
  let variance = 0;
  for (let l = 2; l < data.length + 1; l++) {
    let sum = 0,
      sum_squares = 0,
      w = 0;
    for (let m = 1; m < l + 1; m++) {
      let lower_class_limit = l - m + 1;
      let val = data[lower_class_limit - 1];
      w++;
      sum += val;
      sum_squares += val * val;
      variance = sum_squares - (sum * sum) / w;
      let i4 = lower_class_limit - 1;
      if (i4 !== 0) {
        for (j = 2; j < numClasses + 1; j++) {
          if (
            variance_combinations[l][j] >=
            variance + variance_combinations[i4][j - 1]
          ) {
            lower_class_limits[l][j] = lower_class_limit;
            variance_combinations[l][j] =
              variance + variance_combinations[i4][j - 1];
          }
        }
      }
    }
    lower_class_limits[l][1] = 1;
    variance_combinations[l][1] = variance;
  }
  let kclass = data.length;
  let kcount = numClasses;
  let breaks = [];
  breaks.push(data[data.length - 1]);
  while (kcount > 0) {
    let idx = lower_class_limits[kclass][kcount] - 1;
    if (idx >= 0 && idx < data.length) {
      if (idx > 0) breaks.push(data[idx - 1]);
    }
    kclass = lower_class_limits[kclass][kcount] - 1;
    kcount--;
  }
  return [...new Set(breaks)].sort((a, b) => a - b);
};

const recalcLegend = () => {
  legendItems.value = [];
  if (!selectedCategory.value || Object.keys(groupedData.value).length === 0)
    return;
  const values = Object.values(groupedData.value).map(
    (item) => item.values[selectedCategory.value] || 0,
  );
  const nonZeroValues = values.filter((v) => v > 0);
  const hasZero = values.some((v) => v === 0);
  const colors = ["#FED976", "#FEB24C", "#FD8D3C", "#F03B20", "#BD0026"];
  let items = [];
  if (nonZeroValues.length === 0) {
    legendItems.value = [
      { label: "0 / Tidak Ada", color: "#FFFFFF", min: 0, max: 0 },
    ];
    return;
  }
  const breaks = getJenksBreaks(
    nonZeroValues,
    Math.min(5, new Set(nonZeroValues).size),
  );
  let currentMin = Math.min(...nonZeroValues);
  for (let i = 0; i < breaks.length; i++) {
    let max = breaks[i];
    let color = colors[i % colors.length];
    let label = currentMin === max ? `${max}` : `${currentMin} - ${max}`;
    items.unshift({ min: currentMin, max: max, color: color, label: label });
    currentMin = max + 1;
  }
  if (hasZero) {
    items.push({ min: 0, max: 0, color: "#FFFFFF", label: "0 / Tidak Ada" });
  }
  legendItems.value = items;
};

const getDynamicColor = (val) => {
  if (val === 0) return "#FFFFFF";
  const item = legendItems.value.find((l) => val >= l.min && val <= l.max);
  return item ? item.color : "#FFFFFF";
};

// === HELPER & TOGGLERS ===
const getId = (item) => {
  if (!item) return null;
  if (typeof item === "string" || typeof item === "number") return item;
  return item.id || item.kode || null;
};
const toggleDatasetList = () => {
  showDatasetList.value = !showDatasetList.value;
  if (showDatasetList.value) showCategoryList.value = false;
};
const onDatasetChange = (dataset) => {
  selectedDatasetId.value = dataset.id_dataset;
  showDatasetList.value = false;
  showCategoryList.value = true;
  fetchAgregatData();
};

// === FETCH DATA ===
const fetchAgregatData = async () => {
  if (!isMapReady.value || !selectedDatasetId.value) return;
  isLoading.value = true;
  datasetMeta.value = { instansi: "-", sumber: "-" };
  groupedData.value = {};
  availableCategories.value = [];
  selectedCategory.value = "";
  selectedInfo.value = null;
  legendItems.value = [];

  const dataset = insightDatasets.find(
    (d) => d.id_dataset === selectedDatasetId.value,
  );

  try {
    let requests = [];
    if (props.wilayah.kabupaten && props.wilayah.kabupaten.length > 0) {
      requests = props.wilayah.kabupaten
        .map((kab) => {
          const idKab = getId(kab);
          if (!idKab) return null;
          return $fetch("/api/agregat-insight", {
            params: {
              id_dataset: dataset.id_dataset,
              id_indikator_insight: dataset.id_indikator,
              period: selectedPeriod.value,
              id_kab: idKab,
            },
          });
        })
        .filter((req) => req !== null);
    } else if (props.wilayah.provinsi && props.wilayah.provinsi.length > 0) {
      requests = props.wilayah.provinsi
        .map((prov) => {
          const idProv = getId(prov);
          if (!idProv) return null;
          return $fetch("/api/agregat-insight", {
            params: {
              id_dataset: dataset.id_dataset,
              id_indikator_insight: dataset.id_indikator,
              period: selectedPeriod.value,
              id_prov: idProv,
            },
          });
        })
        .filter((req) => req !== null);
    }

    if (requests.length === 0) {
      isLoading.value = false;
      return;
    }
    const responses = await Promise.all(requests);
    // Ambil meta dari response pertama yang sukses
    const validResponse = responses.find(
      (res) => res.success && res.data?.meta,
    );
    if (validResponse && validResponse.data.meta.dataset) {
      const metaDs = validResponse.data.meta.dataset;
      datasetMeta.value = {
        instansi: metaDs.instansi || "-",
        sumber: metaDs.sumber || "-",
      };
    }
    const combinedRecords = [];
    responses.forEach((res) => {
      if (res.success && res.data?.records)
        combinedRecords.push(...res.data.records);
    });

    if (combinedRecords.length === 0) {
      isLoading.value = false;
      return;
    }

    const categoriesSet = new Set();
    combinedRecords.forEach((r) => {
      if (r.itemCategory2?.nama) categoriesSet.add(r.itemCategory2.nama);
    });
    availableCategories.value = Array.from(categoriesSet).sort();

    if (
      !selectedCategory.value ||
      !availableCategories.value.includes(selectedCategory.value)
    ) {
      if (availableCategories.value.length > 0)
        selectedCategory.value = availableCategories.value[0];
    }

    const tempGrouped = {};
    combinedRecords.forEach((record) => {
      const kodeKab = record.kd_kab?.kode;
      if (!kodeKab) return;
      if (!tempGrouped[kodeKab]) {
        tempGrouped[kodeKab] = {
          id: kodeKab,
          name: record.kd_kab.nama,
          values: {},
        };
      }
      const catName = record.itemCategory2?.nama || "Uncategorized";
      tempGrouped[kodeKab].values[catName] = record.value || 0;
    });

    groupedData.value = tempGrouped;
    recalcLegend();

    // UPDATE BOTH MAPS
    if (map) renderLayerForMap(map, false);
    if (mapFullscreen) renderLayerForMap(mapFullscreen, true);
  } catch (error) {
    console.error("Failed:", error);
  } finally {
    isLoading.value = false;
  }
};

const loadGeoJsonData = async () => {
  if (geoJsonData.value) return;
  try {
    const module =
      await import("~/assets/data/map/batas_kabupaten_sumatera_20251.json");
    geoJsonData.value = module.default || module;
  } catch (e) {
    console.error("Gagal load geojson", e);
  }
};

// === REUSABLE RENDER LOGIC ===
const renderLayerForMap = (mapInstance, isFullscreen) => {
  if (!mapInstance || !geoJsonData.value) return;

  // Clear existing layer specific to the map
  if (isFullscreen && geoJsonLayerFullscreen) {
    mapInstance.removeLayer(geoJsonLayerFullscreen);
    geoJsonLayerFullscreen = null;
  } else if (!isFullscreen && geoJsonLayer) {
    mapInstance.removeLayer(geoJsonLayer);
    geoJsonLayer = null;
  }

  if (!selectedCategory.value || Object.keys(groupedData.value).length === 0)
    return;

  // === DEBUGGING: CHECK MISMATCH (Jalankan sekali saja di map utama) ===
  if (!isFullscreen) {
    const apiIds = new Set(Object.keys(groupedData.value));
    const geoJsonIds = new Set();

    geoJsonData.value.features.forEach((f) => {
      if (f.properties?.kdkab) geoJsonIds.add(f.properties.kdkab);
    });

    // --- [BARU] LOG JUMLAH DATA ---
    // console.group("📊 Statistik Data Peta");
    // console.log(`🔹 Total Kab/Kota dari API: ${apiIds.size}`);
    // console.log(
    //   `🔹 Total Polygon di GeoJSON: ${geoJsonData.value.features.length}`,
    // );
    // console.log(`🔹 Total ID Unik di GeoJSON: ${geoJsonIds.size}`);
    // console.groupEnd();
    // ------------------------------

    // 1. Ada di API, tapi TIDAK ADA di GeoJSON (Peta Bolong padahal ada data)
    const missingInMap = [...apiIds].filter((id) => !geoJsonIds.has(id));

    // if (missingInMap.length > 0) {
    //   // console.warn("⚠️ DATA MISMATCH DETECTED!");
    //   console.table(
    //     missingInMap.map((id) => ({
    //       Kode_Kab: id,
    //       Nama_Kab_API: groupedData.value[id]?.name || "Unknown",
    //       Status: "Ada di API, Tidak ada di GeoJSON",
    //     })),
    //   );
    // } else {
    //   console.log("✅ Semua data API cocok dengan GeoJSON.");
    // }
  }
  // ===================================================================

  const layer = L.geoJSON(geoJsonData.value, {
    filter: (feature) => {
      const kodeKab = feature.properties.kdkab;
      // Tambahkan log jika kodeKab undefined di GeoJSON
      if (!kodeKab)
        console.warn("GeoJSON Feature tanpa property 'kdkab':", feature);

      // Filter: Hanya tampilkan jika ada di data API
      return !!groupedData.value[kodeKab];
    },
    style: (feature) => {
      const kodeKab = feature.properties.kdkab;
      const regionData = groupedData.value[kodeKab];
      const value = regionData
        ? regionData.values[selectedCategory.value] || 0
        : 0;
      return {
        fillColor: getDynamicColor(value),
        weight: 1,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
      };
    },
    onEachFeature: (feature, l) => {
      l.on({
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          const kodeKab = feature.properties.kdkab;
          const regionData = groupedData.value[kodeKab];
          const breakdown = availableCategories.value
            .map((cat) => ({
              category: cat,
              value: regionData.values[cat] || 0,
            }))
            .sort((a, b) => b.value - a.value);
          selectedInfo.value = {
            id: kodeKab,
            name: regionData.name,
            value: regionData.values[selectedCategory.value] || 0,
            breakdown: breakdown,
          };

          layer.eachLayer((lr) => layer.resetStyle(lr));
          e.target.setStyle({
            weight: 3,
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
        mouseover: (e) => {
          e.target.setStyle({ weight: 2, color: "#666", dashArray: "" });
        },
        mouseout: (e) => {
          if (selectedInfo.value?.id !== feature.properties.kdkab)
            layer.resetStyle(e.target);
        },
      });
    },
  }).addTo(mapInstance);

  // Save reference
  if (isFullscreen) geoJsonLayerFullscreen = layer;
  else geoJsonLayer = layer;

  if (layer.getLayers().length > 0) {
    mapInstance.fitBounds(layer.getBounds(), { padding: [20, 20] });
  }
};

const initMap = async (elementId) => {
  if (!process.client) return null;
  const [LModule] = await Promise.all([
    import("leaflet"),
    import("leaflet/dist/leaflet.css"),
    loadGeoJsonData(),
  ]);
  const m = LModule.map(elementId, { zoomControl: false }).setView(
    [-0.9, 100.5],
    6,
  );
  LModule.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(m);
  m.on("click", () => {
    selectedInfo.value = null;
    if (geoJsonLayer) geoJsonLayer.eachLayer((l) => geoJsonLayer.resetStyle(l));
    if (geoJsonLayerFullscreen)
      geoJsonLayerFullscreen.eachLayer((l) =>
        geoJsonLayerFullscreen.resetStyle(l),
      );
  });
  return m;
};

// === WATCHERS ===
watch(
  () => props.wilayah,
  async (newVal) => {
    if (
      (newVal.provinsi && newVal.provinsi.length > 0) ||
      (newVal.kabupaten && newVal.kabupaten.length > 0)
    ) {
      await fetchAgregatData();
    } else {
      groupedData.value = {};
      legendItems.value = [];
      if (geoJsonLayer && map) map.removeLayer(geoJsonLayer);
      if (geoJsonLayerFullscreen && mapFullscreen)
        mapFullscreen.removeLayer(geoJsonLayerFullscreen);
    }
  },
  { deep: true, immediate: true },
);

// Watch Kategori -> Recalc Legend & Update Style di KEDUA peta
watch(selectedCategory, () => {
  recalcLegend();
  const updateStyle = (layer) => {
    if (!layer) return;
    layer.eachLayer((l) => {
      const kodeKab = l.feature.properties.kdkab;
      const regionData = groupedData.value[kodeKab];
      const value = regionData
        ? regionData.values[selectedCategory.value] || 0
        : 0;
      l.setStyle({ fillColor: getDynamicColor(value) });
    });
  };
  updateStyle(geoJsonLayer);
  updateStyle(geoJsonLayerFullscreen);

  if (selectedInfo.value) {
    const regionData = groupedData.value[selectedInfo.value.id];
    selectedInfo.value.value = regionData.values[selectedCategory.value] || 0;
  }
});

// Watch Fullscreen Open
watch(openFullscreen, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    mapFullscreen = await initMap("map-insight-fullscreen");
    renderLayerForMap(mapFullscreen, true);
  } else {
    if (mapFullscreen) {
      mapFullscreen.remove();
      mapFullscreen = null;
      geoJsonLayerFullscreen = null;
    }
  }
});

onMounted(async () => {
  setTimeout(async () => {
    map = await initMap("map-insight");
    if (props.wilayah?.provinsi?.length > 0) fetchAgregatData();
  }, 100);
});

onActivated(async () => {
  if (map) {
    await nextTick();
    setTimeout(() => map.invalidateSize(), 300);
  }
});
</script>

<style scoped>
#map-insight,
#map-insight-fullscreen {
  z-index: 1;
}
</style>
