<template>
    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mt-0">
        <ChartHeader
            :dataset-info="datasetInfo"
            icon="i-heroicons-building-library"
            icon-class="text-orange-600"
            class="mb-4"
        />

        <div
            class="w-full border border-gray-100 rounded-xl p-3 bg-white flex flex-col h-[250px]"
        >
            <div class="flex-1 min-h-0 w-full relative">
                <ChartsBarChart
                    v-if="barChartData.categories.length > 0"
                    :categories="barChartData.categories"
                    :series="barChartData.series"
                    height="h-full"
                    class="h-full w-full"
                    :show-legend="false"
                    :bar-width="'45%'"
                    :colors="['#f97316']"
                    :grid="{
                        left: '3%',
                        right: '4%',
                        bottom: '0%',
                        top: '0%',
                        containLabel: true,
                    }"
                />
                <div
                    v-else
                    class="h-full flex items-center justify-center text-xs text-gray-400 gap-2"
                >
                    <UIcon
                        name="i-heroicons-chart-bar"
                        class="w-5 h-5 text-gray-300"
                    />
                    <span>Data detail jenjang belum tersedia</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import ChartHeader from "~/components/shared/ChartHeader.vue";

const props = defineProps({
    chartData: { type: Object, required: true },
    datasetInfo: { type: Object, default: null },
});

const barChartData = computed(() => {
    // 1. Get Raw Data
    const raw = props.chartData.pendidikan?.kemendikdasmen || [];
    if (!Array.isArray(raw) || raw.length === 0)
        return { categories: [], series: [] };

    // [CRITICAL FIX] 2. Filter out "Total" rows FIRST
    // We must remove summary rows BEFORE checking hierarchy.
    // Otherwise, a "Province Total" row will trick the code into discarding all detailed region data.
    const relevantData = raw.filter((r) => {
        // Ensure value exists
        if (r.value === null || r.value === undefined || r.value === "")
            return false;

        const catName = r.itemCategory1?.nama || "";
        const catCode = r.itemCategory1?.kode || "";

        // Exclude "Total" or "Seluruh"
        const isTotal =
            catName.toLowerCase().includes("seluruh") ||
            catName.toLowerCase().includes("total") ||
            catCode === "Total";

        return !isTotal;
    });

    if (relevantData.length === 0) return { categories: [], series: [] };

    // 3. Hierarchy Check (Smart Aggregation)
    // Now check: Do we have detailed breakdown (PAUD, SD...) at the Province Level?
    // If YES, use those. If NO (which is your case), use the Region/Kabupaten rows.
    const hasProvLevelBreakdown = relevantData.some(
        (r) => !r.kd_kab || !r.kd_kab.kode,
    );

    let finalData = relevantData;
    if (hasProvLevelBreakdown) {
        finalData = relevantData.filter((r) => !r.kd_kab || !r.kd_kab.kode);
    }

    // 4. Group & Sum Data
    const indicatorsMap = new Map();

    finalData.forEach((r) => {
        const label =
            r.itemCategory1?.nama || r.itemCategory1?.kode || "Lainnya";
        const val = Number(r.value) || 0;

        if (!indicatorsMap.has(label)) {
            indicatorsMap.set(label, 0);
        }
        indicatorsMap.set(label, indicatorsMap.get(label) + val);
    });

    // 5. Sort by Value (Descending)
    const categories = Array.from(indicatorsMap.keys()).sort((a, b) => {
        return indicatorsMap.get(b) - indicatorsMap.get(a);
    });

    const seriesData = categories.map((c) => indicatorsMap.get(c));

    return {
        categories,
        series: [
            {
                name: "Jumlah Terdampak",
                data: seriesData,
                color: "#f97316", // Orange
                showLabel: true,
                labelFormatter: "{c}",
            },
        ],
    };
});
</script>
