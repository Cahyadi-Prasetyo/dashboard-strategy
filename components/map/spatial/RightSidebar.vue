<template>
  <div
    class="flex flex-col h-full bg-white w-full border-l border-gray-200 shadow-xl"
  >
    <div class="shrink-0 bg-white border-b border-gray-200">
      <div v-if="tabs.length > 1" class="flex px-4 pt-4 gap-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="pb-3 text-sm font-bold border-b-2 transition-colors relative"
          :class="
            activeTab === tab.id
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          "
        >
          {{ tab.label }}
          <span
            v-if="tab.id === 'koordinat' && location"
            class="absolute -top-1 -right-2 flex h-2 w-2"
          >
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-red-500"
            ></span>
          </span>
        </button>
      </div>

      <div
        v-else-if="tabs.length === 1"
        class="px-4 py-4 border-b border-gray-100"
      >
        <h3 class="font-bold text-gray-800 flex items-center gap-2">
          <UIcon :name="tabs[0].icon" class="w-5 h-5 text-amber-500" />
          {{ tabs[0].label }}
        </h3>
      </div>
    </div>

    <div class="flex-1 overflow-hidden relative bg-gray-50">
      <Transition name="fade" mode="out-in">
        <div
          v-if="activeTab === 'statistik'"
          class="h-full overflow-y-auto custom-scrollbar p-4"
        >
          <MapSpatialSidebarStatistik
            :info="info"
            :dataset-label="datasetLabel"
            :unit="unit"
            :description="description"
            :related-indicators="relatedIndicators"
            :is-loading-related="isLoadingRelated"
            @switch-indicator="$emit('switch-indicator', $event)"
          />
        </div>

        <div v-else-if="activeTab === 'koordinat'" class="h-full flex flex-col">
          <DetailKoordinat
            :selected-location="location"
            :is-filter-complete="isFilterComplete"
            class="border-none shadow-none bg-transparent h-full !p-0"
            @close="$emit('close-location')"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import MapSpatialSidebarStatistik from "~/components/map/spatial/SidebarStatistik.vue"; // Component baru (lihat poin 2)
// Import DetailKoordinat sudah global atau import manual jika perlu

const props = defineProps({
  info: { type: Object, default: null }, // Data Wilayah (Statistik)
  location: { type: Object, default: null }, // Data Marker (Koordinat)

  // Props penerus untuk Statistik
  datasetLabel: String,
  unit: String,
  description: String,
  relatedIndicators: Array,
  isLoadingRelated: Boolean,

  // Props penerus untuk Koordinat
  isFilterComplete: Boolean,
});

const emit = defineEmits(["close", "close-location", "switch-indicator"]);

const activeTab = ref("statistik");

// Logic Tab Dinamis
const tabs = computed(() => {
  const list = [];
  if (props.info) {
    list.push({
      id: "statistik",
      label: "Info Statistik",
      icon: "i-heroicons-chart-bar",
    });
  }
  if (props.location || !props.isFilterComplete) {
    // Tampilkan tab koordinat jika ada lokasi terpilih ATAU jika filter belum lengkap (state awal sidebar)
    list.push({
      id: "koordinat",
      label: "Detail Koordinat",
      icon: "i-heroicons-map-pin",
    });
  }
  return list;
});

// Auto Switch Tab logic
watch(
  () => props.location,
  (val) => {
    if (val) activeTab.value = "koordinat";
  },
);

watch(
  () => props.info,
  (val) => {
    if (val && !props.location) activeTab.value = "statistik";
  },
);

// Fallback jika tab aktif tiba-tiba hilang datanya
watch(
  tabs,
  (newTabs) => {
    if (!newTabs.find((t) => t.id === activeTab.value)) {
      if (newTabs.length > 0) activeTab.value = newTabs[0].id;
    }
  },
  { deep: true },
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
