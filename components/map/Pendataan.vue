<template>
  <div>
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">
          Memuat data peta untuk {{ regionCount }} wilayah...
        </p>
      </div>
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-4"
      :class="selectedLocation ? 'lg:grid-cols-3' : ''"
    >
      <div class="relative" :class="selectedLocation ? 'lg:col-span-2' : ''">
        <div class="absolute top-4 right-16 z-[400]">
          <div
            class="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200 shadow-lg flex items-center gap-3"
          >
            <UIcon
              name="i-heroicons-clock"
              class="w-5 h-5 text-amber-500 flex-shrink-0"
            />

            <div class="flex flex-col leading-tight">
              <span class="text-xs font-bold text-gray-800"
                >Data Hasil Pendataan Lapangan</span
              >
              <span class="text-[10px] font-medium text-gray-500"
                >Terakhir diperbarui: 18 Jan 2025 06.00 WIB</span
              >
            </div>
          </div>
        </div>

        <div class="absolute top-4 right-4 z-[400]">
          <button
            @click="open = true"
            :disabled="!isMapReady"
            class="p-2.5 rounded-lg flex items-center justify-center transition-all border bg-white border-gray-200 shadow-lg hover:bg-gray-50 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <UIcon
              name="i-heroicons-arrows-pointing-out"
              class="w-5 h-5 text-gray-700"
            />
          </button>
        </div>

        <div
          class="relative w-full h-96 lg:h-[500px] rounded-xl border-2 border-gray-200 z-0 bg-slate-50 overflow-hidden"
        >
          <div class="absolute top-4 left-4 z-[400]">
            <UTooltip
              text="Silakan filter sampai Level Desa/Kelurahan terlebih dahulu"
              :prevent="!isMapReady"
              :popper="{ placement: 'top' }"
            >
              <button
                @click="showIndikator = !showIndikator"
                :disabled="!isMapReady"
                class="px-4 py-2.5 rounded-lg flex items-center justify-between w-50 transition-all border shadow-lg cursor-pointer"
                :class="
                  !isMapReady
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-75 shadow-none'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                "
              >
                <div class="flex items-center gap-4">
                  <UIcon
                    name="i-heroicons-adjustments-horizontal"
                    class="w-5 h-5 flex-shrink-0"
                    :class="!isMapReady ? 'text-gray-400' : 'text-gray-700'"
                  />
                  <span
                    class="font-semibold"
                    :class="!isMapReady ? 'text-gray-400' : 'text-gray-900'"
                  >
                    Indikator
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <div
                    v-if="checkedCount > 0 && isMapReady"
                    class="flex items-center justify-center bg-amber-500 text-white text-[10px] font-bold h-5 w-5 rounded-full shadow-sm"
                  >
                    {{ checkedCount }}
                  </div>

                  <UIcon
                    :name="
                      showIndikator
                        ? 'i-heroicons-chevron-up'
                        : 'i-heroicons-chevron-down'
                    "
                    class="w-4 h-4 flex-shrink-0"
                    :class="!isMapReady ? 'text-gray-400' : 'text-gray-600'"
                  />
                </div>
              </button>
            </UTooltip>

            <div
              v-if="showIndikator && isMapReady"
              class="mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 w-96 max-h-[25rem] flex flex-col overflow-hidden"
            >
              <div class="p-4 border-b border-gray-100 bg-gray-50">
                <div class="flex justify-between items-center">
                  <p
                    class="text-xs font-bold"
                    :class="
                      checkedCount >= 3 ? 'text-red-500' : 'text-amber-600'
                    "
                  >
                    {{ checkedCount }}/3 Terpilih
                  </p>
                </div>
              </div>
              <div
                class="overflow-y-auto p-2 space-y-2 custom-scrollbar flex-1 bg-white"
              >
                <div
                  v-for="ind in localIndikatorList"
                  :key="ind.id"
                  class="border border-gray-100 rounded-lg transition-colors"
                  :class="{
                    'bg-amber-50/50 border-amber-200': ind.checked,
                    'bg-white hover:border-gray-300': !ind.checked,
                  }"
                >
                  <div class="flex items-center justify-between p-3">
                    <div class="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        v-model="ind.checked"
                        :disabled="!ind.checked && checkedCount >= 3"
                        @change="onIndikatorChange(ind)"
                        class="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500 cursor-pointer disabled:opacity-50"
                      />
                      <span
                        @click="toggleAccordion(ind)"
                        class="text-sm font-medium cursor-pointer select-none flex-1"
                        :class="ind.checked ? 'text-gray-900' : 'text-gray-600'"
                        >{{ ind.label }}</span
                      >
                    </div>
                    <button
                      v-if="ind.jenis_infra?.length > 0"
                      @click.stop="toggleAccordion(ind)"
                      class="p-1 rounded-full hover:bg-gray-200/50 transition-colors"
                    >
                      <UIcon
                        :name="
                          ind.isOpen
                            ? 'i-heroicons-chevron-up'
                            : 'i-heroicons-chevron-down'
                        "
                        class="w-4 h-4 text-gray-400"
                      />
                    </button>
                  </div>
                  <div
                    v-if="ind.jenis_infra?.length > 0"
                    v-show="ind.isOpen"
                    class="px-3 pb-3 pt-0 border-t border-gray-100/50 ml-7"
                  >
                    <div class="flex justify-between items-center py-2 mb-1">
                      <p
                        class="text-[10px] text-gray-500 font-semibold uppercase tracking-wide"
                      >
                        Pilih Detail:
                      </p>
                      <button
                        v-if="ind.selectedJenisInfra?.length > 0"
                        @click="clearJenisInfraForIndicator(ind)"
                        class="text-[10px] text-red-500 hover:text-red-700 font-medium hover:underline"
                      >
                        Reset
                      </button>
                    </div>
                    <div class="space-y-1">
                      <label
                        v-for="jenis in ind.jenis_infra"
                        :key="jenis"
                        class="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded border border-transparent hover:border-gray-200 transition-all"
                      >
                        <input
                          type="checkbox"
                          :value="jenis"
                          v-model="ind.selectedJenisInfra"
                          @change="updateMapMarkers"
                          :disabled="!ind.checked"
                          class="w-3.5 h-3.5 text-amber-500 rounded border-gray-300 focus:ring-amber-500 disabled:opacity-50"
                        />
                        <span
                          class="text-xs text-gray-700"
                          :class="{ 'opacity-50': !ind.checked }"
                          >{{ jenis }}</span
                        >
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="map-pendataan" class="w-full h-full z-0"></div>
        </div>

        <div
          v-if="checkedCount > 0 && isMapReady"
          class="mt-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
        >
          <div class="flex items-center justify-between mb-3">
            <h4
              class="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase"
            >
              <UIcon
                name="i-heroicons-list-bullet"
                class="w-4 h-4 text-amber-500"
              />Legenda
            </h4>
            <button
              @click="clearAllSelection"
              class="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Hapus Semua
            </button>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <div
              v-for="ind in localIndikatorList.filter((i) => i.checked)"
              :key="ind.id"
              class="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200"
            >
              <div
                :style="{ backgroundColor: getMarkerColor(ind.data_key) }"
                class="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
              ></div>
              <span class="text-xs font-semibold text-gray-700 line-clamp-2">{{
                ind.label
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Koordinat - Hanya muncul jika ada selectedLocation -->
      <DetailKoordinat
        v-if="selectedLocation"
        :selected-location="selectedLocation"
        :is-filter-complete="isMapReady"
        @close="selectedLocation = null"
      />
    </div>

    <UModal v-model:open="open" fullscreen>
      <template #content>
        <div class="flex flex-col h-full bg-white relative">
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white z-[500] shadow-sm"
          >
            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UIcon name="i-heroicons-map" class="w-6 h-6 text-amber-600" />
              Peta Sebaran
            </h3>

            <div class="flex items-center gap-3">
              <div
                class="bg-white/90 px-3 py-2.5 rounded-lg border border-gray-200 flex items-center gap-2"
              >
                <UIcon
                  name="i-heroicons-clock"
                  class="w-4 h-4 text-amber-500"
                />
                <span class="text-xs font-bold text-gray-700">
                  Terakhir diperbarui: 18 Jan 2025 06.00 WIB
                </span>
              </div>

              <UButton
                variant="solid"
                icon="i-heroicons-x-mark"
                class="text-gray-100 hover:bg-primary/80 cursor-pointer"
                @click="open = false"
              />
            </div>
          </div>

          <div class="flex-1 flex overflow-hidden relative">
            <div class="relative flex-1 bg-slate-100">
              <div
                id="map-fullscreen-pendataan"
                class="w-full h-full z-0"
              ></div>

              <div class="absolute top-4 left-4 z-[400]">
                <button
                  @click="showIndikatorFullscreen = !showIndikatorFullscreen"
                  class="px-4 py-2.5 rounded-lg flex items-center w-50 gap-4 transition-all border bg-white border-gray-200 shadow-lg hover:bg-gray-50 cursor-pointer"
                >
                  <UIcon
                    name="i-heroicons-adjustments-horizontal"
                    class="w-5 h-5 text-gray-900"
                  />
                  <span class="font-bold text-gray-900">Indikator</span>

                  <div
                    v-if="checkedCount > 0 && isMapReady"
                    class="flex items-center justify-center bg-amber-500 text-white text-[10px] font-bold h-5 w-5 rounded-full shadow-sm"
                  >
                    {{ checkedCount }}
                  </div>
                  <UIcon
                    :name="
                      showIndikatorFullscreen
                        ? 'i-heroicons-chevron-up'
                        : 'i-heroicons-chevron-down'
                    "
                    class="w-4 h-4"
                    :class="!isMapReady ? 'text-gray-400' : 'text-gray-600'"
                  />
                </button>
                <div
                  v-if="showIndikatorFullscreen"
                  class="mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 w-96 max-h-[70vh] flex flex-col overflow-hidden"
                >
                  <div class="p-4 border-b border-gray-100 bg-gray-50">
                    <p class="text-xs font-bold text-amber-700">
                      {{ checkedCount }}/3 Terpilih
                    </p>
                  </div>
                  <div
                    class="overflow-y-auto p-2 space-y-2 custom-scrollbar flex-1 bg-white"
                  >
                    <div
                      v-for="ind in localIndikatorList"
                      :key="'fs-' + ind.id"
                      class="border rounded-lg transition-colors duration-200 bg-white border-gray-200"
                    >
                      <div class="flex items-center justify-between p-3">
                        <div class="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            v-model="ind.checked"
                            :disabled="!ind.checked && checkedCount >= 3"
                            @change="onIndikatorChange(ind)"
                            class="w-4 h-4 text-amber-600 rounded border-gray-400 focus:ring-amber-600 cursor-pointer"
                          />
                          <span
                            @click="toggleAccordion(ind)"
                            class="text-sm font-semibold cursor-pointer select-none flex-1"
                            >{{ ind.label }}</span
                          >
                        </div>
                        <button
                          v-if="ind.jenis_infra?.length > 0"
                          @click.stop="toggleAccordion(ind)"
                          class="p-1 rounded-full hover:bg-gray-200"
                        >
                          <UIcon
                            :name="
                              ind.isOpen
                                ? 'i-heroicons-chevron-up'
                                : 'i-heroicons-chevron-down'
                            "
                            class="w-4 h-4 text-gray-600"
                          />
                        </button>
                      </div>
                      <div
                        v-if="ind.jenis_infra?.length > 0"
                        v-show="ind.isOpen"
                        class="px-3 pb-3 pt-0 border-t border-gray-200/60 ml-7"
                      >
                        <div class="space-y-1.5 pt-2">
                          <label
                            v-for="jenis in ind.jenis_infra"
                            :key="'fs-' + jenis"
                            class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded border border-transparent hover:border-gray-300"
                          >
                            <input
                              type="checkbox"
                              :value="jenis"
                              v-model="ind.selectedJenisInfra"
                              @change="updateMapMarkers"
                              :disabled="!ind.checked"
                              class="w-3.5 h-3.5 text-amber-600 rounded border-gray-400"
                            />
                            <span class="text-xs">{{ jenis }}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="checkedCount > 0"
                class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[400] max-w-[90%]"
              >
                <div
                  class="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-full border border-gray-200 shadow-xl flex items-center gap-4 transition-all hover:bg-white"
                >
                  <div
                    class="flex items-center gap-2 border-r border-gray-200 pr-4 shrink-0"
                  >
                    <UIcon
                      name="i-heroicons-list-bullet"
                      class="w-4 h-4 text-amber-500"
                    />
                    <span
                      class="text-xs font-bold text-gray-800 uppercase tracking-wide"
                    >
                      Legenda
                    </span>
                  </div>

                  <div
                    class="flex items-center gap-4 overflow-x-auto no-scrollbar"
                  >
                    <div
                      v-for="ind in localIndikatorList.filter((i) => i.checked)"
                      :key="'legend-fs-' + ind.id"
                      class="flex items-center gap-2 shrink-0"
                    >
                      <div
                        :style="{
                          backgroundColor: getMarkerColor(ind.data_key),
                        }"
                        class="w-3 h-3 rounded-full border border-white shadow-sm ring-1 ring-gray-100"
                      ></div>
                      <span
                        class="text-xs font-semibold text-gray-700 whitespace-nowrap"
                      >
                        {{ ind.label }}
                      </span>
                    </div>
                  </div>

                  <div class="border-l border-gray-200 pl-2 ml-1 shrink-0">
                    <button
                      @click="clearAllSelection"
                      class="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Hapus Semua Filter"
                    >
                      <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="selectedLocation"
              class="w-96 border-l border-gray-200 bg-white h-full overflow-y-auto shadow-xl z-[450]"
            >
              <DetailKoordinat
                :selected-location="selectedLocation"
                :is-filter-complete="isMapReady"
                @close="selectedLocation = null"
              />
            </div>
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
  onMounted,
  onActivated,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import DetailKoordinat from "~/components/DetailKoordinat.vue";

// --- STATE & PROPS ---
const props = defineProps({
  wilayah: { type: Object, default: () => ({ desa: [] }) },
});

const isLoading = ref(false);
const showIndikator = ref(false);
const showIndikatorFullscreen = ref(true);
const open = ref(false);
const selectedLocation = ref(null);
const localIndikatorList = ref([]);
const regionCount = ref(0);
const cachedLocationsData = ref({});
const locationsData = ref({});

// --- MAP INSTANCES ---
let map = null;
let mapFullscreen = null;
let mainMarkerGroup = null;
let fsMarkerGroup = null;

// --- COMPUTED ---
const isMapReady = computed(
  () => props.wilayah?.desa && props.wilayah.desa.length > 0,
);
const checkedCount = computed(
  () => localIndikatorList.value.filter((ind) => ind.checked).length,
);
const getIndikatorBtnClass = (disabled) => [
  "px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all border w-50 justify-between",
  disabled
    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-75 shadow-none"
    : "bg-white border-gray-200 shadow-lg hover:bg-gray-50 cursor-pointer",
];

// --- FETCHING LOGIC ---
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

const fetchLocationData = async (kodeDesaArray) => {
  const cacheKey = JSON.stringify(kodeDesaArray.sort());
  if (cachedLocationsData.value[cacheKey]) {
    locationsData.value = cachedLocationsData.value[cacheKey];
    return;
  }
  try {
    isLoading.value = true;
    regionCount.value = kodeDesaArray.length;
    const response = await $fetch("/api/koordinat", {
      method: "POST",
      body: { kode_desa: kodeDesaArray },
    });
    if (response.success) {
      cachedLocationsData.value[cacheKey] = response.data;
      locationsData.value = response.data;
    }
  } catch (error) {
    console.error("Err fetch loc:", error);
    locationsData.value = {};
  } finally {
    isLoading.value = false;
  }
};

// --- HELPERS ---
const getMarkerColor = (type) => {
  const colors = {
    keluarga: "#14b8a6",
    pendidikan: "#3b82f6",
    kesehatan: "#ef4444",
    ekonomi: "#10b981",
    sosial: "#a855f7",
  };
  return colors[type] || "#14b8a6";
};

const toggleAccordion = (indicator) => {
  indicator.isOpen = !indicator.isOpen;
};

const onIndikatorChange = (indicator) => {
  if (indicator.checked) {
    indicator.isOpen = true;
    if (indicator.jenis_infra?.length > 0)
      indicator.selectedJenisInfra = [...indicator.jenis_infra];
  } else {
    indicator.isOpen = false;
    indicator.selectedJenisInfra = [];
  }
  updateMapMarkers();
};

const clearJenisInfraForIndicator = (ind) => {
  ind.selectedJenisInfra = [];
  updateMapMarkers();
};

const clearAllSelection = () => {
  localIndikatorList.value.forEach((ind) => {
    ind.checked = false;
    ind.selectedJenisInfra = [];
  });
  updateMapMarkers();
};

const highlightMarkerInGroup = (group, loc, color, L) => {
  if (!group) return;
  group.eachLayer((layer) => {
    const mLatLng = layer.getLatLng();
    // Check match
    if (mLatLng.lat === loc.lat && mLatLng.lng === loc.lng) {
      // Active State
      layer.setIcon(
        L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #fbbf24; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.6); transform: scale(1.2);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      );
      layer.setZIndexOffset(1000);
    } else {
      // Reset State
      const defaultColor = layer.originalColor || "#14b8a6";
      layer.setIcon(
        L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: ${defaultColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }),
      );
      layer.setZIndexOffset(0);
    }
  });
};
const resetAllMarkers = (group, L) => {
  if (!group) return;
  group.eachLayer((layer) => {
    // Ambil warna asli yang disimpan saat inisialisasi
    const defaultColor = layer.originalColor || "#14b8a6";

    // Set icon kembali ke ukuran kecil
    layer.setIcon(
      L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${defaultColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      }),
    );
    // Kembalikan z-index agar tidak menutupi yang lain
    layer.setZIndexOffset(0);
  });
};
// --- MAP LOGIC ---
const getMapDataConfig = () => {
  const markerConfigs = [];
  localIndikatorList.value
    .filter((ind) => ind.checked)
    .forEach((indicator) => {
      let locations = locationsData.value[indicator.data_key] || [];

      if (indicator.selectedJenisInfra?.length > 0)
        locations = locations.filter((loc) =>
          indicator.selectedJenisInfra.includes(loc.kode_jenis_infra),
        );

      const markerColor = getMarkerColor(indicator.data_key);

      locations.forEach((loc) => {
        markerConfigs.push({ loc, markerColor });
      });
    });

  return { markerConfigs };
};

const updateLayersOnMap = async (targetMap, markerGroup, L) => {
  if (!targetMap || !markerGroup) return;

  const { markerConfigs } = getMapDataConfig();

  markerGroup.clearLayers();

  markerConfigs.forEach(({ loc, markerColor }) => {
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

    // Save original color for reset logic
    marker.originalColor = markerColor;

    marker.on("click", () => {
      selectedLocation.value = loc;
      highlightMarkerInGroup(mainMarkerGroup, loc, markerColor, L);
      if (fsMarkerGroup)
        highlightMarkerInGroup(fsMarkerGroup, loc, markerColor, L);
    });

    marker.addTo(markerGroup);
  });

  if (markerConfigs.length > 0) {
    targetMap.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
  }

  if (selectedLocation.value) {
    // Cari konfigurasi (warna) untuk lokasi yang sedang dipilih
    const activeConfig = markerConfigs.find(
      (c) =>
        c.loc.lat === selectedLocation.value.lat &&
        c.loc.lng === selectedLocation.value.lng,
    );

    // Jika ketemu, langsung highlight marker tersebut di grup ini
    if (activeConfig) {
      highlightMarkerInGroup(
        markerGroup,
        selectedLocation.value,
        activeConfig.markerColor,
        L,
      );
    }
  }
};

const isDataReady = computed(() => {
  return (
    localIndikatorList.value.length > 0 &&
    Object.keys(locationsData.value).length > 0
  );
});

const updateMapMarkers = async () => {
  const L = await import("leaflet");
  await updateLayersOnMap(map, mainMarkerGroup, L);
  if (mapFullscreen) {
    await updateLayersOnMap(mapFullscreen, fsMarkerGroup, L);
  }
};

// --- INITIALIZATION ---
const initMainMap = async () => {
  if (!process.client) return;
  await nextTick();
  const L = await import("leaflet");
  await import("leaflet/dist/leaflet.css");

  if (map) {
    map.remove();
    map = null;
  }

  const mapElement = document.getElementById("map-pendataan");
  if (!mapElement) return;

  map = L.map("map-pendataan", { zoomControl: false }).setView([2.0, 99.0], 6);
  L.control.zoom({ position: "bottomleft" }).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  mainMarkerGroup = L.featureGroup().addTo(map);

  if (isDataReady.value) {
    await updateMapMarkers();
  }

  setTimeout(() => {
    map.invalidateSize();
  }, 250);
};

const initFullscreenMap = async () => {
  if (!process.client) return;
  const L = await import("leaflet");

  let center = [4.710135, 96.764397],
    zoom = 13;
  if (map) {
    center = map.getCenter();
    zoom = map.getZoom();
  }
  mapFullscreen = L.map("map-fullscreen-pendataan", {
    zoomControl: false,
  }).setView(center, zoom);
  L.control.zoom({ position: "bottomright" }).addTo(mapFullscreen);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(mapFullscreen);

  fsMarkerGroup = L.featureGroup().addTo(mapFullscreen);

  await updateLayersOnMap(mapFullscreen, fsMarkerGroup, L);
};

// --- WATCHERS ---
watch(
  () => props.wilayah,
  async (newVal) => {
    selectedLocation.value = null;
    if (newVal.desa && newVal.desa.length > 0) {
      await fetchLocationData(newVal.desa);
      await initMainMap();
    } else {
      if (mainMarkerGroup) mainMarkerGroup.clearLayers();
      locationsData.value = {};
    }
  },
  { deep: true, immediate: true },
);

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    await initFullscreenMap();
  } else {
    if (mapFullscreen) {
      mapFullscreen.remove();
      mapFullscreen = null;
      fsMarkerGroup = null;
    }
  }
});

watch(isDataReady, async (ready) => {
  if (ready && map) {
    await nextTick();
    await updateMapMarkers();
  }
});
watch(selectedLocation, async (newVal) => {
  const L = await import("leaflet");

  if (!newVal) {
    if (mainMarkerGroup) resetAllMarkers(mainMarkerGroup, L);
    if (fsMarkerGroup) resetAllMarkers(fsMarkerGroup, L);
  } else {
    const color = getMarkerColor(newVal.type || "keluarga"); // Fallback logic

    if (mainMarkerGroup)
      highlightMarkerInGroup(mainMarkerGroup, newVal, color, L);
    if (fsMarkerGroup) highlightMarkerInGroup(fsMarkerGroup, newVal, color, L);
  }
});
onMounted(async () => {
  await fetchIndikatorList();
  setTimeout(() => {
    initMainMap();
  }, 300);
});

onActivated(async () => {
  if (map) {
    await nextTick();
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }
});

onBeforeUnmount(() => {
  if (map) map.remove();
  if (mapFullscreen) mapFullscreen.remove();
});
</script>
<style scoped>
#map-pendataan,
#map-fullscreen-pendataan {
  z-index: 1;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
