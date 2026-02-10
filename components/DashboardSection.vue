<template>
    <div
        v-if="visible"
        class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
        <div
            class="flex flex-col md:flex-row md:items-start justify-between gap-4"
        >
            <div class="flex items-start gap-3">
                <div
                    :class="`p-2 rounded-lg ${themeClasses.bg} ${themeClasses.text} flex-shrink-0`"
                >
                    <UIcon :name="icon" class="w-6 h-6" />
                </div>

                <div class="space-y-2">
                    <h3 class="text-xl font-bold text-gray-800 leading-tight">
                        {{ title }}
                    </h3>

                    <div class="flex flex-wrap items-center gap-2 text-sm">
                        <UBadge color="primary" variant="subtle" size="xs">
                            {{ source }}
                        </UBadge>

                        <UBadge
                            v-if="frequency"
                            color="primary"
                            variant="subtle"
                            size="xs"
                        >
                            {{ frequency }}
                        </UBadge>

                        <span
                            v-if="lastUpdate"
                            class="text-xs text-gray-500 flex items-center gap-1 ml-1"
                        >
                            <UIcon
                                name="i-heroicons-clock"
                                class="w-3.5 h-3.5"
                            />
                            Diperbarui: {{ formatDate(lastUpdate) }}
                        </span>
                    </div>
                </div>
            </div>

            <div v-if="$slots.actions" class="flex-shrink-0">
                <slot name="actions"></slot>
            </div>
        </div>

        <div class="space-y-6">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    title: { type: String, required: true },
    source: { type: String, default: "-" },
    frequency: { type: String, default: "" }, // Prop Baru
    lastUpdate: { type: String, default: "" }, // Prop Baru
    icon: { type: String, default: "i-heroicons-document-chart-bar" },
    visible: { type: Boolean, default: true },
    colorTheme: { type: String, default: "primary" },
});

// Helper Format Tanggal
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

const themeClasses = computed(() => {
    const colors = {
        rose: { bg: "bg-rose-100", text: "text-rose-600" },
        blue: { bg: "bg-blue-100", text: "text-blue-600" },
        orange: { bg: "bg-orange-100", text: "text-orange-600" },
        emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
        gray: { bg: "bg-gray-100", text: "text-gray-600" },
    };
    return colors[props.colorTheme] || colors.blue;
});
</script>
