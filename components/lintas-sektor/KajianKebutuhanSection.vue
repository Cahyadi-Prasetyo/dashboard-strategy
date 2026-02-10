<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-10 mt-6"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-clipboard-document-list"
                        class="w-4 h-4 text-indigo-600"
                    />
                    <span
                        class="text-[10px] font-black text-indigo-700 uppercase tracking-wider"
                    >
                        Kajian Kebutuhan Pasca Bencana
                    </span>
                </div>

                <div
                    class="flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-gray-200 shadow-sm"
                >
                    <UBadge
                        v-if="metaData.dataset?.instansi"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ metaData.dataset.instansi }}
                    </UBadge>
                    <UBadge
                        v-if="metaData.dataset?.sumber"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ metaData.dataset.sumber }}
                    </UBadge>
                    <span
                        v-if="metaData.dataset?.terakhir_diupdate"
                        class="text-[10px] text-gray-400 flex items-center gap-0.5 ml-1"
                    >
                        <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                        {{ formatDate(metaData.dataset.terakhir_diupdate) }}
                    </span>
                </div>
            </div>
        </div>

        <div class="mt-2">
            <div
                class="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
                <h3 class="text-lg font-bold text-gray-800">
                    {{ selectedIndicatorLabel }}
                </h3>

                <div class="flex flex-wrap items-center gap-2">
                    <div class="w-full md:w-64">
                        <select
                            v-model="selectedIndicatorId"
                            class="w-full pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        >
                            <option
                                v-for="opt in indicatorOptions"
                                :key="opt.id"
                                :value="opt.id"
                            >
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>

                    <div class="w-full md:w-48 relative">
                        <UIcon
                            name="i-heroicons-magnifying-glass"
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Cari wilayah/sektor..."
                            class="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <UTooltip
                        text="Export Excel"
                        :popper="{ placement: 'top' }"
                    >
                        <UButton
                            icon="i-heroicons-document-arrow-down"
                            size="sm"
                            :loading="isExporting"
                            :disabled="!filteredData.length || loading"
                            @click="triggerDownload"
                            class="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[38px]"
                            :ui="{
                                rounded: 'rounded-lg',
                                padding: { sm: 'px-4 py-2' },
                                font: 'font-semibold',
                                icon: { size: { sm: 'w-4 h-4' } },
                            }"
                        >
                            <span class="tracking-wide text-sm">Excel</span>
                        </UButton>
                    </UTooltip>
                </div>
            </div>

            <SharedTable
                :columns="tableColumns"
                :data="processedTableData"
                :loading="loading"
                :total-items="filteredData.length"
                :items-per-page="itemsPerPage"
                v-model:current-page="currentPage"
                v-model:sort-column="sortColumn"
                v-model:sort-direction="sortDirection"
                :show-no="true"
                empty-message="Data kajian kebutuhan tidak ditemukan, silakan coba filter lain."
            />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import SharedTable from "~/components/shared/SharedTable.vue";
import { useDynamicExcel } from "~/composables/useDynamicExcel";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const loading = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortColumn = ref("value"); // Default sort by Value
const sortDirection = ref("desc");
const { downloadDynamicExcel } = useDynamicExcel();
const isExporting = ref(false);
const headers = useRequestHeaders(["cookie"]);

// Dataset Configuration
const DATASET_ID = 126;
const indicatorOptions = [
    { id: 289, label: "Perkiraan Kebutuhan" },
    { id: 290, label: "Nilai Kewenangan Aset Pusat" },
    { id: 291, label: "Nilai Kewenangan Aset Provinsi" },
    { id: 292, label: "Nilai Kewenangan Aset Kab/Kota" },
    { id: 293, label: "Nilai Kewenangan Aset Masyarakat" },
    { id: 294, label: "Nilai Kewenangan Aset Dunia Usaha" },
];
const selectedIndicatorId = ref(289);

const rawData = ref([]);
const metaData = reactive({ dataset: null });

const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
};

const formatCurrency = (val) => {
    if (val == null) return "-";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val);
};

const selectedIndicatorLabel = computed(() => {
    return (
        indicatorOptions.find((o) => o.id === selectedIndicatorId.value)
            ?.label || "Data Kajian"
    );
});

// Fetch Data
async function fetchKajianData() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";
        const query = { id_dataset: DATASET_ID };

        // Handle Region Filters
        if (w.desa?.length) query.id_desa = w.desa;
        else if (w.kecamatan?.length) query.id_kec = w.kecamatan;
        else if (w.kabupaten?.length) query.id_kab = w.kabupaten;
        else if (w.provinsi?.length) query.id_prov = w.provinsi;

        const res = await $fetch(endpoint, { query, headers });

        if (res?.data?.meta?.dataset) {
            metaData.dataset = res.data.meta.dataset;
        }

        rawData.value = res?.data?.records || [];
    } catch (e) {
        console.error("Error fetching Kajian Data:", e);
        rawData.value = [];
    } finally {
        loading.value = false;
    }
}

// Columns Configuration
const tableColumns = computed(() => [
    { key: "provinsi", label: "Provinsi", sortable: true, width: "15%" },
    { key: "kabupaten", label: "Kabupaten/Kota", sortable: true, width: "20%" },
    {
        key: "sektor",
        label: "Sektor",
        sortable: true,
        width: "15%",
        headerClass: "bg-gray-50",
        cellClass: "font-medium",
    },
    { key: "subsektor", label: "Sub Sektor", sortable: true, width: "20%" },
    {
        key: "formattedValue",
        label: `Nilai (Rp)`,
        sortable: true,
        headerClass: "bg-indigo-50 text-indigo-700 text-right",
        cellClass: "text-right font-bold text-gray-800",
    },
]);

// Data Processing Pipeline
const filteredData = computed(() => {
    // 1. Filter by Selected Indicator & Search Query
    const indicatorId = selectedIndicatorId.value;
    const search = searchQuery.value.toLowerCase();

    return rawData.value
        .filter((r) => {
            // Filter by Indicator (using ID from indicator object if available, or fetch specific logic if API returns all)
            // Note: The API returns 'indikator.id' or we match by logic.
            // Assuming API returns all indicators for dataset 126, we filter by the selected ID.
            // If the API response structure doesn't include numeric ID directly in root, we might need to match keys.
            // Based on agregat-insight_126.json, we rely on 'indikator.nama' matching our option label OR fetch separate queries.
            // However, usually aggregates return filtered data if id_indikator is passed.
            // Since we fetched ALL (no id_indikator in fetch query), we filter here.
            // We'll match loosely by Name if ID isn't explicit, or use the known mapping.
            // Let's assume rawData contains all indicators.

            // Actually, best practice is to filtering in FETCH if dataset is huge.
            // But if dataset is small enough (agregat), client filtering is snappy.

            // Map ID to Name for filtering based on JSON structure
            const targetName = indicatorOptions.find(
                (o) => o.id === indicatorId,
            )?.label;
            const recordName = r.indikator?.nama;

            if (recordName !== targetName) return false;

            // Search Filter
            if (!search) return true;
            return (
                (r.kd_prov?.nama || "").toLowerCase().includes(search) ||
                (r.kd_kab?.nama || "").toLowerCase().includes(search) ||
                (r.itemCategory1?.nama || "").toLowerCase().includes(search) ||
                (r.itemCategory2?.nama || "").toLowerCase().includes(search)
            );
        })
        .map((r) => ({
            provinsi: r.kd_prov?.nama || "-",
            kabupaten: r.kd_kab?.nama || "-",
            sektor: r.itemCategory1?.nama || "-",
            subsektor: r.itemCategory2?.nama || "-",
            value: Number(r.value) || 0,
            formattedValue: formatCurrency(Number(r.value) || 0),
        }));
});

// Sorting & Pagination
const processedTableData = computed(() => {
    let data = [...filteredData.value];

    // Sorting
    if (sortColumn.value) {
        data.sort((a, b) => {
            let valA = a[sortColumn.value];
            let valB = b[sortColumn.value];

            // Handle numeric value sorting if formatting column is selected
            if (sortColumn.value === "formattedValue") {
                valA = a.value;
                valB = b.value;
            }

            if (typeof valA === "string") {
                return sortDirection.value === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }
            return sortDirection.value === "asc" ? valA - valB : valB - valA;
        });
    }

    // Pagination
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return data.slice(start, start + itemsPerPage.value);
});

const triggerDownload = async () => {
    if (!filteredData.value.length) return;

    isExporting.value = true;
    try {
        const title = selectedIndicatorLabel.value || "Data_Kajian";
        const date = new Date().toISOString().split("T")[0];
        const filename = `${title.replace(/\s+/g, "_")}_${date}`;

        const excelColumns = [
            { header: "Provinsi", key: "provinsi", width: 20 },
            { header: "Kabupaten/Kota", key: "kabupaten", width: 25 },
            { header: "Sektor", key: "sektor", width: 20 },
            { header: "Sub Sektor", key: "subsektor", width: 25 },
            { header: "Nilai (Rp)", key: "value", width: 20 },
        ];

        await downloadDynamicExcel(filteredData.value, filename, excelColumns);
    } catch (error) {
        console.error("Export error:", error);
    } finally {
        isExporting.value = false;
    }
};

// Watchers
watch(() => props.selectedWilayah, fetchKajianData, {
    deep: true,
    immediate: true,
});
watch([selectedIndicatorId, searchQuery], () => {
    currentPage.value = 1;
});
</script>
