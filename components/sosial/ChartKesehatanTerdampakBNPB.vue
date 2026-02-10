<template>
    <EkonomiChartHeader
            title="Tren Jumlah Fasilitas Kesehatan Terdampak"
            :dataset-info="datasetInfo"
            icon="i-heroicons-academic-cap"
            icon-class="text-rose-600"
            class="mb-4"
    />

    <div class="w-full border border-gray-100 rounded-xl p-3 bg-white flex flex-col flex-1 min-h-[200px]">
        <div class="flex-1 min-h-0 w-full relative">
            <ChartsLineChart
                v-if="lineChartData.categories.length > 0"
                :categories="lineChartData.categories"
                :series="lineChartData.series"
                height="h-full"
                :colors="['#E11D48']"
                :show-indicator-filter="false"
            />
            <div
                v-else
                class="h-full flex items-center justify-center text-xs text-gray-400 gap-2"
            >
                <UIcon
                    name="i-heroicons-chart-bar"
                    class="w-5 h-5 text-gray-300"
                />
                <span>Data tren belum tersedia</span>
                </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
// [CHANGE] Import the header component
import EkonomiChartHeader from "~/components/ekonomi/ChartHeader.vue";

const props = defineProps({
    chartData: { type: Object, required: true },
    datasetInfo: { type: Object, default: null },
});

const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
};

const lineChartData = computed(() => {
    const raw = props.chartData.kesehatan?.pasca || [];
    if (raw.length === 0) return { categories: [], series: [] };

    const sorted = [...raw].sort(
        (a, b) => new Date(a.tanggal) - new Date(b.tanggal),
    );

    const grouped = new Map();
    sorted.forEach((r) => {
        const dateKey = formatDate(r.tanggal);
        const val = Number(r.value) || 0;
        grouped.set(dateKey, (grouped.get(dateKey) || 0) + val);
    });

    return {
        categories: Array.from(grouped.keys()),
        series: [
            {
                name: "Fasilitas Kesehatan Terdampak",
                data: Array.from(grouped.values()),
                color: "#E11D48", // Rose-600
                smooth: true,
                showSymbol: true,
            },
        ],
    };
});
</script>
