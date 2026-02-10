<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-5 pt-7 mt-4"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div
                class="flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-lg border border-amber-100 shadow-sm whitespace-nowrap"
            >
                <UIcon
                    name="i-heroicons-heart"
                    class="w-4 h-4 text-amber-400"
                />
                <span
                    class="text-[10px] font-black text-amber-700 uppercase tracking-wider"
                >
                    Fasilitas Kesehatan
                </span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex flex-1 flex-col gap-3">
                <StatCard
                    v-if="loading"
                    label="Memuat Data..."
                    :loading="true"
                />

                <StatCard
                    v-else
                    label="Jumlah Fasilitas Kesehatan"
                    color="amber"
                    icon="i-heroicons-heart"
                    :isRound="true"
                >
                    <template #default>
                        <div
                            class="flex items-center gap-4 bg-slate-50/50 p-2 rounded-lg border border-slate-100"
                        >
                            <div class="px-2">
                                <span
                                    class="text-[9px] uppercase font-semibold text-slate-500 block mb-1"
                                    >Pra (PODES)</span
                                >
                                <div class="flex items-baseline gap-1">
                                    <span
                                        class="text-2xl font-black text-slate-600"
                                    >
                                        {{
                                            datapra.kesehatan?.total == null
                                                ? "N/A"
                                                : formatNumber(
                                                      datapra.kesehatan?.total,
                                                  )
                                        }}
                                    </span>
                                    <span
                                        class="text-[10px] text-slate-500 font-bold uppercase"
                                        >Unit</span
                                    >
                                </div>
                            </div>
                            <div class="h-10 w-px bg-slate-200"></div>
                            <div class="px-2">
                                <span
                                    class="text-[9px] uppercase font-semibold text-rose-500 block mb-1"
                                    >Terdampak (BNPB)</span
                                >
                                <div class="flex items-baseline gap-1">
                                    <span
                                        class="text-2xl font-black text-rose-600"
                                    >
                                        {{
                                            datapasca.kesehatan?.dampak == null
                                                ? "N/A"
                                                : formatNumber(
                                                      datapasca.kesehatan
                                                          ?.dampak,
                                                  )
                                        }}
                                    </span>
                                    <span
                                        class="text-[10px] text-rose-500 font-bold uppercase"
                                        >Unit</span
                                    >
                                </div>
                            </div>
                        </div>
                    </template>
                </StatCard>

                <!-- <div class="bg-white border border-gray-100 rounded-xl p-2 shadow-sm flex-1 flex flex-col">
                    <ChartKesehatanTerdampakBNPB
                        :chart-data="chartData"
                        :dataset-info="chartData.datasetInfoBNPB"
                    />
                </div> -->
            </div>

            <div class="col-span-2 flex flex-col gap-3">
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
                                    <td
                                        colspan="8"
                                        class="px-2 py-10 text-center"
                                    >
                                        <div
                                            class="flex flex-col items-center gap-2"
                                        >
                                            <div
                                                class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"
                                            ></div>
                                            <span
                                                class="text-xs text-gray-500 font-medium"
                                                >Memuat Detail Wilayah...</span
                                            >
                                        </div>
                                    </td>
                                </tr>
                                <tr
                                    v-else
                                    v-for="(item, index) in paginatedTableRows"
                                    :key="index"
                                    class="hover:bg-gray-50 text-[10px]"
                                >
                                    <td
                                        class="px-2 py-2 text-gray-500 border-r border-gray-200 text-center"
                                    >
                                        {{
                                            (currentPage - 1) * itemsPerPage +
                                            index +
                                            1
                                        }}
                                    </td>
                                    <td
                                        class="px-2 py-2 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap"
                                    >
                                        {{ item.provinsi }}
                                    </td>
                                    <td
                                        class="px-2 py-2 text-gray-600 border-r border-gray-200 whitespace-nowrap"
                                    >
                                        {{ item.kabupaten }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-emerald-50/30 border-r border-gray-200"
                                    >
                                        {{ formatNumber(item.rumah_sakit) }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50/30 border-r border-gray-200"
                                    >
                                        {{ formatNumber(item.klinik_utama) }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50/30 border-r border-gray-200"
                                    >
                                        {{ formatNumber(item.balai_kesehatan) }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50/30 border-r border-gray-200"
                                    >
                                        {{
                                            formatNumber(
                                                item.puskesmas_rawat_inap,
                                            )
                                        }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50/30 border-r border-gray-200"
                                    >
                                        {{
                                            formatNumber(
                                                item.puskesmas_tanpa_rawat_inap,
                                            )
                                        }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50/30 border-r border-gray-200"
                                    >
                                        {{
                                            formatNumber(
                                                item.puskesmas_pembantu,
                                            )
                                        }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50/30 border-r border-gray-200"
                                    >
                                        {{ formatNumber(item.klinik_pratama) }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50/30 border-r border-gray-200"
                                    >
                                        {{
                                            formatNumber(
                                                item.praktik_mandiri_dokter,
                                            )
                                        }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50/30 border-r border-gray-200"
                                    >
                                        {{
                                            formatNumber(
                                                item.praktik_mandiri_bidan,
                                            )
                                        }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50/30 border-r border-gray-200"
                                    >
                                        {{ formatNumber(item.poskesdes) }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50/30 border-r border-gray-200"
                                    >
                                        {{ formatNumber(item.polindes) }}
                                    </td>

                                    <td
                                        class="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50/30 border-r border-gray-200"
                                    >
                                        {{ formatNumber(item.apotek) }}
                                    </td>

                                    <td
                                        class="px-2 py-2 font-bold text-gray-800 bg-gray-50 text-center"
                                    >
                                        {{ formatNumber(item.total) }}
                                    </td>
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
            </div>
        </div>

        <div>
            <AlatKesehatanTerdampakSection
                :selected-wilayah="selectedWilayah"
            />
        </div>
    </div>
</template>

<script setup>
import StatCard from "~/components/shared/StatCard.vue";
import ChartKesehatanTerdampakBNPB from "~/components/sosial/ChartKesehatanTerdampakBNPB.vue";
import AlatKesehatanTerdampakSection from "~/components/sosial/AlatKesehatanTerdampakSection.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
    chartData: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    availablePeriods: { type: Array, default: () => [] },
});

const getTodayFormatted = () => {
    return new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const selectedPeriod = ref("");

watch(
    () => props.availablePeriods,
    (newPeriods) => {
        if (newPeriods?.length > 0 && !selectedPeriod.value) {
            selectedPeriod.value = newPeriods[0];
        }
    },
    { immediate: true },
);

const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
};

const datapra = computed(() => {
    const result = {
        kesehatan: { total: null, periode: "2025" },
    };

    if (!props.chartData || !props.chartData.kesehatan) return result;

    const rawData = props.chartData.kesehatan.pra || [];

    const total =
        rawData.reduce((acc, curr) => acc + (curr.value || 0), 0) || null;

    result.kesehatan.total = total;
    return result;
});

const datapasca = computed(() => {
    const result = {
        kesehatan: { dampak: null, periode: getTodayFormatted() },
    };

    if (!props.chartData) return result;

    const w = props.selectedWilayah;
    const isProvinsiMultiple =
        Array.isArray(w.provinsi) && w.provinsi.length > 1;

    const categories = ["kesehatan"];
    const targetDate = selectedPeriod.value?.trim();
    categories.forEach((key) => {
        const raw = props.chartData[key]?.pasca || [];

        const filtered = raw.filter((item) => {
            if (!item.tanggal) return false;
            return formatDate(item.tanggal)?.trim() === targetDate;
        });

        if (filtered.length === 0) {
            result[key].dampak = null;
            result[key].periode = targetDate;
            return;
        }

        if (isProvinsiMultiple) {
            result[key].dampak = filtered.reduce(
                (acc, curr) => acc + (curr.value || 0),
                0,
            );
            result[key].periode = targetDate;
        } else {
            result[key].dampak = filtered[0]?.value ?? null;
            result[key].periode = targetDate;
        }
    });

    return result;
});

const itemsPerPage = ref(10);
const currentPage = ref(1);
const listFasilitasKesehatan = [
    "Jumlah Rumah Sakit",
    "Jumlah Klinik Utama",
    "Jumlah Balai Kesehatan",
    "Jumlah Puskesmas dengan Rawat Inap",
    "Jumlah Puskesmas tanpa Rawat Inap",
    "Jumlah Puskesmas Pembantu",
    "Jumlah Klinik Pratama",
    "Jumlah Praktik Mandiri Dokter",
    "Jumlah Praktik Mandiri Bidan",
    "Jumlah Poskesdes (Pos Kesehatan Desa)",
    "Jumlah Polindes (Pondok Bersalin Desa)",
    "Jumlah Apotek",
];

const getJenjangKey = (rawName) => {
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
    const records = props.chartData.kesehatan?.pra || [];
    const w = props.selectedWilayah;
    const groups = {};

    let level = "provinsi";
    const selectedKabCount = w.kabupaten?.length || 0;
    const hasKecOrDesa = w.kecamatan?.length > 0 || w.desa?.length > 0;

    if (hasKecOrDesa || selectedKabCount === 1) {
        level = "desa";
    } else if (selectedKabCount > 1 || w.provinsi?.length > 0) {
        level = "kabupaten";
    }

    records.forEach((r) => {
        const pCode =
            r.kd_prov?.kode ??
            r.provinsi?.kode ??
            r.id_prov ??
            r.kd_prov_tag ??
            "XX";
        const kCode =
            r.kd_kab?.kode ??
            r.kabupaten?.kode ??
            r.id_kab ??
            r.kd_kab_tag ??
            "XX";

        const pName =
            r.kd_prov?.nama ??
            r.provinsi?.nama ??
            r.nm_prov ??
            r.provinsi ??
            "-";
        const kName =
            r.kd_kab?.nama ??
            r.kabupaten?.nama ??
            r.nm_kab ??
            r.kabupaten ??
            "-";

        let key = "";
        let disp = "";

        if (level === "provinsi") {
            key = `P-${pCode}`;
            disp = pName;
        } else if (level === "kabupaten") {
            key = `K-${pCode}-${kCode}`;
            disp = kName;
        }

        if (!groups[key]) {
            groups[key] = {
                provinsi: pName,
                kabupaten: level !== "provinsi" ? kName : "-",
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
                negeri_total: 0,
                swasta_total: 0,
            };
        }

        const indName =
            r.indicator_name || r.indikator?.nama || r.nama_indikator || "";
        const jKey = getJenjangKey(indName);
        const val = Number(r.value) || 0;

        if (groups[key][jKey] !== undefined) {
            groups[key][jKey] += val;
        }

        groups[key].total += val;

        const n = indName.toLowerCase();
        if (n.includes("swasta")) groups[key].swasta_total += val;
        else groups[key].negeri_total += val;
    });

    let result = Object.values(groups);

    if (level === "provinsi" && (!w.provinsi || w.provinsi.length === 0)) {
        const target = ["ACEH", "SUMATERA UTARA", "SUMATERA BARAT"];
        const filtered = result.filter((g) =>
            target.includes(g.provinsi.toUpperCase()),
        );
        const order = { ACEH: 0, "SUMATERA UTARA": 1, "SUMATERA BARAT": 2 };
        filtered.sort(
            (a, b) =>
                (order[a.provinsi.toUpperCase()] ?? 9) -
                (order[b.provinsi.toUpperCase()] ?? 9),
        );
        return filtered;
    }

    return result.sort((a, b) => {
        return (
            a.provinsi.localeCompare(b.provinsi) ||
            a.kabupaten.localeCompare(b.kabupaten)
        );
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

            acc.negeri += row.negeri_total || 0;
            acc.swasta += row.swasta_total || 0;
            acc.total += row.total || 0;
            return acc;
        },
        {
            rs: 0,
            ku: 0,
            bk: 0,
            p_ri: 0,
            p_tri: 0,
            p_pemb: 0,
            kp: 0,
            pm_d: 0,
            pm_b: 0,
            pos: 0,
            pol: 0,
            apo: 0,
            negeri: 0,
            swasta: 0,
            total: 0,
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

const startItem = computed(
    () => (currentPage.value - 1) * itemsPerPage.value + 1,
);
const endItem = computed(() =>
    Math.min(
        currentPage.value * itemsPerPage.value,
        pivotTableRows.value.length,
    ),
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
</script>
