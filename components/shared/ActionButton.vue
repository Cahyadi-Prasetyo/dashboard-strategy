<template>
    <UTooltip
        :text="tooltip"
        :popper="{ placement: 'top' }"
        :delay-duration="0"
    >
        <UButton
            @click="$emit('click')"
            :icon="icon"
            size="sm"
            color="primary"
            variant="solid"
            :disabled="disabled || loading"
            class="font-bold shadow-md text-white bg-gray-900 hover:shadow-lg hover:shadow-gray-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
            :ui="{
                rounded: 'rounded-lg',
                padding: { sm: 'px-3 py-2' },
                font: 'font-bold',
                icon: { size: { sm: 'w-4 h-4' } },
            }"
        />
    </UTooltip>
</template>

<script setup>
defineProps({
    icon: {
        type: String,
        required: true,
    },
    tooltip: {
        type: String,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

defineEmits(["click"]);
</script>
