<template>
    <div class="relative overflow-hidden">
        <div
            v-if="
                !data_structure ||
                !data_structure.row_headers ||
                data_structure.row_headers.length === 0
            "
            class="text-center py-12 text-gray-500"
        >
            <UIcon
                name="i-heroicons-circle-stack"
                class="w-12 h-12 mx-auto mb-3 text-gray-300"
            />
            <p class="font-medium">Memuat struktur data...</p>
            <p class="text-xs mt-1 text-gray-400">
                {{ data_structure ? "Structure exists" : "No structure" }}
            </p>
        </div>

        <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <!-- Header -->
                <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr
                        v-for="(row, rowIndex) in colHeadersProcessed"
                        :key="rowIndex"
                        class="border-b border-gray-200"
                    >
                        <!-- Row Header Column -->
                        <th
                            v-if="rowIndex == 0"
                            class="sticky left-0 z-10 px-6 py-3 bg-gradient-to-r from-amber-50 to-amber-100 text-xs font-bold text-amber-900 uppercase tracking-wider text-left align-middle border-r border-amber-200 min-w-[200px] whitespace-nowrap"
                            :rowspan="colHeadersProcessed.length"
                        >
                            <div class="flex items-center gap-2">
                                <UIcon
                                    name="i-heroicons-map-pin"
                                    class="w-4 h-4 text-amber-600"
                                />
                                {{ rowHeader?.name }}
                            </div>
                        </th>

                        <!-- Column Headers -->
                        <th
                            v-for="(cell, cellIndex) in row"
                            :key="'cell-' + cellIndex"
                            :colspan="cell.colspan"
                            class="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-center align-middle border-r border-gray-200 last:border-r-0"
                        >
                            {{ cell.text }}
                        </th>
                    </tr>
                </thead>

                <!-- Body -->
                <tbody class="bg-white divide-y divide-gray-100">
                    <tr
                        v-for="(rowItem, rowIdx) in rowHeader?.items"
                        :key="rowItem.id"
                        :class="[
                            'hover:bg-amber-50/30 transition-all duration-150',
                            rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30',
                        ]"
                    >
                        <!-- Wilayah Column (Sticky) -->
                        <td
                            class="sticky left-0 z-10 px-4 py-3 font-semibold text-sm text-gray-900 bg-white border-r border-gray-200"
                            :class="[
                                rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
                            ]"
                        >
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"
                                ></div>
                                {{ rowItem.name }}
                            </div>
                        </td>

                        <!-- Data Columns -->
                        <td
                            v-for="colItem in colHeadersProcessed[
                                colHeadersProcessed.length - 1
                            ]"
                            :key="colItem.id"
                            class="px-4 py-3 text-center border-r border-gray-100 last:border-r-0"
                        >
                            <!-- Badge Style -->
                            <span
                                v-if="isBadge(colItem.id)"
                                :class="[
                                    'inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm',
                                    getBadgeClass(colItem.id),
                                ]"
                            >
                                {{
                                    formatDisplay(
                                        getRawValue(
                                            callGetCellPath(rowItem, colItem),
                                        ),
                                        colItem.id,
                                    )
                                }}
                            </span>

                            <!-- Normal Text Style -->
                            <span
                                v-else
                                class="text-gray-800 font-medium text-sm"
                            >
                                {{
                                    formatDisplay(
                                        getRawValue(
                                            callGetCellPath(rowItem, colItem),
                                        ),
                                        colItem.id,
                                    )
                                }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Empty State (jika tidak ada data) -->
        <div
            v-if="
                data_structure &&
                data_structure.row_headers &&
                data_structure.row_headers.length > 0 &&
                (!rowHeader?.items || rowHeader.items.length === 0)
            "
            class="text-center py-12"
        >
            <UIcon
                name="i-heroicons-inbox"
                class="w-16 h-16 mx-auto mb-3 text-gray-300"
            />
            <p class="text-gray-500 font-medium">Tidak ada data tersedia</p>
            <p class="text-xs text-gray-400 mt-1">
                Silakan pilih filter wilayah yang berbeda
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type {
    DataStructure,
    Dimension,
    DimensionItem,
} from "~/shared/types/dataset";

import {
    generateHierarchicalHeader,
    getCellPath,
    formatNumber,
} from "~/composables/useTableUtils";

const props = defineProps<{
    data: any[];
    data_structure: DataStructure;
}>();

const finalRowHeaders = computed(() => {
    if (!props.data_structure) return [];
    if (props.data_structure.row_headers?.length > 0)
        return props.data_structure.row_headers;
    return props.data_structure.regions || [];
});

const finalColHeaders = computed(() => {
    if (!props.data_structure) return [];
    if (props.data_structure.column_headers?.length > 0)
        return props.data_structure.column_headers;
    return props.data_structure.measures || [];
});

const rowHeader = computed<Dimension | undefined>(
    () => finalRowHeaders.value[0],
);

const colHeadersProcessed = computed(() =>
    generateHierarchicalHeader(finalColHeaders.value.map((h) => h.items)),
);

function callGetCellPath(rowItem?: DimensionItem, colItem?: any) {
    return getCellPath(
        rowItem,
        colItem,
        rowHeader.value,
        finalColHeaders.value,
        props.data_structure?.regions || [],
    );
}

const getRawValue = (path: string) => {
    if (!path) return null;
    const found = props.data.find(
        (item: any) => item.dimensions.join("-") === path,
    );
    return found ? found.value : null;
};

const getBadgeClass = (colId: string | number) => {
    const idStr = String(colId);
    if (idStr === "c_ops")
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    if (idStr === "c_lmt")
        return "bg-amber-100 text-amber-700 border border-amber-200";
    if (idStr === "c_non")
        return "bg-rose-100 text-rose-700 border border-rose-200";
    return "text-gray-900";
};

const isBadge = (colId: string | number) => {
    const idStr = String(colId);
    return ["c_ops", "c_lmt", "c_non"].includes(idStr);
};

const formatDisplay = (value: any, colId: string | number) => {
    if (value === null || value === undefined) return "-";
    const formatted = formatNumber(value);
    if (String(colId) === "c_pct") return `${formatted}%`;
    return formatted;
};
</script>
