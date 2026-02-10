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
                    Luas Tambak Rakyat dan Lahan Mangrove Kawasan Konservasi Terdampak (Ha)
                </h3>
                <UButton
                    color="error"
                    variant="soft"
                    icon="i-heroicons-x-mark"
                    @click="$emit('close')"
                    class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[31px]"
                />
            </div>

            <div class="p-6 bg-slate-50/30">
                <div
                    v-if="loading"
                    class="h-80 flex items-center justify-center"
                >
                    <div class="flex flex-col items-center gap-3">
                        <div
                            class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"
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
                    <BarChart
                        :categories="chartCategories"
                        :series="chartSeries"
                        height="h-96"
                        :showLegend="true"
                        :stacked="false"
                        :horizontal="false"
                        :grid="{
                            left: '3%',
                            right: '4%',
                            bottom: '10%',
                            top: '10%',
                            containLabel: true,
                        }"
                        :tooltipFormatter="(value) => {
                                    if (value == null) return '0';
                                    return new Intl.NumberFormat('id-ID', {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 3
                                    }).format(value);
                                }"
                    />

                    <div class="mt-4 text-center text-xs text-gray-400 italic">
                        * Grafik menampilkan total volume kerusakan pada sektor kelautan dan perikanan berdasarkan kewenangan
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
import { computed } from "vue";
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

const targetKeys = [
    { key: "Tambak Rakyat (Ha)", label: "Tambak Rakyat", color: "#3B82F6" },
    { key: "Lahan Mangrove Kawasan Konservasi (Ha)", label: "Lahan Mangrove Kawasan Konservasi", color: "#10B981" },
];

// --- Data Processing with Kewenangan Breakdown ---
const processedData = computed(() => {
    // Initialize data structure
    const kabKota = new Map();
    const provinsi = new Map();
    
    targetKeys.forEach(k => {
        kabKota.set(k.key, 0);
        provinsi.set(k.key, 0);
    });

    // Process raw data - rawData sudah di-filter untuk indikator "Volume Kerusakan" dari parent
    props.rawData.forEach((r) => {
        // Double-check indikator (untuk keamanan)
        const indikatorNama = r.indikator?.nama || "";
        if (indikatorNama !== "Volume Kerusakan") return;
        
        const cat1 = (r.itemCategory1?.nama || r.itemCategory1 || "").trim();
        const cat3Raw = r.itemCategory3?.nama || r.itemCategory3 || "";
        const cat3 = cat3Raw.trim();
        
        const match = targetKeys.find(k => k.key === cat3);
        if (!match) return;

        const val = Number(r.value) || 0;

        if (cat1 === "Kewenangan Kabupaten/Kota") {
            kabKota.set(match.key, kabKota.get(match.key) + val);
        } else if (cat1 === "Kewenangan Provinsi") {
            provinsi.set(match.key, provinsi.get(match.key) + val);
        }
    });

    return {
        categories: targetKeys.map(k => k.label),
        series: [
            {
                name: "Kewenangan Kabupaten/Kota",
                data: targetKeys.map(k => kabKota.get(k.key)),
                itemStyle: { color: "#3B82F6" }
            },
            {
                name: "Kewenangan Provinsi",
                data: targetKeys.map(k => provinsi.get(k.key)),
                itemStyle: { color: "#10B981" }
            }
        ]
    };
});

const chartCategories = computed(() => processedData.value.categories);
const chartSeries = computed(() => processedData.value.series);
</script>