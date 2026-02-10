<template>
    <StatCard
        :label="label"
        :icon="icon"
        :color="color"
        :loading="loading"
        sizeIcon="md"
    >
        <template #default>
            <div class="mt-3 flex flex-col gap-3">
                <div
                    v-if="!details || details.length === 0"
                    class="text-sm text-gray-400 italic bg-gray-50/50 p-3 rounded-lg text-center border border-gray-100"
                >
                    Tidak ada data detail
                </div>

                <div v-else class="flex flex-col gap-2">
                    <div
                        v-for="(item, index) in details"
                        :key="index"
                        class="flex justify-between items-center group"
                    >
                        <span
                            class="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors"
                        >
                            {{ item.label }}
                        </span>
                        <div class="flex items-baseline gap-1.5">
                            <span
                                class="text-base font-bold text-gray-900 tabular-nums"
                            >
                                {{ formatNumber(item.value) }}
                            </span>
                            <span
                                class="text-[10px] text-gray-400 font-bold uppercase"
                                >{{ unit }}</span
                            >
                        </div>
                    </div>
                </div>

                <div
                    v-if="total > 0"
                    class="pt-3 border-t border-gray-100 mt-1"
                >
                    <div class="flex justify-between items-center">
                        <span
                            class="text-xs font-bold text-gray-500 uppercase tracking-wider"
                            >Total</span
                        >
                        <div class="flex items-baseline gap-1">
                            <span
                                class="text-xl font-black tracking-tight"
                                :class="`text-${color}-600`"
                            >
                                {{ formatNumber(total) }}
                            </span>
                            <span class="text-xs text-gray-400 font-medium">{{
                                unit
                            }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </StatCard>
</template>

<script setup>
import StatCard from "~/components/shared/StatCard.vue";

defineProps({
    label: { type: String, required: true },
    icon: { type: String, default: "i-heroicons-cube" },
    color: { type: String, default: "blue" },
    loading: { type: Boolean, default: false },
    details: { type: Array, default: () => [] }, // Array of { label, value }
    total: { type: Number, default: 0 },
    unit: { type: String, default: "Unit" },
});

const formatNumber = (n) => new Intl.NumberFormat("id-ID").format(n || 0);
</script>
