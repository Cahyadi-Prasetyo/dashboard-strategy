<template>
    <div
        class="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex items-center gap-4 transition-all hover:shadow-md h-full relative overflow-hidden"
    >
        <UIcon
            :name="icon"
            class="absolute -right-6 -bottom-6 w-32 h-32 opacity-5 pointer-events-none transform -rotate-12"
            :class="`text-${color}-600`"
        />

        <div
            class="flex-none p-2 rounded-lg relative z-10"
            :class="`bg-${color}-50 text-${color}-600`"
        >
            <UIcon :name="icon" :class="sizeMap[sizeIcon]" />
        </div>

        <div class="flex-1 min-w-0 relative z-10">
            <p
                class="font-bold text-gray-700 uppercase tracking-wide mb-1 break-words"
                :class="labelSize ? `text-${labelSize}` : 'text-[10px]'"
            >
                {{ label }}
            </p>

            <div v-if="loading" class="space-y-2 py-1">
                <USkeleton class="h-8 w-32 rounded-md" />
            </div>

            <div v-else class="flex flex-col">
                <slot>
                    <div class="flex items-baseline gap-1">
                        <span
                            class="font-bold tracking-tight"
                            :class="[
                                isNumeric
                                    ? 'text-3xl'
                                    : 'text-sm italic font-normal text-gray-400',
                                color ? `text-${color}-600` : '',
                                isNegative ? 'text-red-500' : '',
                                isPositive ? 'text-emerald-600' : '',
                                isNumeric && !isNegative && !isPositive
                                    ? 'text-gray-900'
                                    : '',
                            ]"
                        >
                            {{ displayText }}
                        </span>
                        <span
                            v-if="unit && isNumeric"
                            class="text-sm text-gray-500 font-medium"
                        >
                            {{ unit }}
                        </span>
                    </div>
                </slot>

                <p
                    v-if="sublabel"
                    class="text-[10px] text-gray-400 font-medium mt-1"
                >
                    {{ sublabel }}
                </p>
            </div>
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
    isRound: { type: Boolean, default: false },
    sizeIcon: { type: String, default: "lg" },
    labelSize: { type: String, default: "" },
});

const sizeMap = {
  sm: "w-2 h-2",
  md: "w-4 h-4",
  lg: "w-8 h-8",
};

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
    if (!isNumeric.value) {
        return props.emptyText || "Data Belum Tersedia";
    }
    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 2,
    }).format(Number(props.value));
});
</script>
