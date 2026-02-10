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
            class="relative w-full max-w-5xl flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10"
        >
            <div
                class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white"
            >
                <h3 class="font-bold text-gray-800 text-lg">
                    Grafik Sektor Pertanian
                </h3>
                <UButton
                    color="error"
                    variant="soft"
                    icon="i-heroicons-x-mark"
                    @click="$emit('close')"
                    class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md border-none ring-0 h-[31px]"
                />
            </div>

            <div class="p-6 bg-slate-50/30">
                <div
                    v-if="loading"
                    class="h-80 flex items-center justify-center"
                >
                    <div class="flex flex-col items-center gap-3">
                        <div
                            class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"
                        ></div>
                        <span class="text-sm text-gray-500"
                            >Memuat Grafik...</span
                        >
                    </div>
                </div>

                <div
                    v-else
                    class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                    <div class="flex flex-wrap justify-center gap-3 mb-6">
                        <div class="flex items-center gap-2">
                            <span
                                class="text-xs font-semibold text-gray-500 uppercase"
                                >Tahun:</span
                            >
                            <select
                                v-model="selectedYear"
                                class="text-sm border-gray-200 rounded-lg bg-gray-50 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option v-for="y in years" :key="y" :value="y">
                                    {{ y }}
                                </option>
                            </select>
                        </div>

                        <div class="flex items-center gap-2">
                            <span
                                class="text-xs font-semibold text-gray-500 uppercase"
                                >Bulan:</span
                            >
                            <select
                                v-model="selectedMonth"
                                class="text-sm border-gray-200 rounded-lg bg-gray-50 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option v-for="m in months" :key="m" :value="m">
                                    {{ m }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <BarChart
                        :categories="chartData.categories"
                        :series="chartData.series"
                        height="h-80"
                        :showLegend="false"
                        :bar-width="'40%'"
                        :grid="{
                            left: '3%',
                            right: '4%',
                            bottom: '5%',
                            top: '10%',
                            containLabel: true,
                        }"
                    />

                    <div class="mt-4 text-center text-xs text-gray-400 italic">
                        * Data menampilkan Nilai Tukar Petani (NTP) periode
                        {{ selectedMonth }} {{ selectedYear }}
                    </div>
                </div>
            </div>

            <!-- Footer Metadata -->
            <div
                v-if="datasetInfo?.sumber || datasetInfo?.instansi"
                class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 shrink-0 z-20"
            >
                <div v-if="datasetInfo?.sumber" class="flex items-center gap-1">
                    <span class="font-bold">Sumber:</span>
                    <span>{{ datasetInfo.sumber }}</span>
                </div>
                <div v-if="datasetInfo?.instansi" class="flex items-center gap-1">
                        <span class="font-bold">Instansi:</span>
                    <span>{{ datasetInfo.instansi }}</span>
                </div>
                <div v-if="datasetInfo?.terakhir_diupdate" class="flex items-center gap-1">
                        <span class="font-bold">Update Terakhir:</span>
                    <span>{{ formatDate(datasetInfo.terakhir_diupdate) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import BarChart from "~/components/charts/BarChart.vue";

const props = defineProps({
    isOpen: Boolean,
    rawData: { type: Array, default: () => [] },
    loading: Boolean,
    datasetInfo: { type: Object, default: () => ({}) },
});

defineEmits(["close"]);

const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    } catch (e) {
        return isoString;
    }
};

// --- Filters Options ---
const years = ["2024", "2025"];
const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
    "Tahunan",
];

// --- Active State ---
const selectedYear = ref("2024");
const selectedMonth = ref("Tahunan");

const chartData = computed(() => {
    // 1. Filter Data based on selected Period
    const filtered = props.rawData.filter((r) => {
        const rYear = (
            r.itemCategory2?.nama ||
            r.itemCategory2 ||
            ""
        ).toString();
        const rMonth = r.itemCategory3?.nama || r.itemCategory3 || "";

        return (
            rYear === selectedYear.value &&
            rMonth.toLowerCase() === selectedMonth.value.toLowerCase()
        );
    });

    // 2. Map to Categories (Sectors) and Values
    // Exclude "Gabungan" logic if needed, or keep it for comparison
    const finalData = filtered
        .map((r) => ({
            category: r.itemCategory1?.nama || r.itemCategory1 || "Lainnya",
            value: Number(r.value) || 0,
        }))
        .sort((a, b) => b.value - a.value);

    return {
        categories: finalData.map((d) => d.category),
        series: [
            {
                name: "Nilai",
                data: finalData.map((d) => ({
                    value: d.value,
                    itemStyle: { color: getColor(d.category) },
                })),
                showLabel: true,
            },
        ],
    };
});

function getColor(category) {
    const lower = category.toLowerCase();
    if (lower.includes("pangan")) return "#10B981"; // Emerald
    if (lower.includes("hortikultura")) return "#84CC16"; // Lime
    if (lower.includes("perkebunan")) return "#059669"; // Green
    if (lower.includes("peternakan")) return "#F59E0B"; // Amber
    if (lower.includes("perikanan")) return "#06B6D4"; // Cyan
    if (lower.includes("gabungan")) return "#6366F1"; // Indigo
    return "#94A3B8"; // Slate
}
</script>
