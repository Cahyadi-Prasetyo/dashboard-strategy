<template>
    <div class="flex flex-col gap-4">
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="text-center">
                <div
                    class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"
                ></div>
                <p class="text-sm text-gray-600">Memuat data...</p>
            </div>
        </div>

        <div v-else class="overflow-x-auto rounded-lg border border-gray-200">
            <table class="w-full relative">
                <thead>
                    <slot
                        name="header"
                        :sort-column="sortColumn"
                        :sort-direction="sortDirection"
                        :handle-sort="handleSort"
                        :get-sort-icon="getSortIcon"
                    >
                        <tr class="bg-gray-100 border-b border-gray-300">
                            <th
                                v-if="showNo"
                                class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 w-12 sticky left-0 z-20 bg-gray-100"
                            >
                                No
                            </th>
                            <th
                                v-for="(col, index) in columns"
                                :key="col.key"
                                @click="
                                    col.sortable ? handleSort(col.key) : null
                                "
                                :class="[
                                    'px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 select-none',
                                    col.sortable
                                        ? 'cursor-pointer hover:bg-gray-200 transition-colors'
                                        : '',
                                    col.sticky ? 'sticky z-20 bg-gray-100' : '',
                                    col.headerClass,
                                ]"
                                :style="{
                                    width: col.width,
                                    left: col.sticky ? col.left : undefined,
                                }"
                            >
                                <div
                                    class="flex items-center gap-1"
                                    :class="
                                        col.align === 'right'
                                            ? 'justify-end'
                                            : col.align === 'center'
                                              ? 'justify-center'
                                              : 'justify-start'
                                    "
                                >
                                    <span>{{ col.label }}</span>
                                    <UIcon
                                        v-if="col.sortable"
                                        :name="getSortIcon(col.key)"
                                        class="w-3 h-3"
                                        :class="
                                            sortColumn === col.key
                                                ? 'text-purple-600'
                                                : 'text-gray-400'
                                        "
                                    />
                                </div>
                            </th>
                        </tr>
                    </slot>
                </thead>

                <tbody class="divide-y divide-gray-200">
                    <tr v-if="data.length === 0">
                        <td
                            :colspan="columnCount"
                            class="px-4 py-8 text-center text-gray-500"
                        >
                            <UIcon
                                name="i-heroicons-inbox"
                                class="w-12 h-12 mx-auto mb-2 text-gray-400"
                            />
                            <p>{{ emptyMessage }}</p>
                        </td>
                    </tr>

                    <tr
                        v-for="(row, index) in data"
                        :key="index"
                        class="hover:bg-gray-50 transition-colors"
                    >
                        <slot
                            name="row"
                            :row="row"
                            :index="index"
                            :start-index="startIndex"
                        >
                            <td
                                v-if="showNo"
                                class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100 sticky left-0 z-10 bg-white"
                            >
                                {{ startIndex + index }}
                            </td>
                            <td
                                v-for="col in columns"
                                :key="col.key"
                                class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100"
                                :class="[
                                    col.cellClass,
                                    col.sticky ? 'sticky z-10 bg-white' : '',
                                ]"
                                :style="{
                                    left: col.sticky ? col.left : undefined,
                                }"
                            >
                                {{ row[col.key] }}
                            </td>
                        </slot>
                    </tr>
                </tbody>

                <tfoot
                    v-if="$slots.footer && data.length > 0"
                    class="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300 font-bold"
                >
                    <slot name="footer"></slot>
                </tfoot>
            </table>
        </div>

        <div
            v-if="!loading && data.length > 0 && totalPages > 1"
            class="flex items-center justify-center mt-0 gap-1"
        >
            <button
                @click="changePage(1)"
                :disabled="currentPage === 1"
                class="p-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Halaman Pertama"
            >
                <UIcon
                    name="i-heroicons-chevron-double-left"
                    class="w-3.5 h-3.5"
                />
            </button>

            <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage <= 1"
                class="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
                <UIcon name="i-heroicons-chevron-left" class="w-3.5 h-3.5" />
                Prev
            </button>

            <div class="flex items-center gap-1">
                <template v-for="page in displayedPages" :key="page">
                    <button
                        v-if="page !== '...'"
                        @click="changePage(page)"
                        :class="[
                            'min-w-[32px] h-8 rounded-md border text-xs font-medium transition-all',
                            currentPage === page
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                        ]"
                    >
                        {{ page }}
                    </button>
                    <span v-else class="px-1 text-gray-500 text-xs">...</span>
                </template>
            </div>

            <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
                Next
                <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
            </button>

            <button
                @click="changePage(totalPages)"
                :disabled="currentPage === totalPages"
                class="p-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Halaman Terakhir"
            >
                <UIcon
                    name="i-heroicons-chevron-double-right"
                    class="w-3.5 h-3.5"
                />
            </button>
        </div>

        <div
            v-if="!loading && data.length > 0"
            class="text-center mt-0 text-[10px] text-gray-500"
        >
            Menampilkan {{ startIndex }}-{{ endIndex }} dari
            {{ totalItems }} data
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    columns: { type: Array, default: () => [] },
    data: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    showNo: { type: Boolean, default: true },
    emptyMessage: { type: String, default: "Tidak ada data tersedia" },
    // Pagination Props
    totalItems: { type: Number, default: 0 },
    itemsPerPage: { type: Number, default: 10 },
    currentPage: { type: Number, default: 1 },
    // Sort Props
    sortColumn: { type: String, default: "" },
    sortDirection: { type: String, default: "asc" },
});

const emit = defineEmits([
    "update:currentPage",
    "update:sortColumn",
    "update:sortDirection",
]);

// Helper for Column Count (for Empty State colspan)
const columnCount = computed(() => {
    return props.columns.length + (props.showNo ? 1 : 0);
});

// Sorting Logic
const handleSort = (key) => {
    if (props.sortColumn === key) {
        emit(
            "update:sortDirection",
            props.sortDirection === "asc" ? "desc" : "asc",
        );
    } else {
        emit("update:sortColumn", key);
        emit("update:sortDirection", "desc");
    }
    emit("update:currentPage", 1);
};

const getSortIcon = (key) => {
    if (props.sortColumn !== key) {
        return "i-heroicons-arrows-up-down";
    }
    return props.sortDirection === "asc"
        ? "i-heroicons-arrow-up"
        : "i-heroicons-arrow-down";
};

// Pagination Logic
const totalPages = computed(() =>
    Math.ceil(props.totalItems / props.itemsPerPage),
);

const startIndex = computed(
    () => (props.currentPage - 1) * props.itemsPerPage + 1,
);
const endIndex = computed(() =>
    Math.min(props.currentPage * props.itemsPerPage, props.totalItems),
);

const changePage = (p) => {
    if (p >= 1 && p <= totalPages.value) {
        emit("update:currentPage", p);
    }
};

const displayedPages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = props.currentPage;

    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        if (current <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push("...");
            pages.push(total);
        } else if (current >= total - 2) {
            pages.push(1);
            pages.push("...");
            for (let i = total - 3; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push("...");
            for (let i = current - 1; i <= current + 1; i++) pages.push(i);
            pages.push("...");
            pages.push(total);
        }
    }
    return pages;
});
</script>
