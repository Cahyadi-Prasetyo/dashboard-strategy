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
                    Grafik Rumah Tenaga Kesehatan Terdampak
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
                            class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"
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
                    <div class="flex justify-center mb-6">
                        <div class="bg-gray-100 p-1 rounded-lg inline-flex">
                            <button
                                v-for="tab in ownershipTabs"
                                :key="tab"
                                @click="activeTab = tab"
                                class="px-4 py-1.5 text-sm font-bold rounded-md transition-all duration-200"
                                :class="
                                    activeTab === tab
                                        ? 'bg-white text-amber-600 shadow-sm ring-1 ring-gray-200'
                                        : 'text-gray-500 hover:text-gray-700'
                                "
                            >
                                Status: {{ tab }}
                            </button>
                        </div>
                    </div>

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
                        * Grafik menampilkan kerusakan bangunan {{ activeTab }}
                        berdasarkan tipe konstruksi
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
                <div v-if="datasetInfo?.terakhir_diupdate" class="flex items-center gap-1">
                    <span class="font-bold">Update Terakhir:</span>
                    <span>{{ formatDate(datasetInfo.terakhir_diupdate) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import BarChart from "~/components/charts/BarChart.vue";

const props = defineProps({
    isOpen: Boolean,
    rawData: { type: Array, default: () => [] },
    loading: Boolean,
    datasetInfo: { type: Object, default: () => ({}) },
});

defineEmits(["close"]);

// --- Configurations ---
const ownershipTabs = ["Sewa", "Pribadi"];
const activeTab = ref("Sewa"); // Default Tab

const buildingTypes = ["Permanen", "Semi Permanen"]; // X-Axis Categories

const damageLevels = ["Rusak Ringan", "Rusak Sedang", "Rusak Berat", "Hilang"];

const colorMap = {
    "Rusak Ringan": "#10B981", // Emerald
    "Rusak Sedang": "#F59E0B", // Amber
    "Rusak Berat": "#F97316", // Orange
    Hilang: "#EF4444", // Red
};

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

// --- Data Processing ---
const chartData = computed(() => {
    // 1. Initialize Map: {'Permanen': {RR:0, RS:0...}, 'Semi': {RR:0...}}
    const groupedData = {};
    buildingTypes.forEach((type) => {
        groupedData[type] = {};
        damageLevels.forEach((dmg) => {
            groupedData[type][dmg] = 0;
        });
    });

    // 2. Iterate and Filter Data
    props.rawData.forEach((r) => {
        // A. Filter by Active Tab (Sewa / Pribadi)
        const cat2 = (
            r.itemCategory2?.nama ||
            r.itemCategory2 ||
            ""
        ).toLowerCase();
        if (!cat2.includes(activeTab.value.toLowerCase())) return;

        // B. Identify Building Type (Permanen / Semi)
        const cat3 = (
            r.itemCategory3?.nama ||
            r.itemCategory3 ||
            ""
        ).toLowerCase();
        let targetType = null;
        if (cat3.includes("semi")) targetType = "Semi Permanen";
        else if (cat3.includes("permanen")) targetType = "Permanen";

        if (!targetType) return;

        // C. Identify Damage Level
        const cat1 = r.itemCategory1?.nama || r.itemCategory1;
        if (!damageLevels.includes(cat1)) return;

        // D. Aggregate Value
        const val = Number(r.value) || 0;
        groupedData[targetType][cat1] += val;
    });

    const series = damageLevels.map((damage) => {
        return {
            name: damage,
            color: colorMap[damage] || "#cbd5e1",
            data: buildingTypes.map((type) => groupedData[type][damage]),
        };
    });

    return {
        categories: buildingTypes, // X-Axis
        series: series,
    };
});
</script>
