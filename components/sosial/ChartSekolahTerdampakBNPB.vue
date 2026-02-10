<template>
    <div
        class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mt-0 h-full flex flex-col"
    >
        <div class="flex items-start justify-between gap-4 mb-4">
            <EkonomiChartHeader
                title="Tren Jumlah Sekolah Terdampak"
                :dataset-info="datasetInfo"
                icon="i-heroicons-academic-cap"
                icon-class="text-rose-600"
                class="mb-4"
            />

            <!-- <UButton
                @click="isDetailOpen = true"
                icon="i-heroicons-table-cells"
                size="xs"
                color="gray"
                variant="solid"
                class="font-bold shadow-md text-white bg-gray-900 hover:bg-gray-800"
                :ui="{
                    rounded: 'rounded-lg',
                    padding: { md: 'px-4 py-2.5' },
                    font: 'font-bold',
                    icon: { size: { md: 'w-5 h-5' } }
                }"
            >
                Lihat Detail Tabel
            </UButton> -->
        </div>

        <div
            class="w-full border border-gray-100 rounded-xl p-3 bg-white flex flex-col flex-1 min-h-[200px]"
        >
            <div class="flex-1 min-h-0 w-full relative">
                <ChartsLineChart
                    v-if="lineChartData.categories.length > 0"
                    :categories="lineChartData.categories"
                    :series="lineChartData.series"
                    height="h-full"
                    :colors="['#E11D48']"
                    :show-indicator-filter="false"
                />
                <div
                    v-else
                    class="h-full flex items-center justify-center text-xs text-gray-400 gap-2"
                >
                    <UIcon
                        name="i-heroicons-chart-bar"
                        class="w-5 h-5 text-gray-300"
                    />
                    <span>Data tren belum tersedia</span>
                </div>
            </div>
        </div>

        <!-- <Teleport to="body">
            <SharedDetailModal
                :is-open="isDetailOpen"
                title="Detail Sekolah Terdampak"
                :region-ids="regionIds"
                :tahun="2026"
                :dataset-id="116"
                :column-config="[
                    { key: 'PAUD', label: 'PAUD' },
                    { key: 'SD', label: 'SD' },
                    { key: 'SMP', label: 'SMP' },
                    { key: 'SMA', label: 'SMA' },
                    { key: 'SMK', label: 'SMK' },
                    { key: 'SLB', label: 'SLB' },
                    { key: 'Total', label: 'Total' },
                ]"
                pivot-field="itemCategory1"
                @close="isDetailOpen = false"
            />
        </Teleport> -->
    </div>
</template>

<script setup>
import { computed } from "vue";
// [CHANGE] Import the header component
import EkonomiChartHeader from "~/components/ekonomi/ChartHeader.vue";

const props = defineProps({
    chartData: { type: Object, required: true },
    // [CHANGE] Add the prop to receive metadata
    datasetInfo: { type: Object, default: null },
    regionIds: { type: Array, default: () => [] },
    tahun: { type: Number, default: 2026 },
});

const isDetailOpen = ref(false);

const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
};

const lineChartData = computed(() => {
    // 1. Source: BNPB Data (Pasca)
    const raw = props.chartData.pendidikan?.pasca || [];
    if (raw.length === 0) return { categories: [], series: [] };

    // 2. Sort by Date
    const sorted = [...raw].sort(
        (a, b) => new Date(a.tanggal) - new Date(b.tanggal),
    );

    // 3. Group by Date (Sum values if multiple records exist for same date)
    const grouped = new Map();
    sorted.forEach((r) => {
        const dateKey = formatDate(r.tanggal);
        const val = Number(r.value) || 0;
        grouped.set(dateKey, (grouped.get(dateKey) || 0) + val);
    });

    return {
        categories: Array.from(grouped.keys()),
        series: [
            {
                name: "Sekolah Terdampak",
                data: Array.from(grouped.values()),
                color: "#E11D48", // Rose-600
                smooth: true,
                showSymbol: true,
            },
        ],
    };
});
</script>
