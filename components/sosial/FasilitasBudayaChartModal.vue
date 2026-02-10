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
            class="relative w-full max-w-5xl flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 max-h-[90vh]"
        >
            <div
                class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white"
            >
                <h3 class="font-bold text-gray-800 text-lg">
                    Grafik Fasilitas Budaya Terdampak
                </h3>
                <UButton
                    color="error"
                    variant="soft"
                    icon="i-heroicons-x-mark"
                    @click="$emit('close')"
                    class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[31px]"
                />
            </div>

            <div class="p-6 bg-slate-50/30 overflow-y-auto">
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

                <div v-else class="flex flex-col gap-6">
                    <!-- Chart 1: Cagar Budaya -->
                    <!-- <div
                        class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                    >
                        <h4 class="text-sm font-bold text-gray-700 mb-4 px-2 border-l-4 border-purple-500">
                            Cagar Budaya Terdampak
                        </h4>
                        <BarChart
                            :categories="chartData1.categories"
                            :series="chartData1.series"
                            height="h-64"
                            :showLegend="false"
                            legendPosition="bottom"
                            :stacked="false"
                            :horizontal="false"
                        />
                         <div class="mt-4 text-center text-xs text-gray-400 italic">
                            * Grafik menampilkan total Cagar Budaya Terdampak
                        </div>
                    </div> -->

                    <!-- Chart 2: Objek Kebudayaan -->
                    <div
                        class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                    >
                        <h4
                            class="text-sm font-bold text-gray-700 mb-4 px-2 border-l-4 border-emerald-500"
                        >
                            Objek Kebudayaan Terdampak
                        </h4>
                        <BarChart
                            :categories="chartData3.categories"
                            :series="chartData3.series"
                            height="h-64"
                            :showLegend="false"
                            legendPosition="bottom"
                            :stacked="false"
                            :horizontal="false"
                        />
                        <div
                            class="mt-4 text-center text-xs text-gray-400 italic"
                        >
                            * Grafik menampilkan total Objek Kebudayaan
                            Terdampak
                        </div>
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
    ds1Data: { type: Array, default: () => [] }, // Cagar Budaya (120 - 276)
    ds3Data: { type: Array, default: () => [] }, // Objek Kebudayaan (122 - 278)
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

// --- Chart 1: Cagar Budaya ---
const categories1 = [
    "Bangunan",
    "Benda",
    "Kawasan",
    "Situs",
    "Struktur",
    "Tidak Ada Kategori",
];
const colorMap1 = {
    Bangunan: "#8b5cf6", // Violet 500
    Benda: "#06b6d4", // Cyan 500
    Kawasan: "#14b8a6", // Teal 500
    Situs: "#8b5cf6", // Violet 500
    Struktur: "#ec4899", // Pink 500
    "Tidak Ada Kategori": "#94a3b8",
};

const chartData1 = computed(() => {
    if (!props.ds1Data?.length) return { categories: [], series: [] };

    const map = new Map();
    categories1.forEach((c) => map.set(c, 0));

    // Mapping raw names to standardized categories
    const typeMap = {
        Bangunan: "Bangunan",
        Benda: "Benda",
        Kawasan: "Kawasan",
        Situs: "Situs",
        Struktur: "Struktur",
        "Tidak Ada Kategori": "Tidak Ada Kategori",
    };

    props.ds1Data.forEach((r) => {
        const raw = r.itemCategory1?.nama || "";
        const key = typeMap[raw];
        if (key && map.has(key)) {
            const val = Number(r.value) || 0;
            map.set(key, map.get(key) + val);
        }
    });

    return {
        categories: categories1,
        series: [
            {
                name: "Jumlah",
                type: "bar",
                data: categories1.map((c) => ({
                    value: map.get(c),
                    itemStyle: { color: colorMap1[c] || "#cbd5e1" },
                })),
            },
        ],
    };
});

// --- Chart 3: Objek Kebudayaan ---
const categories3 = [
    "Cagar Budaya",
    "Objek diduga Cagar Budaya",
    "Museum",
    "Sanggar",
    "Komunitas Budaya",
    "Lainnya",
];
const colorMap3 = {
    "Cagar Budaya": "#d97706", // Amber 600
    "Objek diduga Cagar Budaya": "#2563eb", // Blue 600
    Museum: "#059669", // Emerald 600
    Sanggar: "#e11d48", // Rose 600
    "Komunitas Budaya": "#7c3aed", // Violet 600
    Lainnya: "#64748b", // Slate 500
};

const chartData3 = computed(() => {
    if (!props.ds3Data?.length) return { categories: [], series: [] };

    const map = new Map();
    categories3.forEach((c) => map.set(c, 0));

    const categoryMap = {
        "Cagar Budaya": "Cagar Budaya",
        "Objek diduga Cagar Budaya": "Objek diduga Cagar Budaya",
        Museum: "Museum",
        Sanggar: "Sanggar",
        "Komunitas Budaya": "Komunitas Budaya",
        Lainnya: "Lainnya",
    };

    props.ds3Data.forEach((r) => {
        const raw = r.itemCategory1?.nama || "";
        const key = categoryMap[raw] || "Lainnya";
        if (map.has(key)) {
            const val = Number(r.value) || 0;
            map.set(key, map.get(key) + val);
        }
    });

    return {
        categories: categories3,
        series: [
            {
                name: "Jumlah",
                type: "bar",
                data: categories3.map((c) => ({
                    value: map.get(c),
                    itemStyle: { color: colorMap3[c] || "#cbd5e1" },
                })),
            },
        ],
    };
});
</script>
