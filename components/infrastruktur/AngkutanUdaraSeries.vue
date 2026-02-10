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
                    <UIcon name="i-heroicons-truck" class="w-4 h-4 text-blue-600" />
                    <span
                        class="text-[10px] font-black text-blue-700 uppercase tracking-wider"
                    >
                        Angkutan Udara
                    </span>
                </div>

                <div class="flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                    <UBadge
                        v-if="datasetInfoDomestik?.instansi"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ datasetInfoDomestik.instansi }}
                    </UBadge>
                    <UBadge
                        v-if="datasetInfoDomestik?.sumber"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ datasetInfoDomestik.sumber }}
                    </UBadge>
                    <UBadge
                        v-if="datasetInfoDomestik?.frekuensi"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ datasetInfoDomestik.frekuensi }}
                    </UBadge>
                    <span
                        v-if="datasetInfoDomestik?.terakhir_diupdate"
                        class="text-[10px] text-gray-400 flex items-center gap-0.5 ml-0.5"
                    >
                        <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                        {{ formatDate(datasetInfoDomestik.terakhir_diupdate) }}
                    </span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- CHART 1: PENUMPANG (Domestik + Internasional) -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden"
            >
                <div class="p-3 flex-none space-y-3">
                    <!-- Custom Header dengan Tahun -->
                    <div class="flex flex-col gap-1 overflow-hidden">
                        <h3 class="text-sm font-bold text-gray-900 flex items-start gap-2">
                            <UIcon
                                name="i-heroicons-user-group"
                                class="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500"
                            />
                            <span class="line-clamp-2 leading-snug">
                                {{ selectedYear ? `Jumlah Penumpang Angkutan Udara (${selectedYear})` : 'Jumlah Penumpang Angkutan Udara' }}
                            </span>
                        </h3>
                    </div>

                    <!-- Filter Lokal: Bandara Only -->
                    <div class="space-y-0.5 w-fit">
                        <label class="text-[9px] font-semibold text-gray-400 uppercase mr-3">
                            Bandara
                        </label>

                        <USelectMenu
                            v-model="selectedBandaraPenumpang"
                            :items="availableBandara"
                            size="xs"
                            placeholder="Pilih Bandara"
                            class="
                                w-fit inline-flex
                                px-2 py-1
                                border border-gray-200
                                rounded-md
                                text-[11px] text-gray-900
                                focus:ring-1 focus:ring-blue-500/30
                                focus:border-blue-500
                                transition-all
                                shadow-sm
                                bg-white
                            "
                        >
                            <template #label>
                                <span class="max-w-[140px] truncate">
                                    {{ selectedBandaraPenumpang || "Pilih Bandara" }}
                                </span>
                            </template>
                        </USelectMenu>
                    </div>
                </div>

                <div class="p-3 flex-1 min-h-0 flex flex-col relative">
                    <div
                        v-if="loadingDomestik || loadingInternasional"
                        class="absolute inset-0 p-3 bg-white z-10"
                    >
                        <USkeleton class="h-full w-full rounded" />
                    </div>
                    <div
                        v-else
                        class="flex-1 min-h-0"
                    >
                        <ChartsMultipleLineChart
                            :key="`penumpang-${selectedYear}-${selectedBandaraPenumpang}`"
                            :data="filteredRecordsPenumpang"
                            :loading="loadingDomestik || loadingInternasional"
                            chart-title=""
                            :show-indicator-filter="false"
                            :indicator-names="penumpangIndicatorNames"
                            x-axis-field="itemCategory3"
                            series-field="indikator"
                            filter-field="indikator"
                            :x-axis-order="monthOrder"
                            :annotations="chartAnnotations"
                            class="h-full w-full"
                        />
                    </div>
                </div>
            </div>

            <!-- CHART 2: BARANG (Domestik + Internasional) -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden"
            >
                <div class="p-3 border-b border-gray-100 flex-none space-y-3">
                    <!-- Custom Header dengan Tahun -->
                    <div class="flex flex-col gap-1 overflow-hidden">
                        <h3 class="text-sm font-bold text-gray-900 flex items-start gap-2">
                            <UIcon
                                name="i-heroicons-cube"
                                class="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500"
                            />
                            <span class="line-clamp-2 leading-snug">
                                {{ selectedYear ? `Jumlah Barang Angkutan Udara (${selectedYear})` : 'Jumlah Barang Angkutan Udara' }}
                            </span>
                        </h3>
                    </div>

                    <!-- Filter Lokal: Bandara Only -->
                    <div class="space-y-0.5">
                        <div class="space-y-0.5 w-fit">
                            <label class="text-[9px] font-semibold text-gray-400 uppercase mr-3">
                                Bandara
                            </label>

                            <USelectMenu
                                v-model="selectedBandaraBarang"
                                :items="availableBandara"
                                size="xs"
                                placeholder="Pilih Bandara"
                                class="
                                    w-fit inline-flex
                                    px-2 py-1
                                    border border-gray-200
                                    rounded-md
                                    text-[11px] text-gray-900
                                    focus:ring-1 focus:ring-blue-500/30
                                    focus:border-blue-500
                                    transition-all
                                    shadow-sm
                                    bg-white
                                "
                            >
                                <template #label>
                                    <span class="max-w-[140px] truncate">
                                        {{ selectedBandaraBarang || "Pilih Bandara" }}
                                    </span>
                                </template>
                            </USelectMenu>
                        </div>
                    </div>
                </div>

                <div class="p-3 flex-1 min-h-0 flex flex-col relative">
                    <div
                        v-if="loadingDomestik || loadingInternasional"
                        class="absolute inset-0 p-3 bg-white z-10"
                    >
                        <USkeleton class="h-full w-full rounded" />
                    </div>
                    <div
                        v-else
                        class="flex-1 min-h-0"
                    >
                        <ChartsMultipleLineChart
                            :key="`barang-${selectedYear}-${selectedBandaraBarang}`"
                            :data="filteredRecordsBarang"
                            :loading="loadingDomestik || loadingInternasional"
                            chart-title=""
                            :show-indicator-filter="false"
                            :indicator-names="barangIndicatorNames"
                            x-axis-field="itemCategory3"
                            series-field="indikator"
                            filter-field="indikator"
                            :x-axis-order="monthOrder"
                            :annotations="chartAnnotations"
                            class="h-full w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, toRef } from "vue";
import { useAgregatInsight } from "~/composables/useAgregatInsight";
import { useDatasetConfig } from "~/composables/useDatasetConfig";
import { useDynamicChartTransformer } from "~/composables/useDynamicChartTransformer";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const selectedWilayahRef = toRef(props, "selectedWilayah");

const { getConfig } = useDatasetConfig();
const { extractUniqueValues } = useDynamicChartTransformer();

// --- CONSTANTS ---
const DATASET_ID_DOMESTIK = 28;
const DATASET_ID_INTERNASIONAL = 29;

// Get configs
const config28 = getConfig(DATASET_ID_DOMESTIK);
const config29 = getConfig(DATASET_ID_INTERNASIONAL);

// Format date helper
const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(isoString));
};

// Indikator Names untuk Penumpang (Domestik + Internasional)
const penumpangIndicatorNames = [
    "Jumlah Penumpang Berangkat melalui Angkutan Udara Domestik",
    "Jumlah Penumpang Datang melalui Angkutan Udara Domestik",
    "Jumlah Penumpang Berangkat melalui Angkutan Udara Internasional",
    "Jumlah Penumpang Datang melalui Angkutan Udara Internasional",
];

// Indikator Names untuk Barang (Domestik + Internasional)
const barangIndicatorNames = [
    "Jumlah Barang Muat melalui Angkutan Udara Domestik",
    "Jumlah Barang Bongkar melalui Angkutan Udara Domestik",
    "Jumlah Barang Muat melalui Angkutan Udara Internasional",
    "Jumlah Barang Bongkar melalui Angkutan Udara Internasional",
];

const monthOrder = [
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

// Exclude aggregated periods
const excludePeriods = ["Tahunan", "Bulanan"];

// Annotations untuk garis bencana di November
const chartAnnotations = {
    markLine: {
        data: [{ xAxis: "November" }],
    },
    backgroundColor: {
        periods: ["Desember"],
        color: "rgba(239, 68, 68, 0.05)",
        label: "Pasca Bencana",
        labelColor: "#ef4444",
    },
};

// --- FETCH DATA ---
// Domestik - fetch semua data tanpa filter indikator
const {
    rawRecords: rawRecordsDomestik,
    status: statusDomestik,
    datasetInfo: datasetInfoDomestik,
} = useAgregatInsight(DATASET_ID_DOMESTIK, selectedWilayahRef);

// Internasional - fetch semua data tanpa filter indikator
const {
    rawRecords: rawRecordsInternasional,
    status: statusInternasional,
    datasetInfo: datasetInfoInternasional,
} = useAgregatInsight(DATASET_ID_INTERNASIONAL, selectedWilayahRef);

const loadingDomestik = computed(() => statusDomestik.value === "pending");
const loadingInternasional = computed(
    () => statusInternasional.value === "pending",
);

// --- COMBINE & FILTER MONTHLY DATA (exclude Tahunan) ---
const monthlyRecordsDomestik = computed(() => {
    return rawRecordsDomestik.value.filter((r) => {
        const bulan = r[config28.chart.monthField]?.nama || r.itemCategory3?.nama;
        return bulan && !excludePeriods.includes(bulan);
    });
});

const monthlyRecordsInternasional = computed(() => {
    return rawRecordsInternasional.value.filter((r) => {
        const bulan = r[config29.chart.monthField]?.nama || r.itemCategory3?.nama;
        return bulan && !excludePeriods.includes(bulan);
    });
});

// --- COMBINE MONTHLY DATA (Domestik + Internasional) ---
const allMonthlyRecords = computed(() => {
    return [...monthlyRecordsDomestik.value, ...monthlyRecordsInternasional.value];
});

// --- EXTRACT FILTER OPTIONS (Combined from both datasets) ---
const availableYears = computed(() => {
    const yearsDomestik = extractUniqueValues(
        monthlyRecordsDomestik.value,
        config28.chart.yearField || "itemCategory2",
    );
    const yearsInternasional = extractUniqueValues(
        monthlyRecordsInternasional.value,
        config29.chart.yearField || "itemCategory2",
    );
    
    // Combine and deduplicate
    const allYears = [...new Set([...yearsDomestik, ...yearsInternasional])];
    return allYears.sort().reverse();
});

const availableBandara = computed(() => {
    // 🔥 FIX: Extract dari allMonthlyRecords yang sudah include filter wilayah
    const bandaraDomestik = extractUniqueValues(
        monthlyRecordsDomestik.value,
        config28.chart.bandaraField || "itemCategory1",
    );
    const bandaraInternasional = extractUniqueValues(
        monthlyRecordsInternasional.value,
        config29.chart.bandaraField || "itemCategory1",
    );
    
    // Combine and deduplicate
    const allBandara = [...new Set([...bandaraDomestik, ...bandaraInternasional])];
    
    // 🔥 PENTING: Hanya tampilkan "Semua Bandara" jika ada lebih dari 1 bandara
    if (allBandara.length > 1) {
        return ["Semua Bandara", ...allBandara.sort()];
    } else if (allBandara.length === 1) {
        // Jika hanya 1 bandara, tidak perlu "Semua Bandara"
        return allBandara;
    } else {
        return ["Semua Bandara"];
    }
});

// --- SELECTED FILTERS (Unified year, separate bandara) ---
const selectedYear = ref("");
const selectedBandaraPenumpang = ref("Semua Bandara");
const selectedBandaraBarang = ref("Semua Bandara");

// --- AUTO SELECT DEFAULT ---
watch(
    [availableYears, availableBandara],
    ([years, bandara]) => {
        // Default tahun: terbaru yang tersedia
        if (!selectedYear.value || !years.includes(selectedYear.value)) {
            selectedYear.value = years[0] || "";
        }
        
        // 🔥 FIX: Auto-select bandara logic
        // Jika hanya ada 1 bandara (bukan "Semua Bandara"), auto-select bandara tersebut
        if (bandara.length === 1 && bandara[0] !== "Semua Bandara") {
            selectedBandaraPenumpang.value = bandara[0];
            selectedBandaraBarang.value = bandara[0];
        } 
        // Jika bandara yang dipilih tidak ada lagi di list, reset ke default
        else if (!bandara.includes(selectedBandaraPenumpang.value)) {
            selectedBandaraPenumpang.value = bandara.includes("Semua Bandara") ? "Semua Bandara" : (bandara[0] || "");
        }
        if (!bandara.includes(selectedBandaraBarang.value)) {
            selectedBandaraBarang.value = bandara.includes("Semua Bandara") ? "Semua Bandara" : (bandara[0] || "");
        }
    },
    { immediate: true },
);

// --- FILTERED RECORDS FOR CHART PENUMPANG ---
const filteredRecordsPenumpang = computed(() => {
    if (!selectedYear.value || !selectedBandaraPenumpang.value)
        return [];

    let filtered = allMonthlyRecords.value.filter((r) => {
        const config = r.indikator?.nama?.includes("Domestik") ? config28 : config29;
        const year = r[config.chart.yearField]?.nama || r.itemCategory2?.nama;
        const indikatorNama = r.indikator?.nama || "";

        return (
            year === selectedYear.value &&
            penumpangIndicatorNames.includes(indikatorNama)
        );
    });

    // Filter atau agregasi berdasarkan bandara
    if (selectedBandaraPenumpang.value === "Semua Bandara") {
        // Agregasi: sum semua bandara per indikator per bulan
        const aggregated = new Map();

        filtered.forEach((r) => {
            const config = r.indikator?.nama?.includes("Domestik") ? config28 : config29;
            const indikator = r.indikator?.nama;
            const bulan = r[config.chart.monthField]?.nama || r.itemCategory3?.nama;
            const key = `${indikator}|${bulan}`;

            if (!aggregated.has(key)) {
                aggregated.set(key, {
                    ...r,
                    [config.chart.bandaraField]: { kode: "", nama: "Semua Bandara" },
                    value: 0,
                });
            }

            aggregated.get(key).value += r.value || 0;
        });

        return Array.from(aggregated.values());
    } else {
        // Filter: bandara spesifik
        return filtered.filter((r) => {
            const config = r.indikator?.nama?.includes("Domestik") ? config28 : config29;
            const bandara = r[config.chart.bandaraField]?.nama || r.itemCategory1?.nama;
            return bandara === selectedBandaraPenumpang.value;
        });
    }
});

// --- FILTERED RECORDS FOR CHART BARANG ---
const filteredRecordsBarang = computed(() => {
    if (!selectedYear.value || !selectedBandaraBarang.value)
        return [];

    let filtered = allMonthlyRecords.value.filter((r) => {
        const config = r.indikator?.nama?.includes("Domestik") ? config28 : config29;
        const year = r[config.chart.yearField]?.nama || r.itemCategory2?.nama;
        const indikatorNama = r.indikator?.nama || "";

        return (
            year === selectedYear.value &&
            barangIndicatorNames.includes(indikatorNama)
        );
    });

    // Filter atau agregasi berdasarkan bandara
    if (selectedBandaraBarang.value === "Semua Bandara") {
        // Agregasi: sum semua bandara per indikator per bulan
        const aggregated = new Map();

        filtered.forEach((r) => {
            const config = r.indikator?.nama?.includes("Domestik") ? config28 : config29;
            const indikator = r.indikator?.nama;
            const bulan = r[config.chart.monthField]?.nama || r.itemCategory3?.nama;
            const key = `${indikator}|${bulan}`;

            if (!aggregated.has(key)) {
                aggregated.set(key, {
                    ...r,
                    [config.chart.bandaraField]: { kode: "", nama: "Semua Bandara" },
                    value: 0,
                });
            }

            aggregated.get(key).value += r.value || 0;
        });

        return Array.from(aggregated.values());
    } else {
        // Filter: bandara spesifik
        return filtered.filter((r) => {
            const config = r.indikator?.nama?.includes("Domestik") ? config28 : config29;
            const bandara = r[config.chart.bandaraField]?.nama || r.itemCategory1?.nama;
            return bandara === selectedBandaraBarang.value;
        });
    }
});

</script>