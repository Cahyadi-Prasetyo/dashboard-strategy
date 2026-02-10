<template>
  <div
    class="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-gray-200 shadow-lg transition-all duration-300 pointer-events-auto"
    :class="[isCollapsed ? 'w-auto' : 'w-56']"
    @click.stop
    @dblclick.stop
    @mousedown.stop
    @wheel.stop
    @touchstart.stop
  >
    <div
      class="flex items-center justify-between gap-2 cursor-pointer group select-none"
      :class="{ 'mb-2 border-b border-gray-200 pb-2': !isCollapsed }"
      @click="toggleCollapse"
    >
      <div class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-amber-500" />
        <span
          class="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap"
        >
          Sebaran Titik
        </span>
      </div>

      <div class="text-gray-400 group-hover:text-amber-500 transition-colors">
        <UIcon
          :name="
            isCollapsed ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'
          "
          class="w-4 h-4 transition-transform duration-300"
        />
      </div>
    </div>

    <div v-show="!isCollapsed" class="animate-fade-in">
      <div class="mb-3 px-1">
        <label class="flex items-center justify-between cursor-pointer group">
          <span
            class="text-[10px] font-semibold text-gray-700 group-hover:text-gray-900"
          >
            Hanya Foto Lengkap
          </span>
          <USwitch
            v-model="localShowPhotosOnly"
            size="xs"
            color="primary"
            @update:model-value="$emit('update:showPhotosOnly', $event)"
          />
        </label>
      </div>

      <div class="space-y-2 border-t border-gray-100 pt-2">
        <div v-for="ind in activeItems" :key="'leg-' + ind.id">
          <div v-if="ind.data_key === 'keluarga'" class="space-y-1">
            <p
              class="text-[10px] font-bold text-gray-800 mb-1 leading-tight border-b border-gray-50 pb-1"
            >
              {{ ind.label }}
            </p>

            <div
              v-for="sub in ind.selectedJenisInfra"
              :key="sub"
              class="flex items-center gap-2 pl-1"
            >
              <div
                :style="{ backgroundColor: getDamageColor(sub) }"
                class="w-2.5 h-2.5 rounded-full border border-white shadow-sm flex-shrink-0"
              ></div>
              <span
                class="text-[10px] font-medium text-gray-600 leading-tight line-clamp-1"
              >
                {{ sub }}
              </span>
            </div>
            <p
              v-if="ind.selectedJenisInfra.length === 0"
              class="text-[9px] text-gray-400 italic pl-1"
            >
              Pilih kategori kerusakan
            </p>
          </div>

          <div v-else class="flex items-start gap-2">
            <div
              class="w-6 h-6 rounded border border-white shadow-sm flex-shrink-0 flex items-center justify-center"
              :style="{ backgroundColor: getInfraColor(ind.data_key) }"
              v-html="getInfraIcon(ind.data_key)"
            ></div>
            <span
              class="text-[10px] font-medium text-gray-700 leading-tight line-clamp-2 mt-0.5"
            >
              {{ ind.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  items: { type: Array, default: () => [] },
  showPhotosOnly: { type: Boolean, default: false },
});

const emit = defineEmits(["update:showPhotosOnly"]);

// State untuk collapse (Default false / terbuka)
const isCollapsed = ref(false);

// Fungsi toggle
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const localShowPhotosOnly = ref(props.showPhotosOnly);

watch(
  () => props.showPhotosOnly,
  (val) => {
    localShowPhotosOnly.value = val;
  },
);

const activeItems = computed(() => props.items.filter((i) => i.checked));

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
  const cls = "w-3.5 h-3.5 text-white";
  if (type === "pendidikan") {
    return `<svg class="${cls}" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/></svg>`;
  }
  if (type === "kesehatan") {
    return `<svg class="${cls}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
  }
  if (type === "ekonomi") {
    return `<svg class="${cls}" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" /></svg>`;
  }
  if (type === "sosial") {
    return `<svg class="${cls}" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>`;
  }
  return `<div class="w-2 h-2 bg-white rounded-full"></div>`;
};
</script>

<style scoped>
/* Tambahkan sedikit animasi fade in */
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
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
