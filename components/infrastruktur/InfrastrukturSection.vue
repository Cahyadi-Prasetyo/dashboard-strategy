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
                        name="i-heroicons-truck"
                        class="w-4 h-4 text-blue-600"
                    />
                    <span
                        class="text-[10px] font-black text-blue-700 uppercase tracking-wider"
                    >
                        Kondisi Infrastruktur
                    </span>
                </div>
            </div>

            <UButton
                @click="isDetailOpen = true"
                icon="i-heroicons-table-cells"
                size="md"
                color="gray"
                variant="solid"
                class="font-bold shadow-md text-white bg-gray-900 hover:bg-gray-800"
                :ui="{
                    rounded: 'rounded-lg',
                    padding: { md: 'px-4 py-2.5' },
                    font: 'font-bold',
                    icon: { size: { md: 'w-5 h-5' } }
                }"
            >
                Lihat Detail Tabel
            </UButton>
        </div>

        <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden"
        >
            <div class="p-3 border-b border-gray-100 flex-none">
                <ChartHeader
                    :dataset-info="datasetInfo"
                    icon="i-heroicons-chart-bar"
                    icon-class="text-blue-600"
                />
            </div>

            <InfrastrukturChart
                :status="status"
                :is-national="isValidView"
                :chart-data-pra="chartDataPra"
                :chart-data-pasca="chartDataPasca"
            />

            <!-- Use the new InfrastrukturDetailModal -->
            <Teleport to="body">
                <SharedDetailModal
                    :is-open="isDetailOpen"
                    title="Detail Kondisi Infrastruktur"
                    :region-ids="regionIds"
                    :tahun="2026"
                    :dataset-id="105"
                    :column-config="infraColumnConfig"
                    :custom-row-matcher="infraMatcher"
                    @close="isDetailOpen = false"
                />
            </Teleport>
        </div>

        <div
            class="mt-4 flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-3 px-2 gap-3"
        >
            <div class="flex flex-col gap-1.5">
                <div
                    class="flex items-center gap-2 text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full w-fit font-medium"
                >
                    <UIcon
                        name="i-heroicons-information-circle"
                        class="w-3 h-3"
                    />
                    <span>
                        Data infrastruktur yang ditampilkan adalah
                        <b class="uppercase tracking-wider">
                            {{
                                isProvinsi
                                    ? "Tingkat Provinsi"
                                    : "Tingkat Nasional"
                            }}
                        </b>
                        berdasarkan pemutakhiran tanggal
                        <b class="uppercase tracking-wider">{{
                            selectedDate || "-"
                        }}</b>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, toRef, unref, watch } from "vue";
import { useAgregatInsight } from "~/composables/useAgregatInsight";
import ChartHeader from "~/components/ekonomi/ChartHeader.vue";
import InfrastrukturChart from "./InfrastrukturChart.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const infraColumnConfig = [
    { key: "jalanNasional", label: "Jalan (Nasional)" },
    { key: "jalanDaerah", label: "Jalan (Daerah)" },
    { key: "jembatanNasional", label: "Jembatan (Nasional)" },
    { key: "jembatanDaerah", label: "Jembatan (Daerah)" },
];

const selectedWilayahRef = toRef(props, "selectedWilayah");
const isDetailOpen = ref(false);
const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num || 0);

const regionIds = computed(() => {
    const w = unref(selectedWilayahRef);
    if (w.desa?.length) return w.desa;
    if (w.kecamatan?.length) return w.kecamatan;
    if (w.kabupaten?.length) return w.kabupaten;
    if (w.provinsi?.length) return w.provinsi;
    // Default national fallback - common provinces in Sumatra
    return DEFAULT_PROVINCE_IDS;
});

// --- LOGIC: VIEW LEVEL DETECTION ---
const isNational = computed(() => {
    const w = unref(selectedWilayahRef) || {};
    const emptyProv = (w.provinsi?.length || 0) === 0;
    const emptyKab = (w.kabupaten?.length || 0) === 0;
    const explicitNationalId = w.provinsi?.includes("00");
    const explicitNationalName = w.provinsiNames?.some(
        (n) => n === "Seluruh Wilayah" || n === "Semua Provinsi",
    );
    return (
        (emptyProv && emptyKab) || explicitNationalId || explicitNationalName
    );
});

const isProvinsi = computed(() => {
    const w = unref(selectedWilayahRef) || {};
    return (
        !isNational.value &&
        w.provinsi?.length === 1 &&
        (w.kabupaten?.length || 0) === 0
    );
});

const isValidView = computed(() => isNational.value || isProvinsi.value);

// --- DATASET SELECTION ---
const activeDatasetId = computed(() => {
    if (isNational.value) return 104;
    if (isProvinsi.value) return 105;
    return 0;
});

const { status, rawRecords, datasetInfo } = useAgregatInsight(
    activeDatasetId,
    selectedWilayahRef,
);

// --- DATE FILTER ---
const selectedDate = ref("");

const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(date);
    } catch (e) {
        return "";
    }
};

const availableDates = computed(() => {
    if (!rawRecords.value || rawRecords.value.length === 0) return [];
    const uniqueIsos = new Set();
    rawRecords.value.forEach((r) => {
        if (r.tanggal) uniqueIsos.add(r.tanggal);
    });
    const sortedIsos = Array.from(uniqueIsos).sort(
        (a, b) => new Date(b) - new Date(a),
    );
    return sortedIsos.map((iso) => formatDate(iso));
});

const infraMatcher = (r) => {
    const indName = (r.indikator?.nama || "").toLowerCase();
    const catName = (r.itemCategory1?.nama || "").toLowerCase();

    // Check for Roads
    if (indName.includes("jalan")) {
        if (catName.includes("nasional")) return "jalanNasional";
        if (
            catName.includes("daerah") ||
            catName.includes("provinsi") ||
            catName.includes("kabupaten")
        )
            return "jalanDaerah";
    }
    // Check for Bridges
    else if (indName.includes("jembatan")) {
        if (catName.includes("nasional")) return "jembatanNasional";
        if (
            catName.includes("daerah") ||
            catName.includes("provinsi") ||
            catName.includes("kabupaten")
        )
            return "jembatanDaerah";
    }

    return null; // No match
};

watch(
    availableDates,
    (dates) => {
        if (dates.length > 0 && !selectedDate.value)
            selectedDate.value = dates[0];
    },
    { immediate: true },
);

const filteredRecords = computed(() => {
    if (!rawRecords.value) return [];
    if (!selectedDate.value) return rawRecords.value;
    return rawRecords.value.filter(
        (r) => formatDate(r.tanggal) === selectedDate.value,
    );
});

const formattedLocation = computed(() => {
    if (isNational.value) return "Seluruh Indonesia";
    const w = unref(selectedWilayahRef) || {};
    if (w.provinsiNames?.length > 0) return `Provinsi: ${w.provinsiNames[0]}`;
    return "Seluruh Indonesia";
});

// --- CHART DATA PROCESSING (ROBUST MATCHING) ---
const structure = [
    { label: "Jalan (Nasional)", cat1: "Nasional", ind: "Jumlah Jalan" },
    { label: "Jalan (Daerah)", cat1: "Daerah", ind: "Jumlah Jalan" },
    { label: "Jembatan (Nasional)", cat1: "Nasional", ind: "Jumlah Jembatan" },
    { label: "Jembatan (Daerah)", cat1: "Daerah", ind: "Jumlah Jembatan" },
];

const categories = structure.map((s) => s.label);

// Helper: Flexible Matching
const matchesCategory = (record, def) => {
    const rInd = (record.indikator?.nama || "").toLowerCase();
    const rCat = (
        record.itemCategory1?.nama ||
        record.itemCategory1 ||
        ""
    ).toLowerCase();

    // 1. Match Indicator (Jalan vs Jembatan)
    if (!rInd.includes(def.ind.toLowerCase().replace("jumlah ", "")))
        return false;

    // 2. Match Category (Nasional vs Daerah)
    const targetCat = def.cat1.toLowerCase();

    if (targetCat === "daerah") {
        // "Daerah" can match "daerah", "provinsi", or "kabupaten"
        return (
            rCat.includes("daerah") ||
            rCat.includes("provinsi") ||
            rCat.includes("kabupaten")
        );
    }

    return rCat.includes(targetCat);
};

const chartDataPra = computed(() => {
    if (!filteredRecords.value.length) return { categories: [], series: [] };
    const recordsPra = filteredRecords.value.filter(
        (r) => r.flag_prapasca === 1,
    );

    if (recordsPra.length === 0) return { categories: [], series: [] };

    const dataValues = structure.map((def) => {
        // Use flexible matching
        const match = recordsPra.find((r) => matchesCategory(r, def));
        return match ? Number(match.value) : 0;
    });

    return {
        categories,
        series: [
            {
                name: "Total Awal",
                data: dataValues,
                color: "#F97316",
                showLabel: true,
                labelFormatter: "{c}",
            },
        ],
    };
});

const chartDataPasca = computed(() => {
    if (!filteredRecords.value.length) return { categories: [], series: [] };
    const recordsPasca = filteredRecords.value.filter(
        (r) => r.flag_prapasca === 2,
    );

    if (recordsPasca.length === 0) return { categories: [], series: [] };

    const seriesFungsional = structure.map((def) => {
        const match = recordsPasca.find(
            (r) =>
                matchesCategory(r, def) &&
                (r.itemCategory2?.nama || "").toLowerCase() === "fungsional",
        );
        return match ? Number(match.value) : 0;
    });

    const seriesPerbaikan = structure.map((def) => {
        const match = recordsPasca.find(
            (r) =>
                matchesCategory(r, def) &&
                (r.itemCategory2?.nama || "").toLowerCase() === "perbaikan",
        );
        return match ? Number(match.value) : 0;
    });

    // Helper: Only show label if value > 0
    const hideZeroLabel = (params) => (params.value > 0 ? params.value : "");

    return {
        categories,
        series: [
            {
                name: "Fungsional",
                data: seriesFungsional,
                color: "#10B981",
                showLabel: true,
                labelFormatter: hideZeroLabel,
            },
            {
                name: "Dalam Perbaikan",
                data: seriesPerbaikan,
                color: "#F59E0B",
                showLabel: true,
                labelFormatter: hideZeroLabel,
            },
        ],
    };
});
</script>
