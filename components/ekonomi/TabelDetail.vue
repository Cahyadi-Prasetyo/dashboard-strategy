<template>
    <div
        class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col h-full"
    >
        <div
            class="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
            <div>
                <h3
                    class="text-lg font-bold text-gray-900 flex items-center gap-2"
                >
                    <UIcon
                        name="i-heroicons-table-cells"
                        class="w-5 h-5 text-amber-500"
                    />
                    Data Tabular
                </h3>
                <p class="text-xs text-gray-500 mt-1">
                    Rincian data {{ tableSelectedIndikator || "Lengkap" }}
                </p>
            </div>

            <USelectMenu
                v-model="tableSelectedIndikator"
                :items="availableIndikator"
                placeholder="Filter Indikator"
                class="w-full sm:w-60"
                size="sm"
            />
        </div>

        <div class="flex-1 flex flex-col min-h-[500px]">
            <div class="flex-1 overflow-auto">
                <div v-if="loading" class="p-6 space-y-4">
                    <USkeleton class="h-10 w-full" v-for="i in 8" :key="i" />
                </div>
                <div
                    v-else-if="!tableStructure || totalRows === 0"
                    class="p-12 text-center text-gray-400"
                >
                    <p>Tidak ada data untuk ditampilkan</p>
                </div>
                <HierarchicalTable
                    v-else
                    :key="`table-${page}`"
                    :data="tableData"
                    :data_structure="tableStructure"
                    class="w-full border-0 rounded-none shadow-none"
                />
            </div>

            <div
                v-if="!loading && totalRows > 0"
                class="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl"
            >
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">
                        Hal. <strong>{{ page }}</strong> dari
                        {{ Math.ceil(totalRows / pageCount) }}
                    </span>
                    <UPagination
                        v-model:page="page"
                        :items-per-page="pageCount"
                        :total="totalRows"
                        size="xs"
                        :ui="{ rounded: 'rounded-full' }"
                        color="amber"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import HierarchicalTable from "~/components/HierarchicalTable.vue";
import { useAgregatTransformer } from "~/composables/useAgregatTransformer";

const props = defineProps({
    rawRecords: { type: Array, default: () => [] },
    selectedWilayah: { type: Object, required: true },
    loading: { type: Boolean, default: false },
});

const { transformAgregatData } = useAgregatTransformer();

const page = ref(1);
const pageCount = 10;
const tableSelectedIndikator = ref("");

// Filter Indikator
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
        if (newVal.length > 0 && !tableSelectedIndikator.value)
            tableSelectedIndikator.value = newVal[0];
    },
    { immediate: true },
);

// Filtered Records
const filteredTableRecords = computed(() => {
    if (!tableSelectedIndikator.value) return props.rawRecords;
    return props.rawRecords.filter(
        (record) => record.indikator?.nama === tableSelectedIndikator.value,
    );
});

// Level Logic
const tableRegionLevel = computed(() => {
    if (props.selectedWilayah.kabupaten?.length > 0) return "kabupaten";
    return "provinsi";
});

// Transform Data
const transformedResult = computed(() => {
    return transformAgregatData(
        filteredTableRecords.value,
        tableRegionLevel.value,
    );
});

// Pagination Logic
const paginatedRowHeaders = computed(() => {
    if (!transformedResult.value?.row_headers) return [];
    const start = (page.value - 1) * pageCount;
    return transformedResult.value.row_headers.slice(start, start + pageCount);
});

const totalRows = computed(
    () => transformedResult.value?.row_headers?.length || 0,
);

const tableStructure = computed(() => {
    if (!transformedResult.value) return null;
    return {
        row_headers: [
            {
                id: "wilayah",
                name: "Wilayah",
                role: "Region",
                items: paginatedRowHeaders.value,
            },
        ],
        column_headers: transformedResult.value.column_headers,
        measures: [],
        regions: [],
    };
});

const tableData = computed(() => {
    if (!transformedResult.value) return [];
    const paginatedRowIds = paginatedRowHeaders.value.map((row) => row.id);
    return transformedResult.value.data.filter((item) =>
        paginatedRowIds.includes(item.dimensions[0]),
    );
});
</script>
