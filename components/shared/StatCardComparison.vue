<template>
    <div
        class="bg-white rounded-xl p-2 border border-gray-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group h-full flex flex-col justify-between min-h-[100px]"
    >
        <div class="flex items-center gap-2 mb-0 relative z-10">
            <div
                :class="`p-1.5 rounded-md ${themeClasses.bg} ${themeClasses.text} bg-opacity-50 shrink-0`"
            >
                <UIcon :name="icon" class="w-4 h-4" />
            </div>
            <span
                class="font-bold text-gray-700 text-sm line-clamp-1 leading-tight"
            >
                {{ label }}
            </span>
        </div>

        <div
            v-if="loading"
            class="animate-pulse flex items-end justify-between relative z-10 mt-1"
        >
            <div class="h-8 bg-gray-100 rounded w-1/3"></div>
            <div class="h-6 bg-gray-100 rounded w-6"></div>
            <div class="h-10 bg-gray-100 rounded w-1/3"></div>
        </div>

        <div v-else class="flex items-end justify-between relative z-10">
            <div>
                <p
                    class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0"
                >
                    {{ praLabel }}
                </p>
                <p
                    class="text-3xl font-bold text-gray-500 flex items-baseline gap-0.5"
                >
                    {{ formatNumber(pra) }}
                    <span v-if="unit" class="text-xs font-normal">{{
                        unit
                    }}</span>
                </p>
            </div>

            <div class="pb-1 text-gray-500 px-1">
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
            </div>

            <div class="text-right">
                <p
                    :class="`text-xs font-bold ${themeClasses.text} uppercase tracking-wider mb-0`"
                >
                    {{ pascaLabel }}
                </p>
                <p
                    class="text-5xl font-black text-gray-900 flex items-baseline justify-end gap-0.5"
                >
                    {{ formatNumber(pasca) }}
                    <span
                        v-if="unit"
                        class="text-xs font-medium text-gray-500"
                        >{{ unit }}</span
                    >
                </p>
            </div>
        </div>

        <UIcon
            :name="icon"
            :class="`absolute -right-10 -bottom-10 w-40 h-40 ${themeClasses.text} opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform -rotate-12`"
        />
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    label: String,
    pra: { type: [Number, String], default: 0 },
    pasca: { type: [Number, String], default: 0 },
    icon: String,
    colorTheme: { type: String, default: "blue" },
    loading: { type: Boolean, default: false },
    unit: { type: String, default: "" },
    praLabel: { type: String, default: "Pra" },
    pascaLabel: { type: String, default: "Pasca" },
});

const formatNumber = (val) => {
    if (val === "-" || val === null || val === undefined) return "-";
    return new Intl.NumberFormat("id-ID").format(Number(val));
};

const themeClasses = computed(() => {
    const colors = {
        rose: { bg: "bg-rose-100", text: "text-rose-600" },
        red: { bg: "bg-red-50", text: "text-red-600" },
        orange: { bg: "bg-orange-100", text: "text-orange-600" },
        blue: { bg: "bg-blue-100", text: "text-blue-600" },
        emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
        amber: { bg: "bg-amber-100", text: "text-amber-600" },
        gray: { bg: "bg-gray-100", text: "text-gray-600" },
    };
    return colors[props.colorTheme] || colors.amber;
});
</script>
