<template>
    <div class="flex flex-col gap-1 overflow-hidden">
        <h3 class="text-sm font-bold text-gray-900 flex items-start gap-2">
            <UIcon
                :name="icon"
                :class="['w-4 h-4 flex-shrink-0 mt-0.5', iconClass]"
            />
            <span class="line-clamp-2 leading-snug">
                {{ title || datasetInfo?.judul || "Chart Title" }}
            </span>
        </h3>

        <div class="flex flex-wrap items-center gap-1.5">
            <UBadge
                v-if="datasetInfo?.instansi"
                color="primary"
                variant="subtle"
                size="xs"
            >
                {{ datasetInfo.instansi }}
            </UBadge>
            <UBadge
                v-if="datasetInfo?.sumber"
                color="primary"
                variant="subtle"
                size="xs"
            >
                {{ datasetInfo.sumber }}
            </UBadge>
            <UBadge
                v-if="datasetInfo?.frekuensi"
                color="primary"
                variant="subtle"
                size="xs"
            >
                {{ datasetInfo.frekuensi }}
            </UBadge>
            <span
                v-if="datasetInfo?.terakhir_diupdate"
                class="text-[10px] text-gray-400 flex items-center gap-0.5 ml-0.5"
            >
                <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                {{ formatDate(datasetInfo.terakhir_diupdate) }}
            </span>
        </div>

        <div>
            
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    datasetInfo: { type: Object, default: () => ({}) },
    title: { type: String, default: "" },
    icon: { type: String, default: "i-heroicons-presentation-chart-line" },
    iconClass: { type: String, default: "text-amber-500" },
});

const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(isoString));
};
</script>
