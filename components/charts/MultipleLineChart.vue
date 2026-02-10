<template>
    <div class="multiple-line-chart-container">
        <div v-if="showIndicatorFilter" class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-3">
                Pilih Data
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label
                    v-for="indicator in availableIndicators"
                    :key="indicator.key"
                    class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
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
                        class="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 focus:ring-2"
                    />
                    <span class="text-sm font-medium text-gray-800">
                        {{ indicator.nama }}
                    </span>
                </label>
            </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-16">
            <div class="text-center">
                <div
                    class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-amber-600"
                ></div>
                <p class="mt-4 text-gray-600 font-medium">
                    Memuat data chart...
                </p>
            </div>
        </div>

        <div
            v-else-if="!chartData || chartData.labels.length === 0"
            class="flex items-center justify-center py-16"
        >
            <div class="text-center">
                <svg
                    class="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
                <p class="text-gray-600 font-medium">
                    Tidak ada data untuk ditampilkan
                </p>
                <p class="text-sm text-gray-500 mt-2">
                    Data kosong atau filter tidak sesuai
                </p>
            </div>
        </div>

        <div v-else class="chart-wrapper">
            <div
                class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
                <h3
                    v-if="chartTitle"
                    class="text-lg font-bold text-gray-900 mb-6"
                >
                    {{ chartTitle }}
                </h3>
                <div class="relative" style="height: 320px">
                    <canvas ref="chartCanvas"></canvas>
                </div>

                <div class="flex flex-wrap gap-3 mt-4 justify-start">
                    <div
                        v-for="(dataset, index) in chartData.datasets"
                        :key="index"
                        class="flex items-center gap-1.5"
                    >
                        <div
                            class="w-3 h-3 rounded"
                            :style="{ backgroundColor: dataset.borderColor }"
                        ></div>
                        <span class="text-xs text-gray-700">{{
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
    data: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    chartTitle: { type: String, default: "" },
    indicatorIds: { type: Array, default: () => [] },
    indicatorNames: { type: Array, default: () => [] },
    showIndicatorFilter: { type: Boolean, default: true },
    xAxisField: { type: String, default: "itemCategory3" },
    seriesField: { type: String, default: "itemCategory2" },
    xAxisOrder: { type: Array, default: () => [] },
    annotations: { type: Object, default: () => ({}) },

    // 🔥 BARU: Field yang digunakan untuk filter (default: indikator)
    // Untuk Perumahan, kita akan set ini jadi 'wilayah'
    filterField: { type: String, default: "indikator" },
});

const useNameMode = computed(() => props.indicatorNames.length > 0);
const chartCanvas = ref(null);
const chartInstance = ref(null);
const selectedIndicators = ref([]);

// Watch untuk inisialisasi filter terpilih
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

// 🔥 UPDATE: Remove red color from palette
const colorPalette = [
    "#F59E0B", // Amber
    "#3B82F6", // Blue
    "#10B981", // Green
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#F97316", // Orange
    "#6366F1", // Indigo
];

const normalizeString = (str) => {
    return str?.trim().toLowerCase().replace(/\s+/g, " ") || "";
};

// 🔥 FIX: Menggunakan props.filterField, bukan hardcode 'indikator'
const availableIndicators = computed(() => {
    const indicators = new Map();
    const field = props.filterField; // 'indikator' atau 'wilayah'

    props.data.forEach((record) => {
        // Akses dinamis: record['wilayah']?.nama
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
            } else {
                // ID Mode logic (optional fallback)
                // ...
            }
        }
    });

    return Array.from(indicators.values()).sort((a, b) => a.key - b.key);
});

// 🔥 FIX: Menggunakan props.filterField untuk filtering data
const filteredData = computed(() => {
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

// Chart Data Logic (tidak berubah banyak, hanya menggunakan filteredData yang sudah benar)
const chartData = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) {
        return { labels: [], datasets: [] };
    }

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

    const datasetsMap = new Map();
    filteredData.value.forEach((record) => {
        const seriesValue = record[props.seriesField]?.nama;
        const xValue = record[props.xAxisField]?.nama;
        if (!seriesValue || !xValue) return;

        if (!datasetsMap.has(seriesValue)) {
            datasetsMap.set(seriesValue, {
                label: seriesValue,
                data: new Array(labels.length).fill(null),
            });
        }

        const xIndex = labels.indexOf(xValue);
        if (xIndex !== -1) {
            // 🔥 FIX: Treat value 0 sebagai null (tidak ada data)
            // Hanya set value jika > 0
            const rawValue = record.value !== null && record.value !== undefined ? record.value : null;
            const val = rawValue > 0 ? rawValue : null;
            
            const current = datasetsMap.get(seriesValue).data[xIndex];
            
            // Jika sudah ada nilai sebelumnya, aggregate
            if (current !== null && val !== null) {
                datasetsMap.get(seriesValue).data[xIndex] = current + val;
            } else if (val !== null) {
                datasetsMap.get(seriesValue).data[xIndex] = val;
            }
            // Jika val === null, biarkan tetap null (tidak ada data)
        }
    });

    const datasets = Array.from(datasetsMap.values()).map((item, index) => {
        const color = colorPalette[index % colorPalette.length];
        return {
            label: item.label,
            data: item.data,
            borderColor: color,
            backgroundColor: color + "20",
            borderWidth: 1.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: false,
            spanGaps: false, // 🔥 PENTING: false = garis putus jika ada null
        };
    });

    return { labels, datasets };
});

let chartUpdateTimeout = null;
watch(
    () => chartData.value,
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
    // 1. Validasi Canvas & Data
    if (!chartCanvas.value || !chartData.value.labels.length) {
        return;
    }

    // 2. Hancurkan instance lama jika ada (mencegah memory leak/double chart)
    if (chartInstance.value) {
        chartInstance.value.destroy();
    }

    // --- PLUGIN 1: HIGHLIGHT BACKGROUND (Area Pasca Bencana) ---
    const backgroundHighlightPlugin = {
        id: "backgroundHighlight",
        beforeDraw: (chart) => {
            // Cek apakah ada config background dari props
            if (!props.annotations?.backgroundColor?.periods) return;

            const {
                ctx,
                scales: { x: xAxis, y: yAxis },
            } = chart;
            const config = props.annotations.backgroundColor;

            // Ambil daftar periode pasca bencana
            const periods = config.periods;
            if (periods.length === 0) return;

            // Cari index dari periode PERTAMA pasca bencana
            // Kita cari label di chart yang cocok dengan data periods[0]
            const firstIndex = chart.data.labels.findIndex(
                (l) =>
                    String(l).trim().toLowerCase() ===
                    String(periods[0]).trim().toLowerCase(),
            );

            if (firstIndex !== -1) {
                // 🔥 FIX: Mulai dari setelah November (di Desember)
                // Gunakan index langsung (bukan index - 0.5)
                const startX = xAxis.getPixelForValue(firstIndex);
                const endX = xAxis.right; // Sampai ujung kanan chart
                const width = endX - startX;
                const height = yAxis.bottom - yAxis.top;

                ctx.save();
                ctx.fillStyle = config.color || "rgba(239, 68, 68, 0.05)";
                ctx.fillRect(startX, yAxis.top, width, height);

                // Label Highlight (Opsional, text di pojok kanan atas area)
                if (config.label) {
                    ctx.fillStyle = config.labelColor || "#ef4444";
                    ctx.font = "bold 12px sans-serif";
                    ctx.textAlign = "right";
                    ctx.textBaseline = "top";
                    ctx.fillText(config.label, endX - 10, yAxis.top + 10);
                }
                ctx.restore();
            }
        },
    };

    // --- PLUGIN 2: VERTICAL MARK LINE (Garis Pembatas Putus-putus) ---
    const verticalLinePlugin = {
        id: "verticalLineAnnotation",
        afterDatasetsDraw: (chart) => {
            // Cek apakah ada config markLine dari props
            if (!props.annotations?.markLine?.data) return;

            const {
                ctx,
                scales: { x: xAxis, y: yAxis },
            } = chart;

            props.annotations.markLine.data.forEach((item) => {
                const targetLabel = item.xAxis;

                // Cari index label target
                const index = chart.data.labels.findIndex(
                    (l) =>
                        String(l).trim().toLowerCase() ===
                        String(targetLabel).trim().toLowerCase(),
                );

                if (index !== -1) {
                    // 🔥 FIX: Gunakan index langsung (bukan index + 0.5)
                    // Agar garis digambar tepat di November, bukan di tengah Nov-Des
                    const x = xAxis.getPixelForValue(index);

                    // Gambar Garis
                    ctx.save();
                    ctx.beginPath();
                    ctx.setLineDash([6, 4]); // Garis putus-putus (6px isi, 4px kosong)
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#ef4444"; // Warna Merah
                    ctx.moveTo(x, yAxis.top);
                    ctx.lineTo(x, yAxis.bottom);
                    ctx.stroke();

                    // Gambar Label "Bencana" di atas garis
                    ctx.fillStyle = "#ef4444";
                    ctx.font = "bold 11px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("Bencana", x, yAxis.top - 10);
                    ctx.restore();
                }
            });
        },
    };

    // 3. Inisialisasi Chart
    const ctx = chartCanvas.value.getContext("2d");
    chartInstance.value = new Chart(ctx, {
        type: "line",
        data: chartData.value,
        // 🔥 Jangan lupa daftarkan kedua plugin di sini
        plugins: [backgroundHighlightPlugin, verticalLinePlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false, // Kita pakai custom legend di luar canvas
                },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    borderColor: "#F59E0B",
                    borderWidth: 1,
                    padding: 10,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || "";
                            if (label) {
                                label += ": ";
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat("id-ID").format(
                                    context.parsed.y,
                                );
                            }
                            return label;
                        },
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return new Intl.NumberFormat("id-ID", {
                                notation: "compact",
                                compactDisplay: "short",
                            }).format(value);
                        },
                        font: { size: 10 },
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                    },
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 } },
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
    min-height: 320px;
}
</style>