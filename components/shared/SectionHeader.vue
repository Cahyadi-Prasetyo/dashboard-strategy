<template>
    <div class="mb-4">
        <div class="flex items-center gap-2 mb-1">
            <div :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center',
                iconBgColor
            ]">
                <UIcon :name="icon" :class="['w-5 h-5', iconColor]" />
            </div>
            <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
        </div>
        <p v-if="description" class="text-sm text-gray-600 ml-10">{{ description }}</p>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: 'amber'
    }
});

const colorMap = {
    amber: {
        bg: 'bg-amber-100',
        icon: 'text-amber-600'
    },
    blue: {
        bg: 'bg-blue-100',
        icon: 'text-blue-600'
    },
    green: {
        bg: 'bg-green-100',
        icon: 'text-green-600'
    },
    purple: {
        bg: 'bg-purple-100',
        icon: 'text-purple-600'
    }
};

const iconBgColor = computed(() => colorMap[props.color]?.bg || colorMap.amber.bg);
const iconColor = computed(() => colorMap[props.color]?.icon || colorMap.amber.icon);
</script>