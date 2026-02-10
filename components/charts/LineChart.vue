<template>
    <div class="multiple-line-chart-container h-full flex flex-col">
        <div v-if="showIndicatorFilter && !isManualMode" class="mb-2 shrink-0">
            <label class="block text-xs font-semibold text-gray-700 mb-1">
                Pilih Data
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label
                    v-for="indicator in availableIndicators"
                    :key="indicator.key"
                    class="flex items-center gap-2 p-2 border rounded cursor-pointer transition-all hover:shadow-sm"
                    :class="
                        selectedIndicators.includes(indicator.key)
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                    "
                >
                    <input
                        type="checkbox"
                        :value="indicator.key"
                        v-model="selectedIndicators"
                        class="w-3 h-3 text-amber-600 rounded focus:ring-amber-500 focus:ring-1"
                    />
                    <span
                        class="text-xs font-medium text-gray-800 line-clamp-1"
                    >
                        {{ indicator.nama }}
                    </span>
                </label>
            </div>
        </div>

        <div v-if="loading" class="flex-1 flex items-center justify-center">
            <div class="text-center">
                <div
                    class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-amber-600"
                ></div>
                <p class="mt-2 text-xs text-gray-600 font-medium">Loading...</p>
            </div>
        </div>

        <div
            v-else-if="!chartData || chartData.labels.length === 0"
            class="flex-1 flex items-center justify-center"
        >
            <div class="text-center">
                <p class="text-xs text-gray-500">Tidak ada data</p>
            </div>
        </div>

        <div v-else class="chart-wrapper flex-1 min-h-0 flex flex-col">
            <div class="h-full flex flex-col">
                <h3
                    v-if="chartTitle"
                    class="text-sm font-bold text-gray-900 mb-2 shrink-0"
                >
                    {{ chartTitle }}
                </h3>

                <div class="relative flex-1 min-h-0 w-full">
                    <canvas ref="chartCanvas"></canvas>
                </div>

                <div
                    class="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center shrink-0"
                >
                    <div
                        v-for="(dataset, index) in chartData.datasets"
                        :key="index"
                        class="flex items-center gap-1.5"
                    >
                        <div
                            class="w-2.5 h-2.5 rounded-full"
                            :style="{ backgroundColor: dataset.borderColor }"
                        ></div>
                        <span class="text-[10px] text-gray-600">{{
                            dataset.label
                        }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    ref,
    computed,
    watch,
    onMounted,
    onBeforeUnmount,
    nextTick,
} from "vue";
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    Filler,
);

const props = defineProps({
    // Standard Props
    data: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    chartTitle: { type: String, default: "" },

    // Manual Mode Props (NEW)
    categories: { type: Array, default: () => [] },
    series: { type: Array, default: () => [] },

    // Configuration
    indicatorIds: { type: Array, default: () => [] },
    indicatorNames: { type: Array, default: () => [] },
    showIndicatorFilter: { type: Boolean, default: true },
    xAxisField: { type: String, default: "itemCategory3" },
    seriesField: { type: String, default: "itemCategory2" },
    xAxisOrder: { type: Array, default: () => [] },
    annotations: { type: Object, default: () => ({}) },
    filterField: { type: String, default: "indikator" },
});

// Detect if we are in "Manual Mode" (using series/categories props)
const isManualMode = computed(() => props.series.length > 0);

const useNameMode = computed(() => props.indicatorNames.length > 0);
const chartCanvas = ref(null);
const chartInstance = ref(null);
const selectedIndicators = ref([]);

watch(
    () => [props.indicatorIds, props.indicatorNames],
    () => {
        if (useNameMode.value) {
            selectedIndicators.value = [...props.indicatorNames];
        } else {
            selectedIndicators.value = [...props.indicatorIds];
        }
    },
    { immediate: true },
);

const colorPalette = [
    "#F59E0B",
    "#3B82F6",
    "#10B981",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
];

const normalizeString = (str) =>
    str?.trim().toLowerCase().replace(/\s+/g, " ") || "";

const availableIndicators = computed(() => {
    // Skip this calculation in Manual Mode
    if (isManualMode.value) return [];

    const indicators = new Map();
    const field = props.filterField;
    props.data.forEach((record) => {
        const valObj = record[field];
        if (valObj?.nama) {
            const name = valObj.nama.trim();
            if (useNameMode.value) {
                const normalizedName = normalizeString(name);
                const isRelevant = props.indicatorNames.some((targetName) => {
                    const normalizedTarget = normalizeString(targetName);
                    return normalizedName === normalizedTarget;
                });
                if (isRelevant && !indicators.has(name)) {
                    indicators.set(name, { key: name, nama: name });
                }
            }
        }
    });
    return Array.from(indicators.values()).sort((a, b) => a.key - b.key);
});

const filteredData = computed(() => {
    if (isManualMode.value) return [];

    if (!props.data || props.data.length === 0) return [];
    const field = props.filterField;
    return props.data.filter((record) => {
        const valObj = record[field];
        if (!valObj?.nama) return false;
        if (useNameMode.value) {
            const recordName = normalizeString(valObj.nama);
            return selectedIndicators.value.some(
                (selectedName) => recordName === normalizeString(selectedName),
            );
        }
        return true;
    });
});

const chartData = computed(() => {
    // 1. MANUAL MODE: Use the ready-made categories and series props
    if (isManualMode.value) {
        if (!props.categories.length) return { labels: [], datasets: [] };

        return {
            labels: props.categories,
            datasets: props.series.map((s) => ({
                label: s.name,
                data: s.data,
                borderColor: s.color,
                backgroundColor: s.color + "20",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.3,
                fill: false,
            })),
        };
    }

    // 2. AUTOMATIC MODE: Use existing logic with props.data
    if (!filteredData.value || filteredData.value.length === 0) {
        return { labels: [], datasets: [] };
    }

    // ... (Existing logic to process raw data)
    const xAxisMap = new Map();
    filteredData.value.forEach((record) => {
        const xValue = record[props.xAxisField]?.nama;
        if (xValue) {
            if (!xAxisMap.has(xValue)) xAxisMap.set(xValue, []);
            xAxisMap.get(xValue).push(record);
        }
    });

    let labels = Array.from(xAxisMap.keys());
    if (props.xAxisOrder.length > 0) {
        labels = labels.sort((a, b) => {
            const idxA = props.xAxisOrder.indexOf(a);
            const idxB = props.xAxisOrder.indexOf(b);
            return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
        });
    } else {
        labels.sort();
    }

    const lastLabel = labels[labels.length - 1];
    const datasetsMap = new Map();

    filteredData.value.forEach((record) => {
        const seriesValue =
            record[props.seriesField]?.nama || record[props.seriesField];
        const xValue = record[props.xAxisField]?.nama;
        if (!seriesValue || !xValue) return;

        if (!datasetsMap.has(seriesValue)) {
            datasetsMap.set(seriesValue, {
                label: seriesValue,
                data: new Array(labels.length).fill(null),
                lastVal: 0,
            });
        }

        const xIndex = labels.indexOf(xValue);
        if (xIndex !== -1) {
            const val = Number(record.value) || 0;
            datasetsMap.get(seriesValue).data[xIndex] = val;

            if (xValue === lastLabel) {
                datasetsMap.get(seriesValue).lastVal = val;
            }
        }
    });

    const sortedDatasets = Array.from(datasetsMap.values())
        .sort((a, b) => b.lastVal - a.lastVal)
        .slice(0, 10);

    const datasets = sortedDatasets.map((item, index) => {
        const color = colorPalette[index % colorPalette.length];
        return {
            label: item.label,
            data: item.data,
            borderColor: color,
            backgroundColor: color + "20",
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: false,
        };
    });

    return { labels, datasets };
});

let chartUpdateTimeout = null;

watch(
    [() => chartData.value, () => props.annotations],
    async () => {
        if (chartUpdateTimeout) clearTimeout(chartUpdateTimeout);
        chartUpdateTimeout = setTimeout(async () => {
            await nextTick();
            createChart();
        }, 150);
    },
    { deep: true },
);

const createChart = () => {
    if (!chartCanvas.value || !chartData.value.labels.length) return;
    if (chartInstance.value) chartInstance.value.destroy();

    // ... (Keep existing plugins logic)
    const backgroundHighlightPlugin = {
        id: "backgroundHighlight",
        beforeDraw: (chart) => {
            if (!props.annotations?.backgroundColor?.periods) return;
            const {
                ctx,
                scales: { x: xAxis, y: yAxis },
            } = chart;
            const config = props.annotations.backgroundColor;
            const periods = config.periods;
            if (periods.length === 0) return;

            const firstIndex = chart.data.labels.findIndex(
                (l) =>
                    String(l).trim().toLowerCase() ===
                    String(periods[0]).trim().toLowerCase(),
            );

            if (firstIndex !== -1) {
                const startX =
                    (xAxis.getPixelForValue(firstIndex - 1) +
                        xAxis.getPixelForValue(firstIndex)) /
                    2;
                const endX = xAxis.right;
                const width = endX - startX;
                const height = yAxis.bottom - yAxis.top;

                ctx.save();
                ctx.fillStyle = config.color || "rgba(239, 68, 68, 0.05)";
                ctx.fillRect(startX, yAxis.top, width, height);
                ctx.restore();
            }
        },
        afterDatasetsDraw: (chart) => {
            if (!props.annotations?.backgroundColor?.periods) return;
            const config = props.annotations.backgroundColor;
            if (!config.label) return;

            const {
                ctx,
                scales: { x: xAxis, y: yAxis },
            } = chart;
            const endX = xAxis.right;

            ctx.save();
            ctx.fillStyle = config.labelColor || "#ef4444";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "right";
            ctx.textBaseline = "top";
            ctx.fillText(config.label, endX - 6, yAxis.top + 10);
            ctx.restore();
        },
    };

    const verticalLinePlugin = {
        id: "verticalLineAnnotation",
        afterDatasetsDraw: (chart) => {
            if (!props.annotations?.markLine?.data) return;
            const {
                ctx,
                scales: { x: xAxis, y: yAxis },
            } = chart;

            props.annotations.markLine.data.forEach((item) => {
                const targetLabel = item.xAxis;
                const index = chart.data.labels.findIndex(
                    (l) =>
                        String(l).trim().toLowerCase() ===
                        String(targetLabel).trim().toLowerCase(),
                );

                if (index !== -1) {
                    const x =
                        (xAxis.getPixelForValue(index - 1) +
                            xAxis.getPixelForValue(index)) /
                        2;

                    ctx.save();
                    ctx.beginPath();
                    ctx.setLineDash([6, 4]);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#ef4444";
                    ctx.moveTo(x, yAxis.top);
                    ctx.lineTo(x, yAxis.bottom);
                    ctx.stroke();

                    ctx.fillStyle = "#ef4444";
                    ctx.font = "bold 11px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("", x, yAxis.top - 15);
                    ctx.restore();
                }
            });
        },
    };

    const ctx = chartCanvas.value.getContext("2d");
    chartInstance.value = new Chart(ctx, {
        type: "line",
        data: chartData.value,
        plugins: [backgroundHighlightPlugin, verticalLinePlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 25,
                    right: 10,
                    left: 5,
                    bottom: 0,
                },
            },
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    padding: 8,
                    titleFont: { size: 11 },
                    bodyFont: { size: 11 },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) =>
                            new Intl.NumberFormat("id-ID", {
                                notation: "compact",
                                compactDisplay: "short",
                            }).format(value),
                        font: { size: 9 },
                    },
                    grid: { color: "rgba(0, 0, 0, 0.05)" },
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 } },
                },
            },
        },
    });
};

onMounted(async () => {
    await nextTick();
    createChart();
});
onBeforeUnmount(() => {
    if (chartInstance.value) chartInstance.value.destroy();
});
</script>

<style scoped>
.multiple-line-chart-container {
    width: 100%;
}
.chart-wrapper {
    width: 100%;
    min-height: 0;
}
</style>
