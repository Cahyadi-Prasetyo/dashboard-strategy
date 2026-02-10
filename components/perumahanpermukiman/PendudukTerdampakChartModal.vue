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
                <div class="flex items-center gap-2">
                    <UButton
                        v-if="currentLevel !== 'provinsi'"
                        icon="i-heroicons-arrow-left"
                        size="sm"
                        color="warning"
                        variant="soft"
                        @click="handleBack"
                    >
                        Kembali
                    </UButton>
                    <h3 class="font-bold text-gray-800 text-lg">
                        {{ currentTitle }}
                    </h3>
                </div>
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
                    v-if="chartLoading"
                    class="h-80 flex items-center justify-center"
                >
                    <div class="flex flex-col items-center gap-3">
                        <div
                            class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"
                        ></div>
                        <span class="text-sm text-gray-500">Memuat Grafik...</span>
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
                        :showLegend="false"
                        :stacked="false"
                        :horizontal="false"
                        :grid="{
                            left: '3%',
                            right: '4%',
                            bottom: '15%',
                            top: '10%',
                            containLabel: true,
                        }"
                        @chartClick="handleChartClick"
                        :onClick="true"
                    />

                    <div class="mt-4 text-center text-xs text-gray-400 italic">
                        * {{ currentLevel === 'provinsi' ? 'Klik provinsi untuk melihat detail kabupaten/kota' : 'Grafik jumlah penduduk terdampak per wilayah' }}
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
                <div v-if="datasetInfo?.terakhir_diupdate" class="flex items-center gap-1">
                    <span class="font-bold">Update Terakhir:</span>
                    <span>{{ formatDate(datasetInfo.terakhir_diupdate) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import BarChart from "~/components/charts/BarChart.vue";

const props = defineProps({
    isOpen: Boolean,
    datasetInfo: { type: Object, default: () => ({}) },
    selectedWilayah: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close", "chartClick"]);

const headers = useRequestHeaders(["cookie"]);

// State
const currentLevel = ref("provinsi");
const currentParent = ref(null);
const chartLoading = ref(false);
const currentLevelData = ref([]);

const currentTitle = computed(() => {
    if (currentLevel.value === "provinsi") return "Grafik Jumlah Penduduk Terdampak";
    return `Grafik Penduduk Terdampak - ${currentParent.value?.name || "Detail"}`;
});

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

// Fetch data per level
async function fetchLevelData() {
    chartLoading.value = true;
    try {
        let query = { id_dataset: 138 };
        const w = props.selectedWilayah;
        const regionIds =
            w.desa?.length ? w.desa :
                w.kecamatan?.length ? w.kecamatan :
                    w.kabupaten?.length ? w.kabupaten :
                        w.provinsi?.length ? w.provinsi :
                             [];

        if (currentLevel.value === "provinsi") {
            if (regionIds.length > 0) {
                const requests = regionIds.map((provId) =>
                    $fetch("/api/agregat-insight", {
                        headers,
                        query: { ...query, id_prov: provId },
                    }),
                );
                const responses = await Promise.all(requests);
                currentLevelData.value = responses.flatMap((r) => r?.data?.records || []);
            } else {
                const response = await $fetch("/api/agregat-insight", {
                    headers,
                    query,
                });
                currentLevelData.value = response?.data?.records || [];
            }
        } else if (currentLevel.value === "kabupaten" && currentParent.value) {
            const response = await $fetch("/api/agregat-insight", {
                headers,
                query: { ...query, id_prov: currentParent.value.id },
            });
            currentLevelData.value = response?.data?.records || [];
        }
    } catch (e) {
        console.error(e);
        currentLevelData.value = [];
    } finally {
        chartLoading.value = false;
    }
}

const processedData = computed(() => {
    if (!currentLevelData.value || currentLevelData.value.length === 0) {
        return new Map();
    }

    const dataMap = new Map();

    // Grouping by "Exact Level" records
    currentLevelData.value.forEach((r) => {
        let isParentRecord = false;
        let targetId, targetName;

        if (currentLevel.value === "provinsi") {
            targetId = r.kd_prov?.kode;
            targetName = r.kd_prov?.nama;
            isParentRecord = !r.kd_kab?.kode;
        } else if (currentLevel.value === "kabupaten") {
            if (currentParent.value && r.kd_prov?.kode !== currentParent.value.id) return;
            targetId = r.kd_kab?.kode;
            targetName = r.kd_kab?.nama;
            isParentRecord = !r.kd_kec?.kode;
        }

        if (!targetId || !targetName) return;

        if (!dataMap.has(targetName)) {
            dataMap.set(targetName, { id: targetId, parentTotal: 0, childTotal: 0, hasParent: false });
        }

        const stats = dataMap.get(targetName);
        const val = Number(r.value) || 0;

        if (isParentRecord) {
            stats.parentTotal += val;
            stats.hasParent = true;
        } else {
            if (currentLevel.value === "provinsi" && r.kd_kab?.kode && !r.kd_kec?.kode) {
                stats.childTotal += val;
            } else if (currentLevel.value === "kabupaten" && r.kd_kec?.kode && !r.kd_desa?.kode) {
                stats.childTotal += val;
            }
        }
    });

    const resultMap = new Map();
    dataMap.forEach((stats, name) => {
        const finalValue = stats.hasParent ? stats.parentTotal : stats.childTotal;
        if (finalValue > 0) {
            resultMap.set(name, { id: stats.id, total: finalValue });
        }
    });

    return resultMap;
});

const chartCategories = computed(() => {
    return Array.from(processedData.value.keys()).sort();
});

const chartSeries = computed(() => {
    return [
        {
            name: "Jumlah Penduduk",
            type: "bar",
            barMaxWidth: 50,
            itemStyle: {
                color: "#F59E0B",
                borderRadius: [4, 4, 0, 0],
            },
            data: chartCategories.value.map((wilayah) => {
                return processedData.value.get(wilayah)?.total || 0;
            }),
        },
    ];
});

// Handle chart click
function handleChartClick(params) {
    if (currentLevel.value !== "provinsi") return;

    const wilayahName = params.name;
    const wilayahData = processedData.value.get(wilayahName);

    if (!wilayahData?.id) return;

    currentLevel.value = "kabupaten";
    currentParent.value = {
        id: wilayahData.id,
        name: wilayahName,
    };

    fetchLevelData();
}

function handleBack() {
    currentLevel.value = "provinsi";
    currentParent.value = null;
    fetchLevelData();
}

watch(
    () => props.isOpen,
    (val) => {
        if (val) {
            currentLevel.value = "provinsi";
            currentParent.value = null;
            fetchLevelData();
        }
    },
    { immediate: true },
);
</script>