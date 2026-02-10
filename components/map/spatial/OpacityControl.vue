<template>
  <div
    class="pointer-events-auto relative z-[9999]"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
  >
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute bottom-full right-0 mb-3 w-48 bg-white/95 backdrop-blur rounded-xl shadow-xl border border-gray-100 p-3 z-[9999]"
      >
        <div class="flex items-center justify-between mb-2">
          <span
            class="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
          >
            Transparansi
          </span>
        </div>
        <USlider
          v-model="internalValue"
          :min="0.1"
          :max="1"
          :step="0.1"
          size="sm"
          color="amber"
        />
      </div>
    </transition>

    <button
      class="bg-white/90 backdrop-blur px-3 py-2.5 rounded-xl border border-gray-200 shadow-lg flex items-center gap-2 transition-all hover:bg-white hover:border-amber-300 group relative z-[2000]"
      :class="{ 'border-amber-300 bg-white': isOpen }"
    >
      <UIcon
        name="ph:sun-dim-bold"
        class="w-4 h-4 text-gray-500 group-hover:text-amber-600 transition-colors"
      />
      <span
        class="text-[10px] font-bold text-gray-600 group-hover:text-gray-900"
      >
        {{ percentage }}%
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
    default: 1,
  },
});

const emit = defineEmits(["update:modelValue"]);

// State manual untuk hover
const isOpen = ref(false);

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const percentage = computed(() => Math.round(internalValue.value * 100));
</script>
