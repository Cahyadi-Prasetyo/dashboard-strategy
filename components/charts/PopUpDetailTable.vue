<template>
    <div class="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#1e2b58] to-[#2d3e7a] px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <UIcon name="i-heroicons-table-cells" class="w-5 h-5 text-white" />
                    </div>
                    <h2 class="text-lg font-bold text-white">
                        {{ title }}
                    </h2>
                </div>
                <button
                    @click="$emit('close')"
                    class="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                    title="Tutup"
                >
                    <UIcon 
                        name="i-heroicons-x-mark" 
                        class="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" 
                    />
                </button>
            </div>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto p-4" style="max-height: calc(90vh - 160px)">
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
                    <p class="text-sm text-gray-600">Memuat data...</p>
                </div>
            </div>

            <!-- Empty State -->
            <div 
                v-else-if="!data || data.length === 0" 
                class="py-12 text-center"
            >
                <div class="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                    <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-400" />
                </div>
                <h3 class="text-lg font-semibold text-gray-700 mb-2">
                    Tidak Ada Data
                </h3>
                <p class="text-sm text-gray-500">
                    Belum ada data yang tersedia untuk wilayah yang dipilih
                </p>
            </div>

            <!-- Table -->
            <div v-else class="overflow-x-auto rounded-lg border border-gray-200">
                <table class="w-full">
                    <thead>
                        <tr class="bg-gray-100 border-b border-gray-300">
                            <th class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                No
                            </th>
                            <th class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                Wilayah
                            </th>
                            <th 
                                v-for="col in columns" 
                                :key="col.key"
                                class="px-2 py-1.5 text-center text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200"
                                :class="col.headerClass"
                            >
                                {{ col.label }}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr 
                            v-for="(row, idx) in data" 
                            :key="idx"
                            class="hover:bg-gray-50 transition-colors"
                        >
                            <!-- Nomor -->
                            <td class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100">
                                {{ idx + 1 }}
                            </td>
                            
                            <!-- Nama Wilayah -->
                            <td class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100 font-medium">
                                {{ row.region_name || row.name || '-' }}
                            </td>
                            
                            <!-- Dynamic Columns -->
                            <td 
                                v-for="col in columns" 
                                :key="col.key"
                                class="px-2 py-1.5 text-[11px] text-center text-gray-900 border-r border-gray-100"
                                :class="[col.cellClass, getValueColorClass(row[col.key])]"
                            >
                                {{ formatValue(row[col.key]) }}
                            </td>
                        </tr>
                    </tbody>
                    
                    <!-- Footer Total (Optional) -->
                    <tfoot v-if="showTotal && data.length > 0" class="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300">
                        <tr class="font-bold">
                            <td colspan="2" class="px-2 py-2 text-[11px] text-gray-900 border-r border-gray-200">
                                <div class="flex items-center gap-2">
                                    <UIcon name="i-heroicons-calculator" class="w-3.5 h-3.5 text-gray-600" />
                                    <span class="uppercase tracking-wide">Total</span>
                                </div>
                            </td>
                            <td 
                                v-for="col in columns" 
                                :key="`total-${col.key}`"
                                class="px-2 py-2 text-[11px] text-center text-gray-900 border-r border-gray-200"
                                :class="col.cellClass"
                            >
                                {{ formatValue(calculateColumnTotal(col.key)) }}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div class="flex items-center justify-between">
                <p class="text-xs text-gray-600">
                    <span class="font-semibold text-[#1e2b58]">
                        {{ data?.length || 0 }}
                    </span>
                    wilayah ditampilkan
                </p>
                <button
                    @click="$emit('close')"
                    class="px-4 py-2 bg-[#1e2b58] text-white rounded-lg hover:bg-[#2d3e7a] transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                >
                    Tutup
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true,
        default: 'Detail Data'
    },
    data: {
        type: Array,
        required: true,
        default: () => []
        // Format: [{ region_name: 'Jakarta', indicator_1: 100, indicator_2: 50, ... }]
    },
    columns: {
        type: Array,
        required: true,
        default: () => []
        // Format: [{ label: 'Nama Kolom', key: 'indicator_id', headerClass?: '', cellClass?: '' }]
    },
    loading: {
        type: Boolean,
        default: false
    },
    showTotal: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close']);

// Format value for display
const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
        return value.toLocaleString('id-ID');
    }
    return value;
};

// Get CSS class based on value for color coding
const getValueColorClass = (value) => {
    if (value === null || value === undefined || value === 0) {
        return '';
    }
    
    // Color coding based on value ranges (optional, can be customized)
    // Uncomment if you want auto color coding
    // if (value >= 100) {
    //     return 'bg-emerald-50/50 text-emerald-700 font-semibold';
    // } else if (value >= 50) {
    //     return 'bg-blue-50/50 text-blue-700 font-semibold';
    // } else if (value >= 20) {
    //     return 'bg-amber-50/50 text-amber-700 font-semibold';
    // } else if (value > 0) {
    //     return 'bg-rose-50/50 text-rose-700 font-semibold';
    // }
    
    return '';
};

// Calculate column total
const calculateColumnTotal = (columnKey) => {
    if (!props.data || props.data.length === 0) return 0;
    
    return props.data.reduce((sum, row) => {
        const value = row[columnKey];
        return sum + (typeof value === 'number' ? value : 0);
    }, 0);
};
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar,
.overflow-x-auto::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track,
.overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb,
.overflow-x-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover,
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>