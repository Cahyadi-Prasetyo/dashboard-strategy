<template>
  <button
    @click="$emit('toggle', layer)"
    class="w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-200"
    :class="[
      active
        ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
        : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50',
    ]"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="font-medium truncate">{{ layer.name }}</span>
      <span
        v-if="active"
        class="flex-shrink-0 w-4 h-4 rounded-full bg-white/30 flex items-center justify-center"
      >
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </div>
  </button>
</template>

<script setup>
defineProps({
  layer: {
    type: Object,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle"]);
</script>
