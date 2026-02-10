<template>
    <div class="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
        <!-- Header Section -->
        <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4"
        >
            <ChartHeader
                :dataset-info="datasetInfo"
                title="Tren Pertanian & Pangan"
                icon="i-heroicons-globe-asia-australia"
                icon-class="text-emerald-600"
                class="flex-shrink-0"
            />

            <USelectMenu
                v-model="selectedIndicators"
                :items="filterOptions"
                multiple
                placeholder="Pilih Indikator"
                class="w-full sm:w-64"
                size="xs"
            >
                <template #label>
                    <span v-if="selectedIndicators.length" class="truncate">
                        {{ selectedIndicators.map((m) => m.label).join(", ") }}
                    </span>
                    <span v-else class="text-gray-400">Pilih Indikator</span>
                </template>

                <template #option="{ option }">
                    <span
                        class="w-2 h-2 rounded-full flex-shrink-0"
                        :style="{ backgroundColor: option.hex }"
                    ></span>
                    <span class="truncate">{{ option.label }}</span>
                </template>
            </USelectMenu>
        </div>

        <!-- Divider -->
        <hr class="border-gray-100 mb-4" />

        <!-- Chart Section -->
        <div class="h-[350px] w-full">
            <LineChart
                v-if="!isLoading && chartData.series.length > 0"
                :categories="chartData.categories"
                :series="chartData.series"
                height="h-full"
                :area="true"
                :annotations="annotations"
                class="h-full w-full"
            />

            <div
                v-else
                class="h-full flex flex-col items-center justify-center gap-4 px-8"
            >
                <div class="relative">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-2xl"
                    ></div>
                    <div
                        class="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200/50 shadow-sm"
                    >
                        <UIcon
                            name="i-heroicons-chart-bar"
                            class="w-12 h-12 text-gray-300"
                        />
                    </div>
                </div>
                <div class="text-center space-y-1.5">
                    <p class="text-sm font-medium text-gray-700">
                        {{
                            isLoading ? "Memuat Data..." : "Data Belum Tersedia"
                        }}
                    </p>
                    <p class="text-xs text-gray-400 max-w-xs">
                        {{
                            isLoading
                                ? "Sedang mengambil data terbaru..."
                                : "Data tren belum tersedia untuk indikator yang dipilih"
                        }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, toRef, ref } from "vue";
import { useAgregatInsight } from "~/composables/useAgregatInsight";
import LineChart from "~/components/charts/LineChart.vue";
import ChartHeader from "~/components/ekonomi/ChartHeader.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});
const selectedWilayahRef = toRef(props, "selectedWilayah");

// --- 1. Data Fetching ---
// Metadata
const { datasetInfo } = useAgregatInsight(30, selectedWilayahRef, {
    id_indikator_insight: 72,
});

// Fetch Data for all 3 indicators
const { rawRecords: rawLuasPanen, status: statusLP } = useAgregatInsight(
    30,
    selectedWilayahRef,
    { id_indikator_insight: 72 },
);
const { rawRecords: rawPadi, status: statusPadi } = useAgregatInsight(
    30,
    selectedWilayahRef,
    { id_indikator_insight: 73 },
);
const { rawRecords: rawBeras, status: statusBeras } = useAgregatInsight(
    30,
    selectedWilayahRef,
    { id_indikator_insight: 74 },
);

const isLoading = computed(
    () =>
        statusLP.value === "pending" ||
        statusPadi.value === "pending" ||
        statusBeras.value === "pending",
);

// --- 2. Filter Configuration (Object Based) ---
const filterOptions = [
    { id: "luas_panen", label: "Luas Panen (Ha)", hex: "#10B981" },
    { id: "prod_padi", label: "Produksi Padi (Ton)", hex: "#F59E0B" },
    { id: "prod_beras", label: "Produksi Beras (Ton)", hex: "#3B82F6" },
];

// [MODIFIED] Default selection is now an Array of Objects (matching filterOptions)
const selectedIndicators = ref([...filterOptions]);

// [MODIFIED] Active Colors now derived directly from the selected objects
const activeColors = computed(() => {
    return selectedIndicators.value.map((option) => option.hex);
});

// --- 3. Data Processing Helper ---
const processData = (records) => {
    const aggregatedMap = new Map();
    if (!records || records.length === 0) return aggregatedMap;

    const monthMap = {
        Januari: 1,
        Februari: 2,
        Maret: 3,
        April: 4,
        Mei: 5,
        Juni: 6,
        Juli: 7,
        Agustus: 8,
        September: 9,
        Oktober: 10,
        November: 11,
        Desember: 12,
        Jan: 1,
        Feb: 2,
        Mar: 3,
        Apr: 4,
        Mei: 5,
        Jun: 6,
        Jul: 7,
        Agu: 8,
        Sep: 9,
        Okt: 10,
        Nov: 11,
        Des: 12,
    };

    records.forEach((r) => {
        if (r.value === null || r.value === undefined) return;
        const year = r.itemCategory1?.nama || r.itemCategory1;
        const month = r.itemCategory2?.nama || r.itemCategory2;
        if (!month || String(month).toLowerCase().includes("tahunan")) return;

        const periodKey = `${month} ${year}`;
        const sortKey = parseInt(year) * 100 + (monthMap[month] || 0);

        if (!aggregatedMap.has(periodKey)) {
            aggregatedMap.set(periodKey, { val: 0, sort: sortKey });
        }
        aggregatedMap.get(periodKey).val += Number(r.value);
    });
    return aggregatedMap;
};

// --- 4. Build Chart Data ---
const chartData = computed(() => {
    const mapLuasPanen = processData(rawLuasPanen.value);
    const mapPadi = processData(rawPadi.value);
    const mapBeras = processData(rawBeras.value);

    let combinedMaps = new Map();

    // [MODIFIED] Check selection by iterating the objects
    selectedIndicators.value.forEach((opt) => {
        if (opt.id === "luas_panen")
            combinedMaps = new Map([...combinedMaps, ...mapLuasPanen]);
        else if (opt.id === "prod_padi")
            combinedMaps = new Map([...combinedMaps, ...mapPadi]);
        else if (opt.id === "prod_beras")
            combinedMaps = new Map([...combinedMaps, ...mapBeras]);
    });

    const sortedCategories = Array.from(combinedMaps.keys()).sort(
        (a, b) => combinedMaps.get(a).sort - combinedMaps.get(b).sort,
    );

    const series = [];

    // [MODIFIED] Build series based on selected objects directly
    selectedIndicators.value.forEach((option) => {
        let sourceMap;
        if (option.id === "luas_panen") sourceMap = mapLuasPanen;
        else if (option.id === "prod_padi") sourceMap = mapPadi;
        else if (option.id === "prod_beras") sourceMap = mapBeras;

        if (sourceMap) {
            series.push({
                name: option.label,
                data: sortedCategories.map(
                    (cat) => sourceMap.get(cat)?.val || null,
                ),
                color: option.hex,
                smooth: true,
                showSymbol: false,
                areaStyle: { opacity: 0.1 },
            });
        }
    });

    return { categories: sortedCategories, series };
});

const annotations = computed(() => {
    const categories = chartData.value.categories;

    const decemberLabel = "Desember 2025";
    const decIndex = categories.indexOf(decemberLabel);

    // Safety check: December must exist in the data
    if (decIndex === -1) return {};

    return {
        markLine: {
            data: [
                {
                    xAxis: decemberLabel, // Must be the label string, NOT a number
                },
            ],
        },

        backgroundColor: {
            periods: [decemberLabel], // First label where highlight starts
            color: "rgba(239, 68, 68, 0.10)", // Red overlay — increase for stronger color
            label: "Pasca Bencana", // Text shown at top-right
            labelColor: "#EF4444", // Color of the label text
        },
    };
});
</script>
