<template>
    <div
        class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
    >
        <div class="flex items-center gap-3 mb-6">
            <div
                :class="`p-2 rounded-lg ${themeClasses.bg} ${themeClasses.text} bg-opacity-50`"
            >
                <UIcon :name="icon" class="w-6 h-6" />
            </div>
            <span class="font-bold text-gray-700 text-lg line-clamp-2">{{
                label
            }}</span>
        </div>

        <div class="flex items-end justify-between relative z-10">
            <div>
                <p
                    class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"
                >
                    Pra Bencana
                </p>
                <p class="text-xl font-bold text-gray-400">
                    {{ formatNumber(pra) }}
                </p>
            </div>

            <div class="pb-1 text-gray-300">
                <UIcon name="i-heroicons-arrow-right" class="w-6 h-6" />
            </div>

            <div class="text-right">
                <p
                    :class="`text-[10px] font-bold ${themeClasses.text} uppercase tracking-wider mb-1`"
                >
                    Pasca Bencana
                </p>
                <p class="text-3xl font-black text-gray-900">
                    {{ formatNumber(pasca) }}
                </p>
            </div>
        </div>

        <UIcon
            :name="icon"
            :class="`absolute -right-4 -bottom-4 w-24 h-24 ${themeClasses.text} opacity-5 group-hover:opacity-10 transition-opacity`"
        />
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    label: String,
    pra: { type: Number, default: 0 },
    pasca: { type: Number, default: 0 },
    icon: String,
    colorTheme: { type: String, default: "blue" }, // rose, orange, blue
});

const formatNumber = (val) => new Intl.NumberFormat("id-ID").format(val);

const themeClasses = computed(() => {
    const colors = {
        rose: { bg: "bg-rose-100", text: "text-rose-600" },
        orange: { bg: "bg-orange-100", text: "text-orange-600" },
        blue: { bg: "bg-blue-100", text: "text-blue-600" },
    };
    return colors[props.colorTheme] || colors.blue;
});
</script>
