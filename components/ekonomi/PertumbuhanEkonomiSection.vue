<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-10 mt-4"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-lg border border-blue-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-presentation-chart-line"
                        class="w-4 h-4 text-blue-600"
                    />
                    <span
                        class="text-[10px] font-black text-blue-700 uppercase tracking-wider"
                    >
                        Pertumbuhan Ekonomi
                    </span>
                </div>
                <div
                    class="flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-gray-200 shadow-sm"
                >
                    <UBadge
                        v-if="datasetInfo?.instansi"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ datasetInfo.instansi }}
                    </UBadge>
                    <UBadge
                        v-if="datasetInfo?.sumber"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ datasetInfo.sumber }}
                    </UBadge>
                    <UBadge
                        v-if="datasetInfo?.frekuensi"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ datasetInfo.frekuensi }}
                    </UBadge>

                    <span
                        v-if="datasetInfo?.terakhir_diupdate"
                        class="text-[10px] text-gray-400 flex items-center gap-0.5 ml-1"
                    >
                        <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                        {{ formatDate(datasetInfo.terakhir_diupdate) }}
                    </span>
                </div>
            </div>

            <div
                class="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
                <UIcon
                    name="i-heroicons-calendar"
                    class="w-4 h-4 text-gray-400 ml-1"
                />
                <USelectMenu
                    v-model="selectedPeriod"
                    :items="availablePeriods"
                    placeholder="Pilih Periode"
                    class="min-w-[140px]"
                    size="xs"
                    :disabled="!isValidSelection.valid"
                    :ui="{
                        base: 'relative',
                        trigger:
                            'border-none shadow-none focus:ring-0 text-xs font-medium text-gray-700 py-1',
                    }"
                >
                    <template #label>
                        <span class="truncate">{{
                            selectedPeriod || "Pilih Periode"
                        }}</span>
                    </template>
                </USelectMenu>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-28">
            <StatCardModern
                v-if="status === 'pending'"
                label="Memuat Data..."
                :loading="true"
            />
            <StatCardModern
                v-else
                :label="`${currentRecord?.indikator?.nama || 'PDRB'} (y-on-y)`"
                :value="
                    isValidSelection.valid && currentRecord
                        ? currentRecord.value
                        : null
                "
                unit="%"
                icon="i-heroicons-chart-bar"
                color="blue"
                :sublabel="
                    isValidSelection.valid && selectedPeriod
                        ? `Periode: ${selectedPeriod}`
                        : ''
                "
                :empty-text="statusMessage || 'Data Tidak Tersedia'"
            />

            <StatCardModern
                v-if="statusQ === 'pending'"
                label="Memuat Data..."
                :loading="true"
            />
            <StatCardModern
                v-else
                :label="`${currentRecordQ?.indikator?.nama || 'PDRB'} (q-to-q)`"
                :value="
                    isValidSelection.valid && currentRecordQ
                        ? currentRecordQ.value
                        : null
                "
                unit="%"
                icon="i-heroicons-presentation-chart-line"
                color="emerald"
                :sublabel="
                    isValidSelection.valid && selectedPeriod
                        ? `Periode: ${selectedPeriod}`
                        : ''
                "
                :empty-text="statusMessage || 'Data Tidak Tersedia'"
            />

            <StatCardModern
                v-if="statusADHB === 'pending'"
                label="Memuat Data..."
                :loading="true"
            />
            <StatCardModern
                v-else
                :label="`${currentRecordADHB?.indikator?.nama || 'PDRB'} (ADHB)`"
                :value="
                    isValidSelection.valid && currentRecordADHB
                        ? currentRecordADHB.value
                        : null
                "
                :unit="currentRecordADHB?.indikator?.satuan || 'Miliar Rupiah'"
                icon="i-heroicons-wallet"
                color="amber"
                :sublabel="
                    isValidSelection.valid && selectedPeriod
                        ? `Periode: ${selectedPeriod}`
                        : ''
                "
                :empty-text="statusMessage || 'Data Tidak Tersedia'"
            />
        </div>

        <hr class="border-gray-100 my-3" />

        <div class="space-y-4">
            <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <h4 class="text-sm font-bold text-gray-800">
                    Tren Perkembangan Ekonomi (Sejak 2023)
                </h4>

                <USelectMenu
                    v-model="selectedChartMetrics"
                    :items="chartMetricOptions"
                    multiple
                    placeholder="Pilih Indikator"
                    class="w-full sm:w-64"
                    size="xs"
                >
                    <template #label>
                        <span
                            v-if="selectedChartMetrics.length"
                            class="truncate"
                        >
                            {{
                                selectedChartMetrics
                                    .map((m) => m.label)
                                    .join(", ")
                            }}
                        </span>
                        <span v-else class="text-gray-400"
                            >Pilih Indikator</span
                        >
                    </template>
                </USelectMenu>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[350px]">
                <div
                    class="lg:col-span-2 w-full h-full border border-gray-100 rounded-xl p-4"
                >
                    <ChartsLineChart
                        v-if="lineChartData.categories.length > 0"
                        :categories="lineChartData.categories"
                        :series="lineChartData.series"
                        :loading="status === 'pending' || statusQ === 'pending'"
                        height="100%"
                        :show-indicator-filter="false"
                        :annotations="chartAnnotations"
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
                                Data Belum Tersedia
                            </p>
                            <p class="text-xs text-gray-400 max-w-xs">
                                Data tren belum tersedia untuk wilayah atau
                                periode yang dipilih
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    class="lg:col-span-1 w-full h-full border border-gray-100 rounded-xl p-4 flex flex-col"
                >
                    <h5 class="text-xs font-bold text-gray-700 mb-2 shrink-0">
                        Komparasi Sektor (y-on-y)
                    </h5>

                    <ChartsBarChart
                        v-if="
                            barChartData.categories &&
                            barChartData.categories.length > 0
                        "
                        :categories="barChartData.categories"
                        :series="barChartData.series"
                        :loading="statusBar === 'pending'"
                        height="h-full"
                        :show-legend="true"
                        legend-position="bottom"
                        :grid="{
                            top: '10%',
                            bottom: '15%',
                            left: '5%',
                            right: '5%',
                            containLabel: true,
                        }"
                        class="flex-1 w-full min-h-0"
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
                                Data Sektor Belum Tersedia
                            </p>
                            <p class="text-xs text-gray-400 max-w-xs">
                                Data sektor belum tersedia untuk wilayah atau
                                periode yang dipilih
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, toRef, unref } from "vue";
import { useAgregatInsight } from "~/composables/useAgregatInsight";
import StatCard from "~/components/shared/StatCard.vue";
import StatCardModern from "../shared/StatCardModern.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});
const selectedWilayahRef = toRef(props, "selectedWilayah");

const isLoading = computed(
    () =>
        status.value === "pending" ||
        statusQ.value === "pending" ||
        statusADHB.value === "pending",
);

// --- LOGIC: Dataset Selection & Aggregation Rules ---
const selectionState = computed(() => {
    const w = unref(selectedWilayahRef) || {};
    const provCount = w.provinsi?.length || 0;
    const kabCount = w.kabupaten?.length || 0;

    // 1. Check for Aggregation Error (More than 1 selection)
    if (provCount > 1 || kabCount > 1) {
        return {
            valid: false,
            msg: "Tidak tersedia untuk agregat wilayah",
            id: 0,
        };
    }

    // 2. Single Kabupaten -> ID 34
    if (kabCount === 1) {
        return { valid: true, msg: "", id: 34 };
    }

    // 3. Single Provinsi -> ID 41
    if (provCount === 1) {
        return { valid: true, msg: "", id: 41 };
    }

    // 4. Default / National / Empty -> No Data
    return {
        valid: false,
        msg: "Data belum tersedia untuk periode atau wilayah yang dipilih",
        id: 0,
    };
});

const activeDatasetId = computed(() => selectionState.value.id);
const isValidSelection = computed(() => ({
    valid: selectionState.value.valid,
}));
const statusMessage = computed(() => selectionState.value.msg);

const activeDatasetIdQ = computed(() => {
    const w = unref(selectedWilayahRef) || {};
    const provCount = w.provinsi?.length || 0;
    const kabCount = w.kabupaten?.length || 0;

    if (provCount > 1 || kabCount > 1) return 0; // Error / Aggregation
    if (kabCount === 1) return 36; // ID 36: Kab (Q-to-Q)
    if (provCount === 1) return 42; // ID 42: Prov (Q-to-Q)
    return 0;
});

const activeDatasetIdADHB = computed(() => {
    const w = unref(selectedWilayahRef) || {};
    const provCount = w.provinsi?.length || 0;
    const kabCount = w.kabupaten?.length || 0;

    if (provCount > 1 || kabCount > 1) return 0;
    if (kabCount === 1) return 9; // ID 9: Kab (ADHB)
    if (provCount === 1) return 31; // ID 31: Prov (ADHB)
    return 0;
});

const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(isoString));
};

// --- FETCH DATA ---
// Now passing a COMPUTED property (Ref) as the first argument
const { status, rawRecords, datasetInfo } = useAgregatInsight(
    activeDatasetId,
    selectedWilayahRef,
    {
        id_indikator_insight: 168,
    },
);

const { status: statusQ, rawRecords: rawRecordsQ } = useAgregatInsight(
    activeDatasetIdQ,
    selectedWilayahRef,
    {
        id_indikator_insight: 168,
    },
);

const {
    status: statusADHB,
    rawRecords: rawRecordsADHB,
    datasetInfo: datasetInfoADHB,
} = useAgregatInsight(activeDatasetIdADHB, selectedWilayahRef, {
    id_indikator_insight: 10, // Filter for Total PDRB
});

// --- TIME PERIODS ---
const availablePeriods = computed(() => {
    if (!rawRecords.value.length) return [];
    if (!isValidSelection.value.valid) return [];

    const periods = new Set();
    rawRecords.value.forEach((r) => {
        const year = r.itemCategory1?.nama || r.itemCategory1;
        const quarter = r.itemCategory2?.nama || r.itemCategory2;
        if (year && quarter) periods.add(`${year} ${quarter}`);
    });

    return Array.from(periods).sort((a, b) => {
        const [yearA] = a.split(" ");
        const [yearB] = b.split(" ");
        if (yearA !== yearB) return Number(yearB) - Number(yearA);
        return b.localeCompare(a);
    });
});

const selectedPeriod = ref("");

watch(
    [availablePeriods, isValidSelection],
    ([periods, validState]) => {
        if (!validState.valid) {
            selectedPeriod.value = "";
            return;
        }

        const isCurrentSelected =
            selectedPeriod.value && periods.includes(selectedPeriod.value);

        if (!isCurrentSelected && periods.length > 0) {
            // Find the first period in the list that actually has a non-null value
            const newestWithData = periods.find((p) => {
                const [pYear, ...pQParts] = p.split(" ");
                const pQuarter = pQParts.join(" ");

                const match = rawRecords.value.find((r) => {
                    const rYear = r.itemCategory1?.nama || r.itemCategory1;
                    const rQuarter = r.itemCategory2?.nama || r.itemCategory2;
                    return rYear === pYear && rQuarter === pQuarter;
                });

                return match && match.value !== null && match.value !== "";
            });

            // Default to newest data, otherwise just newest period
            selectedPeriod.value = newestWithData || periods[0];
        }
    },
    { immediate: true },
);

// --- CURRENT RECORD ---
const currentRecord = computed(() => {
    if (!isValidSelection.value.valid || !selectedPeriod.value) return null;

    const [selYear, ...selQuarterParts] = selectedPeriod.value.split(" ");
    const selQuarter = selQuarterParts.join(" ");

    const periodRecords = rawRecords.value.filter((r) => {
        const rYear = r.itemCategory1?.nama || r.itemCategory1;
        const rQuarter = r.itemCategory2?.nama || r.itemCategory2;
        return rYear === selYear && rQuarter === selQuarter;
    });

    if (periodRecords.length === 0) return null;

    // Stability Sort
    periodRecords.sort((a, b) => {
        const nameA = a.indikator?.nama || "";
        const nameB = b.indikator?.nama || "";
        if (nameA.length !== nameB.length) return nameA.length - nameB.length;
        return nameA.localeCompare(nameB);
    });

    return periodRecords[0];
});

const currentRecordQ = computed(() => {
    if (!isValidSelection.value.valid || !selectedPeriod.value) return null;

    const [selYear, ...selQuarterParts] = selectedPeriod.value.split(" ");
    const selQuarter = selQuarterParts.join(" ");

    const periodRecords = rawRecordsQ.value.filter((r) => {
        const rYear = r.itemCategory1?.nama || r.itemCategory1;
        const rQuarter = r.itemCategory2?.nama || r.itemCategory2;
        return rYear === selYear && rQuarter === selQuarter;
    });

    if (periodRecords.length === 0) return null;

    // Sort to ensure stability
    periodRecords.sort((a, b) => {
        const nameA = a.indikator?.nama || "";
        const nameB = b.indikator?.nama || "";
        if (nameA.length !== nameB.length) return nameA.length - nameB.length;
        return nameA.localeCompare(nameB);
    });

    return periodRecords[0];
});

const currentRecordADHB = computed(() => {
    if (!isValidSelection.value.valid || !selectedPeriod.value) return null;

    const [selYear, ...selQuarterParts] = selectedPeriod.value.split(" ");
    const selQuarter = selQuarterParts.join(" ");

    const periodRecords = rawRecordsADHB.value.filter((r) => {
        const rYear = r.itemCategory1?.nama || r.itemCategory1;
        const rQuarter = r.itemCategory2?.nama || r.itemCategory2;
        return rYear === selYear && rQuarter === selQuarter;
    });

    if (periodRecords.length === 0) return null;

    // Sort for stability
    periodRecords.sort((a, b) => {
        const nameA = a.indikator?.nama || "";
        const nameB = b.indikator?.nama || "";
        if (nameA.length !== nameB.length) return nameA.length - nameB.length;
        return nameA.localeCompare(nameB);
    });

    return periodRecords[0];
});

// --- LOGIC 4: LINE CHART DATA PROCESSING ---

// A. Filter Options
const chartMetricOptions = [
    { label: "Laju Pertumbuhan (Y-on-Y)", value: "yoy", color: "#3B82F6" }, // Blue
    { label: "Laju Pertumbuhan (Q-to-Q)", value: "qtq", color: "#10B981" }, // Emerald
    { label: "PDRB ADHB", value: "adhb", color: "#F59E0B" }, // Amber
];

// Default selected: Y-on-Y
const selectedChartMetrics = ref([chartMetricOptions[0]]);

// B. Helper to parse "2023 Triwulan IV" -> Sortable Value
const parsePeriod = (periodStr) => {
    const parts = periodStr.split(" ");
    const year = parseInt(parts[0]);
    const quarterRoman = parts.slice(1).join(" "); // "Triwulan IV"

    const romanMap = {
        "Triwulan I": 1,
        "Triwulan II": 2,
        "Triwulan III": 3,
        "Triwulan IV": 4,
    };
    const q = romanMap[quarterRoman] || 0;

    return { year, q, val: year * 10 + q };
};

// C. Compute Chart Data
const lineChartData = computed(() => {
    if (!isValidSelection.value.valid) return { categories: [], series: [] };

    // 1. Collect ALL available periods from all 3 datasets
    const allPeriodsSet = new Set();
    [rawRecords.value, rawRecordsQ.value, rawRecordsADHB.value]
        .flat()
        .forEach((r) => {
            if (!r) return;
            const year = r.itemCategory1?.nama || r.itemCategory1;
            const quarter = r.itemCategory2?.nama || r.itemCategory2;
            if (year && quarter) allPeriodsSet.add(`${year} ${quarter}`);
        });

    // 2. Filter & Sort Periods (>= 2023)
    const sortedPeriods = Array.from(allPeriodsSet)
        .filter((p) => {
            const y = parseInt(p.split(" ")[0]);
            // ADD THIS: Check if it contains "Tahunan" and exclude it
            const isAnnual = p.toLowerCase().includes("tahunan");

            return y >= 2023 && !isAnnual;
        })
        .sort((a, b) => parsePeriod(a).val - parsePeriod(b).val);

    if (sortedPeriods.length === 0) return { categories: [], series: [] };

    // 3. Build Series Data
    const series = selectedChartMetrics.value.map((metric) => {
        // Select source data based on metric value
        let sourceRecords = [];
        if (metric.value === "yoy") sourceRecords = rawRecords.value;
        else if (metric.value === "qtq") sourceRecords = rawRecordsQ.value;
        else if (metric.value === "adhb") sourceRecords = rawRecordsADHB.value;

        // Map periods to values
        const data = sortedPeriods.map((period) => {
            const [pYear, ...pQParts] = period.split(" ");
            const pQuarter = pQParts.join(" ");

            const match = sourceRecords.find((r) => {
                const rYear = r.itemCategory1?.nama || r.itemCategory1;
                const rQuarter = r.itemCategory2?.nama || r.itemCategory2;
                return rYear === pYear && rQuarter === pQuarter;
            });

            // Return value or null (gap in line)
            if (
                match &&
                match.value !== null &&
                match.value !== undefined &&
                match.value !== ""
            ) {
                return Number(match.value);
            }
            return null;
        });

        return {
            name: metric.label,
            data: data,
            color: metric.color,
            smooth: true,
            showSymbol: true,
        };
    });

    return {
        categories: sortedPeriods,
        series: series,
    };
});

const chartAnnotations = computed(() => {
    const categories = lineChartData.value.categories;

    const targetLabel = "2025 Triwulan IV";
    const targetIndex = categories.indexOf(targetLabel);

    if (targetIndex === -1) return {};

    return {
        markLine: {
            data: [
                {
                    xAxis: targetLabel,
                },
            ],
        },
        backgroundColor: {
            periods: [targetLabel],
            color: "rgba(239, 68, 68, 0.10)", // Red overlay — increase for stronger
            label: "Pasca Bencana", // Text at top-right
            labelColor: "#EF4444",
        },
    };
});

// 2. Add Logic for Bar Chart Dataset (Place this near your other activeDatasetId computations)
const activeDatasetIdBar = computed(() => {
    const w = unref(selectedWilayahRef) || {};
    const provCount = w.provinsi?.length || 0;
    const kabCount = w.kabupaten?.length || 0;

    if (provCount > 1 || kabCount > 1) return 0;
    if (kabCount === 1) return 33; // ID 33: Kab
    if (provCount === 1) return 40; // ID 40: Prov
    return 0;
});

// 3. Fetch Data
const { status: statusBar, rawRecords: rawRecordsBar } = useAgregatInsight(
    activeDatasetIdBar,
    selectedWilayahRef,
    {},
);

// 4. Process Data (Filter 2025 T3 onwards)
const barChartData = computed(() => {
    // 1. Safety Check & Filter Valid Values
    const validRecords = (rawRecordsBar.value || []).filter(
        (r) => r.value !== null && r.value !== undefined && r.value !== "",
    );

    if (validRecords.length === 0) return { categories: [], series: [] };

    // 2. Determine "Pra" and "Pasca" periods
    const getPeriodVal = (r) => {
        const y = parseInt(r.itemCategory1?.nama || r.itemCategory1 || 0);
        const qStr = r.itemCategory2?.nama || r.itemCategory2 || "";
        const qMap = {
            "Triwulan I": 1,
            "Triwulan II": 2,
            "Triwulan III": 3,
            "Triwulan IV": 4,
        };
        return y * 10 + (qMap[qStr] || 0);
    };

    const praVal = 20253; // Pra = 2025 Triwulan III

    // Find the newest valid period available in the dataset (Pasca)
    let pascaVal = 0;
    let pascaName = "";

    validRecords.forEach((r) => {
        const val = getPeriodVal(r);
        if (val > pascaVal) {
            pascaVal = val;
            pascaName = `${r.itemCategory1?.nama || r.itemCategory1} ${r.itemCategory2?.nama || r.itemCategory2}`;
        }
    });

    // 3. Group Data by Indicator
    const indicatorsMap = new Map();

    validRecords.forEach((r) => {
        const val = getPeriodVal(r);
        const indName = r.indikator?.nama || "Lainnya"; // Group by Indicator Name

        // Only interested in Pra or the Latest Period (Pasca)
        if (val !== praVal && val !== pascaVal) return;

        if (!indicatorsMap.has(indName)) {
            indicatorsMap.set(indName, { pra: 0, pasca: 0 });
        }

        const numVal = Number(r.value);
        if (val === praVal) indicatorsMap.get(indName).pra = numVal;
        if (val === pascaVal) indicatorsMap.get(indName).pasca = numVal;
    });

    // 4. Build Categories & Series
    const categories = Array.from(indicatorsMap.keys()).sort(); // Sort indicators alphabetically

    // Series 1: Pra Bencana
    const series = [
        {
            name: "Pra Bencana (2025 TW III)",
            data: categories.map((c) => indicatorsMap.get(c).pra),
            color: "#FCD34D", // Gray
            showLabel: true,
            labelFormatter: "{c}%",
        },
    ];

    // Series 2: Pasca Bencana (Only if newer data exists)
    if (pascaVal > praVal) {
        series.push({
            name: `Pasca Bencana (${pascaName})`,
            data: categories.map((c) => indicatorsMap.get(c).pasca),
            color: "#F59E0B", // Amber
            showLabel: true,
            labelFormatter: "{c}%",
        });
    }

    return { categories, series };
});
</script>
