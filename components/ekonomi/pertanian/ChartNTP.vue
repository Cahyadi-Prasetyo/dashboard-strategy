<template>
    <div
        class="h-full w-full border border-gray-100 rounded-xl p-4 relative flex flex-col shadow-sm bg-white"
    >
        <ChartHeader
            :dataset-info="datasetInfo"
            title="Nilai Tukar Petani (NTP)"
            icon="i-heroicons-currency-dollar"
            icon-class="text-emerald-500"
            class="mb-2 flex-shrink-0"
        />

        <div class="flex-1 min-h-0 relative">
            <HeatmapProgress
                v-if="
                    isContextValid &&
                    !statusLoading &&
                    chartData.seriesData.length > 0
                "
                :x-axis-data="chartData.xAxis"
                :y-axis-data="chartData.yAxis"
                :series-data="chartData.seriesData"
                class="h-full w-full"
            />

            <div
                v-else
                class="h-full flex flex-col items-center justify-center gap-4 px-8"
            >
                <div class="relative">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-2xl"
                    ></div>
                    <div
                        class="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200/50 shadow-sm"
                    >
                        <UIcon
                            name="i-heroicons-chart-bar"
                            class="w-12 h-12 text-gray-300"
                        />
                    </div>
                </div>
                <div class="text-center space-y-1.5">
                    <p class="text-sm font-medium text-gray-700">
                        {{
                            statusLoading
                                ? "Memuat Data..."
                                : "Data Belum Tersedia"
                        }}
                    </p>
                    <p class="text-xs text-gray-400 max-w-xs">
                        {{
                            statusLoading
                                ? "Sedang mengambil data terbaru"
                                : "Data belum tersedia untuk wilayah atau periode yang dipilih"
                        }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, toRef } from "vue";
import { useAgregatInsight } from "~/composables/useAgregatInsight";
import HeatmapProgress from "~/components/charts/HeatmapProgress.vue";
import ChartHeader from "~/components/ekonomi/ChartHeader.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

// [LOGIC] Check if the selection is valid for this specific dataset
// Constraints: flag_agregasi=0 (No Multi), Level Province Only (No National, No Kab)
const isContextValid = computed(() => {
    const w = props.selectedWilayah;
    const provCount = w.provinsi?.length || 0;
    const kabCount = w.kabupaten?.length || 0;

    // 1. National Level (0 Prov) -> Invalid (Data not available)
    if (provCount === 0) return false;

    // 2. Multi Province (>1 Prov) -> Invalid (flag_agregasi = 0)
    if (provCount > 1) return false;

    // 3. Kabupaten Level (>0 Kab) -> Invalid (Data only available at Province level)
    if (kabCount > 0) return false;

    // Valid only if exactly 1 Province is selected
    return true;
});

const { rawRecords, status, datasetInfo } = useAgregatInsight(
    11,
    toRef(props, "selectedWilayah"),
    {
        id_indikator_insight: 14,
    },
);

const statusLoading = computed(() => status.value === "pending");

const chartData = computed(() => {
    // If context is invalid, return empty immediately to trigger v-else
    if (
        !isContextValid.value ||
        !rawRecords.value ||
        rawRecords.value.length === 0
    ) {
        return { xAxis: [], yAxis: [], seriesData: [] };
    }

    const monthMap = {
        Januari: 1,
        Februari: 2,
        Maret: 3,
        April: 4,
        Mei: 5,
        Juni: 6,
        Juli: 7,
        Agustus: 8,
        September: 9,
        Oktober: 10,
        November: 11,
        Desember: 12,
        Jan: 1,
        Feb: 2,
        Mar: 3,
        Apr: 4,
        Mei: 5,
        Jun: 6,
        Jul: 7,
        Agu: 8,
        Sep: 9,
        Okt: 10,
        Nov: 11,
        Des: 12,
    };

    const getPeriodVal = (r) => {
        const y = parseInt(r.itemCategory2?.nama || r.itemCategory2 || 0);
        const mStr = r.itemCategory3?.nama || r.itemCategory3 || "";
        const m = monthMap[mStr] || 0;
        return y * 100 + m;
    };

    const validRecords = rawRecords.value.filter((r) => {
        if (r.value === null || r.value === undefined) return false;
        const monthName = r.itemCategory3?.nama || r.itemCategory3;
        // Exclude "Tahunan" data
        if (!monthName || String(monthName).toLowerCase().includes("tahunan"))
            return false;
        return true;
    });

    const uniquePeriods = [
        ...new Set(
            validRecords.map((r) =>
                JSON.stringify({
                    label: `${r.itemCategory3?.nama || ""} ${r.itemCategory2?.nama || ""}`,
                    val: getPeriodVal(r),
                }),
            ),
        ),
    ]
        .map((s) => JSON.parse(s))
        .sort((a, b) => a.val - b.val)
        .map((p) => p.label);

    const uniqueSectors = [
        ...new Set(
            validRecords.map((r) => r.itemCategory1?.nama || "NTP Umum"),
        ),
    ].sort();

    const seriesData = [];

    validRecords.forEach((r) => {
        const period = `${r.itemCategory3?.nama || ""} ${r.itemCategory2?.nama || ""}`;
        const sector = r.itemCategory1?.nama || "NTP Umum";

        const xIndex = uniquePeriods.indexOf(period);
        const yIndex = uniqueSectors.indexOf(sector);
        const value = parseFloat(Number(r.value).toFixed(2));

        if (xIndex >= 0 && yIndex >= 0) {
            seriesData.push([xIndex, yIndex, value]);
        }
    });

    return {
        xAxis: uniquePeriods,
        yAxis: uniqueSectors,
        seriesData,
    };
});
</script>
