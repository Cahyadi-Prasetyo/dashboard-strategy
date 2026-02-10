<template>
    <div
        class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
    >
        <div class="p-8 border-b border-gray-100">
            <div
                class="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <UBadge color="amber" variant="soft" size="xs"
                            >Dataset 11</UBadge
                        >
                        <h3 class="text-xl font-bold text-gray-900">
                            Heatmap Inflasi & Ekonomi
                        </h3>
                    </div>
                    <p class="text-sm text-gray-500">
                        Distribusi nilai berdasarkan bulan dan sub-sektor
                        ekonomi
                    </p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                    <USelectMenu
                        v-model="selectedYear11"
                        :items="availableYears11"
                        placeholder="Tahun"
                        class="w-32"
                    />
                    <USelectMenu
                        v-model="selectedSektor11"
                        :items="availableSektors11"
                        placeholder="Pilih Sektor"
                        class="w-64"
                    />
                </div>
            </div>
        </div>

        <div class="p-8">
            <div
                v-if="loading"
                class="h-[500px] flex items-center justify-center"
            >
                <USkeleton class="w-full h-full" />
            </div>
            <div v-else-if="heatmapData.data.length > 0">
                <HeatmapProgress
                    :xAxisData="heatmapData.xAxis"
                    :yAxisData="heatmapData.yAxis"
                    :seriesData="heatmapData.data"
                    class="h-[600px]"
                />
            </div>
            <div
                v-else
                class="h-[400px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl"
            >
                <p>Data Heatmap tidak tersedia</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import HeatmapProgress from "~/components/charts/HeatmapProgress.vue";
import { useDynamicChartTransformer } from "~/composables/useDynamicChartTransformer";
import { useDatasetConfig } from "~/composables/useDatasetConfig";

const props = defineProps({
    rawRecords: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
});

const { getConfig } = useDatasetConfig();
const { extractUniqueValues } = useDynamicChartTransformer();
const config11 = getConfig(11);

const selectedYear11 = ref("");
const selectedSektor11 = ref("");

// Computed Filters
const availableYears11 = computed(() =>
    extractUniqueValues(props.rawRecords, config11.chart.yearField),
);
const availableSektors11 = computed(() => {
    const filteredByYear = props.rawRecords.filter(
        (r) => r[config11.chart.yearField]?.nama === selectedYear11.value,
    );
    const source = selectedYear11.value ? filteredByYear : props.rawRecords;
    return extractUniqueValues(source, config11.chart.sektorField);
});

// Auto Select
watch(
    [availableYears11, availableSektors11],
    ([years, sektors]) => {
        if (years.length > 0 && !selectedYear11.value)
            selectedYear11.value = years[0];
        if (sektors.length > 0 && !selectedSektor11.value)
            selectedSektor11.value = sektors[0];
    },
    { immediate: true },
);

// Data Logic
const heatmapData = computed(() => {
    if (
        props.loading ||
        !props.rawRecords.length ||
        !selectedYear11.value ||
        !selectedSektor11.value
    )
        return { xAxis: [], yAxis: [], data: [] };

    const filtered = props.rawRecords.filter((r) => {
        const matchYear =
            r[config11.chart.yearField]?.nama === selectedYear11.value;
        const matchSektor =
            r[config11.chart.sektorField]?.nama === selectedSektor11.value;
        return matchYear && matchSektor && r.value !== null;
    });

    const aggMap = new Map();
    const bulanSet = new Set();
    const subsektorSet = new Set();

    filtered.forEach((r) => {
        const bulan = r[config11.chart.monthField]?.nama;
        const subsektor = r[config11.chart.subsektorField]?.nama;
        const val = Number(r.value) || 0;
        if (bulan && subsektor) {
            bulanSet.add(bulan);
            subsektorSet.add(subsektor);
            const key = `${bulan}|${subsektor}`;
            aggMap.set(key, (aggMap.get(key) || 0) + val);
        }
    });

    const bulanOrder = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];
    const xAxis = bulanOrder.filter((b) => bulanSet.has(b));
    const yAxis = Array.from(subsektorSet).sort();
    const data = [];
    aggMap.forEach((val, key) => {
        const [bulan, subsektor] = key.split("|");
        const xIndex = xAxis.indexOf(bulan);
        const yIndex = yAxis.indexOf(subsektor);
        if (xIndex >= 0 && yIndex >= 0) data.push([xIndex, yIndex, val]);
    });

    return { xAxis, yAxis, data };
});
</script>
