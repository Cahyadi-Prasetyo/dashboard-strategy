<template>
    <div
        class="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 mb-2 pt-0 pb-4"
    >
        <div
            class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1"
        >
            <span
                class="text-sm text-gray-400 font-semibold mr-2 flex-shrink-0 uppercase tracking-wider"
            >
                SubSektor:
            </span>

            <button
                v-for="section in sections"
                :key="section.id"
                @click="$emit('navigate', section.id)"
                :class="[
                    'px-2 py-1 rounded-full text-sm font-semibold transition-all duration-200 flex-shrink-0 border',
                    activeSection === section.id
                        ? 'bg-gray-900 text-white border-gray-500 shadow-md shadow-gray-500/20 transform scale-105'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-600 hover:shadow-sm',
                ]"
            >
                <span class="flex items-center gap-2">
                    <UIcon :name="section.icon" class="w-4 h-4" />
                    {{ section.label }}
                </span>
            </button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    sections: { type: Array, required: true },
    activeSection: { type: String, required: true },
});

defineEmits(["navigate"]);
</script>
