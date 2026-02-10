<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
    >
        <div
            class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            @click="$emit('close')"
        ></div>

        <div
            class="relative w-full max-w-7xl max-h-[95vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10"
        >
            <div
                class="px-6 pt-6 pb-2 flex items-center justify-between gap-4 bg-white z-20"
            >
                <div class="flex items-center gap-2">
                    <UButton
                        v-if="currentLevel !== 'provinsi'"
                        icon="i-heroicons-arrow-left"
                        size="sm"
                        color="warning"
                        variant="soft"
                        @click="handleBack"
                    >
                        Kembali
                    </UButton>
                    <h3 class="text-lg font-bold text-gray-800">
                        {{ currentTitle }}
                    </h3>
                </div>

                <div class="flex items-center gap-2">
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <UTooltip
                            text="Export Halaman Ini"
                            :popper="{ placement: 'top' }"
                        >
                            <UButton
                                icon="i-heroicons-document-arrow-down"
                                size="xs"
                                :loading="isExporting"
                                :disabled="!filteredData.length"
                                @click="triggerDownload"
                                class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                <span class="tracking-wide text-sm"
                                    >Unduh Data per Wilayah</span
                                >
                            </UButton>
                        </UTooltip>

                        <UTooltip
                            text="Export Semua Level"
                            :popper="{ placement: 'top' }"
                        >
                            <UButton
                                icon="i-heroicons-document-arrow-down"
                                size="xs"
                                :loading="isExportingAll"
                                @click="triggerDownloadAll"
                                color="primary"
                                class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                <span class="tracking-wide text-sm"
                                    >Unduh Semua Data</span
                                >
                            </UButton>
                        </UTooltip>
                    </div>

                    <UButton
                        color="error"
                        variant="soft"
                        icon="i-heroicons-x-mark"
                        @click="$emit('close')"
                        class="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white border-none h-[31px] transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
                    />
                </div>
            </div>
            <div
                class="pt-6 pb-2 flex items-center justify-between gap-4 bg-white z-20"
            >
                <div
                    v-if="resolvedTabs.length > 1"
                    class="px-6 py-2 border-b border-gray-100 bg-white text-gray-800"
                >
                    <div class="flex space-x-1 bg-gray-100/50 p-1 rounded-lg w-fit">
                        <button
                            v-for="tab in resolvedTabs"
                            :key="tab.value"
                            @click="activeTab = tab.value"
                            class="px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200"
                            :class="
                                activeTab === tab.value
                                    ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            "
                        >
                            {{ tab.label }}
                        </button>
                    </div>
                </div>
                <div class="relative w-full sm:w-64">
                    <UIcon
                        name="i-heroicons-magnifying-glass"
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Cari wilayah..."
                        class="w-full pl-9 pr-4 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div class="flex-1 overflow-auto p-4 bg-slate-50/30">
                <div
                    class="bg-white rounded-lg shadow-sm border border-gray-200 inline-block min-w-full align-middle"
                >
                    <table class="min-w-full divide-y divide-gray-300">
                        <thead class="bg-gray-50 sticky top-0 z-10">
                            <template v-if="activeConfig.type === 'nested'">
                                <tr>
                                    <th
                                        rowspan="2"
                                        class="px-3 py-3.5 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200 sticky left-0 bg-gray-50 z-20 w-[200px]"
                                    >
                                        Wilayah
                                    </th>
                                    <th
                                        v-for="group in activeConfig.groups"
                                        :key="group"
                                        :colspan="activeConfig.columns.length"
                                        class="px-3 py-2 text-center text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-r border-gray-200 bg-emerald-50/50"
                                    >
                                        {{ group }}
                                    </th>
                                    <th
                                        v-if="!hideTotal"
                                        rowspan="2"
                                        class="px-3 py-3.5 text-center text-xs font-bold text-gray-900 uppercase tracking-wider bg-gray-100"
                                    >
                                        Total
                                    </th>
                                </tr>
                                <tr>
                                    <template
                                        v-for="group in activeConfig.groups"
                                        :key="group + '_subs'"
                                    >
                                        <th
                                            v-for="col in activeConfig.columns"
                                            :key="group + col"
                                            class="px-2 py-2 text-center text-[10px] font-semibold text-gray-600 border-r border-gray-200 min-w-[80px]"
                                        >
                                            {{ col }}
                                        </th>
                                    </template>
                                </tr>
                            </template>

                            <template v-else>
                                <tr>
                                    <th
                                        class="px-3 py-3.5 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200 sticky left-0 bg-gray-50 z-20 w-[200px]"
                                    >
                                        Wilayah
                                    </th>
                                    <th
                                        v-for="col in activeConfig.columns"
                                        :key="col"
                                        class="px-3 py-3.5 text-center text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200"
                                    >
                                        {{ col }}
                                    </th>
                                    <th
                                        v-if="!hideTotal"
                                        class="px-3 py-3.5 text-center text-xs font-bold text-gray-900 uppercase tracking-wider bg-gray-100"
                                    >
                                        Total
                                    </th>
                                </tr>
                            </template>
                        </thead>

                        <tbody class="divide-y divide-gray-200 bg-white">
                            <tr v-if="loading" class="animate-pulse">
                                <td
                                    :colspan="totalColSpan"
                                    class="px-3 py-4 text-center text-sm text-gray-500"
                                >
                                    Memuat data...
                                </td>
                            </tr>
                            <tr v-else-if="filteredData.length === 0">
                                <td
                                    :colspan="totalColSpan"
                                    class="px-3 py-4 text-center text-sm text-gray-500"
                                >
                                    Tidak ada data
                                </td>
                            </tr>
                            <tr
                                v-else
                                v-for="(row, idx) in paginatedData"
                                :key="row.id"
                                class="hover:bg-gray-50/80 transition-colors"
                            >
                                <td
                                    class="px-3 py-3 text-xs font-medium text-gray-900 border-r border-gray-100 sticky left-0 bg-white z-10"
                                    :class="
                                        canDrillDown(row)
                                            ? 'cursor-pointer text-blue-600 hover:text-blue-800'
                                            : ''
                                    "
                                    @click="handleDrillDown(row)"
                                >
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <span
                                            class="truncate max-w-[180px]"
                                            :title="row.region"
                                        >
                                            {{
                                                idx +
                                                1 +
                                                (currentPage - 1) * 10
                                            }}. {{ row.region }}
                                        </span>
                                        <UIcon
                                            v-if="canDrillDown(row)"
                                            name="i-heroicons-chevron-right"
                                            class="w-4 h-4 text-slate-900 flex-shrink-0"
                                        />
                                    </div>
                                </td>

                                <template v-if="activeConfig.type === 'nested'">
                                    <template
                                        v-for="group in activeConfig.groups"
                                        :key="group + '_data'"
                                    >
                                        <td
                                            v-for="col in activeConfig.columns"
                                            :key="group + col"
                                            class="px-2 py-2 text-xs text-right text-gray-600 border-r border-gray-100 tabular-nums"
                                        >
                                            {{
                                                formatNumber(
                                                    row.values[
                                                        `${group}_${col}`
                                                    ] || 0,
                                                )
                                            }}
                                        </td>
                                    </template>
                                </template>

                                <template v-else>
                                    <td
                                        v-for="col in activeConfig.columns"
                                        :key="col"
                                        class="px-2 py-2 text-xs text-right text-gray-600 border-r border-gray-100 tabular-nums"
                                    >
                                        {{ formatNumber(row.values[col] || 0) }}
                                    </td>
                                </template>

                                <td
                                    v-if="!hideTotal"
                                    class="px-2 py-2 text-xs text-right font-bold text-gray-900 bg-gray-50/50 tabular-nums"
                                >
                                    {{ formatNumber(row.total || 0) }}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot
                            v-if="filteredData.length > 0"
                            class="bg-gray-100 border-t-2 border-gray-300 font-bold sticky bottom-0 z-20"
                        >
                            <tr>
                                <td
                                    class="px-3 py-3 text-xs text-gray-900 border-r border-gray-100 sticky left-0 bg-gray-100 z-30"
                                >
                                    Grand Total
                                </td>

                                <template v-if="activeConfig.type === 'nested'">
                                    <template
                                        v-for="group in activeConfig.groups"
                                        :key="group + '_total'"
                                    >
                                        <td
                                            v-for="col in activeConfig.columns"
                                            :key="group + col + '_total'"
                                            class="px-2 py-2 text-xs text-right text-gray-900 border-r border-gray-100 tabular-nums"
                                        >
                                            {{
                                                formatNumber(
                                                    grandTotals.values[
                                                        `${group}_${col}`
                                                    ] || 0,
                                                )
                                            }}
                                        </td>
                                    </template>
                                </template>

                                <template v-else>
                                    <td
                                        v-for="col in activeConfig.columns"
                                        :key="col + '_total'"
                                        class="px-2 py-2 text-xs text-right text-gray-900 border-r border-gray-100 tabular-nums"
                                    >
                                        {{
                                            formatNumber(
                                                grandTotals.values[col] || 0,
                                            )
                                        }}
                                    </td>
                                </template>

                                <td
                                    v-if="!hideTotal"
                                    class="px-2 py-2 text-xs text-right font-black text-emerald-700 bg-emerald-50/50 tabular-nums"
                                >
                                    {{ formatNumber(grandTotals.total || 0) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div
                class="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-xs"
            >
                <!-- Metadata Section (Left) -->
                <div
                    class="flex flex-col gap-1 text-gray-500 text-left w-full sm:w-auto"
                >
                    <div
                        v-if="
                            currentDatasetMeta?.sumber
                        "
                        class="flex gap-1"
                    >
                        <span class="font-bold text-gray-600">Sumber:</span>
                        <span>{{
                            currentDatasetMeta.sumber !== '-' ? currentDatasetMeta.sumber : currentDatasetMeta.instansi || '-'
                        }}</span>
                    </div>
                    <!-- <div v-if="currentDatasetMeta?.instansi" class="flex gap-1">
                        <span class="font-bold text-gray-600">Instansi:</span>
                        <span>{{ currentDatasetMeta.instansi }}</span>
                    </div> -->
                    <div
                        v-if="currentDatasetMeta?.terakhir_diupdate"
                        class="flex gap-1"
                    >
                        <span class="font-bold text-gray-600"
                            >Terakhir diperbarui:</span
                        >
                        <span>{{
                            formatDate(currentDatasetMeta.terakhir_diupdate)
                        }}</span>
                    </div>
                </div>

                <!-- Pagination & Info (Right) -->
                <div
                    class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-end"
                >
                    <span class="text-gray-500 whitespace-nowrap">
                        {{ (currentPage - 1) * 10 + 1 }} -
                        {{ Math.min(currentPage * 10, filteredData.length) }}
                        dari {{ filteredData.length }} data
                    </span>
                    <div class="flex gap-2">
                        <button
                            :disabled="currentPage === 1"
                            @click="currentPage--"
                            class="text-gray-500 px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Prev
                        </button>
                        <button
                            :disabled="currentPage * 10 >= filteredData.length"
                            @click="currentPage++"
                            class="text-gray-500 px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useDynamicExcel } from "~/composables/useDynamicExcel";

const props = defineProps({
    isOpen: Boolean,
    title: { type: String, default: "Detail Data" },
    datasetId: { type: [Number, Array], required: true },
    indicatorId: { type: [Number, Array], default: null },
    regionIds: { type: Array, required: true },
    hideTotal: { type: Boolean, default: false },
    skipcol: { type: Array, default: () => [] },
    config: {
        type: Object,
        required: true,
        default: () => ({
            type: "flat",
            pivotVar: "",
            tabs: [],
            columns: [],
            groups: [],
        }),
    },
});

defineEmits(["close"]);

const { downloadDynamicExcel } = useDynamicExcel();
const isExporting = ref(false);
const isExportingAll = ref(false);

// --- Helpers ---
const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(date);
    } catch (e) {
        return isoString;
    }
};

// --- Configuration Helpers ---
const datasetPairs = computed(() => {
    const ids = Array.isArray(props.datasetId)
        ? props.datasetId
        : [props.datasetId];
    const indicators = Array.isArray(props.indicatorId)
        ? props.indicatorId
        : props.indicatorId != null
          ? [props.indicatorId]
          : [];

    return ids.map((id, i) => ({
        datasetId: id,
        indicatorId: indicators[i] ?? null,
    }));
});

const resolvedConfigs = computed(() => {
    if (Array.isArray(props.config)) return props.config;
    return datasetPairs.value.map(() => props.config);
});

const selectedTabItem = computed(() => {
    return (
        resolvedTabs.value.find((t) => t.value === activeTab.value) ||
        resolvedTabs.value[0]
    );
});

// Config yang aktif berdasarkan tab
const activeConfig = computed(() => {
    const dsIdx = selectedTabItem.value?.dsIndex || 0;
    if (resolvedConfigs.value.length === 0) return props.config;
    return resolvedConfigs.value[dsIdx] || resolvedConfigs.value[0];
});

const resolvedTabs = computed(() => {
    const result = [];
    datasetPairs.value.forEach((pair, dsIdx) => {
        const cfg = resolvedConfigs.value[dsIdx];
        const tabs = cfg?.tabs || [];

        if (tabs.length === 0) {
            result.push({
                label: `Dataset ${pair.datasetId}`,
                value: `ds_${dsIdx}`,
                dsIndex: dsIdx,
                filterValue: null,
            });
        } else {
            // If only 1 tab is defined for a dataset in a multi-dataset setup,
            // it's usually just a label for that dataset, not a filter value.
            const shouldFilter = tabs.length > 1;

            tabs.forEach((t, tIdx) => {
                const label = typeof t === "string" ? t : t.label;
                const value = typeof t === "string" ? t : t.value;
                result.push({
                    label: label,
                    value: `ds${dsIdx}_t${tIdx}_${value}`,
                    dsIndex: dsIdx,
                    filterValue: shouldFilter ? value : null,
                });
            });
        }
    });
    return result;
});

const activeDatasetIndex = computed(() => {
    return selectedTabItem.value?.dsIndex || 0;
});

const visibleColumns = computed(() => {
    if (!props.skipcol.length) return activeConfig.value.columns;
    return activeConfig.value.columns.filter(
        (col) => !props.skipcol.includes(col),
    );
});

const totalColSpan = computed(() => {
    if (activeConfig.value.type === "nested") {
        return (
            1 +
            (activeConfig.value.groups?.length || 0) *
                visibleColumns.value.length +
            (props.hideTotal ? 0 : 1)
        );
    }
    return 1 + visibleColumns.value.length + (props.hideTotal ? 0 : 1);
});

// --- State ---
const activeTab = ref("");

// Initializing activeTab
watch(
    resolvedTabs,
    (newTabs) => {
        if (
            newTabs.length > 0 &&
            (!activeTab.value || !newTabs.find((t) => t.value === activeTab.value))
        ) {
            activeTab.value = newTabs[0].value;
        }
    },
    { immediate: true },
);
const loading = ref(false);
const currentPage = ref(1);
const searchQuery = ref("");
const rawRecords = ref([]);
const currentLevel = ref("provinsi");
const currentParent = ref(null);
const currentDatasetMeta = ref(null); // Metadata active dataset

const currentTitle = computed(() => {
    return currentParent.value
        ? `${props.title} - ${currentParent.value.name}`
        : props.title;
});

// --- Fetch Logic ---
// Simpan raw records per dataset index
const rawRecordsMap = ref(new Map());

async function fetchData() {
    loading.value = true;
    rawRecords.value = [];
    currentDatasetMeta.value = null; // reset meta
    try {
        if (datasetPairs.value.length <= 1) {
            // Single dataset — fetch seperti biasa
            const pair = datasetPairs.value[0];
            const { records, meta } = await fetchSingle(
                pair.datasetId,
                pair.indicatorId,
            );
            rawRecords.value = records;
            currentDatasetMeta.value = meta;
        } else {
            // Multiple — fetch yang aktif saja
            const pair = datasetPairs.value[activeDatasetIndex.value];
            const cached = rawRecordsMap.value.get(activeDatasetIndex.value);

            if (cached) {
                rawRecords.value = cached.records;
                currentDatasetMeta.value = cached.meta;
            } else {
                const { records, meta } = await fetchSingle(
                    pair.datasetId,
                    pair.indicatorId,
                );
                const cacheData = { records, meta };
                rawRecordsMap.value.set(activeDatasetIndex.value, cacheData);
                rawRecords.value = records;
                currentDatasetMeta.value = meta;
            }
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    } finally {
        loading.value = false;
    }
}

async function fetchSingle(datasetId, indicatorId) {
    const baseQuery = {
        id_dataset: datasetId,
        ...(indicatorId != null ? { id_indikator_insight: indicatorId } : {}),
    };

    let requests = [];

    if (currentLevel.value === "provinsi") {
        const hasSpecificProvinces =
            props.regionIds.length > 0 &&
            String(props.regionIds[0]).length === 2;
        if (hasSpecificProvinces) {
            requests = props.regionIds.map((id) =>
                $fetch("/api/agregat-insight", {
                    query: { ...baseQuery, id_prov: id },
                }),
            );
        } else {
            requests = [$fetch("/api/agregat-insight", { query: baseQuery })];
        }
    } else if (currentLevel.value === "kabupaten" && currentParent.value) {
        requests = [
            $fetch("/api/agregat-insight", {
                query: { ...baseQuery, id_prov: currentParent.value.id },
            }),
        ];
    } else if (currentLevel.value === "kecamatan" && currentParent.value) {
        requests = [
            $fetch("/api/agregat-insight", {
                query: { ...baseQuery, id_kab: currentParent.value.id },
            }),
        ];
    }

    const responses = await Promise.all(requests);
    const records = responses.flatMap((r) => r?.data?.records || []);

    // Extract metadata from the first response
    const meta = responses[0]?.data?.meta?.dataset || null;

    return { records, meta };
}

watch(activeTab, () => {
    if (datasetPairs.value.length > 1) {
        fetchData();
    }
});

// Watch explicit untuk perubahan parent/level
watch([currentLevel, currentParent], () => {
    rawRecordsMap.value = new Map(); // clear cache karena filter wilayah berubah
    fetchData();
});

// --- Data Processing ---
const processedData = computed(() => {
    if (!rawRecords.value.length) return [];

    const pivotVar = activeConfig.value.pivotVar || "itemCategory1";
    const isSingleValue =
        activeConfig.value.columns.length === 1 && !activeConfig.value.pivotVar;

    // Tab filter
    const tabFiltered = rawRecords.value.filter((r) => {
        const filterVal = selectedTabItem.value?.filterValue;

        // Skip filter if no filter value is defined for this tab (or if it's a single tab label)
        if (!filterVal) return true;

        // Default to filtering by itemCategory2 unless otherwise specified in config
        const tabVar = activeConfig.value.tabVar || "itemCategory2";

        // Prevent filtering if the data is already being pivoted by this same variable
        if (activeConfig.value.pivotVar === tabVar) return true;

        const rowTabVal = r[tabVar]?.nama || r[tabVar];
        if (!rowTabVal) return false;

        // Normalize for comparison
        const normRowVal = String(rowTabVal).toLowerCase().trim();
        const normFilterVal = String(filterVal).toLowerCase().trim();

        return normRowVal === normFilterVal;
    });

    // --- Step 2: Pisahkan parent vs child ---
    const parentRecords = [];
    const childRecords = [];

    tabFiltered.forEach((r) => {
        const provCode = r.kd_prov?.kode;
        const kabCode = r.kd_kab?.kode;
        const kecCode = r.kd_kec?.kode;

        if (currentLevel.value === "provinsi") {
            if (!provCode) return;
            if (!kabCode) parentRecords.push(r);
            else childRecords.push(r);
        } else if (currentLevel.value === "kabupaten") {
            if (
                !kabCode ||
                (currentParent.value && provCode !== currentParent.value.id)
            )
                return;
            if (!kecCode) parentRecords.push(r);
            else childRecords.push(r);
        } else if (currentLevel.value === "kecamatan") {
            if (
                !kecCode ||
                (currentParent.value && kabCode !== currentParent.value.id)
            )
                return;
            if (!desaCode) parentRecords.push(r);
            else childRecords.push(r);
        } else if (currentLevel.value === "desa") {
            if (
                !desaCode ||
                (currentParent.value && kecCode !== currentParent.value.id)
            )
                return;
            parentRecords.push(r);
        }
    });

    const records = parentRecords.length > 0 ? parentRecords : childRecords;

    const groupedMap = new Map();

    records.forEach((r) => {
        const provCode = r.kd_prov?.kode;
        const kabCode = r.kd_kab?.kode;
        const kecCode = r.kd_kec?.kode;

        let key, name;

        if (currentLevel.value === "provinsi") {
            key = provCode;
            name = r.kd_prov?.nama;
        } else if (currentLevel.value === "kabupaten") {
            key = kabCode;
            name = r.kd_kab?.nama;
        } else if (currentLevel.value === "kecamatan") {
            key = kecCode;
            name = r.kd_kec?.nama;
        } else if (currentLevel.value === "desa") {
            key = desaCode;
            name = r.kd_desa?.nama;
        }

        if (!key) return;

        if (!groupedMap.has(key)) {
            groupedMap.set(key, {
                id: key,
                region: name || "N/A",
                values: {},
                total: 0,
            });
        }

        const row = groupedMap.get(key);
        const val = Number(r.value) || 0;

        let compositeKey = "";

        if (isSingleValue) {
            compositeKey = activeConfig.value.columns[0];
        } else if (activeConfig.value.type === "nested") {
            let groupNameRaw =
                r.itemCategory3?.nama || r.itemCategory3 || "Lainnya";
            const colNameRaw =
                r.itemCategory1?.nama || r.itemCategory1 || "Lainnya";

            let mappedGroup = groupNameRaw;
            if (activeConfig.value.groups) {
                const sortedGroups = [...activeConfig.value.groups].sort(
                    (a, b) => b.length - a.length,
                );
                const found = sortedGroups.find((g) =>
                    groupNameRaw.toLowerCase().includes(g.toLowerCase()),
                );
                if (found) mappedGroup = found;
            }
            compositeKey = `${mappedGroup}_${colNameRaw}`;
        } else {
            const sourceObj = r[pivotVar];
            const rawKey = sourceObj?.nama || sourceObj || "Lainnya";

            // Apply reverse mapping if columnMapping exists
            compositeKey = rawKey;
            if (activeConfig.value.columnMapping) {
                const reverseMap = Object.entries(
                    activeConfig.value.columnMapping,
                ).find(([displayName, apiValue]) => apiValue === rawKey);
                if (reverseMap) {
                    compositeKey = reverseMap[0]; // Use display name as key
                }
            }
        }

        if (!row.values[compositeKey]) row.values[compositeKey] = 0;
        row.values[compositeKey] += val;
        row.total += val;
    });

    return Array.from(groupedMap.values()).sort((a, b) => b.total - a.total);
});

const filteredData = computed(() => {
    if (!searchQuery.value) return processedData.value;
    const q = searchQuery.value.toLowerCase();
    return processedData.value.filter((r) =>
        r.region.toLowerCase().includes(q),
    );
});

const grandTotals = computed(() => {
    const totals = {
        values: {},
        total: 0,
    };

    if (!filteredData.value) return totals;

    filteredData.value.forEach((row) => {
        if (activeConfig.value.type === "nested") {
            activeConfig.value.groups?.forEach((group) => {
                activeConfig.value.columns?.forEach((col) => {
                    const key = `${group}_${col}`;
                    totals.values[key] =
                        (totals.values[key] || 0) + (row.values[key] || 0);
                });
            });
        } else {
            activeConfig.value.columns?.forEach((col) => {
                totals.values[col] =
                    (totals.values[col] || 0) + (row.values[col] || 0);
            });
        }
        totals.total += row.total || 0;
    });

    return totals;
});

// [FIX 2] Excel Export Logic for Nested Tables
const triggerDownload = async () => {
    isExporting.value = true;
    try {
        let excelColumns = [{ header: "Wilayah", key: "region", width: 30 }];

        // Build Dynamic Columns based on Type
        if (activeConfig.value.type === "nested") {
            // For nested: Loop Groups -> Loop Columns
            activeConfig.value.groups.forEach((group) => {
                visibleColumns.value.forEach((col) => {
                    excelColumns.push({
                        header: `${group} - ${col}`, // e.g. "Permanen - Rusak Ringan"
                        key: `${group}_${col}`, // Key to find in row.values
                        width: 20,
                    });
                });
            });
        } else {
            // For flat: Just Loop Columns
            visibleColumns.value.forEach((col) => {
                excelColumns.push({ header: col, key: col, width: 20 });
            });
        }

        // Add Total if not hidden
        if (!props.hideTotal) {
            excelColumns.push({ header: "Total", key: "total", width: 15 });
        }

        // Flatten Data
        const flatData = filteredData.value.map((row) => {
            const flatRow = {
                region: row.region,
                total: row.total,
            };

            // Extract values based on the keys generated above
            excelColumns.forEach((colDef) => {
                if (colDef.key !== "region" && colDef.key !== "total") {
                    flatRow[colDef.key] = row.values[colDef.key] || 0;
                }
            });

            return flatRow;
        });

        // Filename
        const safeTitle = props.title.replace(/[^a-zA-Z0-9]/g, "_");
        const dateStr = new Date().toISOString().split("T")[0];
        const fileName = `${safeTitle}_${dateStr}`;

        await downloadDynamicExcel(flatData, fileName, excelColumns);
    } catch (error) {
        console.error("Export Error:", error);
    } finally {
        isExporting.value = false;
    }
};

async function triggerDownloadAll() {
    isExportingAll.value = true;
    try {
        const pair = datasetPairs.value[activeDatasetIndex.value];
        const baseQuery = {
            id_dataset: pair.datasetId,
            ...(pair.indicatorId != null
                ? { id_indikator_insight: pair.indicatorId }
                : {}),
        };

        const response = await $fetch("/api/agregat-insight", {
            query: baseQuery,
        });

        const allRecords = response?.data?.records || [];

        if (allRecords.length === 0) {
            console.error("No data to export!");
            return;
        }

        const processedData = processAllRecordsWithHierarchy(allRecords);

        const excelColumns = [
            { header: "No", key: "No", width: 8 },
            { header: "Provinsi", key: "provinsi", width: 25 },
            { header: "Kabupaten", key: "kabupaten", width: 25 },
            { header: "Kecamatan", key: "kecamatan", width: 25 },
            { header: "Desa", key: "desa", width: 25 },
        ];

        if (activeConfig.value.type === "nested") {
            activeConfig.value.groups.forEach((group) => {
                visibleColumns.value.forEach((col) => {
                    excelColumns.push({
                        header: `${group} - ${col}`,
                        key: `${group}_${col}`,
                        width: 20,
                    });
                });
            });
        } else {
            visibleColumns.value.forEach((col) => {
                excelColumns.push({ header: col, key: col, width: 20 });
            });
        }

        if (!props.hideTotal) {
            excelColumns.push({ header: "Total", key: "total", width: 15 });
        }

        const flatData = processedData.map((row, index) => {
            const flatRow = {
                No: index + 1,
                provinsi: row.provinsi || "-",
                kabupaten: row.kabupaten || "-",
                kecamatan: row.kecamatan || "-",
                desa: row.desa || "-",
            };

            excelColumns.forEach((colDef) => {
                if (
                    ![
                        "No",
                        "provinsi",
                        "kabupaten",
                        "kecamatan",
                        "desa",
                        "total",
                    ].includes(colDef.key)
                ) {
                    flatRow[colDef.key] = row.values?.[colDef.key] || 0;
                }
            });

            if (!props.hideTotal) {
                flatRow.total = row.total || 0;
            }

            return flatRow;
        });

        const safeTitle = props.title.replace(/[^a-zA-Z0-9]/g, "_");
        const dateStr = new Date().toISOString().split("T")[0];
        const fileName = `${safeTitle}_Semua_Wilayah_${dateStr}`;

        await downloadDynamicExcel(flatData, fileName, excelColumns);
    } catch (error) {
        console.error("Export All Error:", error);
    } finally {
        isExportingAll.value = false;
    }
}

function processAllRecordsWithHierarchy(records) {
    const pivotVar = activeConfig.value.pivotVar || "itemCategory1";
    const isSingleValue =
        activeConfig.value.columns.length === 1 && !activeConfig.value.pivotVar;

    const groupedMap = new Map();

    records.forEach((r) => {
        const provCode = r.kd_prov?.kode;
        const kabCode = r.kd_kab?.kode;
        const kecCode = r.kd_kec?.kode;
        const desaCode = r.kd_desa?.kode;

        const provName = r.kd_prov?.nama || "-";
        const kabName = r.kd_kab?.nama || "-";
        const kecName = r.kd_kec?.nama || "-";
        const desaName = r.kd_desa?.nama || "-";

        const key = `${provCode || "X"}-${kabCode || "X"}-${kecCode || "X"}-${desaCode || "X"}`;

        if (!groupedMap.has(key)) {
            groupedMap.set(key, {
                provinsi: provName,
                kabupaten: kabName,
                kecamatan: kecName,
                desa: desaName,
                values: {},
                total: 0,
            });
        }

        const row = groupedMap.get(key);
        const val = Number(r.value) || 0;

        let compositeKey = "";

        if (isSingleValue) {
            compositeKey = activeConfig.value.columns[0];
        } else if (activeConfig.value.type === "nested") {
            let groupNameRaw =
                r.itemCategory3?.nama || r.itemCategory3 || "Lainnya";
            const colNameRaw =
                r.itemCategory1?.nama || r.itemCategory1 || "Lainnya";

            let mappedGroup = groupNameRaw;
            if (activeConfig.value.groups) {
                const sortedGroups = [...activeConfig.value.groups].sort(
                    (a, b) => b.length - a.length,
                );
                const found = sortedGroups.find((g) =>
                    groupNameRaw.toLowerCase().includes(g.toLowerCase()),
                );
                if (found) mappedGroup = found;
            }
            compositeKey = `${mappedGroup}_${colNameRaw}`;
        } else {
            const sourceObj = r[pivotVar];
            const rawKey = sourceObj?.nama || sourceObj || "Lainnya";

            // Apply reverse mapping if columnMapping exists
            compositeKey = rawKey;
            if (activeConfig.value.columnMapping) {
                const reverseMap = Object.entries(
                    activeConfig.value.columnMapping,
                ).find(([displayName, apiValue]) => apiValue === rawKey);
                if (reverseMap) {
                    compositeKey = reverseMap[0]; // Use display name as key
                }
            }
        }

        row.values[compositeKey] = (row.values[compositeKey] || 0) + val;
        row.total += val;
    });

    return Array.from(groupedMap.values()).sort(
        (a, b) =>
            a.provinsi.localeCompare(b.provinsi) ||
            a.kabupaten.localeCompare(b.kabupaten) ||
            a.kecamatan.localeCompare(b.kecamatan) ||
            a.desa.localeCompare(b.desa),
    );
}

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * 10;
    return filteredData.value.slice(start, start + 10);
});

// --- Navigation ---
const canDrillDown = (row) => {
    if (!row?.id) return false;

    if (currentLevel.value === "provinsi") return row.id.length === 2;

    if (currentLevel.value === "kabupaten") return row.id.length === 4;

    if (currentLevel.value === "kecamatan") return row.id.length === 6;

    return false;
};

const parentStack = ref([]);
function handleDrillDown(row) {
    if (!canDrillDown(row)) return;

    parentStack.value.push({
        level: currentLevel.value,
        parent: currentParent.value,
    });

    if (currentLevel.value === "provinsi") {
        currentLevel.value = "kabupaten";
    } else if (currentLevel.value === "kabupaten") {
        currentLevel.value = "kecamatan";
    } else if (currentLevel.value === "kecamatan") {
        currentLevel.value = "desa";
    }

    currentParent.value = {
        id: row.id,
        name: row.region,
    };

    currentPage.value = 1;
    searchQuery.value = "";
    fetchData();
}

function handleBack() {
    if (!parentStack.value.length) return;

    const last = parentStack.value.pop();

    currentLevel.value = last.level;
    currentParent.value = last.parent;

    currentPage.value = 1;
    searchQuery.value = "";
    fetchData();
}

const formatNumber = (n) => new Intl.NumberFormat("id-ID").format(n);

watch(
    () => props.isOpen,
    (val) => {
        if (val) {
            currentLevel.value = "provinsi";
            currentParent.value = null;
            rawRecordsMap.value = new Map();
            activeTab.value = resolvedTabs.value[0]?.value || "";
            fetchData();
        }
    },
    { immediate: true },
);
</script>
