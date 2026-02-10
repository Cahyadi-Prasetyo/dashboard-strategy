<template>
    <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden"
    >
        <div class="p-3 border-b border-gray-100 flex-none space-y-3">
            <EkonomiChartHeader
                :dataset-info="datasetInfo"
                title="Analisis Sektor Unggulan"
                icon="i-heroicons-presentation-chart-line"
                icon-class="text-amber-500"
            />

            <div class="grid grid-cols-3 gap-2">
                <div class="space-y-0.5">
                    <label
                        class="text-[9px] font-semibold text-gray-400 uppercase"
                        >Indikator</label
                    >
                    <USelectMenu
                        v-model="selectedIndikator26"
                        :items="availableIndikator26"
                        class="w-full"
                        size="xs"
                    />
                </div>
                <div class="space-y-0.5">
                    <label
                        class="text-[9px] font-semibold text-gray-400 uppercase"
                        >Tahun</label
                    >
                    <USelectMenu
                        v-model="selectedYears26"
                        :items="availableYears26"
                        class="w-full"
                        size="xs"
                    />
                </div>
                <div class="space-y-0.5">
                    <label
                        class="text-[9px] font-semibold text-gray-400 uppercase"
                        >Sektor</label
                    >
                    <USelectMenu
                        v-model="selectedSektors26"
                        :items="availableSektors26"
                        multiple
                        class="w-full"
                        size="xs"
                    >
                        <template #label
                            ><span class="truncate">{{
                                selectedSektors26.length
                                    ? `${selectedSektors26.length} terpilih`
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
                v-else-if="filteredRecords26.length > 0"
                class="flex-1 min-h-0"
            >
                <ChartsLineChart
                    :key="`chart26-${selectedYears26}-${selectedIndikator26}-${uniqueKey}`"
                    :data="filteredRecords26"
                    :loading="loading"
                    chart-title=""
                    :indicator-names="[selectedIndikator26]"
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
const config26 = getConfig(26);

// Helper safe extractor to handle both Objects ({kode, nama}) and Strings
const safeExtract = (records, field) => {
    const rawValues = extractUniqueValues(records, field);
    // Map objects to their 'nama' property if needed
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

const selectedIndikator26 = ref("");
const selectedSektors26 = ref([]);
const selectedYears26 = ref("");

const normalize = (val) =>
    String(val || "")
        .replace(/\./g, "")
        .trim();

const getCode = (item) => {
    if (!item) return "";
    if (typeof item === "string") return normalize(item);
    return normalize(item.kode || item.id || "");
};

// 2. Update the computed property
const recordsByWilayah = computed(() => {
    if (props.loading || !props.rawRecords.length) return [];

    const selWil = props.selectedWilayah;
    const isKabupatenMode = selWil.kabupaten?.length > 0;
    const isProvinsiMode = !isKabupatenMode && selWil.provinsi?.length > 0;

    if (isKabupatenMode && selWil.kabupaten.length > 1) return [];
    if (isProvinsiMode && selWil.provinsi.length > 1) return [];

    return props.rawRecords.filter((r) => {
        // KEY FIX: Use getCode() on the API record data too!
        const recProvKode = getCode(r.kd_prov);
        const recKabKode = getCode(r.kd_kab);

        if (isKabupatenMode) {
            const targetKab = getCode(selWil.kabupaten[0]);
            return recKabKode === targetKab;
        } else if (isProvinsiMode) {
            const targetProv = getCode(selWil.provinsi[0]);

            // Logic: Row is valid if it matches Prov ID AND is a Provincial Aggregate row
            const isTotalProvRow =
                !r.kd_kab ||
                getCode(r.kd_kab) === "00" ||
                getCode(r.kd_kab) === "0" ||
                getCode(r.kd_kab) === "";

            return recProvKode === targetProv && isTotalProvRow;
        } else {
            return recProvKode === "00";
        }
    });
});

const isMultiSelectError = computed(() => {
    const selWil = props.selectedWilayah;
    return (
        selWil.kabupaten?.length > 1 ||
        (selWil.provinsi?.length > 1 && selWil.kabupaten?.length === 0)
    );
});

// Use safeExtract to ensure we get Strings (names) for the dropdowns
const availableIndikator26 = computed(() =>
    safeExtract(recordsByWilayah.value, config26.chart.indikatorField),
);

const availableSektors26 = computed(() => {
    const filtered = recordsByWilayah.value.filter(
        (r) => (r.indikator?.nama || r.indikator) === selectedIndikator26.value,
    );
    return safeExtract(filtered, config26.chart.sektorField);
});

const availableYears26 = computed(() => {
    const filtered = recordsByWilayah.value.filter(
        (r) => (r.indikator?.nama || r.indikator) === selectedIndikator26.value,
    );
    return safeExtract(filtered, config26.chart.yearField).sort().reverse();
});

watch(
    [availableIndikator26, availableSektors26, availableYears26],
    ([avInd, avSekt, avYears]) => {
        if (
            !selectedIndikator26.value ||
            !avInd.includes(selectedIndikator26.value)
        ) {
            selectedIndikator26.value = avInd.length > 0 ? avInd[0] : "";
        }

        if (selectedSektors26.value.length === 0 && avSekt.length > 0) {
            selectedSektors26.value = avSekt.slice(0, 3);
        }

        if (
            !selectedYears26.value ||
            !avYears.includes(selectedYears26.value)
        ) {
            selectedYears26.value = avYears.length > 0 ? avYears[0] : "";
        }
    },
    { immediate: true, deep: true },
);

const filteredRecords26 = computed(() => {
    if (
        !selectedIndikator26.value ||
        !selectedSektors26.value.length ||
        !selectedYears26.value
    )
        return [];

    return recordsByWilayah.value.filter((r) => {
        // Compare with optional chaining to handle both Object and String data
        const valIndikator = r.indikator?.nama || r.indikator;
        const valSektor = r.itemCategory3?.nama || r.itemCategory3;
        const valTahun = r.itemCategory1?.nama || r.itemCategory1;

        const matchIndikator = valIndikator === selectedIndikator26.value;
        const matchSektor = selectedSektors26.value.includes(valSektor);
        const matchTahun = valTahun === selectedYears26.value;

        return matchIndikator && matchSektor && matchTahun;
    });
});

const uniqueKey = computed(() => {
    const selWil = props.selectedWilayah;
    const kode =
        selWil.kabupaten?.[0]?.kode || selWil.provinsi?.[0]?.kode || "nasional";
    return `${kode}-${filteredRecords26.value.length}`;
});
</script>
