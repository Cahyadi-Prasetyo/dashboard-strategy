<template>
  <div v-if="info" class="space-y-4">
    <div class="border-b border-gray-100 pb-3">
      <UBadge
        v-if="regionLevelLabel"
        color="primary"
        variant="subtle"
        size="xs"
        class="mb-1.5 font-extrabold tracking-wider rounded-md"
        :ui="{ rounded: 'rounded-md' }"
      >
        {{ regionLevelLabel }}
      </UBadge>

      <h3 class="font-bold text-gray-900 text-xl leading-tight mb-2">
        {{ info.name }}
      </h3>

      <div
        v-if="parentDetails.length > 0"
        class="flex flex-col gap-1 bg-gray-50/50 p-2 rounded-lg border border-gray-100/50"
      >
        <div
          v-for="(detail, idx) in parentDetails"
          :key="idx"
          class="flex items-baseline gap-2 text-xs text-gray-600"
        >
          <span class="opacity-60 w-20 shrink-0 font-medium">{{
            detail.label
          }}</span>
          <span class="font-semibold text-gray-800 truncate"
            >: {{ detail.value }}</span
          >
        </div>
      </div>
    </div>

    <div>
      <div class="flex flex-wrap items-center gap-1.5 mb-3">
        <span
          v-if="datasetLabel"
          class="text-[10px] font-bold bg-gray-800 text-white px-2 py-0.5 rounded border border-gray-700 shadow-sm"
        >
          {{ datasetLabel }}
        </span>
        <template v-if="info.context">
          <span
            v-for="(val, key) in info.context"
            :key="key"
            class="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200"
          >
            {{ key === "Tahun" ? key + ": " : "" }}{{ val }}
          </span>
        </template>
      </div>

      <div class="flex items-end gap-2 mb-3">
        <span
          class="text-3xl font-extrabold text-gray-900 tracking-tight leading-none"
        >
          {{ info.value }}
        </span>
        <span
          class="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 mb-1 shadow-sm"
        >
          {{ unit }}
        </span>
      </div>
    </div>

    <div
      v-if="sortedBreakdown && sortedBreakdown.length > 1"
      class="mb-3 border rounded-lg overflow-hidden border-gray-200 shadow-sm"
    >
      <div
        class="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex justify-between items-center"
      >
        <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Rincian Data
        </p>
        <span class="text-[9px] text-gray-400 italic">
          {{ sortedBreakdown.length }} Kategori
        </span>
      </div>

      <div class="max-h-[300px] overflow-y-auto custom-scrollbar bg-white">
        <div class="text-xs">
          <div
            v-for="(parent, idx) in sortedBreakdown"
            :key="idx"
            class="border-b border-gray-100 last:border-0"
          >
            <div
              class="flex justify-between items-start px-3 py-2 transition-colors select-none"
              :class="[
                hasChildren(parent) ? 'cursor-pointer hover:bg-gray-50' : '',
                isExpanded(idx) ? 'bg-amber-50/50' : '',
              ]"
              @click="toggleRow(idx, parent)"
            >
              <div class="flex gap-2 flex-1">
                <div
                  v-if="hasChildren(parent)"
                  class="mt-0.5 text-gray-400 shrink-0"
                >
                  <UIcon
                    :name="
                      isExpanded(idx)
                        ? 'i-heroicons-chevron-down'
                        : 'i-heroicons-chevron-right'
                    "
                    class="w-3.5 h-3.5 transition-transform"
                  />
                </div>
                <div v-else class="w-3.5 shrink-0"></div>
                <span class="font-medium text-gray-700 leading-snug">
                  {{ parent.label === "Total" ? "Jumlah Total" : parent.label }}
                </span>
              </div>
              <span class="font-bold text-gray-900 ml-3 whitespace-nowrap">
                {{ formatNumber(parent.value) }}
              </span>
            </div>

            <div
              v-if="isExpanded(idx) && hasChildren(parent)"
              class="bg-gray-50/80 border-t border-dashed border-gray-200 pl-4 animate-fade-in"
            >
              <div
                v-for="(child, cIdx) in sortChildren(parent.children)"
                :key="cIdx"
                class="flex justify-between items-center px-3 py-1.5 border-b border-gray-100/50 last:border-0 hover:bg-gray-100/50"
              >
                <div
                  class="flex items-center gap-2 pl-4 border-l-2 border-gray-300"
                >
                  <span class="text-[11px] text-gray-600 leading-tight">
                    {{ child.label }}
                  </span>
                </div>
                <span
                  class="text-[11px] font-semibold text-gray-800 whitespace-nowrap"
                >
                  {{ formatNumber(child.value) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="description"
      class="pt-2 border-t border-gray-100 text-xs text-gray-500 italic leading-relaxed"
    >
      {{ description }}
    </div>

    <div
      v-if="relatedIndicators && relatedIndicators.length > 0"
      class="mt-3 pt-2 border-t border-gray-100"
    >
      <div class="flex items-center justify-between mb-1.5 px-0.5">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Indikator Terkait
        </p>
        <UIcon
          v-if="isLoadingRelated"
          name="i-heroicons-arrow-path"
          class="w-3 h-3 text-amber-500 animate-spin"
        />
      </div>
      <div
        class="flex flex-col gap-1 max-h-[140px] overflow-y-auto custom-scrollbar pr-1"
      >
        <button
          v-for="ind in relatedIndicators"
          :key="ind.id_indikator"
          @click="$emit('switch-indicator', ind)"
          class="w-full text-left px-2.5 py-3 rounded bg-gray-50 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all duration-200 group relative overflow-hidden cursor-pointer"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex-1 min-w-0">
              <span
                class="text-[11px] text-gray-600 group-hover:text-amber-800 font-medium line-clamp-2 leading-tight"
              >
                {{ ind.label }}
              </span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <template v-if="isLoadingRelated && !ind.formattedValue">
                <div class="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
              </template>
              <template v-else>
                <span
                  class="text-[10px] font-bold text-gray-900 group-hover:text-amber-700 whitespace-nowrap"
                >
                  {{ ind.formattedValue || "-" }}
                </span>
                <span
                  v-if="ind.unit"
                  class="text-[9px] text-gray-400 font-medium whitespace-nowrap"
                >
                  {{ ind.unit }}
                </span>
              </template>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  info: { type: Object, default: null },
  datasetLabel: { type: String, default: "" },
  unit: { type: String, default: "" },
  description: { type: String, default: "" },
  relatedIndicators: { type: Array, default: () => [] },
  isLoadingRelated: { type: Boolean, default: false },
});

const emit = defineEmits(["switch-indicator"]);

const formatNumber = (num) => {
  if (num === null || num === undefined) return "-";
  return new Intl.NumberFormat("id-ID").format(num);
};

// --- LOGIC BARU: Label Level ---
const regionLevelLabel = computed(() => {
  const level = props.info?.level;
  if (!level) return null;

  switch (level) {
    case "prov":
      return "PROVINSI";
    case "kab":
      return "KABUPATEN/KOTA";
    case "kec":
      return "KECAMATAN";
    case "desa":
      return "DESA/KELURAHAN";
    default:
      return "WILAYAH";
  }
});

// --- LOGIC BARU: List Parent Hierarchy ---
// Menampilkan parent di atasnya berdasarkan level saat ini
const parentDetails = computed(() => {
  if (!props.info?.details || !props.info?.level) return [];

  const level = props.info.level;
  const d = props.info.details;
  const parents = [];

  // Urutan hierarki: Provinsi -> Kabupaten -> Kecamatan

  // Jika levelnya Kab, Kec, atau Desa -> Tampilkan Provinsi
  if (["kab", "kec", "desa"].includes(level) && d.provinsi) {
    parents.push({ label: "Provinsi", value: d.provinsi });
  }

  // Jika levelnya Kec atau Desa -> Tampilkan Kab/Kota
  if (["kec", "desa"].includes(level) && d.kabupaten) {
    parents.push({ label: "Kab/Kota", value: d.kabupaten });
  }

  // Jika levelnya Desa -> Tampilkan Kecamatan
  if (level === "desa" && d.kecamatan) {
    parents.push({ label: "Kecamatan", value: d.kecamatan });
  }

  return parents;
});

// --- LOGIC BREAKDOWN (Existing) ---
const expandedRows = ref({});

const sortedBreakdown = computed(() => {
  if (!props.info?.breakdown) return [];

  const items = [...props.info.breakdown];

  // --- LOGIC 1: Urutan Waktu (Tahunan & Triwulan) ---
  const isTimeData = items.some((item) => {
    const l = (item.label || "").toLowerCase();
    return l.includes("triwulan") || l.includes("tahunan");
  });

  if (isTimeData) {
    // Fungsi untuk memberi bobot urutan (0 paling atas)
    // PENTING: Cek dari IV ke I agar "Triwulan IV" tidak terdeteksi sebagai "Triwulan I"
    const getTimeWeight = (label) => {
      const l = (label || "").toLowerCase();
      if (l.includes("tahunan")) return 0; // Paling Atas
      if (l.includes("triwulan iv")) return 4; // Paling Bawah
      if (l.includes("triwulan iii")) return 3;
      if (l.includes("triwulan ii")) return 2;
      if (l.includes("triwulan i")) return 1; // Di bawah Tahunan
      return 999; // Lainnya (tidak dikenal) taruh paling bawah
    };

    return items.sort((a, b) => {
      const weightA = getTimeWeight(a.label);
      const weightB = getTimeWeight(b.label);

      // Jika bobot beda, urutkan Ascending (0, 1, 2, 3, 4)
      if (weightA !== weightB) {
        return weightA - weightB;
      }

      // Jika bobot sama (fallback), urutkan berdasar nilai terbesar
      return b.value - a.value;
    });
  }

  // --- LOGIC 2: Urutan Kerusakan (Existing) ---
  const damageOrder = [
    "ringan",
    "sedang",
    "berat",
    "hanyut",
    "lainnya",
    "tidak ada informasi",
  ];

  const hasDamageTerms = items.some((item) => {
    const l = (item.label || "").toLowerCase();
    return damageOrder.some((term) => l.includes(term));
  });

  if (hasDamageTerms) {
    return items.sort((a, b) => {
      const labelA = (a.label || "").toLowerCase();
      const labelB = (b.label || "").toLowerCase();

      let indexA = damageOrder.findIndex((key) => labelA.includes(key));
      let indexB = damageOrder.findIndex((key) => labelB.includes(key));

      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;

      if (indexA !== indexB) {
        return indexA - indexB;
      }
      return b.value - a.value;
    });
  }

  // --- LOGIC 3: Default (Value Terbesar) ---
  return items.sort((a, b) => b.value - a.value);
});

const hasChildren = (item) => {
  return item.children && item.children.length > 0;
};

const isExpanded = (index) => {
  return !!expandedRows.value[index];
};

const toggleRow = (index, item) => {
  if (hasChildren(item)) {
    expandedRows.value[index] = !expandedRows.value[index];
  }
};

const sortChildren = (children) => {
  if (!children) return [];
  return [...children].sort((a, b) => b.value - a.value);
};

watch(
  () => props.info,
  () => {
    expandedRows.value = {};
  },
);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
