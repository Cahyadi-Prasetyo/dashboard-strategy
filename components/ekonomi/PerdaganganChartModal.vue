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
                    Grafik Sektor Perdagangan Terdampak
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
                        * Grafik menampilkan tingkat kerusakan sarana
                        perdagangan
                    </div>
                </div>
            </div>

            <div
                v-if="displayInfo?.sumber || displayInfo?.instansi"
                class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 shrink-0 z-20"
            >
                <div v-if="displayInfo?.sumber" class="flex items-center gap-1">
                    <span class="font-bold">Sumber:</span>
                    <span>{{ displayInfo.sumber }}</span>
                </div>
                <div
                    v-if="displayInfo?.terakhir_diupdate"
                    class="flex items-center gap-1"
                >
                    <span class="font-bold">Update Terakhir:</span>
                    <span>{{ formatDate(displayInfo.terakhir_diupdate) }}</span>
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

const displayInfo = computed(() => {
    // If it's the new object structure, return the first available info
    const values = Object.values(props.datasetInfo);
    if (values.length > 0 && typeof values[0] === "object") {
        return values[0];
    }
    return props.datasetInfo;
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
const damageLevels = [
    "Rusak Ringan",
    "Rusak Sedang",
    "Rusak Berat",
    "Hanyut",
    "Tidak Ada Informasi",
];

const targetCategories = {
    "Jumlah Pasar Terdampak": "Pasar",
    "Jumlah Pedagang Pasar Terdampak": "Pedagang Pasar",
    "Pertokoan": "Pertokoan",
    "Pedagang Kaki Lima (PKL)": "PKL",
};

const categoryOrder = ["Pasar", "Pedagang Pasar", "Pertokoan", "PKL"];

const colorMap = {
    "Rusak Ringan": "#10B981",
    "Rusak Sedang": "#F59E0B",
    "Rusak Berat": "#F97316",
    "Hanyut": "#EF4444",
    "Tidak Ada Informasi": "#94A3B8",
};

const mapDamageLabel = (rawLabel) => {
    const DAMAGE_LABEL_MAP = {
        "Rusak Hanyut": "Hanyut",
        "Rusak Tidak Ada Informasi": "Tidak Ada Informasi",
    };
    return DAMAGE_LABEL_MAP[rawLabel] || rawLabel;
};

// --- Data Processing ---
const processedData = computed(() => {
    const dataMap = new Map(); // Map<"Sector|Damage", Value>

    props.rawData.forEach((r) => {
        const rawCat =
            r.unifiedCategory || r.itemCategory2?.nama || r.itemCategory2;
        const mappedCat = targetCategories[rawCat];

        if (!mappedCat) return;

        const cat4 = mapDamageLabel(
            r.unifiedDamage ||
                r.itemCategory4?.nama ||
                r.itemCategory4 ||
                "Rusak Tidak Ada Informasi",
        );
        const val = Number(r.value) || 0;

        const key = `${mappedCat}|${cat4}`;
        dataMap.set(key, (dataMap.get(key) || 0) + val);
    });

    return {
        categories: categoryOrder,
        dataMap,
    };
});

const chartCategories = computed(() => processedData.value.categories);

const chartSeries = computed(() => {
    const { categories, dataMap } = processedData.value;
    if (!categories.length) return [];

    return damageLevels.map((damage) => {
        return {
            name: damage,
            color: colorMap[damage] || "#cbd5e1",
            data: categories.map((cat) => dataMap.get(`${cat}|${damage}`) || 0),
        };
    });
});
</script>
