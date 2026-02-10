<template>
   <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative">
      <div class="flex items-center justify-between mb-6">
         <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg text-blue-500 bg-blue-50">
               <UIcon name="i-heroicons-square-3-stack-3d" class="w-5 h-5" />
            </div>
            <div>
               <h4 class="font-bold text-gray-800 text-sm">
                  Jumlah penduduk 5 tahun ke atas yang masih sekolah menurut status keaktifan bersekolah
               </h4>
               <div class="flex flex-wrap items-center gap-2 text-sm">
                  <UBadge color="primary" variant="subtle" size="xs">
                     Hasil Pendataan
                  </UBadge>

                  <UBadge color="primary" variant="subtle" size="xs">
                     Badan Pusat Statistik
                  </UBadge>

                  <span class="text-xs text-gray-500 flex items-center gap-1 ml-1">
                     <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
                     Diperbarui: {{ informationDate.pendataan_pkl_last_update }}
                  </span>
               </div>
            </div>
         </div>
      </div>

      <div v-if="pendingPerWilayah" class="h-96 flex flex-col items-center justify-center gap-4">
         <div class="flex items-end gap-2 h-full w-full px-8 pb-8">
            <USkeleton class="w-full h-[40%]" />
            <USkeleton class="w-full h-[70%]" />
            <USkeleton class="w-full h-[50%]" />
            <USkeleton class="w-full h-[80%]" />
            <USkeleton class="w-full h-[60%]" />
         </div>
      </div>

      <div v-else-if="chartSeries.length > 0">
         <BarChart :categories="wilayahLabels" :series="chartSeries" stacked height="h-96" :show-legend="true"
            legend-position="top" />
      </div>

      <div v-else class="h-96 flex items-center justify-center">
         <p class="text-gray-400">Tidak ada data</p>
      </div>

      <!-- Info Box -->
      <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
         <div class="flex items-start gap-2">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div class="text-xs text-blue-800">
               <p class="font-semibold mb-1">Tentang Data:</p>
               <p>
                  Menampilkan jumlah penduduk berdasarkan status keaktifan bersekolah (aktif dan tidak aktif)
               </p>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { computed, watch } from "vue";
import BarChart from "~/components/charts/BarChart.vue";
import informationDate from "~/data/information-date.json";

const props = defineProps({
   regionIds: { type: Array, required: true, default: () => [] },
   tahun: { type: Number, default: 2026 },
});

const indicatorIds = [
   "penduduk_diatas_5_tahun_sekolah",
   "penduduk_diatas_5_tahun_tidak_sekolah",
];

// --- FETCH DATA PER WILAYAH ---
const {
   data: dataPerWilayah,
   pending: pendingPerWilayah,
   refresh,
} = useFetch("/api/data-per-wilayah", {
   method: "POST",
   lazy: true,
   body: computed(() => ({
      regionIds: props.regionIds,
      indicatorIds,
      tahun: props.tahun,
   })),
   watch: false, // Disable auto-watch, we'll manually refresh
});

// Watch for changes in regionIds
watch(
   [() => props.regionIds],
   () => {
      refresh();
   },
   { deep: true, immediate: true },
);

// --- COMPUTED PROPS ---
const wilayahLabels = computed(() => {
   if (!dataPerWilayah.value) return [];
   return dataPerWilayah.value.map((w) => w.nama);
});

// Mapping data to series
const chartSeries = computed(() => {
   if (!dataPerWilayah.value || !dataPerWilayah.value.length) return [];

   return [
      {
         name: "Aktif Sekolah",
         data: dataPerWilayah.value.map(
            (w) => w.penduduk_diatas_5_tahun_sekolah || 0
         ),
         color: "#10B981", // Green
      },
      {
         name: "Tidak Aktif Sekolah",
         data: dataPerWilayah.value.map(
            (w) => w.penduduk_diatas_5_tahun_tidak_sekolah || 0
         ),
         color: "#EF4444", // Red
      },
   ];
});
</script>
