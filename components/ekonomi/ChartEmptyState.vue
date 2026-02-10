<template>
    <div
        class="h-full flex flex-col items-center justify-center text-gray-400"
        :class="compact ? 'p-2' : 'py-8 px-4'"
    >
        <UAvatar
            :icon="icon"
            :size="compact ? 'sm' : 'xl'"
            class="bg-gradient-to-br from-amber-100 to-blue-100 text-amber-500 shadow-sm"
            :class="compact ? 'mb-2' : 'mb-4'"
        />
        <p
            class="font-semibold text-gray-700 text-center"
            :class="compact ? 'text-[10px]' : 'text-base mb-1'"
        >
            {{ title }}
        </p>
        <p
            v-if="description"
            class="text-gray-500 text-center mx-auto"
            :class="
                compact
                    ? 'text-[9px] max-w-[150px] leading-tight'
                    : 'text-sm max-w-xs'
            "
        >
            {{ description }}
        </p>
    </div>
</template>

<script setup>
defineProps({
    title: { type: String, default: "Data Tidak Tersedia" },
    description: { type: String, default: "" },
    icon: { type: String, default: "i-heroicons-chart-bar" },
    compact: { type: Boolean, default: false },
});
</script>
