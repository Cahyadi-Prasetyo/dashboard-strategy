<template>
  <div
    v-if="hasActiveLayers"
    class="bg-white/95 backdrop-blur rounded-xl border border-gray-200 shadow-lg overflow-hidden pointer-events-auto flex flex-col transition-all duration-300"
    :class="[isCollapsed ? 'w-auto' : 'w-64 max-h-[265px]']"
    @click.stop
    @dblclick.stop
    @mousedown.stop
    @wheel.stop
    @touchstart.stop
  >
    <div
      class="px-3 py-1.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-2 shrink-0 cursor-pointer group select-none hover:bg-gray-100 transition-colors"
      @click="toggleCollapse"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-map" class="w-3.5 h-3.5 text-gray-600" />
        <span
          class="text-[10px] font-bold text-gray-600 uppercase whitespace-nowrap"
        >
          Sebaran Dampak
        </span>
      </div>

      <div class="text-gray-400 group-hover:text-gray-600 transition-colors">
        <UIcon
          :name="
            isCollapsed ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'
          "
          class="w-3.5 h-3.5 transition-transform duration-300"
        />
      </div>
    </div>

    <div
      v-show="!isCollapsed"
      class="overflow-y-auto custom-scrollbar p-3 space-y-4 animate-fade-in"
    >
      <div v-if="bpsLayers.length > 0" class="space-y-3">
        <div class="pb-1 border-b border-gray-100">
          <span class="text-[9px] font-extrabold text-blue-600 tracking-wider">
            Sumber: BPS GeoServer
          </span>
        </div>

        <div v-for="layer in bpsLayers" :key="layer.id" class="space-y-1.5">
          <p class="text-[10px] font-bold text-gray-800 leading-tight">
            {{ layer.name }}
          </p>

          <div class="bg-white rounded border border-gray-100 p-2 space-y-1.5">
            <div
              v-for="(item, idx) in getLegendItems(layer.id)"
              :key="idx"
              class="flex items-start gap-2"
            >
              <span
                class="block shrink-0 mt-0.5 border border-black/10 shadow-sm"
                :class="[
                  item.shape === 'circle'
                    ? 'w-3 h-3 rounded-full'
                    : 'w-3.5 h-3.5 rounded-sm',
                ]"
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
            class="text-[9px] font-extrabold text-sky-500 uppercase tracking-wider leading-tight"
          >
            Sumber: BMKG
          </span>
        </div>

        <div v-for="layer in bmkgLayers" :key="layer.id" class="space-y-1.5">
          <p class="text-[10px] font-bold text-gray-800 leading-tight">
            {{ layer.name }}
          </p>

          <div class="bg-white rounded border border-gray-100 p-2 space-y-1.5">
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
            Sumber: BRIN
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
            class="bg-white rounded border border-gray-100 p-2 flex items-center gap-2"
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
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { additionalLayersConfig } from "~/constants/insight-spatial-data.ts";

const props = defineProps({
  activePmssLayers: { type: Array, default: () => [] },
  activeBrinLayers: { type: Array, default: () => [] },
});

// -- Logic Collapse --
const isCollapsed = ref(false); // Default terbuka
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
// --------------------

// marker: legend items map
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
  // marker: curah hujan legend
  prediksi_curah_hujan_februari_2026: [
    { label: "Sangat Rendah (0-50 mm)", color: "#E2FFCB", shape: "square" },
    { label: "Rendah (51-150 mm)", color: "#32FD32", shape: "square" },
    { label: "Menengah (151-300 mm)", color: "#FFFF32", shape: "square" },
    { label: "Tinggi (301-500 mm)", color: "#FD9A32", shape: "square" },
    { label: "Sangat Tinggi (>500 mm)", color: "#FD3232", shape: "square" },
  ],
};

// marker: computed properties
const bpsLayers = computed(() => {
  return props.activePmssLayers.filter((l) => !l.id.includes("curah_hujan"));
});

const bmkgLayers = computed(() => {
  return props.activePmssLayers.filter((l) => l.id.includes("curah_hujan"));
});

const computedBrinLayers = computed(() => {
  return props.activeBrinLayers
    .map((id) => additionalLayersConfig.find((l) => l.id === id))
    .filter(Boolean);
});

const hasActiveLayers = computed(() => {
  return props.activePmssLayers.length > 0 || props.activeBrinLayers.length > 0;
});

// marker: helper function
const getLegendItems = (layerId) => {
  return (
    LEGEND_ITEMS_MAP[layerId] || [
      { label: "Data Layer", color: "#9CA3AF", shape: "square" },
    ]
  );
};
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
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animasi Fade In */
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
