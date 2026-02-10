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
                    Grafik Prasarana Lingkungan Terdampak
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
                    <BarChart
                        :categories="chartCategories"
                        :series="chartSeries"
                        height="h-96"
                        :showLegend="true"
                        legendPosition="bottom"
                        :stacked="false"
                        :horizontal="false"
                        :grid="{
                            left: '3%',
                            right: '4%',
                            bottom: '15%',
                            top: '10%',
                            containLabel: true,
                        }"
                    />

                    <div class="mt-4 text-center text-xs text-gray-400 italic">
                        * Grafik menampilkan perbandingan tingkat kerusakan per
                        jenis prasarana
                    </div>
                </div>
            </div>

            <!-- Footer Metadata -->
            <div
                v-if="datasetInfo?.sumber || datasetInfo?.instansi || datasetInfo?.sumber_data"
                class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 shrink-0 z-20"
            >
                <div v-if="datasetInfo?.sumber || datasetInfo?.sumber_data" class="flex items-center gap-1">
                    <span class="font-bold">Sumber:</span>
                    <span>{{ datasetInfo.sumber || datasetInfo.sumber_data }}</span>
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

// Configuration
const targetCategories = [
    "Drainase Lingkungan",
    "Jalan Lingkungan",
    "Jembatan Ruas Jalan Lingkungan",
];

const damageLevels = [
    "Rusak Ringan",
    "Rusak Sedang",
    "Rusak Berat",
    "Rusak Hanyut",
    "Rusak Tidak Diketahui",
];

const colorMap = {
    "Rusak Ringan": "#10B981", // Emerald
    "Rusak Sedang": "#F59E0B", // Amber
    "Rusak Berat": "#F97316", // Orange
    "Rusak Hanyut": "#EF4444", // Red
    "Rusak Tidak Diketahui": "#94A3B8", // Slate
};

// --- Data Processing ---
const chartCategories = computed(() => targetCategories);

const chartSeries = computed(() => {
    if (!props.rawData.length) return [];

    // Map data for fast lookup: Map<"InfraType|DamageLevel", Value>
    const dataMap = new Map();
    props.rawData.forEach((r) => {
        const cat2 = r.itemCategory2?.nama || r.itemCategory2;
        const cat4 =
            r.itemCategory4?.nama || r.itemCategory4 || "Rusak Tidak Diketahui";
        const val = Number(r.value) || 0;

        const key = `${cat2}|${cat4}`;
        dataMap.set(key, (dataMap.get(key) || 0) + val);
    });

    // Create a series for each Damage Level
    return damageLevels.map((damage) => {
        return {
            name: damage,
            color: colorMap[damage] || "#cbd5e1",
            // For this damage level, get value for each Infra Type (Category)
            data: targetCategories.map((infra) => {
                return dataMap.get(`${infra}|${damage}`) || 0;
            }),
        };
    });
});
</script>
