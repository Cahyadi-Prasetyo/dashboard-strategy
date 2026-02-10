<template>
    <div
        class="flex-none border-l-4 pl-3 py-0.5"
        :class="`border-${color}-500`"
    >
        <div class="flex items-center gap-2">
            <UIcon :name="icon" class="w-5 h-5" :class="`text-${color}-500`" />
            <h2 class="text-lg font-bold text-gray-900">
                {{ title }}
            </h2>
        </div>
        <p v-if="description" class="text-xs text-gray-600 mt-0.5">
            {{ description }}
        </p>
    </div>
</template>

<script setup>
defineProps({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "i-heroicons-squares-2x2" },
    color: { type: String, default: "gray" }, // e.g. 'amber', 'blue', 'emerald'
});
</script>
