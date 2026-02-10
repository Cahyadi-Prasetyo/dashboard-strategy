<template>
    <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden"
    >
        <div class="p-3 border-b border-gray-100 flex-none">
            <ChartHeader
                :dataset-info="datasetInfo"
                title="Status Kerusakan Hunian (Pra vs Pasca)"
                icon="i-heroicons-home"
                icon-class="text-orange-600"
            />
        </div>

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
                        v-if="status === 'pending'"
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
                        title="Data Kosong"
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
                        v-if="status === 'pending'"
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
import { computed, toRef } from "vue";
import { useAgregatInsight } from "~/composables/useAgregatInsight";
import ChartHeader from "~/components/ekonomi/ChartHeader.vue";
import ChartEmptyState from "~/components/ekonomi/ChartEmptyState.vue";
import BarChart from "~/components/charts/BarChart.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const selectedWilayahRef = toRef(props, "selectedWilayah");

// Fetch Data (ID 107)
const { status, rawRecords, datasetInfo } = useAgregatInsight(
    107,
    selectedWilayahRef,
);

// Helper to Process Data by Flag (1 = Pra, 2 = Pasca)
const processData = (flag) => {
    if (!rawRecords.value.length) return { categories: [], series: [] };

    // Filter by Flag
    const filtered = rawRecords.value.filter((r) => r.flag_prapasca === flag);

    if (!filtered.length) return { categories: [], series: [] };

    // Aggregate Sum
    const statusMap = new Map();
    filtered.forEach((r) => {
        const name = r.itemCategory1?.nama || r.itemCategory1 || "Lainnya";
        const val = Number(r.value) || 0;
        statusMap.set(name, (statusMap.get(name) || 0) + val);
    });

    const categories = Array.from(statusMap.keys());
    const data = Array.from(statusMap.values());

    // Color Logic
    const getColor = (name) => {
        const n = name.toLowerCase();
        if (n.includes("berat")) return "#EF4444"; // Red
        if (n.includes("sedang")) return "#F97316"; // Orange
        if (n.includes("ringan")) return "#FBBF24"; // Amber
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
