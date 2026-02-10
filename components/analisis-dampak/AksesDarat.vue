<template>
    <div>
        <div class="mb-10 border-l-4 border-amber-500 pl-4 py-1">
            <div class="flex items-center gap-3 mb-1">
                <UIcon name="i-heroicons-truck" class="w-8 h-8 text-amber-500" />
                <h2 class="text-2xl font-bold text-gray-900">
                    Sektor Akses Darat
                </h2>
            </div>
            <p class="text-gray-600">
                Visualisasi sektor keberangkatan dan statistik penumpang untuk analisis mobilitas publik
            </p>
        </div>
        <div class="space-y-8">
            <!-- Header Section -->
            <div>
                <div class="mb-6">
                    <!-- Loading State untuk Header -->
                    <div
                        v-if="status28 === 'pending' || status29 === 'pending'"
                        class="space-y-3"
                    >
                        <USkeleton class="h-8 w-2/3" />
                        <div class="flex flex-wrap items-center gap-3">
                            <USkeleton class="h-6 w-32 rounded-full" />
                            <USkeleton class="h-6 w-28 rounded-full" />
                            <USkeleton class="h-6 w-40 rounded-full" />
                            <USkeleton class="h-4 w-48" />
                        </div>
                    </div>

                    <div v-else>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">
                            Data Angkutan Udara
                        </h2>
                        <p class="text-gray-600 mb-4">
                            Visualisasi data penumpang dan barang melalui angkutan
                            udara
                        </p>

                        <div class="flex flex-wrap items-center gap-3">
                            <UBadge
                                v-if="datasetInfo28.instansi"
                                color="primary"
                                variant="subtle"
                                size="md"
                                icon="i-heroicons-building-office-2"
                            >
                                {{ datasetInfo28.instansi }}
                            </UBadge>
                            <UBadge
                                v-if="datasetInfo28.frekuensi"
                                color="primary"
                                variant="subtle"
                                size="md"
                                icon="i-heroicons-calendar-days"
                            >
                                {{ datasetInfo28.frekuensi }}
                            </UBadge>
                            <UBadge
                                v-if="datasetInfo28.sumber"
                                color="gray"
                                variant="solid"
                                size="md"
                                icon="i-heroicons-document-text"
                            >
                                Sumber: {{ datasetInfo28.sumber }}
                            </UBadge>
                            <div
                                v-if="datasetInfo28.terakhir_diupdate"
                                class="flex items-center gap-1.5 text-xs text-gray-500 ml-1 font-medium"
                            >
                                <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                                <span
                                    >Diperbarui:
                                    {{
                                        formatDate(datasetInfo28.terakhir_diupdate)
                                    }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filter Row -->
                <div
                    v-if="status28 === 'pending' || status29 === 'pending'"
                    class="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                    <div class="flex items-center gap-2">
                        <USkeleton class="h-5 w-5" />
                        <USkeleton class="h-4 w-16" />
                        <USkeleton class="h-9 w-48" />
                    </div>
                    <div class="flex items-center gap-2">
                        <USkeleton class="h-5 w-5" />
                        <USkeleton class="h-4 w-12" />
                        <USkeleton class="h-9 w-32" />
                    </div>
                    <div class="ml-auto flex gap-4">
                        <USkeleton class="h-6 w-24" />
                        <USkeleton class="h-6 w-32" />
                    </div>
                </div>
                <div
                    v-else-if="
                        availableBandara.length > 0 && availableYears.length > 0
                    "
                    class="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                    <!-- Bandara Filter -->
                    <div class="flex items-center gap-2">
                        <UIcon
                            name="i-heroicons-map-pin"
                            class="w-5 h-5 text-gray-600"
                        />
                        <label
                            class="text-sm font-medium text-gray-700 whitespace-nowrap"
                        >
                            Bandara:
                        </label>
                        <USelectMenu
                            v-model="selectedBandara"
                            :items="availableBandara"
                            placeholder="Pilih Bandara"
                            class="w-48"
                        />
                    </div>

                    <!-- Tahun Filter -->
                    <div class="flex items-center gap-2">
                        <UIcon
                            name="i-heroicons-calendar"
                            class="w-5 h-5 text-gray-600"
                        />
                        <label
                            class="text-sm font-medium text-gray-700 whitespace-nowrap"
                        >
                            Tahun:
                        </label>
                        <USelectMenu
                            v-model="selectedTahun"
                            :items="availableYears"
                            placeholder="Pilih Tahun"
                            class="w-32"
                        />
                    </div>

                    <!-- Jenis Filter -->
                    <div class="flex items-center gap-4 ml-auto">
                        <label class="text-sm font-semibold text-gray-700">
                            Jenis Transportasi:
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                v-model="selectedJenis"
                                value="domestik"
                                class="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                            />
                            <span class="text-sm font-medium text-gray-700"
                                >Domestik</span
                            >
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                v-model="selectedJenis"
                                value="internasional"
                                class="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                            />
                            <span class="text-sm font-medium text-gray-700"
                                >Internasional</span
                            >
                        </label>
                    </div>
                </div>
            </div>

            <!-- Summary Statistics -->
            <div
                v-if="summaryStats.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <div
                    v-for="stat in summaryStats"
                    :key="stat.label + stat.subtitle"
                    class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100"
                >
                    <div class="flex items-start justify-between mb-2">
                        <UIcon :name="stat.icon" class="w-8 h-8 text-amber-600" />
                    </div>
                    <p class="text-2xl font-bold text-gray-900 mb-1">
                        {{ stat.value.toLocaleString("id-ID") }}
                    </p>
                    <p class="text-sm text-gray-600">{{ stat.label }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ stat.subtitle }}</p>
                </div>
            </div>

            <!-- Info Badge -->
            <div
                v-if="monthlyRecords.length > 0"
                class="flex items-center gap-2 text-sm text-gray-600"
            >
                <UIcon
                    name="i-heroicons-information-circle"
                    class="w-5 h-5 text-amber-600"
                />
                <span>
                    Menampilkan data bulanan untuk
                    <strong>{{ selectedBandara }}</strong> pada tahun
                    <strong>{{ selectedTahun }}</strong>
                    <template v-if="selectedWilayahCount > 1">
                        dari {{ selectedWilayahCount }} wilayah:
                        <span class="font-medium">
                            {{ selectedWilayahNames.slice(0, 3).join(", ") }}
                            <template v-if="selectedWilayahNames.length > 3">
                                +{{ selectedWilayahNames.length - 3 }} lainnya
                            </template>
                        </span>
                    </template>
                    ({{ monthlyRecords.length }} data points)
                </span>
            </div>

            <div>
                <ChartsMultipleLineChart
                    :data="monthlyRecords"
                    :loading="status28 === 'pending' || status29 === 'pending'"
                    chart-title="Data Penumpang Angkutan Udara (Bulanan)"
                    :indicator-names="penumpangIndicatorNames"
                    :show-indicator-filter="true"
                    x-axis-field="itemCategory3"
                    series-field="indikator"
                    :x-axis-order="[
                        'Januari',
                        'Februari',
                        'Maret',
                        'April',
                        'Mei',
                        'Juni',
                        'Juli',
                        'Agustus',
                        'September',
                        'Oktober',
                        'November',
                        'Desember',
                    ]"
                />
            </div>

            <div>
                <ChartsMultipleLineChart
                    :data="monthlyRecords"
                    :loading="status28 === 'pending' || status29 === 'pending'"
                    chart-title="Data Barang Angkutan Udara - ton (Bulanan)"
                    :indicator-names="barangIndicatorNames"
                    :show-indicator-filter="true"
                    x-axis-field="itemCategory3"
                    series-field="indikator"
                    :x-axis-order="[
                        'Januari',
                        'Februari',
                        'Maret',
                        'April',
                        'Mei',
                        'Juni',
                        'Juli',
                        'Agustus',
                        'September',
                        'Oktober',
                        'November',
                        'Desember',
                    ]"
                />
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
    selectedWilayah: {
        type: Object,
        default: () => ({
            provinsi: [],
            kabupaten: [],
            kecamatan: [],
            desa: [],
        }),
    },
});

const { getConfig } = useDatasetConfig();
const { extractUniqueValues } = useDynamicChartTransformer();

// Format helpers
const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

// --- Wilayah Info ---
const selectedWilayahRef = toRef(props, "selectedWilayah");

const selectedWilayahCount = computed(() => {
    const w = props.selectedWilayah;
    if (w.desa?.length > 0) return w.desa.length;
    if (w.kecamatan?.length > 0) return w.kecamatan.length;
    if (w.kabupaten?.length > 0) return w.kabupaten.length;
    if (w.provinsi?.length > 0) return w.provinsi.length;
    return 0;
});

const selectedWilayahNames = computed(() => {
    const w = props.selectedWilayah;
    if (w.desaNames?.length > 0) return w.desaNames;
    if (w.kecamatanNames?.length > 0) return w.kecamatanNames;
    if (w.kabupatenNames?.length > 0) return w.kabupatenNames;
    if (w.provinsiNames?.length > 0) return w.provinsiNames;
    return [];
});

// --- DATA FETCHING (with multiple wilayah support) ---
const dataset28 = useAgregatInsight(28, selectedWilayahRef);
const dataset29 = useAgregatInsight(29, selectedWilayahRef);

const {
    status: status28,
    error: error28,
    datasetInfo: datasetInfo28,
    rawRecords: rawRecords28,
} = dataset28;
const {
    status: status29,
    error: error29,
    datasetInfo: datasetInfo29,
    rawRecords: rawRecords29,
} = dataset29;

const config28 = getConfig(28);
const config29 = getConfig(29);

// --- STATE ---
const selectedBandara = ref("Semua Bandara");
const selectedTahun = ref("2025");
const selectedJenis = ref(["domestik", "internasional"]);

// --- COMBINE RECORDS ---
const allRecords = computed(() => {
    const combined = [];

    rawRecords28.value.forEach((record) => {
        combined.push({ ...record, _jenis: "domestik" });
    });

    rawRecords29.value.forEach((record) => {
        combined.push({ ...record, _jenis: "internasional" });
    });

    return combined;
});

// --- SEPARATE: Monthly vs Tahunan ---
const monthlyRecordsRaw = computed(() => {
    return allRecords.value.filter((record) => {
        const config = record._jenis === "domestik" ? config28 : config29;
        const bulan = record[config.chart.monthField]?.nama;
        return bulan && bulan !== "Tahunan";
    });
});

const tahunanRecordsRaw = computed(() => {
    return allRecords.value.filter((record) => {
        const config = record._jenis === "domestik" ? config28 : config29;
        const bulan = record[config.chart.monthField]?.nama;
        return bulan === "Tahunan";
    });
});

// --- AVAILABLE FILTERS ---
const availableBandara = computed(() => {
    const values = extractUniqueValues(
        monthlyRecordsRaw.value,
        config28.chart.bandaraField,
    );
    return ["Semua Bandara", ...values];
});

const availableYears = computed(() => {
    const values = extractUniqueValues(
        monthlyRecordsRaw.value,
        config28.chart.yearField,
    );
    return values.sort((a, b) => b.localeCompare(a));
});

// Set default tahun
watch(
    availableYears,
    (years) => {
        if (years.length > 0 && !years.includes(selectedTahun.value)) {
            selectedTahun.value = years[0];
        }
    },
    { immediate: true },
);

// Reset bandara saat wilayah berubah
watch(
    () => props.selectedWilayah,
    () => {
        selectedBandara.value = "Semua Bandara";
    },
    { deep: true },
);

// --- FILTERED MONTHLY RECORDS ---
// 🔥 FIX: Update aggregation logic untuk preserve jenis (baris ~380)
const monthlyRecords = computed(() => {
    let filtered = monthlyRecordsRaw.value;

    // Filter by jenis
    filtered = filtered.filter((record) =>
        selectedJenis.value.includes(record._jenis),
    );

    // Filter by tahun
    filtered = filtered.filter((record) => {
        const config = record._jenis === "domestik" ? config28 : config29;
        return record[config.chart.yearField]?.nama === selectedTahun.value;
    });

    // Filter/Aggregate by bandara
    if (selectedBandara.value !== "Semua Bandara") {
        filtered = filtered.filter((record) => {
            const config = record._jenis === "domestik" ? config28 : config29;
            return (
                record[config.chart.bandaraField]?.nama ===
                selectedBandara.value
            );
        });
    } else {
        // 🔥 FIX: Aggregate dengan key yang include jenis + indikator
        const aggregated = new Map();

        filtered.forEach((record) => {
            const config = record._jenis === "domestik" ? config28 : config29;
            const indikator = record[config.chart.indikatorField]?.nama;
            const bulan = record[config.chart.monthField]?.nama;

            // 🔥 KEY HARUS UNIK PER INDIKATOR (bukan per jenis)
            // Karena indikator sudah include "Domestik" atau "Internasional"
            const key = `${indikator}|${bulan}`;

            if (!aggregated.has(key)) {
                aggregated.set(key, {
                    ...record,
                    [config.chart.bandaraField]: {
                        kode: "",
                        nama: "Semua Bandara",
                    },
                    value: 0,
                });
            }

            aggregated.get(key).value += record.value || 0;
        });

        filtered = Array.from(aggregated.values());
    }

    // console.log("✅ Monthly Records Processed:", {
    //     total: filtered.length,
    //     sampleRecords: filtered.slice(0, 3).map((r) => ({
    //         jenis: r._jenis,
    //         indikator: r.indikator?.nama,
    //         bulan: r[
    //             r._jenis === "domestik"
    //                 ? config28.chart.monthField
    //                 : config29.chart.monthField
    //         ]?.nama,
    //         value: r.value,
    //     })),
    // });

    return filtered;
});

// --- SUMMARY STATISTICS ---
const summaryStats = computed(() => {
    let tahunanData = tahunanRecordsRaw.value;

    // Filter by jenis
    tahunanData = tahunanData.filter((record) =>
        selectedJenis.value.includes(record._jenis),
    );

    // Filter by tahun
    tahunanData = tahunanData.filter((record) => {
        const config = record._jenis === "domestik" ? config28 : config29;
        return record[config.chart.yearField]?.nama === selectedTahun.value;
    });

    // Filter/Aggregate by bandara
    if (selectedBandara.value !== "Semua Bandara") {
        tahunanData = tahunanData.filter((record) => {
            const config = record._jenis === "domestik" ? config28 : config29;
            return (
                record[config.chart.bandaraField]?.nama ===
                selectedBandara.value
            );
        });
    } else {
        const aggregated = new Map();

        tahunanData.forEach((record) => {
            const config = record._jenis === "domestik" ? config28 : config29;
            const indikator = record[config.chart.indikatorField]?.nama;

            if (!aggregated.has(indikator)) {
                aggregated.set(indikator, 0);
            }

            aggregated.set(
                indikator,
                aggregated.get(indikator) + (record.value || 0),
            );
        });

        tahunanData = Array.from(aggregated.entries()).map(
            ([indikator, value]) => ({
                indikator: { nama: indikator },
                value,
                _jenis: indikator.includes("Domestik")
                    ? "domestik"
                    : "internasional",
            }),
        );
    }

    // Build stats
    const stats = [];

    tahunanData.forEach((record) => {
        const nama = record.indikator?.nama || "";
        const jenis = nama.includes("Domestik") ? "Domestik" : "Internasional";

        const config = record._jenis === "domestik" ? config28 : config29;
        const tahun =
            record[config?.chart?.yearField]?.nama || selectedTahun.value;

        if (nama.includes("Penumpang Berangkat")) {
            stats.push({
                label: "Total Penumpang Berangkat",
                subtitle: `${jenis} - Tahun ${tahun}`,
                value: record.value || 0,
                icon: "i-heroicons-arrow-up-circle",
            });
        } else if (nama.includes("Penumpang Datang")) {
            stats.push({
                label: "Total Penumpang Datang",
                subtitle: `${jenis} - Tahun ${tahun}`,
                value: record.value || 0,
                icon: "i-heroicons-arrow-down-circle",
            });
        } else if (nama.includes("Barang Muat")) {
            stats.push({
                label: "Total Barang Muat (Ton)",
                subtitle: `${jenis} - Tahun ${tahun}`,
                value: record.value || 0,
                icon: "i-heroicons-cube",
            });
        } else if (nama.includes("Barang Bongkar")) {
            stats.push({
                label: "Total Barang Bongkar (Ton)",
                subtitle: `${jenis} - Tahun ${tahun}`,
                value: record.value || 0,
                icon: "i-heroicons-archive-box",
            });
        }
    });

    return stats;
});

// --- INDICATOR NAMES ---
const penumpangIndicatorNames = computed(() => {
    const names = [];

    if (selectedJenis.value.includes("domestik")) {
        names.push(
            "Jumlah Penumpang Berangkat melalui Angkutan Udara Domestik",
        );
        names.push("Jumlah Penumpang Datang melalui Angkutan Udara Domestik");
    }

    if (selectedJenis.value.includes("internasional")) {
        names.push(
            "Jumlah Penumpang Berangkat melalui Angkutan Udara Internasional",
        );
        names.push(
            "Jumlah Penumpang Datang melalui Angkutan Udara Internasional",
        );
    }

    return names;
});

const barangIndicatorNames = computed(() => {
    const names = [];

    if (selectedJenis.value.includes("domestik")) {
        names.push("Jumlah Barang Muat melalui Angkutan Udara Domestik");
        names.push("Jumlah Barang Bongkar melalui Angkutan Udara Domestik");
    }

    if (selectedJenis.value.includes("internasional")) {
        names.push("Jumlah Barang Muat melalui Angkutan Udara Internasional");
        names.push(
            "Jumlah Barang Bongkar melalui Angkutan Udara Internasional",
        );
    }

    return names;
});
</script>

<style scoped>
input[type="checkbox"]:checked {
    background-color: #f59e0b;
    border-color: #f59e0b;
}
</style>
