<template>
    <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden"
    >
        <div
            class="p-3 border-b border-gray-100 flex-none flex items-start justify-between gap-3"
        >
            <EkonomiChartHeader
                :dataset-info="datasetInfo"
                title="Tren Historis"
                icon="i-heroicons-presentation-chart-line"
                class="flex-1 min-w-0"
            />

            <USelectMenu
                v-model="selectedChartIndikator"
                :items="availableIndikator"
                placeholder="Pilih Indikator"
                class="w-48 sm:w-80 shrink-0"
                size="xs"
            >
                <template #leading>
                    <UIcon
                        name="i-heroicons-funnel"
                        class="w-3 h-3 text-gray-400"
                    />
                </template>
            </USelectMenu>
        </div>

        <div class="p-3 flex-1 min-h-0 flex flex-col relative">
            <div
                v-if="loading"
                class="absolute inset-0 p-3 flex flex-col justify-end gap-2 bg-white z-10"
            >
                <USkeleton class="h-full w-full rounded" />
            </div>
            <div v-else-if="lineChartData.length > 0" class="flex-1 min-h-0">
                <ChartsLineChart
                    :key="`${selectedChartIndikator}-${allWilayahNames.length}`"
                    :data="lineChartData"
                    :loading="loading"
                    :chart-title="`${selectedChartIndikator} - Per ${wilayahLevelLabel}`"
                    :indicator-names="allWilayahNames"
                    :show-indicator-filter="false"
                    x-axis-field="period"
                    series-field="wilayah"
                    :x-axis-order="xAxisOrder"
                    :annotations="chartAnnotations"
                    filter-field="wilayah"
                    class="h-full w-full"
                />
            </div>
            <div v-else>
                <EkonomiChartEmptyState
                    title="Data Tidak Tersedia"
                    description="Tidak ditemukan data untuk filter indikator atau wilayah yang dipilih."
                    icon="i-heroicons-chart-bar"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
    rawRecords: { type: Array, default: () => [] },
    selectedWilayah: { type: Object, required: true },
    loading: { type: Boolean, default: false },
    datasetInfo: { type: Object, default: () => null },
});

const selectedChartIndikator = ref(null);

const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(isoString));
};

const currentWilayahLevel = computed(() => {
    if (props.selectedWilayah.desa?.length > 0) return "desa";
    if (props.selectedWilayah.kecamatan?.length > 0) return "kecamatan";
    if (props.selectedWilayah.kabupaten?.length > 0) return "kabupaten";
    return "provinsi";
});

const wilayahFieldMap = {
    provinsi: "kd_prov",
    kabupaten: "kd_kab",
    kecamatan: "kd_kec",
    desa: "kd_desa",
};

const wilayahLevelLabel = computed(() => {
    const labels = {
        provinsi: "Provinsi",
        kabupaten: "Kabupaten/Kota",
        kecamatan: "Kecamatan",
        desa: "Desa/Kelurahan",
    };
    return labels[currentWilayahLevel.value] || "Wilayah";
});

const availableIndikator = computed(() => {
    if (!props.rawRecords.length) return [];
    return [
        ...new Set(
            props.rawRecords.map((r) => r.indikator?.nama).filter(Boolean),
        ),
    ].sort();
});

watch(
    availableIndikator,
    (newVal) => {
        if (newVal.length > 0 && !selectedChartIndikator.value)
            selectedChartIndikator.value = newVal[0];
    },
    { immediate: true },
);

// --- X-AXIS (PERIOD) ---
const xAxisOrder = computed(() => {
    if (!props.rawRecords.length) return [];
    const periods = new Set();
    props.rawRecords.forEach((r) => {
        const thn = r.itemCategory1?.nama;
        const tw = r.itemCategory2?.nama;
        if (thn && tw && tw !== "Tahunan") periods.add(`${thn} ${tw}`);
    });
    return Array.from(periods).sort((a, b) => {
        const [yA, ...restA] = a.split(" ");
        const [yB, ...restB] = b.split(" ");
        if (yA !== yB) return Number(yA) - Number(yB);
        const twMap = {
            "Triwulan I": 1,
            "Triwulan II": 2,
            "Triwulan III": 3,
            "Triwulan IV": 4,
        };
        return (twMap[restA.join(" ")] || 0) - (twMap[restB.join(" ")] || 0);
    });
});

// 🔥 CORE LOGIC: FILTER DATA (BUKAN AGREGASI)
// Ini memastikan kita mengambil angka ASLI dari API, bukan menjumlahkan double.
const filteredDataForChart = computed(() => {
    if (!props.rawRecords.length) return [];

    return props.rawRecords.filter((r) => {
        // 1. Filter Indikator & Waktu
        if (r.indikator?.nama !== selectedChartIndikator.value) return false;
        if (r.itemCategory2?.nama === "Tahunan") return false;
        if (!r.itemCategory1?.nama || !r.itemCategory2?.nama) return false;

        // 2. Filter Level Wilayah (Strict)
        const provCode = r.kd_prov?.kode;
        const kabCode = r.kd_kab?.kode;
        const isRealKab = kabCode && kabCode !== "" && kabCode !== "00";

        // Jika mode KABUPATEN: Ambil yang punya kode kab valid
        if (currentWilayahLevel.value === "kabupaten") {
            return isRealKab;
        }
        // Jika mode PROVINSI: Ambil yang punya Prov TAPI TIDAK punya kode kab valid (Baris Total)
        else {
            return provCode && !isRealKab;
        }
    });
});

const lineChartData = computed(() => {
    const result = [];
    const wilayahField = wilayahFieldMap[currentWilayahLevel.value];

    filteredDataForChart.value.forEach((r) => {
        const wilayahNama = r[wilayahField]?.nama;
        if (wilayahNama) {
            result.push({
                period: {
                    nama: `${r.itemCategory1.nama} ${r.itemCategory2.nama}`,
                },
                wilayah: { nama: wilayahNama },
                value: Number(r.value) || 0,
            });
        }
    });

    return result.sort(
        (a, b) =>
            xAxisOrder.value.indexOf(a.period.nama) -
            xAxisOrder.value.indexOf(b.period.nama),
    );
});

const allWilayahNames = computed(() => {
    const wilayahField = wilayahFieldMap[currentWilayahLevel.value];
    // Gunakan filteredDataForChart agar legend sinkron dengan data yang ditampilkan
    const unique = new Set(
        filteredDataForChart.value
            .map((r) => r[wilayahField]?.nama)
            .filter(Boolean),
    );
    return Array.from(unique).sort();
});

const chartAnnotations = computed(() => {
    // Determine the start of the disaster period
    const startIndex = xAxisOrder.value.indexOf("2025 Triwulan III");

    if (startIndex === -1 || startIndex >= xAxisOrder.value.length - 1)
        return null;

    // Get all periods after the start date
    const pascaPeriods = xAxisOrder.value.slice(startIndex + 1);

    return {
        // 1. Red Background Area with "Pasca Bencana" Label
        backgroundColor: {
            periods: pascaPeriods,
            color: "rgba(239, 68, 68, 0.08)", // Red-500 with low opacity
            label: "Pasca Bencana", // <--- This adds the text annotation
            labelColor: "#ef4444",
        },
    };
});
</script>
