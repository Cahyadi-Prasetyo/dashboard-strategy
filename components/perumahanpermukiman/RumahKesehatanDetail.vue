<template>
    <div class="p-4">
        <!-- Header with Filters -->
        <div class="mb-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
                 <div class="flex items-center gap-2">
                    <UButton
                        v-if="showKabupaten"
                        icon="i-heroicons-arrow-left"
                        size="sm"
                        color="warning"
                        variant="soft"
                        @click="handleBack"
                    >
                        Kembali
                    </UButton>
                    <h3 class="text-lg font-bold text-gray-800">
                        Jumlah Rumah Tenaga Kesehatan Terdampak Bencana
                    </h3>
                </div>
                <!-- Filter Jenis Rumah -->
                <div class="flex items-center gap-2">
                    <div class="w-95">
                        <select
                            v-model="selectedJenisRumah"
                            class="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        >
                            <option :value="null">Semua Jenis Rumah</option>
                            <option v-for="option in jenisRumahOptions" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>
                    </div>
                    <UTooltip text="Excel" :popper="{ placement: 'top' }">
                        <UButton
                        icon="i-heroicons-document-arrow-down"
                        size="xs"
                        :loading="isExporting"
                        :disabled="!filteredData.length || pending"
                        @click="triggerDownload"
                        class="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[31px]"
                        :ui="{
                            rounded: 'rounded-lg',
                            padding: { sm: 'px-4 py-1' },
                            font: 'font-semibold',
                            icon: { size: { sm: 'w-4 h-4' } },
                        }"
                        >
                        <span class="tracking-wide text-sm">Excel</span>
                        </UButton>
                    </UTooltip>
                    <UButton
                        color="error"
                        variant="soft"
                        icon="i-heroicons-x-mark"
                        @click="handleClose"
                        class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[31px]"
                    />
                </div>
            </div>

            <div v-if="selectedJenisRumah" class="mt-2 text-[10px] text-gray-400 text-right font-medium uppercase tracking-wider">
                Hasil Filter: <span class="text-emerald-600 font-bold">{{ filteredData.length }}</span> baris ditemukan
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
                <p class="text-sm text-gray-600">Memuat data...</p>
            </div>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto rounded-lg border border-gray-200 max-h-[500px] overflow-y-auto">
            <table class="w-full">
                <thead class="sticky top-0 z-10">
                    <tr class="bg-gray-100 border-b border-gray-300">
                        <th rowspan="2" class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">No</th>
                        <th rowspan="2" 
                            @click="toggleSort('provinsi')"
                            class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                        >
                            <div class="flex items-center gap-1">
                                <span>Provinsi</span>
                                <UIcon 
                                    :name="getSortIcon('provinsi')" 
                                    class="w-3 h-3"
                                    :class="sortColumn === 'provinsi' ? 'text-emerald-600' : 'text-gray-400'"
                                />
                            </div>
                        </th>
                        <th 
                            v-if="showKabupaten"
                            rowspan="2" 
                            @click="toggleSort('kabupaten')"
                            class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                        >
                            <div class="flex items-center gap-1">
                                <span>Kabupaten</span>
                                <UIcon 
                                    :name="getSortIcon('kabupaten')" 
                                    class="w-3 h-3"
                                    :class="sortColumn === 'kabupaten' ? 'text-emerald-600' : 'text-gray-400'"
                                />
                            </div>
                        </th>
                        <!-- Status Kepemilikan Headers -->
                        <th 
                            v-for="kepemilikan in uniqueStatusKepemilikan" 
                            :key="kepemilikan"
                            :colspan="uniqueStatusKerusakan.length"
                            class="px-2 py-1.5 text-center text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 bg-emerald-50"
                        >
                            {{ kepemilikan }}
                        </th>
                        <th rowspan="2" 
                            @click="toggleSort('total')"
                            class="px-2 py-1.5 text-center text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 cursor-pointer hover:bg-emerald-200 transition-colors select-none"
                        >
                            <div class="flex items-center justify-center gap-1">
                                <span>Total</span>
                                <UIcon 
                                    :name="getSortIcon('total')" 
                                    class="w-3 h-3"
                                    :class="sortColumn === 'total' ? 'text-emerald-600' : 'text-gray-400'"
                                />
                            </div>
                        </th>
                    </tr>
                    <tr class="bg-gray-50 border-b border-gray-300">
                        <!-- Status Kerusakan Sub-headers -->
                        <template v-for="kepemilikan in uniqueStatusKepemilikan" :key="`sub-${kepemilikan}`">
                            <th 
                                v-for="status in uniqueStatusKerusakan" 
                                :key="`${kepemilikan}-${status}`"
                                class="px-2 py-1.5 text-center text-[9px] font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200"
                                :class="getStatusColor(status)"
                            >
                                {{ status }}
                            </th>
                        </template>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-if="paginatedData.length === 0">
                        <td :colspan="(showKabupaten ? 3 : 2) + (uniqueStatusKepemilikan.length * uniqueStatusKerusakan.length) + 1" class="px-4 py-8 text-center text-gray-500">
                            <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p>{{ selectedJenisRumah ? 'Tidak ada data yang sesuai dengan filter' : 'Tidak ada data tersedia' }}</p>
                        </td>
                    </tr>
                    <tr
                        v-for="(row, index) in paginatedData"
                        :key="index"
                        class="hover:bg-gray-50 transition-colors"
                    >
                        <td class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100">
                            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                        </td>
                        <td 
                            class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100"
                            :class="!showKabupaten ? 'cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 font-medium' : ''"
                            @click="!showKabupaten && handleProvinsiClick(row.provinsi)"
                        >
                            <div class="flex items-center gap-1">
                                {{ row.provinsi }}
                                <UIcon 
                                    v-if="!showKabupaten" 
                                    name="i-heroicons-chevron-right" 
                                    class="w-3 h-3 text-gray-400"
                                />
                            </div>
                        </td>
                        <td 
                            v-if="showKabupaten"
                            class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100"
                        >
                            {{ row.kabupaten }}
                        </td>
                        <!-- Data Cells -->
                        <template v-for="kepemilikan in uniqueStatusKepemilikan" :key="`data-${kepemilikan}`">
                            <td 
                                v-for="status in uniqueStatusKerusakan" 
                                :key="`${kepemilikan}-${status}-data`"
                                class="px-2 py-1.5 text-[11px] text-center text-gray-900 border-r border-gray-100"
                                :class="getStatusBgColor(status)"
                            >
                                {{ formatNumber(row.data[kepemilikan]?.[status] || 0) }}
                            </td>
                        </template>
                        <td class="px-2 py-1.5 text-[11px] text-center font-bold text-emerald-700 bg-emerald-50/50">
                            {{ formatNumber(row.total) }}
                        </td>
                    </tr>
                </tbody>
                <!-- Grand Total Footer -->
                <tfoot v-if="filteredData.length > 0" class="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300 sticky bottom-0">
                    <tr class="font-bold">
                        <td :colspan="showKabupaten ? 3 : 2" class="px-2 py-2 text-[11px] text-gray-900 border-r border-gray-200">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-heroicons-calculator" class="w-3.5 h-3.5 text-gray-600" />
                                <span class="uppercase tracking-wide">Grand Total</span>
                            </div>
                        </td>
                        <!-- Grand Total Data Cells -->
                        <template v-for="kepemilikan in uniqueStatusKepemilikan" :key="`total-${kepemilikan}`">
                            <td 
                                v-for="status in uniqueStatusKerusakan" 
                                :key="`${kepemilikan}-${status}-total`"
                                class="px-2 py-2 text-[11px] text-center text-gray-900 border-r border-gray-200"
                                :class="getStatusBgColorDark(status)"
                            >
                                {{ formatNumber(grandTotal.data[kepemilikan]?.[status] || 0) }}
                            </td>
                        </template>
                        <td class="px-2 py-2 text-[11px] text-center text-emerald-900 bg-emerald-200">
                            {{ formatNumber(grandTotal.total) }}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Pagination -->
        <div 
            v-if="!loading && filteredData.length > 0 && totalPages > 1"
            class="flex items-center justify-center mt-4 gap-1"
        >
            <button
                @click="changePage(1)"
                :disabled="currentPage === 1"
                class="p-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Halaman Pertama"
            >
                <UIcon name="i-heroicons-chevron-double-left" class="w-3.5 h-3.5" />
            </button>

            <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage <= 1"
                class="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
                <UIcon name="i-heroicons-chevron-left" class="w-3.5 h-3.5" />
                Prev
            </button>

            <!-- Page Numbers -->
            <div class="flex items-center gap-1">
                <template v-for="page in displayedPages" :key="page">
                    <button
                        v-if="page !== '...'"
                        @click="changePage(page)"
                        :class="[
                            'min-w-[32px] h-8 rounded-md border text-xs font-medium transition-all',
                            currentPage === page
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
                <UIcon name="i-heroicons-chevron-double-right" class="w-3.5 h-3.5" />
            </button>
        </div>

        <!-- Pagination Info -->
        <div v-if="!loading && filteredData.length > 0" class="text-center mt-2 text-[10px] text-gray-500">
            Menampilkan {{ startItem }}-{{ endItem }} dari {{ filteredData.length }} data
        </div>
    </div>
</template>

<script setup>
import { useDynamicExcel } from "~/composables/useDynamicExcel";

const { downloadDynamicExcel } = useDynamicExcel();

const props = defineProps({
    rawData: { type: Array, required: true },
    allRecordsData: { type: Array, required: true },
    metaData: { type: Object, required: true },
    loading: { type: Boolean, default: false },
    showKabupaten: { type: Boolean, default: false }
});

const emit = defineEmits(['provinsi-click', 'close', 'back']);
const handleClose = () => {
    emit('close');
};

const isExporting = ref(false);
const selectedJenisRumah = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortColumn = ref('');
const sortDirection = ref('asc');

const formatNumber = (value) => {
    if (value == null || value === 0) return "0";
    return new Intl.NumberFormat("id-ID").format(value);
};

const toggleSort = (column) => {
    if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = column;
        sortDirection.value = 'desc';
    }
    currentPage.value = 1;
};

const getSortIcon = (column) => {
    if (sortColumn.value !== column) {
        return 'i-heroicons-arrows-up-down';
    }
    return sortDirection.value === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down';
};

function handleBack() {
    selectedJenisRumah.value = null;
    currentPage.value = 1;
    sortColumn.value = '';
    emit('back');
}

const getStatusColor = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('ringan')) return 'bg-green-50';
    if (lowerStatus.includes('sedang')) return 'bg-yellow-50';
    if (lowerStatus.includes('berat')) return 'bg-orange-50';
    if (lowerStatus.includes('hanyut') || lowerStatus.includes('hilang')) return 'bg-red-50';
    return 'bg-gray-50';
};

const getStatusBgColor = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('ringan')) return 'bg-green-50/30';
    if (lowerStatus.includes('sedang')) return 'bg-yellow-50/30';
    if (lowerStatus.includes('berat')) return 'bg-orange-50/30';
    if (lowerStatus.includes('hanyut') || lowerStatus.includes('hilang')) return 'bg-red-50/30';
    return 'bg-gray-50/30';
};

const getStatusBgColorDark = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('ringan')) return 'bg-green-100';
    if (lowerStatus.includes('sedang')) return 'bg-yellow-100';
    if (lowerStatus.includes('berat')) return 'bg-orange-100';
    if (lowerStatus.includes('hanyut') || lowerStatus.includes('hilang')) return 'bg-red-100';
    return 'bg-gray-100';
};

// Get unique values for filters and table headers
const uniqueStatusKepemilikan = computed(() => {
    const kepemilikan = new Set();
    props.rawData.forEach(row => {
        Object.keys(row.data).forEach(kat => kepemilikan.add(kat));
    });
    return Array.from(kepemilikan).sort();
});

const uniqueStatusKerusakan = computed(() => {
    const statuses = new Set();
    props.rawData.forEach(row => {
        Object.values(row.data).forEach(kepemilikan => {
            Object.keys(kepemilikan).forEach(status => statuses.add(status));
        });
    });
    
    // Custom sort order
    const statusOrder = ['Rusak Ringan', 'Rusak Sedang', 'Rusak Berat', 'Rusak Hanyut', 'Hilang'];
    return Array.from(statuses).sort((a, b) => {
        const indexA = statusOrder.indexOf(a);
        const indexB = statusOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
});

// Options for Jenis Rumah filter (itemCategory3)
const jenisRumahOptions = computed(() => {
    const uniqueJenisRumah = new Set();
    props.allRecordsData.forEach(record => {
        const nama = record.itemCategory3?.nama;
        if (nama && nama.trim() !== '') {
            uniqueJenisRumah.add(nama);
        }
    });
    return Array.from(uniqueJenisRumah).sort();
});

const filteredData = computed(() => {
    let data = [...props.rawData];
    
    // Filter by jenis rumah (itemCategory3)
    if (selectedJenisRumah.value) {
        // Get records that match the selected jenis rumah
        let filteredRecords = props.allRecordsData.filter(
            record => record.itemCategory3?.nama === selectedJenisRumah.value
        );
        
        // PENTING: Jika showKabupaten = true, berarti kita sedang drill-down ke kabupaten
        // Kita harus filter hanya kabupaten dari provinsi yang dipilih
        if (props.showKabupaten && props.rawData.length > 0) {
            // Ambil nama provinsi dari data pertama (semua data pasti dari provinsi yang sama)
            const selectedProvinsiName = props.rawData[0].provinsi;
            
            // Filter records hanya untuk provinsi yang dipilih
            filteredRecords = filteredRecords.filter(
                record => record.kd_prov?.nama === selectedProvinsiName
            );
        }
        
        // Regroup data based on filtered records
        const regroupedData = new Map();
        
        filteredRecords.forEach(record => {
            // Key berdasarkan provinsi dan kabupaten (jika ada)
            const key = props.showKabupaten 
                ? `${record.kd_prov?.kode || ''}-${record.kd_kab?.kode || ''}`
                : record.kd_prov?.kode || '';
            
            if (!regroupedData.has(key)) {
                regroupedData.set(key, {
                    provinsi: record.kd_prov?.nama || '-',
                    kabupaten: record.kd_kab?.nama || '-',
                    data: {},
                    total: 0
                });
            }

            const item = regroupedData.get(key);
            const value = Number(record.value) || 0;
            const statusKerusakan = record.itemCategory1?.nama || 'Tidak Diketahui';
            const statusKepemilikan = record.itemCategory2?.nama || 'Lainnya';

            if (!item.data[statusKepemilikan]) {
                item.data[statusKepemilikan] = {};
            }
            
            if (!item.data[statusKepemilikan][statusKerusakan]) {
                item.data[statusKepemilikan][statusKerusakan] = 0;
            }
            
            item.data[statusKepemilikan][statusKerusakan] += value;
            item.total += value;
        });
        
        data = Array.from(regroupedData.values());
    }

    // Apply sorting
    if (sortColumn.value) {
        data.sort((a, b) => {
            const aVal = a[sortColumn.value];
            const bVal = b[sortColumn.value];
            
            if (typeof aVal === 'string') {
                if (sortDirection.value === 'asc') {
                    return aVal.localeCompare(bVal, 'id');
                } else {
                    return bVal.localeCompare(aVal, 'id');
                }
            } else {
                if (sortDirection.value === 'asc') {
                    return aVal - bVal;
                } else {
                    return bVal - aVal;
                }
            }
        });
    }
    
    return data;
});

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value));

const displayedPages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;
    
    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        if (current <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push('...');
            pages.push(total);
        } else if (current >= total - 2) {
            pages.push(1);
            pages.push('...');
            for (let i = total - 3; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = current - 1; i <= current + 1; i++) pages.push(i);
            pages.push('...');
            pages.push(total);
        }
    }
    
    return pages;
});

const startItem = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredData.value.length));

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredData.value.slice(start, end);
});

// Grand Total berdasarkan data yang terfilter
const grandTotal = computed(() => {
    const total = {
        data: {},
        total: 0
    };

    filteredData.value.forEach(row => {
        Object.keys(row.data).forEach(kategori => {
            if (!total.data[kategori]) {
                total.data[kategori] = {};
            }
            Object.keys(row.data[kategori]).forEach(status => {
                if (!total.data[kategori][status]) {
                    total.data[kategori][status] = 0;
                }
                total.data[kategori][status] += row.data[kategori][status] || 0;
            });
        });
        total.total += row.total || 0;
    });

    return total;
});

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const handleProvinsiClick = (provinsi) => {
    emit('provinsi-click', provinsi);
};

const downloadData = computed(() => {
    const exportData = [];
    
    filteredData.value.forEach((row, index) => {
        const rowData = {
            No: index + 1,
            Provinsi: row.provinsi,
        };

        if (props.showKabupaten) {
            rowData.Kabupaten = row.kabupaten;
        }

        // Add columns for each status kepemilikan + status kerusakan combination
        uniqueStatusKepemilikan.value.forEach(kepemilikan => {
            uniqueStatusKerusakan.value.forEach(status => {
                const columnName = `${kepemilikan} - ${status}`;
                rowData[columnName] = row.data[kepemilikan]?.[status] || 0;
            });
        });

        rowData['Total'] = row.total;
        exportData.push(rowData);
    });

    return exportData;
});

const triggerDownload = async () => {
    isExporting.value = true;
    try {
        const columns = [
            { header: 'No', key: 'No', width: 10 },
            { header: 'Provinsi', key: 'Provinsi', width: 20 },
        ];

        if (props.showKabupaten) {
            columns.push({ header: 'Kabupaten', key: 'Kabupaten', width: 20 });
        }

        // Add dynamic columns
        uniqueStatusKepemilikan.value.forEach(kepemilikan => {
            uniqueStatusKerusakan.value.forEach(status => {
                const columnName = `${kepemilikan} - ${status}`;
                columns.push({
                    header: columnName,
                    key: columnName,
                    width: 18
                });
            });
        });

        columns.push({ header: 'Total', key: 'Total', width: 15 });
        
        if (typeof downloadDynamicExcel === "function") {
            await downloadDynamicExcel(
                downloadData.value,
                `Data_Rumah_Tenaga_Kesehatan_Terdampak_Detail_${new Date().toISOString().split("T")[0]}`,
                columns,
            );
        } else {
            console.error("Fungsi downloadDynamicExcel tidak ditemukan.");
        }
    } catch (error) {
        console.error('Error downloading Excel:', error);
    } finally {
        isExporting.value = false;
    }
};

watch(selectedJenisRumah, () => {
    currentPage.value = 1;
});
</script>