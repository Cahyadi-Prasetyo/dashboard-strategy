<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-10 mt-6"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-lg border border-amber-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-briefcase"
                        class="w-4 h-4 text-amber-600"
                    />
                    <span
                        class="text-[10px] font-black text-amber-700 uppercase tracking-wider"
                    >
                        Pengangguran dan Ketenagakerjaan
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
                        v-if="datasetInfo?.frekuesi"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ datasetInfo.frekuesi }}
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
                <span
                    class="text-[10px] font-medium text-gray-500 uppercase tracking-wider mr-1"
                    >Pasca:</span
                >
                <USelectMenu
                    v-model="selectedPascaPeriod"
                    :items="pascaPeriodOptions"
                    placeholder="Pilih Periode"
                    class="min-w-[140px]"
                    size="xs"
                    :disabled="pascaPeriodOptions.length === 0"
                    :ui="{
                        base: 'relative',
                        trigger:
                            'border-none shadow-none focus:ring-0 text-xs font-medium text-gray-700 py-1',
                    }"
                >
                    <template #label>
                        <span class="truncate">{{
                            selectedPascaPeriod || "Data Belum Tersedia"
                        }}</span>
                    </template>
                </USelectMenu>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <template v-if="status === 'pending'">
                <div
                    v-for="n in 6"
                    :key="n"
                    class="h-28 bg-gray-50 rounded-xl animate-pulse border border-gray-100"
                ></div>
            </template>
            <template v-else>
                <StatCardComparison
                    v-for="(card, index) in indicatorCards"
                    :key="index"
                    :label="card.label"
                    :icon="card.icon"
                    :pra="card.pra"
                    :pasca="card.pasca"
                    :unit="card.unit"
                    :color-theme="card.colorTheme"
                    :pra-label="`Pra (Februari 2025)`"
                    :pasca-label="
                        selectedPascaPeriod
                            ? `Pasca (${shortPeriod(selectedPascaPeriod)})`
                            : 'Pasca'
                    "
                />
            </template>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-100">
            <h4 class="text-sm font-bold text-gray-800 mb-4 px-1">
                Jumlah Penduduk Bekerja Menurut Lapangan Usaha Utama
            </h4>

            <div
                class="h-[300px] w-full border border-gray-100 rounded-xl p-4 bg-gray-50/30 shadow-sm"
            >
                <ChartsBarChart
                    v-if="barChartData.categories.length > 0"
                    :categories="barChartData.categories"
                    :series="barChartData.series"
                    :loading="statusChart === 'pending'"
                    height="h-full"
                    :show-legend="true"
                    legend-position="top"
                    :rotate-label="45"
                    :grid="{
                        top: '15%',
                        bottom: '5%',
                        left: '5%',
                        right: '5%',
                        containLabel: true,
                    }"
                    class="h-full w-full"
                />

                <div
                    v-else
                    class="h-full flex flex-col items-center justify-center text-gray-400 gap-2"
                >
                    <UIcon
                        name="i-heroicons-chart-bar"
                        class="w-8 h-8 opacity-20"
                    />
                    <span class="text-xs"
                        >Data Lapangan Usaha tidak tersedia</span
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, toRef, unref, watch } from "vue";
import { useAgregatInsight } from "~/composables/useAgregatInsight";
import StatCardComparison from "~/components/shared/StatCardComparison.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});
const selectedWilayahRef = toRef(props, "selectedWilayah");

// --- DATA FETCHING ---
const { status, rawRecords, datasetInfo } = useAgregatInsight(
    114,
    selectedWilayahRef,
);
const { status: statusChart, rawRecords: rawRecordsChart } = useAgregatInsight(
    114,
    selectedWilayahRef,
    { id_indikator_insight: 267 },
);

// --- PERIOD LOGIC ---
const PRA_PERIOD_STR = "2025 Februari";
const FILTER_START_STR = "2025 Agustus";

const getPeriodValue = (periodStr) => {
    if (!periodStr) return 0;
    const [year, month] = periodStr.split(" ");
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
        Ags: 8,
        Sep: 9,
        Okt: 10,
        Nov: 11,
        Des: 12,
    };
    return parseInt(year) * 100 + (monthMap[month] || 0);
};

const pascaPeriodOptions = computed(() => {
    if (!rawRecords.value) return [];
    const periods = new Set();
    [rawRecords.value, rawRecordsChart.value].flat().forEach((r) => {
        if (!r) return;
        const y = r.itemCategory1?.nama || r.itemCategory1;
        const m = r.itemCategory2?.nama || r.itemCategory2;
        if (y && m) periods.add(`${y} ${m}`);
    });
    const filterStartVal = getPeriodValue(FILTER_START_STR);
    return Array.from(periods)
        .filter((p) => getPeriodValue(p) > filterStartVal)
        .sort((a, b) => getPeriodValue(b) - getPeriodValue(a));
});

const selectedPascaPeriod = ref("");
watch(
    pascaPeriodOptions,
    (opts) => {
        if (opts.length > 0 && !selectedPascaPeriod.value)
            selectedPascaPeriod.value = opts[0];
    },
    { immediate: true },
);

// --- VALUE EXTRACTION ---
const getValueForContext = (
    records,
    periodStr,
    config,
    categoryLabel = null,
) => {
    if (!periodStr || !records) return null;
    const [pYear, pMonth] = periodStr.split(" ");
    const w = unref(selectedWilayahRef) || {};
    const provCount = w.provinsi?.length || 0;
    const kabCount = w.kabupaten?.length || 0;

    // Direct Match (National, 1 Prov, or 1 Kab)
    if (
        (provCount === 0 && kabCount === 0) ||
        (provCount === 1 && kabCount === 0) ||
        kabCount === 1
    ) {
        const directMatch = records.find((r) => {
            const rYear = r.itemCategory1?.nama || r.itemCategory1;
            const rMonth = r.itemCategory2?.nama || r.itemCategory2;
            if (rYear !== pYear || rMonth !== pMonth) return false;
            if (config.label && r.indikator?.nama !== config.label)
                return false;
            if (categoryLabel) {
                const c3 = r.itemCategory3?.nama || r.itemCategory3;
                if (
                    c3 !== categoryLabel &&
                    r.itemCategory1?.nama !== categoryLabel
                )
                    return false;
            }
            if (provCount === 0 && kabCount === 0)
                return r.kd_prov?.kode === "00";
            if (provCount === 1 && kabCount === 0)
                return r.kd_prov?.kode === w.provinsi[0] && !r.kd_kab;
            if (kabCount === 1) return r.kd_kab?.kode === w.kabupaten[0];
            return false;
        });
        if (directMatch) return Number(directMatch.value) || 0;
    }

    // Aggregation
    const childRecords = records.filter((r) => {
        const rYear = r.itemCategory1?.nama || r.itemCategory1;
        const rMonth = r.itemCategory2?.nama || r.itemCategory2;
        if (rYear !== pYear || rMonth !== pMonth) return false;
        if (config.label && r.indikator?.nama !== config.label) return false;
        if (categoryLabel) {
            const c3 = r.itemCategory3?.nama || r.itemCategory3;
            if (c3 !== categoryLabel && r.itemCategory1?.nama !== categoryLabel)
                return false;
        }
        return true;
    });

    if (childRecords.length === 0) return null;
    if (childRecords[0].flag_agregasi === 0) return null;

    return childRecords.reduce(
        (acc, curr) => acc + (Number(curr.value) || 0),
        0,
    );
};

// --- CARDS ---
const indicatorsConfig = [
    {
        id: 212,
        label: "Tingkat Pengangguran Terbuka (TPT)",
        unit: "%",
        icon: "i-heroicons-chart-bar",
        colorTheme: "rose",
    },
    {
        id: 213,
        label: "Jumlah Pengangguran",
        unit: "Orang",
        icon: "i-heroicons-user-minus",
        colorTheme: "rose",
    },
    {
        id: 214,
        label: "Jumlah Bekerja",
        unit: "Orang",
        icon: "i-heroicons-briefcase",
        colorTheme: "emerald",
    },
    {
        id: 215,
        label: "Jumlah Angkatan Kerja",
        unit: "Orang",
        icon: "i-heroicons-users",
        colorTheme: "blue",
    },
    {
        id: 216,
        label: "Jumlah Bukan Angkatan Kerja",
        unit: "Orang",
        icon: "i-heroicons-home",
        colorTheme: "slate",
    },
    {
        id: 217,
        label: "Jumlah Penduduk Usia Kerja",
        unit: "Orang",
        icon: "i-heroicons-user-group",
        colorTheme: "indigo",
    },
];

const indicatorCards = computed(() => {
    if (!rawRecords.value) return [];
    return indicatorsConfig.map((config) => ({
        ...config,
        pra: getValueForContext(rawRecords.value, PRA_PERIOD_STR, config),
        pasca: getValueForContext(
            rawRecords.value,
            selectedPascaPeriod.value,
            config,
        ),
    }));
});

// --- BAR CHART (With Color & Clean Short Labels) ---
const barChartData = computed(() => {
    if (!rawRecordsChart.value || rawRecordsChart.value.length === 0)
        return { categories: [], series: [] };

    // 1. Extract Sectors
    const sectors = new Set();
    rawRecordsChart.value.forEach((r) => {
        const c3 = r.itemCategory3?.nama || r.itemCategory3;
        if (c3) sectors.add(c3);
    });
    const sortedSectors = Array.from(sectors).sort();

    // 2. Clean Labels Logic
    // Converts "Lapangan Usaha A. Pertanian..." -> "Pertanian..."
    const cleanLabel = (str) => {
        if (!str) return "";
        // Regex: Matches start of string, "Lapangan Usaha", space, optional Letter, dot, optional space
        return str.replace(/^Lapangan Usaha [A-Z]?\.\s*/i, "");
    };

    const categories = sortedSectors.map(cleanLabel);

    // 3. Build Series
    const buildSeriesData = (periodStr) => {
        return sortedSectors.map((sector) => {
            return getValueForContext(
                rawRecordsChart.value,
                periodStr,
                { label: null },
                sector,
            );
        });
    };

    return {
        categories,
        series: [
            {
                name: "Pra Bencana (Feb '25)",
                data: buildSeriesData(PRA_PERIOD_STR),
                color: "#F59E0B", // Amber-500
            },
            {
                name: selectedPascaPeriod.value
                    ? `Pasca (${shortPeriod(selectedPascaPeriod.value)})`
                    : "Pasca Bencana",
                data: buildSeriesData(selectedPascaPeriod.value),
                color: "#F97316", // Orange-500
            },
        ],
    };
});

const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(isoString));
};
const shortPeriod = (str) => {
    if (!str) return "";
    const [y, m] = str.split(" ");
    return `${m.substring(0, 3)} '${y.substring(2)}`;
};
</script>
