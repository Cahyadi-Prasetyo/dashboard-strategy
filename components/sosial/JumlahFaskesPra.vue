<template>
<div class="mt-0">
                    <div
                        class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm"
                    >
                        <table class="w-full text-xs text-left">
                            <thead>
                                <tr
                                    class="bg-gray-100 border-b border-gray-300"
                                >
                                    <th
                                        class="px-2 py-2 text-center font-bold text-gray-500 uppercase border-r border-gray-200"
                                    >
                                        No
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-gray-500 uppercase border-r border-gray-200"
                                    >
                                        Provinsi
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-gray-500 uppercase border-r border-gray-200"
                                    >
                                        Kab/Kota
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-emerald-700 uppercase bg-emerald-50 border-r border-gray-200"
                                    >
                                        Rumah Sakit
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-blue-700 uppercase bg-blue-50 border-r border-gray-200"
                                    >
                                        Klinik Utama
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-blue-700 uppercase bg-blue-50 border-r border-gray-200"
                                    >
                                        Balai Kesehatan
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-blue-700 uppercase bg-blue-50 border-r border-gray-200"
                                    >
                                        Puskesmas dengan Rawat Inap
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-blue-700 uppercase bg-blue-50 border-r border-gray-200"
                                    >
                                        Puskesmas tanpa Rawat Inap
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-blue-700 uppercase bg-blue-50 border-r border-gray-200"
                                    >
                                        Puskesmas Pembantu
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-blue-700 uppercase bg-blue-50 border-r border-gray-200"
                                    >
                                        Klinik Pratama
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-blue-700 uppercase bg-blue-50 border-r border-gray-200"
                                    >
                                        Praktik Mandiri Dokter
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-blue-700 uppercase bg-blue-50 border-r border-gray-200"
                                    >
                                        Praktik Mandiri Bidan
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-blue-700 uppercase bg-blue-50 border-r border-gray-200"
                                    >
                                        Poskesdes (Pos Kesehatan Desa)
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-blue-700 uppercase bg-blue-50 border-r border-gray-200"
                                    >
                                        Polindes (Pondok Bersalin Desa)
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-blue-700 uppercase bg-blue-50 border-r border-gray-200"
                                    >
                                        Apotek
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-bold text-gray-700 uppercase bg-gray-50"
                                    >
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
    <tr v-if="loading">
        <td colspan="14" class="px-2 py-10 text-center"> <!-- 🔥 FIX: Changed from 8 to 14 -->
            <div class="flex flex-col items-center gap-2">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span class="text-xs text-gray-500 font-medium">Memuat Detail Fasilitas Kesehatan...</span>
            </div>
        </td>
    </tr>
    
    <!-- 🔥 ADD: Empty state -->
    <tr v-else-if="paginatedTableRows.length === 0">
        <td colspan="14" class="px-4 py-12 text-center">
            <div class="flex flex-col items-center gap-3">
                <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-300" />
                <p class="text-sm text-gray-500 font-medium">Tidak ada data fasilitas kesehatan</p>
            </div>
        </td>
    </tr>
    
    <tr
        v-else
        v-for="(item, index) in paginatedTableRows"
        :key="index"
        class="hover:bg-gray-50 text-[10px]"
    >
        <!-- ... rest of table rows ... -->
    </tr>
</tbody>
                            <tfoot
                                v-if="
                                    currentPage === totalPages &&
                                    pivotTableRows.length > 0
                                "
                                class="bg-gray-100 border-t-2 border-gray-300 font-bold"
                            >
                                <tr>
                                    <td
                                        colspan="3"
                                        class="px-2 py-2 text-right border-r border-gray-200 uppercase tracking-wider text-[10px]"
                                    >
                                        Grand Total
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-emerald-50 text-emerald-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.rs) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-blue-50 text-blue-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.ku) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-blue-50 text-blue-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.bk) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-blue-50 text-blue-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.p_ri) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-blue-50 text-blue-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.p_tri) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-blue-50 text-blue-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.p_pemb) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-blue-50 text-blue-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.kp) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-blue-50 text-blue-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.pm_d) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-blue-50 text-blue-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.pm_b) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-blue-50 text-blue-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.pos) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-blue-50 text-blue-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.pol) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-blue-50 text-blue-800 border-r border-gray-200"
                                    >
                                        {{ formatNumber(grandTotal.apo) }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-center bg-gray-200 text-gray-900"
                                    >
                                        {{ formatNumber(grandTotal.total) }}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div
                        v-if="
                            !loading &&
                            pivotTableRows.length > 0 &&
                            totalPages > 1
                        "
                        class="flex items-center justify-center mt-2 gap-2"
                    >
                        <button
                            @click="changePage(1)"
                            :disabled="currentPage === 1"
                            class="p-2 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            title="Halaman Pertama"
                        >
                            <UIcon
                                name="i-heroicons-chevron-double-left"
                                class="w-2 h-2"
                            />
                        </button>

                        <button
                            @click="changePage(currentPage - 1)"
                            :disabled="currentPage <= 1"
                            class="p-2 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                        >
                            <UIcon
                                name="i-heroicons-chevron-left"
                                class="w-2 h-2"
                            />
                        </button>

                        <div class="flex items-center gap-1">
                            <template
                                v-for="page in displayedPages"
                                :key="page"
                            >
                                <button
                                    v-if="page !== '...'"
                                    @click="changePage(page)"
                                    :class="[
                                        'w-8 h-8 rounded-lg border text-[10px] font-medium transition-all',
                                        currentPage === page
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-amber-600',
                                    ]"
                                >
                                    {{ page }}
                                </button>
                                <span v-else class="p-2 text-slate-400"
                                    >...</span
                                >
                            </template>
                        </div>

                        <button
                            @click="changePage(currentPage + 1)"
                            :disabled="currentPage >= totalPages"
                            class="p-2 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                        >
                            <UIcon
                                name="i-heroicons-chevron-right"
                                class="w-2 h-2"
                            />
                        </button>

                        <button
                            @click="changePage(totalPages)"
                            :disabled="currentPage === totalPages"
                            class="p-2 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            title="Halaman Terakhir"
                        >
                            <UIcon
                                name="i-heroicons-chevron-double-right"
                                class="w-2 h-2"
                            />
                        </button>
                    </div>

                    <!-- Pagination Info -->
                    <div
                        v-if="!loading && pivotTableRows.length > 0"
                        class="text-center mt-1 text-xs text-slate-400"
                    >
                        Menampilkan {{ startItem }}-{{ endItem }} dari
                        {{ pivotTableRows.length }} data
                    </div>
                </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
    chartData: { type: [Object, Array], required: true },
    datasetInfo: { type: Object, default: null },
    selectedWilayah: { type: Object, default: () => ({}) }, // 🔥 Added this prop
});

const loading = ref(false);
const itemsPerPage = ref(10);
const currentPage = ref(1);

const formatNumber = (num) => {
    if (num == null || isNaN(num)) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
};

const getJenjangKey = (rawName) => {
    if (!rawName) return "lainnya";
    const n = rawName.toUpperCase();
    if (n.includes("RUMAH SAKIT")) return "rumah_sakit";
    if (n.includes("KLINIK UTAMA")) return "klinik_utama";
    if (n.includes("BALAI KESEHATAN")) return "balai_kesehatan";
    if (n.includes("DENGAN RAWAT INAP")) return "puskesmas_rawat_inap";
    if (n.includes("TANPA RAWAT INAP")) return "puskesmas_tanpa_rawat_inap";
    if (n.includes("PUSKESMAS PEMBANTU")) return "puskesmas_pembantu";
    if (n.includes("KLINIK PRATAMA")) return "klinik_pratama";
    if (n.includes("DOKTER")) return "praktik_mandiri_dokter";
    if (n.includes("BIDAN")) return "praktik_mandiri_bidan";
    if (n.includes("POSKESDES")) return "poskesdes";
    if (n.includes("POLINDES")) return "polindes";
    if (n.includes("APOTEK")) return "apotek";
    return "lainnya";
};

const pivotTableRows = computed(() => {
    let records = [];
    
    if (Array.isArray(props.chartData)) {
        records = props.chartData;
    } else if (props.chartData?.kesehatan?.pra) {
        records = props.chartData.kesehatan.pra;
    } else if (props.chartData?.records) {
        records = props.chartData.records;
    }
    
    // console.log('📊 Records found:', records.length);
    
    if (records.length === 0) return [];
    
    const w = props.selectedWilayah || {};
    const groups = {};

    // Determine level based on selected region
    let level = "provinsi";
    const selectedKabCount = w.kabupaten?.length || 0;
    const hasKecOrDesa = (w.kecamatan?.length || 0) > 0 || (w.desa?.length || 0) > 0;

    if (hasKecOrDesa || selectedKabCount === 1) {
        level = "kabupaten";
    } else if (selectedKabCount > 1 || (w.provinsi?.length || 0) > 0) {
        level = "kabupaten";
    }

    records.forEach((r) => {
        const pCode = r.kd_prov?.kode || "XX";
        const kCode = r.kd_kab?.kode || "XX";
        const pName = r.kd_prov?.nama || "-";
        const kName = r.kd_kab?.nama || "-";

        let key = "";
        let disp = "";

        if (level === "provinsi") {
            key = `P-${pCode}`;
            disp = pName;
        } else {
            key = `K-${pCode}-${kCode}`;
            disp = kName;
        }

        if (!groups[key]) {
            groups[key] = {
                provinsi: pName,
                kabupaten: level === "kabupaten" ? kName : "-",
                displayName: disp,
                rumah_sakit: 0,
                klinik_utama: 0,
                balai_kesehatan: 0,
                puskesmas_rawat_inap: 0,
                puskesmas_tanpa_rawat_inap: 0,
                puskesmas_pembantu: 0,
                klinik_pratama: 0,
                praktik_mandiri_dokter: 0,
                praktik_mandiri_bidan: 0,
                poskesdes: 0,
                polindes: 0,
                apotek: 0,
                total: 0,
            };
        }

        const indName = r.indikator?.nama || r.indicator_name || r.nama_indikator || "";
        const jKey = getJenjangKey(indName);
        const val = Number(r.value) || 0;

        if (groups[key][jKey] !== undefined) {
            groups[key][jKey] += val;
        }

        groups[key].total += val;
    });

    const result = Object.values(groups);
    
    // console.log('📋 Grouped data:', result.length, 'rows');
    
    return result.sort((a, b) => {
        return a.provinsi.localeCompare(b.provinsi) || a.kabupaten.localeCompare(b.kabupaten);
    });
});

const grandTotal = computed(() => {
    return pivotTableRows.value.reduce(
        (acc, row) => {
            acc.rs += row.rumah_sakit || 0;
            acc.ku += row.klinik_utama || 0;
            acc.bk += row.balai_kesehatan || 0;
            acc.p_ri += row.puskesmas_rawat_inap || 0;
            acc.p_tri += row.puskesmas_tanpa_rawat_inap || 0;
            acc.p_pemb += row.puskesmas_pembantu || 0;
            acc.kp += row.klinik_pratama || 0;
            acc.pm_d += row.praktik_mandiri_dokter || 0;
            acc.pm_b += row.praktik_mandiri_bidan || 0;
            acc.pos += row.poskesdes || 0;
            acc.pol += row.polindes || 0;
            acc.apo += row.apotek || 0;
            acc.total += row.total || 0;
            return acc;
        },
        {
            rs: 0, ku: 0, bk: 0, p_ri: 0, p_tri: 0, p_pemb: 0,
            kp: 0, pm_d: 0, pm_b: 0, pos: 0, pol: 0, apo: 0, total: 0,
        },
    );
});

const totalPages = computed(() =>
    Math.ceil(pivotTableRows.value.length / itemsPerPage.value),
);

const displayedPages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;
    
    if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
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

const paginatedTableRows = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return pivotTableRows.value.slice(start, end);
});

const startItem = computed(() => 
    (currentPage.value - 1) * itemsPerPage.value + 1
);

const endItem = computed(() =>
    Math.min(currentPage.value * itemsPerPage.value, pivotTableRows.value.length),
);

const changePage = (p) => {
    if (p >= 1 && p <= totalPages.value) currentPage.value = p;
};

watch(
    () => props.selectedWilayah,
    () => {
        currentPage.value = 1;
    },
    { deep: true },
);

watch(
    () => props.chartData,
    (newData) => {
        // console.log('📦 chartData updated:', newData);
    },
    { immediate: true, deep: true }
);
</script>