<template>
    <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden"
    >
        <div
            class="p-3 border-b border-gray-100 flex-none flex items-start justify-between gap-3"
        >
            <ChartHeader
                :dataset-info="datasetInfo"
                title="Status Infrastruktur"
                icon="i-heroicons-truck"
                icon-class="text-blue-600"
                class="flex-1 min-w-0"
            />
            <USelectMenu
                v-model="selectedIndikator"
                :items="availableIndikator"
                class="w-32 sm:w-40 shrink-0"
                size="xs"
                placeholder="Pilih Indikator"
            />
        </div>

        <div class="p-4 flex-1 min-h-[350px] flex flex-col relative">
            <div
                v-if="status === 'pending'"
                class="absolute inset-0 p-4 bg-white z-10"
            >
                <USkeleton class="h-full w-full rounded" />
            </div>

            <div
                v-else-if="chartData.categories.length > 0"
                class="flex-1 min-h-0"
            >
                <BarChart
                    :categories="chartData.categories"
                    :series="chartData.series"
                    stacked
                    :grid="{
                        top: 20,
                        bottom: 30,
                        left: 10,
                        right: 10,
                        containLabel: true,
                    }"
                    class="h-full w-full"
                />
            </div>

            <ChartEmptyState
                v-else
                title="Data Tidak Tersedia"
                description="Tidak ada data lintas sektor untuk filter atau indikator yang dipilih."
                icon="i-heroicons-truck"
                compact
            />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useAgregatInsight } from "~/composables/useAgregatInsight";
import ChartHeader from "~/components/ekonomi/ChartHeader.vue";
import ChartEmptyState from "~/components/ekonomi/ChartEmptyState.vue";
import BarChart from "~/components/charts/BarChart.vue"; // Adjust path

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

// FIXED: Convert prop to a Ref so the composable can watch for changes
const selectedWilayahRef = toRef(props, "selectedWilayah");

// Pass the Ref, not the plain object
const { status, rawRecords, datasetInfo } = useAgregatInsight(
    104,
    selectedWilayahRef,
);

const selectedIndikator = ref("Jumlah Jalan");
const availableIndikator = computed(() => {
    if (!rawRecords.value.length) return [];
    return [
        ...new Set(
            rawRecords.value.map((r) => r.indikator?.nama || r.indikator),
        ),
    ].sort();
});

watch(
    availableIndikator,
    (opts) => {
        if (opts.length && !opts.includes(selectedIndikator.value))
            selectedIndikator.value = opts[0];
    },
    { immediate: true },
);

const chartData = computed(() => {
    if (!rawRecords.value.length) return { categories: [], series: [] };
    const filtered = rawRecords.value.filter(
        (r) => (r.indikator?.nama || r.indikator) === selectedIndikator.value,
    );

    // Categories: Nasional, Daerah
    const categories = [
        ...new Set(
            filtered
                .map((r) => r.itemCategory1?.nama || r.itemCategory1)
                .filter(Boolean),
        ),
    ].sort();

    const getData = (status) =>
        categories.map((cat) => {
            const m = filtered.find(
                (r) =>
                    (r.itemCategory1?.nama || r.itemCategory1) === cat &&
                    (r.itemCategory2?.nama || r.itemCategory2) === status,
            );
            return m ? Number(m.value) : 0;
        });

    return {
        categories,
        series: [
            {
                name: "Fungsional",
                data: getData("Fungsional"),
                color: "#10B981",
                stack: "total",
            },
            {
                name: "Perbaikan",
                data: getData("Perbaikan"),
                color: "#F59E0B",
                stack: "total",
            },
        ],
    };
});
</script>
