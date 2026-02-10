<template>
    <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full"
    >
        <div class="p-3 border-b border-gray-100 flex-none">
            <div class="flex items-center justify-between mb-2">
                <h3
                    class="text-sm font-bold text-gray-900 flex items-center gap-2"
                >
                    <UIcon
                        name="i-heroicons-map"
                        class="w-4 h-4 text-amber-500"
                    />
                    <span class="line-clamp-1">
                        {{ datasetInfo?.judul || "Perbandingan Wilayah" }}
                    </span>
                </h3>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <div class="space-y-0.5">
                    <label
                        class="text-[9px] font-semibold text-gray-400 uppercase"
                        >Indikator</label
                    >
                    <USelectMenu
                        v-model="selectedIndikator"
                        :items="availableIndikator"
                        size="xs"
                    />
                </div>
                <div class="space-y-0.5">
                    <label
                        class="text-[9px] font-semibold text-gray-400 uppercase"
                        >Tahun</label
                    >
                    <USelectMenu
                        v-model="selectedYear"
                        :items="availableYears"
                        size="xs"
                    />
                </div>
            </div>
        </div>

        <div class="p-3 flex-1 min-h-0 flex flex-col relative">
            <div
                v-if="loading"
                class="absolute inset-0 p-3 flex flex-col justify-end gap-2 bg-white z-10"
            >
                <div class="flex flex-col gap-2 h-full justify-center">
                    <USkeleton class="h-4 w-3/4 rounded" />
                    <USkeleton class="h-4 w-1/2 rounded" />
                    <USkeleton class="h-4 w-5/6 rounded" />
                    <USkeleton class="h-4 w-2/3 rounded" />
                    <USkeleton class="h-4 w-full rounded" />
                </div>
            </div>

            <div v-else class="flex-1 min-h-0">
                <ChartsBarChart
                    :categories="chartData.categories"
                    :series="chartSeries"
                    horizontal
                    class="h-full w-full"
                    :grid="{ top: 10, bottom: 20, left: 10, right: 30 }"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import BarChart from "~/components/charts/BarChart.vue";
import { useDynamicChartTransformer } from "~/composables/useDynamicChartTransformer";
import { useDatasetConfig } from "~/composables/useDatasetConfig";

const props = defineProps({
    rawRecords: { type: Array, default: () => [] },
    selectedWilayah: { type: Object, required: true },
    loading: { type: Boolean, default: false },
    datasetInfo: { type: Object, default: () => null },
});

const { getConfig } = useDatasetConfig();
const { extractUniqueValues, formatValue } = useDynamicChartTransformer();
const config9 = getConfig(9);

const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(isoString));
};

const selectedYear = ref("");
const selectedIndikator = ref("");
const selectedTriwulan = ref("");

// Computed Filters
const availableYears = computed(() =>
    extractUniqueValues(props.rawRecords, config9.chart.yearField),
);
const availableIndikator = computed(() =>
    extractUniqueValues(props.rawRecords, config9.chart.indikatorField),
);
const availableTriwulan = computed(() =>
    extractUniqueValues(props.rawRecords, config9.chart.periodField),
);

// Auto Select
watch(
    [availableYears, availableIndikator, availableTriwulan],
    ([years, indikator, triwulan]) => {
        if (years.length > 0 && !selectedYear.value)
            selectedYear.value = years[0];
        if (indikator.length > 0 && !selectedIndikator.value)
            selectedIndikator.value = indikator[0];
        if (triwulan.length > 0 && !selectedTriwulan.value)
            selectedTriwulan.value = triwulan[0];
    },
    { immediate: true },
);

// --- LOGIC LAMA (AGGREGATION) YANG TERBUKTI MUNCUL ---
const aggregateByRegion = (records, level) => {
    const map = new Map();
    records.forEach((r) => {
        let key, name;

        // Logic Penentuan Wilayah
        if (level === "kabupaten") {
            // Jika level Kabupaten: Ambil kd_kab
            if (r.kd_kab?.kode) {
                key = r.kd_kab.kode;
                name = r.kd_kab.nama;
            } else {
                // Fallback jika data tidak punya kd_kab proper
                key = r.kabupaten?.kode || "n/a";
                name = r.kabupaten?.nama || r.nama_kab || "Kab. Lainnya";
            }
        } else {
            // Jika level Provinsi (atau Nasional)
            if (r.kd_prov?.kode) {
                key = r.kd_prov.kode;
                name = r.kd_prov.nama;
            } else if (r.kd_kab?.kode) {
                // Fallback: Ambil 2 digit pertama kode kab sebagai kode provinsi
                key = String(r.kd_kab.kode).substring(0, 2);
                name = r.provinsi?.nama || r.nama_prov || `Provinsi ${key}`;
            } else {
                key = "n/a";
            }
        }

        if (key === "n/a") return;

        // Inisialisasi Map jika belum ada
        if (!map.has(key)) {
            map.set(key, { name: name || key, value: 0 });
        }

        // Agregasi Nilai (Sum)
        const val = Number(r.value);
        if (!isNaN(val)) {
            map.get(key).value += val;
        }
    });

    // Urutkan dari nilai terbesar
    return Array.from(map.values())
        .map((item) => ({
            name: item.name,
            value: Number(item.value.toFixed(2)),
        }))
        .sort((a, b) => b.value - a.value);
};

const chartRegionLevel = computed(() => {
    if (props.selectedWilayah.kabupaten?.length > 0) return "kabupaten";
    return "provinsi";
});

const chartData = computed(() => {
    if (props.loading || !props.rawRecords.length)
        return { categories: [], data: [] };

    // 1. Filter Data
    const filtered = props.rawRecords.filter((r) => {
        const matchYear =
            r[config9.chart.yearField]?.nama === selectedYear.value;
        const matchIndikator = r.indikator?.nama === selectedIndikator.value;
        const matchPeriod =
            r[config9.chart.periodField]?.nama === selectedTriwulan.value;
        return matchYear && matchIndikator && matchPeriod;
    });

    // 2. Agregasi Data (Old Logic)
    const aggregated = aggregateByRegion(filtered, chartRegionLevel.value);

    return {
        categories: aggregated.map((d) => d.name),
        data: aggregated.map((d) => d.value),
    };
});

const chartSeries = computed(() => [
    {
        name: selectedIndikator.value || "PDRB",
        data: chartData.value.data,
        color: "#F59E0B",
        showLabel: true,
        labelFormatter: (params) => formatValue(params.value),
    },
]);
</script>
