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
                    Grafik Kerusakan Koperasi & UMKM
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
                        :categories="chartData.categories"
                        :series="chartData.series"
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
                        * Grafik menampilkan tingkat kerusakan untuk sektor
                        Koperasi dan UMKM
                    </div>
                </div>
            </div>

            <div
                v-if="datasetInfo?.sumber || datasetInfo?.instansi"
                class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 shrink-0 z-20"
            >
                <div v-if="datasetInfo?.sumber" class="flex items-center gap-1">
                    <span class="font-bold">Sumber:</span>
                    <span>{{ datasetInfo.sumber }}</span>
                </div>
                <div
                    v-if="datasetInfo?.instansi"
                    class="flex items-center gap-1"
                >
                    <span class="font-bold">Instansi:</span>
                    <span>{{ datasetInfo.instansi }}</span>
                </div>
                <div
                    v-if="datasetInfo?.terakhir_diupdate"
                    class="flex items-center gap-1"
                >
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

const damageLevels = [
    "Rusak Ringan",
    "Rusak Sedang",
    "Rusak Berat",
    "Rusak Hanyut",
    "Rusak Tidak Ada Informasi",
];

const colorMap = {
    "Rusak Ringan": "#10B981",
    "Rusak Sedang": "#F59E0B",
    "Rusak Berat": "#F97316",
    "Rusak Hanyut": "#EF4444",
    "Rusak Tidak Ada Informasi": "#94A3B8",
};

const chartData = computed(() => {
    // 1. Filter Data for Koperasi & UMKM
    const filtered = props.rawData.filter((r) => {
        const cat1 = (
            r.itemCategory1?.nama ||
            r.itemCategory1 ||
            ""
        ).toLowerCase();
        // Keep rows that belong to either Koperasi or UMKM sector
        return cat1.includes("koperasi") || cat1.includes("umkm");
    });

    const categoriesSet = new Set();
    const dataMap = new Map(); // Key: "Category|Damage" -> Value: count

    // 2. Aggregate Data
    filtered.forEach((r) => {
        // Use ItemCategory2 as the Group (e.g., "Koperasi", "UMKM")
        const cat2 = r.itemCategory2?.nama || r.itemCategory2 || "Lainnya";
        const damage =
            r.itemCategory4?.nama ||
            r.itemCategory4 ||
            "Rusak Tidak Ada Informasi";
        const val = Number(r.value) || 0;

        categoriesSet.add(cat2);

        const key = `${cat2}|${damage}`;
        dataMap.set(key, (dataMap.get(key) || 0) + val);
    });

    // Sort categories to ensure consistent order (e.g. Koperasi, then UMKM)
    const categories = Array.from(categoriesSet).sort();

    // 3. Construct Series based on Damage Levels
    const series = damageLevels.map((damage) => {
        return {
            name: damage,
            color: colorMap[damage] || "#cbd5e1",
            // For each damage level, get the value for every category (Koperasi, UMKM)
            data: categories.map((cat) => dataMap.get(`${cat}|${damage}`) || 0),
        };
    });

    return {
        categories,
        series,
    };
});
</script>
