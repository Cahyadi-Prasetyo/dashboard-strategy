<template>
    <div
        class="p-3 flex-1 min-h-[350px] grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden"
    >
        <div
            v-if="!isNational"
            class="lg:col-span-2 h-full flex flex-col items-center justify-center text-gray-400 gap-3 border border-dashed border-gray-100 rounded-lg bg-gray-50/50"
        >
            <UIcon name="i-heroicons-map" class="w-12 h-12 opacity-20" />
            <div class="text-center">
                <p class="font-medium text-gray-600">Data Belum Tersedia</p>
                <p class="text-xs text-gray-400 max-w-[250px] mt-1">
                    Data infrastruktur (Nasional) tidak dapat di-agregasi
                    berdasarkan wilayah. Silakan hapus filter wilayah untuk
                    melihat data.
                </p>
            </div>
        </div>

        <template v-else>
            <div
                class="flex flex-col h-full border border-gray-100 rounded-lg bg-gray-50/50 overflow-hidden"
            >
                <div class="px-3 py-2 border-b border-gray-100 bg-white">
                    <span
                        class="text-xs font-bold text-orange-600 uppercase tracking-wide"
                    >
                        Pra Bencana
                    </span>
                </div>
                <div class="flex-1 min-h-[300px] p-2 relative">
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
                            class="h-full"
                            :categories="chartDataPra.categories"
                            :series="chartDataPra.series"
                            horizontal
                            :show-legend="false"
                            height="h-full"
                            :grid="{
                                top: 10,
                                bottom: 20,
                                left: 10,
                                right: 20,
                                containLabel: true,
                            }"
                        />
                    </div>

                    <ChartEmptyState
                        v-else
                        title="Data Kosong"
                        description="Data Pra Bencana belum tersedia."
                        icon="i-heroicons-truck"
                        compact
                    />
                </div>
            </div>

            <div
                class="flex flex-col h-full border border-gray-100 rounded-lg bg-gray-50/50 overflow-hidden"
            >
                <div class="px-3 py-2 border-b border-gray-100 bg-white">
                    <span
                        class="text-xs font-bold text-emerald-600 uppercase tracking-wide"
                    >
                        Pasca Bencana
                    </span>
                </div>
                <div class="flex-1 min-h-[300px] p-2 relative">
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
                            class="h-full"
                            :categories="chartDataPasca.categories"
                            :series="chartDataPasca.series"
                            horizontal
                            :stacked="true"
                            :show-legend="true"
                            legend-position="bottom"
                            height="h-full"
                            :grid="{
                                top: 10,
                                bottom: 30,
                                left: 10,
                                right: 20,
                                containLabel: true,
                            }"
                        />
                    </div>

                    <ChartEmptyState
                        v-else
                        title="Data Kosong"
                        description="Data Pasca Bencana belum tersedia."
                        icon="i-heroicons-truck"
                        compact
                    />
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import BarChart from "~/components/charts/BarChart.vue";
import ChartEmptyState from "~/components/ekonomi/ChartEmptyState.vue";

const props = defineProps({
    status: { type: String, default: "idle" },
    isNational: { type: Boolean, default: true },
    chartDataPra: {
        type: Object,
        default: () => ({ categories: [], series: [] }),
    },
    chartDataPasca: {
        type: Object,
        default: () => ({ categories: [], series: [] }),
    },
});
</script>
