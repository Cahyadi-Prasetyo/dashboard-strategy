<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-10 mt-6"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-red-50 rounded-lg border border-red-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-banknotes"
                        class="w-4 h-4 text-red-600"
                    />
                    <span
                        class="text-[10px] font-black text-red-700 uppercase tracking-wider"
                    >
                        Inflasi Harga Konsumen
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
                    placeholder="Pilih Bulan"
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
                        <span class="truncate">
                            {{ selectedPeriod || "Pilih Bulan" }}
                        </span>
                    </template>
                </USelectMenu>
            </div>
        </div>

        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <StatCardComparison
                    label="Inflasi Bulanan (m-to-m)"
                    :pra="praRecord ? praRecord.value : '-'"
                    :pasca="
                        isValidSelection.valid && currentRecord
                            ? currentRecord.value
                            : '-'
                    "
                    icon="i-heroicons-chart-bar"
                    color-theme="red"
                    unit="%"
                    :pra-label="'Pra (Nov 2025)'"
                    :pasca-label="`Pasca (${selectedPeriod ? selectedPeriod.split(' ')[1] : '-'})`"
                    :loading="status === 'pending'"
                />

                <StatCard
                    label="Inflasi Tahunan (y-on-y)"
                    :value="
                        isValidSelection.valid && currentRecordYoY
                            ? currentRecordYoY.value
                            : null
                    "
                    unit="%"
                    icon="i-heroicons-arrow-path"
                    color="emerald"
                    :sublabel="
                        isValidSelection.valid && currentRecordYoY
                            ? `Periode: ${selectedPeriod}`
                            : 'Data belum tersedia'
                    "
                    empty-text="Data Belum Tersedia"
                    class="h-full"
                    :loading="status === 'pending'"
                />
            </div>

            <hr class="border-gray-100 my-4" />

            <div class="space-y-3">
                <h4
                    class="text-sm font-bold text-gray-800 flex items-center gap-2"
                >
                    <UIcon
                        name="i-heroicons-presentation-chart-line"
                        class="w-5 h-5 text-gray-500"
                    />
                    Tren Inflasi Bulanan (m-to-m)
                </h4>

                <div
                    class="h-[280px] w-full border border-gray-100 rounded-xl p-3 flex flex-col relative overflow-hidden"
                >
                    <LineChart
                        v-if="lineChartData.categories.length > 0"
                        :categories="lineChartData.categories"
                        :series="lineChartData.series"
                        :show-indicator-filter="false"
                        :annotations="annotations"
                        class="flex-1 min-h-0 transition-all duration-500"
                        :class="
                            !chartDataAvailability.available
                                ? 'opacity-30 blur-[2px] grayscale'
                                : ''
                        "
                    />

                    <div
                        v-if="!chartDataAvailability.available"
                        class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] transition-all duration-300"
                    >
                        <div
                            class="bg-white p-3 rounded-full shadow-sm border border-gray-100 mb-2"
                        >
                            <UIcon
                                name="i-heroicons-presentation-chart-line"
                                class="w-6 h-6 text-gray-300"
                            />
                        </div>
                        <h5 class="text-sm font-semibold text-gray-800">
                            Data Tren Tidak Tersedia
                        </h5>
                        <p
                            class="text-[11px] text-gray-500 mt-1 max-w-[200px] text-center leading-relaxed"
                        >
                            Data
                            <b>{{
                                chartDataAvailability.missing.join(" & ")
                            }}</b>
                            belum tersedia untuk wilayah atau periode yang
                            dipilih.
                        </p>
                    </div>
                </div>
            </div>

            <div
                v-if="showAndilSection && !statusAndilLoading"
                class="mt-4 pt-4 border-t border-gray-100"
            >
                <h4
                    class="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3"
                >
                    <UIcon
                        name="i-heroicons-shopping-bag"
                        class="w-5 h-5 text-gray-500"
                    />
                    Andil Inflasi Komoditas {{ selectedPeriod }} (m-to-m)
                </h4>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        class="bg-red-50/50 border border-red-100 rounded-xl p-4"
                    >
                        <div class="flex items-center justify-between mb-3">
                            <span
                                class="text-xs font-bold text-red-700 uppercase tracking-wide flex items-center gap-1.5"
                            >
                                <UIcon
                                    name="i-heroicons-arrow-trending-up"
                                    class="w-4 h-4"
                                />
                                Andil Tertinggi
                            </span>
                        </div>

                        <div v-if="top3Highest.length > 0" class="space-y-2">
                            <div
                                v-for="(item, idx) in top3Highest"
                                :key="idx"
                                class="flex items-center justify-between text-sm bg-white p-2 rounded-lg border border-red-100 shadow-sm"
                            >
                                <span
                                    class="font-medium text-gray-700 truncate flex-1 mr-2"
                                    >{{ item.name }}</span
                                >
                                <span class="font-bold text-red-600"
                                    >{{ formatAndilValue(item.value) }}%</span
                                >
                            </div>
                        </div>
                        <div
                            v-else
                            class="text-xs text-center text-gray-400 py-4 italic"
                        >
                            Tidak ada data komoditas
                        </div>
                    </div>

                    <div
                        class="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4"
                    >
                        <div class="flex items-center justify-between mb-3">
                            <span
                                class="text-xs font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5"
                            >
                                <UIcon
                                    name="i-heroicons-arrow-trending-down"
                                    class="w-4 h-4"
                                />
                                Andil Terendah
                            </span>
                        </div>

                        <div v-if="top3Lowest.length > 0" class="space-y-2">
                            <div
                                v-for="(item, idx) in top3Lowest"
                                :key="idx"
                                class="flex items-center justify-between text-sm bg-white p-2 rounded-lg border border-emerald-100 shadow-sm"
                            >
                                <span
                                    class="font-medium text-gray-700 truncate flex-1 mr-2"
                                    >{{ item.name }}</span
                                >
                                <span class="font-bold text-emerald-600"
                                    >{{ formatAndilValue(item.value) }}%</span
                                >
                            </div>
                        </div>
                        <div
                            v-else
                            class="text-xs text-center text-gray-400 py-4 italic"
                        >
                            Tidak ada data komoditas
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
import StatCardComparison from "~/components/shared/StatCardComparison.vue";
import LineChart from "~/components/charts/LineChart.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});
const selectedWilayahRef = toRef(props, "selectedWilayah");

// --- 1. CONFIGURATION ---
const DATASET_ID = 27;
const SECTOR_CODE_UMUM = "0";
const INDIKATOR_ID_MTM = 63;
const INDIKATOR_ID_YOY = 209;
const INDIKATOR_ID_ANDIL = 269; //

// --- 2. HELPERS ---
const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(isoString));
};

const formatAndilValue = (val) => {
    if (val === null || val === undefined) return "-";
    return Number(val).toLocaleString("id-ID", { maximumFractionDigits: 3 });
};

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
};

const parsePeriod = (periodStr) => {
    const [yearStr, monthName] = periodStr.split(" ");
    const year = parseInt(yearStr);
    const month = monthMap[monthName] || 0;
    return year * 100 + month;
};

// --- 3. REGION SELECTION LOGIC ---
const selectionState = computed(() => {
    const w = unref(selectedWilayahRef) || {};
    const provCount = w.provinsi?.length || 0;
    const kabCount = w.kabupaten?.length || 0;

    if (provCount > 1 || kabCount > 1) {
        return { valid: false, msg: "Tidak tersedia untuk agregat wilayah" };
    }
    if (kabCount === 1) return { valid: true, msg: "" };
    if (provCount === 1) return { valid: true, msg: "" };

    return { valid: false, msg: "Pilih Provinsi atau Kabupaten/Kota" };
});

const isValidSelection = computed(() => selectionState.value);
const statusMessage = computed(() => selectionState.value.msg);

// --- 4. FETCH DATA (TRIPLE FETCH) ---
// API 1: M-to-M (Indikator 63)
const {
    rawRecords: rawMtM,
    status: statusMtM,
    datasetInfo,
} = useAgregatInsight(DATASET_ID, selectedWilayahRef, {
    id_indikator_insight: INDIKATOR_ID_MTM,
});

// API 2: Y-on-Y (Indikator 209)
const { rawRecords: rawYoY, status: statusYoY } = useAgregatInsight(
    DATASET_ID,
    selectedWilayahRef,
    { id_indikator_insight: INDIKATOR_ID_YOY },
);

// API 3: Andil Inflasi (Indikator 269) for Bottom Cards
const { rawRecords: rawAndil, status: statusAndil } = useAgregatInsight(
    DATASET_ID,
    selectedWilayahRef,
    { id_indikator_insight: INDIKATOR_ID_ANDIL },
);

// Combined Status
const status = computed(() =>
    statusMtM.value === "pending" || statusYoY.value === "pending"
        ? "pending"
        : "idle",
);
const statusAndilLoading = computed(() => statusAndil.value === "pending");

// --- 5. DATA PROCESSING (Base Filter: Region & Sector) ---
const filterRecords = (records) => {
    if (!records || records.length === 0) return [];

    return records.filter((r) => {
        const cat3 = r.itemCategory3;
        const cat3Kode = cat3?.kode || "";
        const isUmum = String(cat3Kode) === SECTOR_CODE_UMUM;

        if (!isUmum || !isValidSelection.value.valid) return false;

        const w = unref(selectedWilayahRef);

        if (w.kabupaten?.length === 1) {
            return String(r.kd_kab?.kode) === String(w.kabupaten[0]);
        }

        if (w.provinsi?.length === 1) {
            const isProvMatch =
                String(r.kd_prov?.kode) === String(w.provinsi[0]);
            const kabKode = r.kd_kab?.kode ? String(r.kd_kab.kode) : "";
            const isNotKabRecord =
                !r.kd_kab || kabKode === "00" || kabKode === "";
            return isProvMatch && isNotKabRecord;
        }
        return false;
    });
};

const recordsMtoM = computed(() => filterRecords(rawMtM.value));
const recordsYonY = computed(() => filterRecords(rawYoY.value));

// --- 6. ANDIL INFLASI PROCESSING (Custom Filter) ---
const andilRecords = computed(() => {
    if (!rawAndil.value || rawAndil.value.length === 0 || !selectedPeriod.value)
        return [];

    const [pYear, pMonth] = selectedPeriod.value.split(" ");
    const w = unref(selectedWilayahRef) || {};

    // Check if National (No specific province/kabupaten selected or multiple) - Hide Data
    if (
        (!w.provinsi?.length && !w.kabupaten?.length) ||
        w.provinsi?.length > 1
    ) {
        return [];
    }

    return rawAndil.value.filter((r) => {
        // 1. Filter Period (Year & Month)
        const rYear = r.itemCategory1?.nama || r.itemCategory1;
        const rMonth = r.itemCategory2?.nama || r.itemCategory2;
        if (String(rYear) !== String(pYear) || rMonth !== pMonth) return false;

        // 2. Filter Region (Special Logic for Andil)
        if (w.kabupaten?.length === 1) {
            // Kabupaten Level: Must have kd_kab matching
            return r.kd_kab && String(r.kd_kab.kode) === String(w.kabupaten[0]);
        }

        if (w.provinsi?.length === 1) {
            // Province Level: Match Province AND kd_kab must be NULL
            const isProvMatch =
                String(r.kd_prov?.kode) === String(w.provinsi[0]);
            const isKabNull = !r.kd_kab || r.kd_kab === null;
            return isProvMatch && isKabNull;
        }

        return false;
    });
});

const sortedAndil = computed(() => {
    return [...andilRecords.value].sort(
        (a, b) => Number(b.value) - Number(a.value),
    );
});

const top3Highest = computed(() => {
    return sortedAndil.value.slice(0, 3).map((r) => ({
        name: r.itemCategory3?.nama || "Komoditas",
        value: r.value,
    }));
});

const top3Lowest = computed(() => {
    // For lowest, we take the bottom 3 (smallest or most negative values)
    // Re-sort ascending for this specific computed
    const ascending = [...andilRecords.value].sort(
        (a, b) => Number(a.value) - Number(b.value),
    );
    return ascending.slice(0, 3).map((r) => ({
        name: r.itemCategory3?.nama || "Komoditas",
        value: r.value,
    }));
});

// Show section only if we have data and not national
const showAndilSection = computed(() => {
    return sortedAndil.value.length > 0;
});

// --- 7. PERIODS (Filter > November 2025) ---
const availablePeriods = computed(() => {
    if (recordsMtoM.value.length === 0) return [];

    const periods = new Set();
    recordsMtoM.value.forEach((r) => {
        const year = r.itemCategory1?.nama || r.itemCategory1;
        const month = r.itemCategory2?.nama || r.itemCategory2;

        if (year && month) {
            const periodStr = `${year} ${month}`;
            const val = parsePeriod(periodStr);
            if (val > 202511) {
                periods.add(periodStr);
            }
        }
    });

    return Array.from(periods).sort((a, b) => parsePeriod(b) - parsePeriod(a));
});

const selectedPeriod = ref("");

watch(
    [availablePeriods],
    ([periods]) => {
        if (periods.length > 0) {
            if (
                !selectedPeriod.value ||
                !periods.includes(selectedPeriod.value)
            ) {
                selectedPeriod.value = periods[0];
            }
        } else {
            selectedPeriod.value = "";
        }
    },
    { immediate: true },
);

// --- 8. RECORDS FOR CARD ---
const praRecord = computed(() => {
    return recordsMtoM.value.find((r) => {
        const year = r.itemCategory1?.nama || r.itemCategory1;
        const month = r.itemCategory2?.nama || r.itemCategory2;
        return (
            String(year) === "2025" && (month === "November" || month === "Nov")
        );
    });
});

const currentRecord = computed(() => {
    if (!selectedPeriod.value || recordsMtoM.value.length === 0) return null;
    const [pYear, pMonth] = selectedPeriod.value.split(" ");
    return recordsMtoM.value.find((r) => {
        const rYear = r.itemCategory1?.nama || r.itemCategory1;
        const rMonth = r.itemCategory2?.nama || r.itemCategory2;
        return rYear === pYear && rMonth === pMonth;
    });
});

const currentRecordYoY = computed(() => {
    if (!selectedPeriod.value || recordsYonY.value.length === 0) return null;
    const [pYear, pMonth] = selectedPeriod.value.split(" ");
    return recordsYonY.value.find((r) => {
        const rYear = r.itemCategory1?.nama || r.itemCategory1;
        const rMonth = r.itemCategory2?.nama || r.itemCategory2;
        return rYear === pYear && rMonth === pMonth;
    });
});

const chartDataAvailability = computed(() => {
    const missing = [];
    // Check if the main dataset (recordsMtoM) is empty
    if (!recordsMtoM.value || recordsMtoM.value.length === 0) {
        missing.push("Inflasi (m-to-m)");
    }

    return { available: missing.length === 0, missing };
});

// --- 9. CHART DATA ---
const lineChartData = computed(() => {
    if (recordsMtoM.value.length === 0) return { categories: [], series: [] };

    const sorted = [...recordsMtoM.value].sort((a, b) => {
        const pA = `${a.itemCategory1?.nama} ${a.itemCategory2?.nama}`;
        const pB = `${b.itemCategory1?.nama} ${b.itemCategory2?.nama}`;
        return parsePeriod(pA) - parsePeriod(pB);
    });

    const categories = sorted.map(
        (r) => `${r.itemCategory1?.nama} ${r.itemCategory2?.nama}`,
    );

    const values = sorted.map((r) => {
        if (r.value === null || r.value === undefined || r.value === "")
            return null;
        return Number(r.value);
    });

    return {
        categories,
        series: [
            {
                name: "Inflasi (m-to-m)",
                data: values,
                color: "#F59E0B", // amber
                smooth: true,
                showSymbol: true,
            },
        ],
    };
});

const annotations = computed(() => {
    const categories = lineChartData.value.categories;

    // Categories here are built as `${year} ${month}` e.g. "2025 Desember"
    const targetLabel = "2025 Desember";
    const targetIndex = categories.indexOf(targetLabel);

    // Safety check: if Desember doesn't exist in data yet, return empty
    if (targetIndex === -1) return {};

    return {
        // Vertical dashed line — plugin finds this label, draws at midpoint before it
        markLine: {
            data: [
                {
                    xAxis: targetLabel,
                },
            ],
        },

        // Red highlight on the right side of the line
        backgroundColor: {
            periods: [targetLabel],
            color: "rgba(239, 68, 68, 0.10)", // Red overlay — increase for stronger
            label: "Pasca Bencana", // Text shown at top-right
            labelColor: "#EF4444",
        },
    };
});
</script>
