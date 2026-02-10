<template>
    <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden"
    >
        <div class="p-3 border-b border-gray-100 flex-none space-y-3">
            <EkonomiChartHeader
                :dataset-info="datasetInfo"
                title="Analisis Inflasi"
                icon="i-heroicons-banknotes"
                icon-class="text-emerald-500"
            />

            <div class="grid grid-cols-3 gap-2">
                <div class="space-y-0.5">
                    <label
                        class="text-[9px] font-semibold text-gray-400 uppercase"
                        >Tahun</label
                    >
                    <USelectMenu
                        v-model="selectedYears27"
                        :items="availableYears27"
                        class="w-full"
                        size="xs"
                    />
                </div>
                <div class="space-y-0.5 col-span-2">
                    <label
                        class="text-[9px] font-semibold text-gray-400 uppercase"
                        >Kelompok</label
                    >
                    <USelectMenu
                        v-model="selectedSektors27"
                        :items="availableSektors27"
                        multiple
                        class="w-full"
                        size="xs"
                    >
                        <template #label
                            ><span class="truncate">{{
                                selectedSektors27.length
                                    ? `${selectedSektors27.length} terpilih`
                                    : "Pilih"
                            }}</span></template
                        >
                    </USelectMenu>
                </div>
            </div>
        </div>

        <div class="p-3 flex-1 min-h-0 flex flex-col relative">
            <div v-if="loading" class="absolute inset-0 p-3 bg-white z-10">
                <USkeleton class="h-full w-full rounded" />
            </div>
            <div
                v-else-if="filteredRecords27.length > 0"
                class="flex-1 min-h-0"
            >
                <ChartsLineChart
                    :key="`chart27-${selectedYears27}-${uniqueKey}`"
                    :data="filteredRecords27"
                    :loading="loading"
                    chart-title=""
                    :show-indicator-filter="false"
                    x-axis-field="itemCategory2"
                    series-field="itemCategory3"
                    class="h-full w-full"
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
import { useDynamicChartTransformer } from "~/composables/useDynamicChartTransformer";
import { useDatasetConfig } from "~/composables/useDatasetConfig";

const props = defineProps({
    rawRecords: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    datasetInfo: { type: Object, default: () => null },
    selectedWilayah: { type: Object, required: true },
});

const { getConfig } = useDatasetConfig();
const { extractUniqueValues } = useDynamicChartTransformer();
// Using config 27 for Inflasi
const config27 = getConfig(27);

// Helper safe extractor
const safeExtract = (records, field) => {
    const rawValues = extractUniqueValues(records, field);
    return rawValues.map((v) => (v && typeof v === "object" ? v.nama : v));
};

const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(isoString));
};

const selectedSektors27 = ref([]);
const selectedYears27 = ref("");

// 1. Add the Normalize Helper
const normalize = (val) =>
    String(val || "")
        .replace(/\./g, "")
        .trim();

const getCode = (item) => {
    if (!item) return "";
    if (typeof item === "string") return normalize(item);
    return normalize(item.kode || item.id || "");
};

// 2. Update recordsByWilayah
const recordsByWilayah = computed(() => {
    if (props.loading || !props.rawRecords.length) return [];

    const selWil = props.selectedWilayah;
    const isKabupatenMode = selWil.kabupaten?.length > 0;
    const isProvinsiMode = !isKabupatenMode && selWil.provinsi?.length > 0;

    if (isKabupatenMode && selWil.kabupaten.length > 1) return [];
    if (isProvinsiMode && selWil.provinsi.length > 1) return [];

    return props.rawRecords.filter((r) => {
        const recProvKode = getCode(r.kd_prov);
        const recKabKode = getCode(r.kd_kab);

        if (isKabupatenMode) {
            const targetKab = getCode(selWil.kabupaten[0]);
            return recKabKode === targetKab;
        } else if (isProvinsiMode) {
            const targetProv = getCode(selWil.provinsi[0]);

            return recProvKode === targetProv;
        } else {
            return recProvKode === "00";
        }
    });
});

// 3. Update filteredRecords27 to handle the display logic
const filteredRecords27 = computed(() => {
    if (!selectedSektors27.value.length || !selectedYears27.value) return [];

    // First filter by Year & Sector
    const matches = recordsByWilayah.value.filter((r) => {
        const valSektor = r.itemCategory3?.nama || r.itemCategory3;
        const valTahun = r.itemCategory1?.nama || r.itemCategory1;

        // Simple string check for dropdown matching
        return (
            selectedSektors27.value.includes(valSektor) &&
            valTahun === selectedYears27.value
        );
    });

    const selWil = props.selectedWilayah;
    const isProvinsiMode =
        !selWil.kabupaten?.length && selWil.provinsi?.length > 0;

    // Smart Display Logic for Province Mode
    if (isProvinsiMode) {
        // Try to find the specific "Provincial Aggregate" row
        const aggregates = matches.filter((r) => {
            const k = getCode(r.kd_kab);
            return k === "" || k === "00" || k === "0";
        });

        // If we have specific provincial data, show ONLY that.
        // Otherwise (fallback), show all city data so the chart isn't empty.
        if (aggregates.length > 0) return aggregates;
        return matches;
    }

    return matches;
});

const isMultiSelectError = computed(() => {
    const selWil = props.selectedWilayah;
    return (
        selWil.kabupaten?.length > 1 ||
        (selWil.provinsi?.length > 1 && selWil.kabupaten?.length === 0)
    );
});

// Dropdown Options
const availableSektors27 = computed(() => {
    return safeExtract(
        recordsByWilayah.value,
        config27.chart.sektorField || "itemCategory3",
    );
});

const availableYears27 = computed(() => {
    return safeExtract(
        recordsByWilayah.value,
        config27.chart.yearField || "itemCategory1",
    )
        .sort()
        .reverse();
});

// Watcher to set defaults
watch(
    [availableSektors27, availableYears27],
    ([avSekt, avYears]) => {
        if (selectedSektors27.value.length === 0 && avSekt.length > 0) {
            // Default select top 3 categories (usually 'Umum' or main groups)
            selectedSektors27.value = avSekt.slice(0, 3);
        }

        if (
            !selectedYears27.value ||
            !avYears.includes(selectedYears27.value)
        ) {
            selectedYears27.value = avYears.length > 0 ? avYears[0] : "";
        }
    },
    { immediate: true, deep: true },
);

const uniqueKey = computed(() => {
    const selWil = props.selectedWilayah;
    const kode =
        selWil.kabupaten?.[0]?.kode || selWil.provinsi?.[0]?.kode || "nasional";
    return `${kode}-${filteredRecords27.value.length}`;
});
</script>
