<template>
    <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden"
    >
        <div
            class="p-3 flex-1 min-h-[350px] grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden"
        >
            <div
                class="flex flex-col h-full border border-gray-100 rounded-lg bg-gray-50/50 overflow-hidden"
            >
                <div class="px-3 py-2 border-b border-gray-100 bg-white">
                    <span
                        class="text-xs font-bold text-orange-600 uppercase tracking-wide"
                        >Pra Bencana</span
                    >
                </div>

                <div class="flex-1 min-h-0 relative p-2">
                    <div
                        v-if="loading === true"
                        class="absolute inset-0 flex items-center justify-center"
                    >
                        <USkeleton class="h-3/4 w-3/4 rounded" />
                    </div>

                    <div
                        v-else-if="chartDataPra.categories.length > 0"
                        class="h-full w-full"
                    >
                        <BarChart
                            :categories="chartDataPra.categories"
                            :series="chartDataPra.series"
                            horizontal
                            :grid="{
                                top: 10,
                                bottom: 20,
                                left: 10,
                                right: 20,
                                containLabel: true,
                            }"
                            class="h-full w-full"
                            :show-legend="false"
                        />
                    </div>

                    <ChartEmptyState
                        v-else
                        title="Data Belum Tersedia"
                        description="Maaf, data saat ini sedang dalam proses pengumpulan dan akan segera tersedia."
                        icon="i-heroicons-home"
                        compact
                    />
                </div>
            </div>

            <div
                class="flex flex-col h-full border border-gray-100 rounded-lg bg-gray-50/50 overflow-hidden"
            >
                <div class="px-3 py-2 border-b border-gray-100 bg-white">
                    <span
                        class="text-xs font-bold text-amber-600 uppercase tracking-wide"
                        >Pasca Bencana</span
                    >
                </div>

                <div class="flex-1 min-h-0 relative p-2">
                    <div
                        v-if="loading === true"
                        class="absolute inset-0 flex items-center justify-center"
                    >
                        <USkeleton class="h-3/4 w-3/4 rounded" />
                    </div>

                    <div
                        v-else-if="chartDataPasca.categories.length > 0"
                        class="h-full w-full"
                    >
                        <BarChart
                            :categories="chartDataPasca.categories"
                            :series="chartDataPasca.series"
                            horizontal
                            :grid="{
                                top: 10,
                                bottom: 20,
                                left: 10,
                                right: 20,
                                containLabel: true,
                            }"
                            class="h-full w-full"
                            :show-legend="false"
                        />
                    </div>

                    <ChartEmptyState
                        v-else
                        title="Data Kosong"
                        description="Pasca Bencana"
                        icon="i-heroicons-home"
                        compact
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import ChartEmptyState from "~/components/ekonomi/ChartEmptyState.vue";
import BarChart from "~/components/charts/BarChart.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
    rawRecords: { type: Array, required: true },
    loading: { type: Boolean, required: true },
    datasetInfo: { type: Object, required: true },
});

const CUSTOM_ORDER = [
    "rusak ringan",
    "rusak sedang",
    "rusak berat",
    "rusak hanyut",
    "rusak tidak diketahui",
    "lainnya",
];

// Helper to Process Data by Flag (1 = Pra, 2 = Pasca)
// Helper to Process Data by Flag (1 = Pra, 2 = Pasca)
const processData = (flag) => {
    if (!props.rawRecords.length) return { categories: [], series: [] };

    // Filter by Flag
    const filtered = props.rawRecords.filter((r) => r.flag_prapasca === flag);

    if (!filtered.length) return { categories: [], series: [] };

    // Aggregate Sum
    const statusMap = new Map();
    // [FIXED] Changed from props.rawRecords.forEach to filtered.forEach
    filtered.forEach((r) => {
        const name = r.itemCategory1?.nama || r.itemCategory1 || "Lainnya";
        const val = Number(r.value) || 0;
        statusMap.set(name, (statusMap.get(name) || 0) + val);
    });

    // [MODIFIED] Convert Map to array and apply Sorting
    let entries = Array.from(statusMap.entries()).map(([name, value]) => ({
        name,
        value,
    }));

    entries.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        let indexA = CUSTOM_ORDER.findIndex((key) => nameA.includes(key));
        let indexB = CUSTOM_ORDER.findIndex((key) => nameB.includes(key));

        // If not found in CUSTOM_ORDER, put at the end
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;

        return indexB - indexA;
    });

    const categories = entries.map((e) => e.name);
    const data = entries.map((e) => e.value);

    // Color Logic
    const getColor = (name) => {
        const n = name.toLowerCase();
        if (n.includes("berat")) return "#EF4444"; // Red
        if (n.includes("sedang")) return "#F97316"; // Orange
        if (n.includes("ringan")) return "#FBBF24"; // Amber
        if (n.includes("hanyut") || n.includes("hilang")) return "#B91C1C"; // Dark Red
        return "#9CA3AF"; // Gray
    };

    return {
        categories,
        series: [
            {
                name: "Jumlah Keluarga",
                data: data.map((val, i) => ({
                    value: val,
                    itemStyle: { color: getColor(categories[i]) },
                })),
                label: { show: true, position: "right" },
            },
        ],
    };
};

// Computed Properties for both cards
const chartDataPra = computed(() => processData(1)); // Flag 1 = Pra
const chartDataPasca = computed(() => processData(2)); // Flag 2 = Pasca
</script>
