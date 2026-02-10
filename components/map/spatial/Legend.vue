<template>
  <div
    class="bg-white/95 backdrop-blur rounded-xl border border-gray-200 shadow-xl transition-all duration-300 pointer-events-auto flex flex-col overflow-hidden"
    :class="[isCollapsed ? 'w-auto' : 'w-72 max-h-[80vh]']"
    @click.stop
    @dblclick.stop
    @mousedown.stop
    @wheel.stop
    @touchstart.stop
  >
    <div
      class="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-100 transition-colors shrink-0"
      @click="isCollapsed = !isCollapsed"
    >
      <div class="flex items-center gap-2">
        <UIcon name="ph:laptop-duotone" class="w-4 h-4 text-gray-700" />
        <span class="text-xs font-bold text-gray-700"> Legenda </span>
      </div>
      <UIcon
        :name="
          isCollapsed ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
        "
        class="w-4 h-4 text-gray-400 transition-transform duration-300"
      />
    </div>

    <div
      v-show="!isCollapsed"
      class="overflow-y-auto custom-scrollbar flex-1 bg-white p-2"
    >
      <UAccordion
        :items="accordionItems"
        multiple
        :ui="{
          wrapper: 'w-full',
          item: {
            padding: 'px-3 py-2',
            size: 'text-xs',
            color: 'text-gray-700',
            icon: 'text-gray-400',
          },
          default: {
            class:
              'text-gray-800 font-semibold text-[10px] uppercase bg-white hover:bg-gray-50',
          },
        }"
      >
        <template #dampak>
          <div class="space-y-4 p-2">
            <div v-if="bpsLayers.length > 0" class="space-y-3">
              <div class="pb-1 border-b border-gray-100">
                <span
                  class="text-[9px] font-extrabold text-blue-600 tracking-wider"
                >
                  SUMBER: BPS GEOSERVER
                </span>
              </div>
              <div
                v-for="layer in bpsLayers"
                :key="layer.id"
                class="space-y-1.5"
              >
                <p class="text-[10px] font-bold text-gray-800 leading-tight">
                  {{ layer.name }}
                </p>
                <div
                  class="bg-gray-50 rounded border border-gray-100 p-2 space-y-1.5"
                >
                  <div
                    v-for="(item, idx) in getLegendItems(layer.id)"
                    :key="idx"
                    class="flex items-start gap-2"
                  >
                    <span
                      class="block shrink-0 mt-0.5 border border-black/10 shadow-sm"
                      :class="
                        item.shape === 'circle'
                          ? 'w-3 h-3 rounded-full'
                          : 'w-3.5 h-3.5 rounded-sm'
                      "
                      :style="{ backgroundColor: item.color }"
                    ></span>
                    <span class="text-[10px] text-gray-600 leading-tight">{{
                      item.label
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="bmkgLayers.length > 0" class="space-y-3">
              <div class="pb-1 border-b border-gray-100">
                <span
                  class="text-[9px] font-extrabold text-sky-500 tracking-wider"
                >
                  SUMBER: BMKG
                </span>
              </div>
              <div
                v-for="layer in bmkgLayers"
                :key="layer.id"
                class="space-y-1.5"
              >
                <p class="text-[10px] font-bold text-gray-800 leading-tight">
                  {{ layer.name }}
                </p>
                <div
                  class="bg-gray-50 rounded border border-gray-100 p-2 space-y-1.5"
                >
                  <div
                    v-for="(item, idx) in getLegendItems(layer.id)"
                    :key="idx"
                    class="flex items-start gap-2"
                  >
                    <span
                      class="block shrink-0 mt-0.5 border border-black/10 shadow-sm w-3.5 h-3.5 rounded-sm"
                      :style="{ backgroundColor: item.color }"
                    ></span>
                    <span class="text-[10px] text-gray-600 leading-tight">{{
                      item.label
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="computedBrinLayers.length > 0" class="space-y-3">
              <div class="pb-1 border-b border-gray-100">
                <span
                  class="text-[9px] font-extrabold text-emerald-600 tracking-wider"
                >
                  SUMBER: BRIN
                </span>
              </div>
              <div
                v-for="layer in computedBrinLayers"
                :key="layer.id"
                class="space-y-1.5"
              >
                <p class="text-[10px] font-bold text-gray-800 leading-tight">
                  {{ layer.label }}
                </p>
                <div
                  class="bg-gray-50 rounded border border-gray-100 p-2 flex items-center gap-2"
                >
                  <span
                    class="block w-3.5 h-3.5 rounded-sm border border-black/10 shadow-sm shrink-0"
                    :style="{ backgroundColor: layer.color }"
                  ></span>
                  <span class="text-[10px] text-gray-600 leading-tight"
                    >Area {{ layer.label }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #sebaran>
          <div class="p-2 space-y-3">
            <div class="px-1">
              <label
                class="flex items-center justify-between cursor-pointer group p-1.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
              >
                <span
                  class="text-[10px] font-semibold text-gray-700 group-hover:text-gray-900"
                >
                  Hanya Foto Lengkap
                </span>
                <USwitch
                  v-model="localShowPhotosOnly"
                  size="xs"
                  color="primary"
                />
              </label>
            </div>

            <div class="space-y-2">
              <div v-for="ind in activeSebaranItems" :key="'leg-' + ind.id">
                <div v-if="ind.data_key === 'keluarga'" class="space-y-2">
                  <p
                    class="text-[10px] font-bold text-gray-800 border-b border-gray-100 pb-1"
                  >
                    {{ ind.label }}
                  </p>
                  <div class="grid grid-cols-1 gap-1.5 pl-1">
                    <div
                      v-for="sub in ind.selectedJenisInfra"
                      :key="sub"
                      class="flex items-center gap-2"
                    >
                      <div
                        :style="{ backgroundColor: getDamageColor(sub) }"
                        class="w-2.5 h-2.5 rounded-full border border-white shadow-sm flex-shrink-0"
                      ></div>
                      <span
                        class="text-[10px] font-medium text-gray-600 leading-tight"
                      >
                        {{ sub }}
                      </span>
                    </div>
                    <p
                      v-if="
                        !ind.selectedJenisInfra ||
                        ind.selectedJenisInfra.length === 0
                      "
                      class="text-[9px] text-gray-400 italic"
                    >
                      Tidak ada kategori dipilih
                    </p>
                  </div>
                </div>

                <div
                  v-else
                  class="flex items-start gap-2 bg-gray-50 p-1.5 rounded border border-gray-100"
                >
                  <div
                    class="w-5 h-5 rounded border border-white shadow-sm flex-shrink-0 flex items-center justify-center"
                    :style="{ backgroundColor: getInfraColor(ind.data_key) }"
                    v-html="getInfraIcon(ind.data_key)"
                  ></div>
                  <span
                    class="text-[10px] font-medium text-gray-700 leading-tight mt-0.5"
                  >
                    {{ ind.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #choropleth>
          <div class="p-2">
            <h4
              class="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2"
            >
              {{ choroplethUnit || "Keterangan" }}
            </h4>
            <div class="space-y-1 mb-3">
              <div
                v-for="(item, idx) in choroplethItems"
                :key="idx"
                class="flex items-center gap-2"
              >
                <span
                  class="w-3.5 h-3.5 rounded-sm shadow-sm border border-black/5"
                  :style="{ backgroundColor: item.color }"
                ></span>
                <span
                  class="text-[11px] text-gray-600 font-medium leading-tight"
                >
                  {{ item.label }}
                </span>
              </div>
            </div>

            <div class="pt-3 border-t border-gray-100">
              <div class="flex items-center gap-2 mb-1.5">
                <UIcon
                  name="i-heroicons-eye"
                  class="w-3.5 h-3.5 text-gray-400"
                />
                <span class="text-[10px] font-semibold text-gray-500 uppercase">
                  Transparansi {{ Math.round(internalMapOpacity * 100) }}%
                </span>
              </div>
              <USlider
                v-model="internalMapOpacity"
                :min="0.1"
                :max="1"
                :step="0.1"
                size="xs"
                color="primary"
                :ui="{ track: 'h-1.5', thumb: 'w-3 h-3' }"
              />
            </div>
          </div>
        </template>
      </UAccordion>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { additionalLayersConfig } from "~/constants/insight-spatial-data.ts";

const props = defineProps({
  showPendataan: { type: Boolean, default: false },
  // Props Dampak
  dampakPmssLayers: { type: Array, default: () => [] },
  dampakBrinLayers: { type: Array, default: () => [] },

  // Props Sebaran
  sebaranItems: { type: Array, default: () => [] },
  showPhotosOnly: { type: Boolean, default: false },

  // Props Choropleth
  choroplethItems: { type: Array, default: () => [] },
  choroplethUnit: { type: String, default: "" },
  choroplethOpacity: { type: Number, default: 0.7 },
});

const emit = defineEmits(["update:showPhotosOnly", "update:choroplethOpacity"]);

const isCollapsed = ref(false);

// --- Computed Accordion Items ---
const accordionItems = computed(() => {
  const items = [];

  // Item 1: Dampak (Only if active)
  if (props.dampakPmssLayers.length > 0 || props.dampakBrinLayers.length > 0) {
    items.push({
      label: "Sebaran Dampak",
      icon: "i-heroicons-exclamation-triangle",
      slot: "dampak",
      defaultOpen: true,
    });
  }

  // Item 2: Sebaran Titik (Pendataan)
  // Cek jika ada item yang checked
  const hasActiveSebaran =
    props.showPendataan && props.sebaranItems.some((i) => i.checked);

  if (hasActiveSebaran) {
    items.push({
      label: "Kondisi Infrastruktur (BPS)",
      icon: "ph:map-pin-simple-area-duotone",
      slot: "sebaran",
      defaultOpen: true,
    });
  }

  // Item 3: Wilayah (Choropleth)
  if (props.choroplethItems.length > 0) {
    items.push({
      label: "Data Statistik",
      icon: "i-heroicons-chart-bar",
      slot: "choropleth",
      defaultOpen: !hasActiveSebaran, // Buka jika sebaran tidak aktif
    });
  }

  return items;
});

// ================= LOGIC DAMPAK =================
const LEGEND_ITEMS_MAP = {
  desa_pendataan: [
    { label: "Desa Pendataan Organik BPS", color: "#BC4B9E", shape: "square" },
    { label: "Desa Pendataan STIS", color: "#CBCD57", shape: "square" },
  ],
  desa_bencana: [
    {
      label: "Desa Terkonfirmasi Terdampak (BNPB)",
      color: "#EE6458",
      shape: "square",
    },
  ],
  prediksi_banjir: [
    { label: "Prediksi Wilayah Banjir", color: "#74ACDF", shape: "square" },
  ],
  lahan_baku_sawah: [
    { label: "Lahan Sawah Tidak Terdampak", color: "#437F30", shape: "square" },
    { label: "Lahan Sawah Terdampak", color: "#DCA247", shape: "square" },
  ],
  infrastruktur_terdampak: [
    { label: "Ekonomi", color: "#4B73BE", shape: "circle" },
    { label: "Infra Pertanian", color: "#55B498", shape: "circle" },
    { label: "Kesehatan", color: "#804097", shape: "circle" },
    { label: "Pendidikan Negeri", color: "#68B348", shape: "circle" },
    { label: "Pendidikan Swasta", color: "#AECF4B", shape: "circle" },
    { label: "Perbankan", color: "#D86E3C", shape: "circle" },
    { label: "Lainnya", color: "#C73E77", shape: "circle" },
  ],
  tempat_tinggal_terdampak: [
    { label: "Tempat Tinggal Terdampak", color: "#DCD339", shape: "circle" },
  ],
  prediksi_curah_hujan_februari_2026: [
    { label: "Sangat Rendah (0-50 mm)", color: "#E2FFCB", shape: "square" },
    { label: "Rendah (51-150 mm)", color: "#32FD32", shape: "square" },
    { label: "Menengah (151-300 mm)", color: "#FFFF32", shape: "square" },
    { label: "Tinggi (301-500 mm)", color: "#FD9A32", shape: "square" },
    { label: "Sangat Tinggi (>500 mm)", color: "#FD3232", shape: "square" },
  ],
  sungai: [
    { label: "Aliran Sungai", color: "#40DFCE", shape: "square" },
  ],
  kawasan_hutan: [
    { label: "Taman Nasional", color: "#FFA500", shape: "square" },
    { label: "Hutan Lindung", color: "#6A5ACD", shape: "square" },
    { label: "Hutan Produksi Tetap", color: "#DC143C", shape: "square" },
    { label: "Taman Buru", color: "#87CEEB", shape: "square" },
    { label: "Hutan (Kawasan) Suaka Alam/Wisata", color: "#FFFF00", shape: "square" },
    { label: "Suaka Margasatwa", color: "#9370DB", shape: "square" },
    { label: "Taman Wisata Alam/Hutan Wisata", color: "#90EE90", shape: "square" },
  ],
};

const bpsLayers = computed(() =>
  props.dampakPmssLayers.filter((l) => !l.id.includes("curah_hujan")),
);
const bmkgLayers = computed(() =>
  props.dampakPmssLayers.filter((l) => l.id.includes("curah_hujan")),
);
const computedBrinLayers = computed(() =>
  props.dampakBrinLayers
    .map((id) => additionalLayersConfig.find((l) => l.id === id))
    .filter(Boolean),
);
const getLegendItems = (layerId) =>
  LEGEND_ITEMS_MAP[layerId] || [
    { label: "Data Layer", color: "#9CA3AF", shape: "square" },
  ];

// ================= LOGIC SEBARAN =================
const localShowPhotosOnly = computed({
  get: () => props.showPhotosOnly,
  set: (val) => emit("update:showPhotosOnly", val),
});

const activeSebaranItems = computed(() =>
  props.sebaranItems.filter((i) => i.checked),
);

const DAMAGE_COLORS = {
  "Rusak Ringan": "#10b981",
  "Rusak Sedang": "#f59e0b",
  "Rusak Berat": "#ef4444",
  Hanyut: "#a855f7",
  "Tidak Diketahui": "#64748b",
};
const getDamageColor = (label) => DAMAGE_COLORS[label] || "#64748b";

const getInfraColor = (type) => {
  const colors = {
    pendidikan: "#3b82f6",
    kesehatan: "#ef4444",
    ekonomi: "#10b981",
    sosial: "#a855f7",
  };
  return colors[type] || "#3b82f6";
};

const getInfraIcon = (type) => {
  const cls = "w-3 h-3 text-white";
  if (type === "pendidikan")
    return `<svg class="${cls}" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/></svg>`;
  if (type === "kesehatan")
    return `<svg class="${cls}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
  if (type === "ekonomi")
    return `<svg class="${cls}" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" /></svg>`;
  if (type === "sosial")
    return `<svg class="${cls}" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>`;
  return `<div class="w-2 h-2 bg-white rounded-full"></div>`;
};

// ================= LOGIC CHOROPLETH =================
const internalMapOpacity = computed({
  get: () => props.choroplethOpacity,
  set: (val) => emit("update:choroplethOpacity", val),
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
