<template>
    <div class="mb-8">
        <div class="mb-4 flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800">
                {{ tableTitle }}
            </h2>

            <UTooltip
                text="Excel"
                :popper="{ placement: 'top' }"
                v-if="enableDownload"
            >
                <UButton
                    icon="i-heroicons-document-arrow-down"
                    size="sm"
                    :loading="isExporting"
                    :disabled="!downloadData.length"
                    @click="triggerDownload"
                    class="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[38px]"
                    :ui="{
                        rounded: 'rounded-lg',
                        padding: { sm: 'px-4 py-2' },
                        font: 'font-semibold',
                        icon: { size: { sm: 'w-2 h-2' } },
                    }"
                >
                    <span class="tracking-wide text-sm">Excel</span>
                </UButton>
            </UTooltip>
        </div>

        <div class="overflow-x-auto rounded-lg border border-gray-200">
            <table class="w-full">
                <thead>
                    <tr class="bg-gray-100 border-b border-gray-300">
                        <slot name="header"></slot>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <slot name="body"></slot>
                </tbody>
            </table>
        </div>

        <div
            v-if="enablePagination && totalItems > 0"
            class="flex flex-col md:flex-row items-center justify-between mt-4 border-t border-gray-100 pt-4"
        >
            <div
                v-if="totalPages > 1"
                class="flex items-center gap-4 order-2 md:order-1"
            >
                <button
                    @click="changePage(modelValue - 1)"
                    :disabled="modelValue <= 1"
                    class="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
                    Prev
                </button>

                <span class="text-sm text-gray-600 font-medium">
                    Halaman {{ modelValue }} dari {{ totalPages }}
                </span>

                <button
                    @click="changePage(modelValue + 1)"
                    :disabled="modelValue >= totalPages"
                    class="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                    <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
                </button>
            </div>

            <div v-else class="order-2 md:order-1"></div>

            <div class="text-xs text-gray-500 order-1 md:order-2 mb-2 md:mb-0">
                Menampilkan {{ startItem }}-{{ endItem }} dari
                {{ totalItems }} data
            </div>
        </div>
    </div>
</template>

<script setup>
import { useDynamicExcel } from "~/composables/useDynamicExcel"; // Import Composable
const props = defineProps({
    tableTitle: String,
    source: String,
    // Pagination Props
    enablePagination: { type: Boolean, default: false },
    totalItems: { type: Number, default: 0 },
    itemsPerPage: { type: Number, default: 10 },
    modelValue: { type: Number, default: 1 }, // v-model for current page

    // Download Props
    enableDownload: { type: Boolean, default: false }, // Switch on/off download
    downloadData: { type: Array, default: () => [] }, // Data LENGKAP (bukan per halaman)
    downloadColumns: { type: Array, default: () => [] }, // Config kolom (opsional)
    fileName: { type: String, default: "Data_Export" },
});

const emit = defineEmits(["update:modelValue"]);

// Computed
const totalPages = computed(() =>
    Math.ceil(props.totalItems / props.itemsPerPage),
);
const startItem = computed(
    () => (props.modelValue - 1) * props.itemsPerPage + 1,
);
const endItem = computed(() =>
    Math.min(props.modelValue * props.itemsPerPage, props.totalItems),
);

// Methods
const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
        emit("update:modelValue", newPage);
    }
};

// logic download excel
const { downloadDynamicExcel, isExporting } = useDynamicExcel();

const triggerDownload = () => {
    // Panggil composable dengan data dari props
    downloadDynamicExcel(
        props.downloadData,
        props.fileName,
        props.downloadColumns,
    );
};
</script>
