<template>
  <div
    v-if="info"
    class="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 pointer-events-auto"
    :class="[isCollapsed ? 'w-auto min-w-[200px]' : 'min-w-[280px] max-w-xs']"
  >
    <div class="cursor-pointer group" @click="toggleCollapse">
      <div
        class="flex items-start justify-between gap-2"
        :class="{ 'mb-2 border-b border-gray-100 pb-2': !isCollapsed }"
      >
        <div class="flex-1 min-w-0">
          <p
            class="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5"
          >
            Info Statistik
          </p>
          <h3 class="font-bold text-gray-900 text-lg leading-tight truncate">
            {{ info.name }}
          </h3>
          <div
            v-if="hasRegionDetails && !isCollapsed"
            class="mt-1 flex flex-col gap-0.5 animate-fade-in"
          >
            <div
              v-if="info.details.kecamatan"
              class="flex items-center gap-1 text-xs text-gray-600"
            >
              <span class="opacity-70">Kec.</span>
              <span class="font-medium">{{ info.details.kecamatan }}</span>
            </div>
            <div
              v-if="info.details.kabupaten"
              class="flex items-center gap-1 text-xs text-gray-600"
            >
              <span class="opacity-70">Kab/Kota.</span>
              <span class="font-medium">{{ info.details.kabupaten }}</span>
            </div>
            <div
              v-if="info.details.provinsi && !info.details.kabupaten"
              class="flex items-center gap-1 text-xs text-gray-600"
            >
              <span class="opacity-70">Prov.</span>
              <span class="font-medium">{{ info.details.provinsi }}</span>
            </div>
          </div>
        </div>
        <div
          v-if="!isHoverMode"
          class="text-gray-400 group-hover:text-amber-500 transition-colors mt-1"
        >
          <UIcon
            :name="
              isCollapsed
                ? 'i-heroicons-chevron-down'
                : 'i-heroicons-chevron-up'
            "
            class="w-5 h-5 transition-transform duration-300"
          />
        </div>
      </div>
    </div>

    <div v-show="!isCollapsed" class="animate-fade-in">
      <div class="flex flex-wrap items-center gap-1.5 mb-3">
        <span
          v-if="datasetLabel"
          class="text-[10px] font-bold bg-gray-800 text-white px-2 py-0.5 rounded border border-gray-700 shadow-sm line-clamp-1 max-w-full"
        >
          {{ datasetLabel }}
        </span>
        <template v-if="info.context">
          <span
            v-for="(val, key) in info.context"
            :key="key"
            class="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 max-w-full break-all whitespace-normal"
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

      <div
        v-if="sortedBreakdown && sortedBreakdown.length > 1"
        class="mb-3 border rounded-lg overflow-hidden border-gray-200 shadow-sm"
      >
        <div
          class="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex justify-between items-center"
        >
          <p
            class="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
          >
            Rincian Data
          </p>
          <span class="text-[9px] text-gray-400 italic"
            >{{ sortedBreakdown.length }} Kategori</span
          >
        </div>

        <div class="max-h-[200px] overflow-y-auto custom-scrollbar bg-white">
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
                    {{
                      parent.label === "Total" ? "Jumlah Total" : parent.label
                    }}
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
                    <span class="text-[11px] text-gray-600 leading-tight">{{
                      child.label
                    }}</span>
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
          <p
            class="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
          >
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
            class="w-full text-left px-2.5 py-4 rounded bg-gray-50 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all duration-200 group relative overflow-hidden cursor-pointer"
          >
            <div class="flex items-center justify-between gap-3 -mt-3">
              <div class="flex-1 min-w-0">
                <span
                  class="text-[10px] text-gray-600 group-hover:text-amber-800 font-medium line-clamp-2 leading-tight"
                  >{{ ind.label }}</span
                >
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <template v-if="isLoadingRelated && !ind.formattedValue">
                  <div class="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                </template>
                <template v-else>
                  <span
                    class="text-[10px] font-bold text-gray-900 group-hover:text-amber-700 whitespace-nowrap"
                    >{{ ind.formattedValue || "-" }}</span
                  >
                  <span
                    v-if="ind.unit"
                    class="text-[9px] text-gray-400 font-medium whitespace-nowrap"
                    >{{ ind.unit }}</span
                  >
                </template>
              </div>
            </div>
          </button>
        </div>
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
  canExport: { type: Boolean, default: false },
  isHoverMode: { type: Boolean, default: false },
});

const emit = defineEmits(["switch-indicator", "export-excel"]);

const formatNumber = (num) => {
  if (num === null || num === undefined) return "-";
  return new Intl.NumberFormat("id-ID").format(num);
};

const isCollapsed = ref(false);
const expandedRows = ref({}); // State untuk melacak row mana yang terbuka

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// Reset state saat info berubah
watch(
  () => props.info,
  () => {
    isCollapsed.value = false;
    expandedRows.value = {};
  },
);

const hasRegionDetails = computed(() => {
  return (
    props.info?.details &&
    (props.info.details.kecamatan ||
      props.info.details.kabupaten ||
      props.info.details.provinsi)
  );
});

// Sorting Parent (Nilai Terbesar di Atas)
const sortedBreakdown = computed(() => {
  if (!props.info?.breakdown) return [];
  return [...props.info.breakdown].sort((a, b) => b.value - a.value);
});

// Helper functions for hierarchy
const hasChildren = (item) => {
  return item.children && item.children.length > 0;
};

const isExpanded = (index) => {
  return !!expandedRows.value[index];
};

const toggleRow = (index, item) => {
  if (hasChildren(item)) {
    // Toggle state boolean
    expandedRows.value[index] = !expandedRows.value[index];
  }
};

const sortChildren = (children) => {
  if (!children) return [];
  return [...children].sort((a, b) => b.value - a.value);
};
</script>

<style scoped>
/* Sama seperti sebelumnya */
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
