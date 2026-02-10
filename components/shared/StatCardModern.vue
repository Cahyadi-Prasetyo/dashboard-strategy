<template>
    <div
        class="bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden h-full"
        :class="`border-${color}-100`"
    >
        <UIcon
            :name="icon"
            class="absolute -right-6 -bottom-6 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform -rotate-12"
            :class="`text-${color}-600`"
        />

        <div class="relative z-10 flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                :class="`bg-${color}-50 group-hover:bg-${color}-100 text-${color}-600`"
            >
                <UIcon :name="icon" class="w-5 h-5" />
            </div>

            <div class="min-w-0 flex-1">
                <p
                    class="text-[10px] font-bold uppercase tracking-wide truncate"
                    :class="`text-${color}-600`"
                >
                    {{ label }}
                </p>

                <div
                    v-if="loading"
                    class="h-8 w-24 bg-gray-100 rounded animate-pulse mt-1"
                ></div>

                <div v-else class="flex items-baseline gap-1">
                    <p
                        class="text-2xl font-bold truncate"
                        :class="[
                            isNumeric
                                ? ''
                                : 'text-sm italic font-normal text-gray-400 whitespace-normal break-words',
                            isNegative ? 'text-red-500' : '',
                            isPositive ? 'text-emerald-600' : '',
                            isNumeric && !isNegative && !isPositive
                                ? 'text-gray-900'
                                : '',
                        ]"
                    >
                        {{ displayText }}
                    </p>
                    <span
                        v-if="unit && isNumeric"
                        class="text-xs font-medium text-gray-500 shrink-0"
                    >
                        {{ unit }}
                    </span>
                </div>
            </div>
        </div>

        <div
            class="relative z-10 mt-2 pt-2 border-t flex items-center justify-between text-[10px] text-gray-400"
            :class="`border-gray-50`"
        >
            <span class="truncate w-full">{{ sublabel || "-" }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    label: { type: String, required: true },
    value: { type: [Number, String], default: null },
    unit: { type: String, default: "" },
    loading: { type: Boolean, default: false },
    icon: { type: String, default: "i-heroicons-chart-bar" },
    color: { type: String, default: "blue" },
    sublabel: { type: String, default: "" },
    emptyText: { type: String, default: "Data Belum Tersedia" },
});

const isNumeric = computed(() => {
    if (props.value === null || props.value === undefined || props.value === "")
        return false;
    return !isNaN(parseFloat(props.value)) && isFinite(props.value);
});

const isNegative = computed(
    () => isNumeric.value && parseFloat(props.value) < 0,
);
const isPositive = computed(
    () => isNumeric.value && parseFloat(props.value) > 0,
);

const displayText = computed(() => {
    if (!isNumeric.value) return props.emptyText;
    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 2,
    }).format(Number(props.value));
});
</script>
