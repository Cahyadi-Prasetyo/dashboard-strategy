<template>
    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg text-blue-500 bg-blue-50">
                    <UIcon name="i-heroicons-square-3-stack-3d" class="w-5 h-5" />
                </div>
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">
                        Jumlah Keluarga Terdampak Menurut Daerah dan Kondisi
                        Bangunan Tempat Tinggal yang Ditempati Setelah Bencana
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
            <BarChart chartTitle="" :categories="wilayahLabels" :series="chartSeries" height="h-96" stacked
                :show-legend="true" legend-position="top" />
        </div>

        <div v-else class="h-96 flex items-center justify-center">
            <p class="text-gray-400">Tidak ada data</p>
        </div>
    </div>
</template>

<script setup>
import { computed, toRef } from "vue";
import BarChart from "~/components/charts/BarChart.vue";
import informationDate from "~/data/information-date.json";

const props = defineProps({
    regionIds: { type: Array, required: true, default: () => [] },
    tahun: { type: Number, default: 2026 },
});

// --- DEFINISI INDICATORS ---
const indicators = [
    "keberadaan_tempat_tinggal_tidak_terdampak",
    "keberadaan_tempat_tinggal_terdampak_tidak_perbaikan",
    "keberadaan_tempat_tinggal_terdampak_perlu_perbaikan",
    "keberadaan_tempat_tinggal_terdampak_rusak",
    "keberadaan_tempat_tinggal_hilang",
];

// --- FETCH DATA PER WILAYAH (Same approach as Keluarga.vue) ---
const { data: dataPerWilayah, pending: pendingPerWilayah } = useFetch(
    "/api/data-per-wilayah",
    {
        method: "POST",
        lazy: true,
        body: {
            regionIds: toRef(props, "regionIds"),
            indicatorIds: indicators,
            tahun: toRef(props, "tahun"),
        },
    },
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
            name: "Tidak Terdampak",
            data: dataPerWilayah.value.map(
                (w) => w.keberadaan_tempat_tinggal_tidak_terdampak || 0,
            ),
            color: "#10B981", // Emerald
        },
        {
            name: "Tidak Perlu Perbaikan",
            data: dataPerWilayah.value.map(
                (w) =>
                    w.keberadaan_tempat_tinggal_terdampak_tidak_perbaikan || 0,
            ),
            color: "#3B82F6", // Blue
        },
        {
            name: "Perlu Perbaikan",
            data: dataPerWilayah.value.map(
                (w) =>
                    w.keberadaan_tempat_tinggal_terdampak_perlu_perbaikan || 0,
            ),
            color: "#F59E0B", // Amber
        },
        {
            name: "Rusak",
            data: dataPerWilayah.value.map(
                (w) => w.keberadaan_tempat_tinggal_terdampak_rusak || 0,
            ),
            color: "#F97316", // Orange
        },
        {
            name: "Hilang",
            data: dataPerWilayah.value.map((w) => w.tinggal_hilang || 0),
            color: "#EF4444", // Red
        },
    ];
});
</script>
