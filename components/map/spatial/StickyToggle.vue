<template>
  <UTooltip
    :text="disabled ? disabledText : tooltipText"
    placement="right"
    :delay-duration="0"
  >
    <div
      @click="!disabled ? $emit('click') : null"
      class="group flex items-center border-y border-r border-gray-300 rounded-r-xl shadow-md transition-all duration-200 h-20 w-9 relative"
      :class="[
        disabled
          ? 'bg-gray-100 cursor-not-allowed opacity-70'
          : `bg-white/95 backdrop-blur cursor-pointer hover:pl-1 hover:w-10 hover:bg-${color}-50`,
      ]"
    >
      <div
        class="h-full w-1.5 transition-colors rounded-r-full"
        :class="[
          disabled ? 'bg-gray-300' : `bg-gray-300 group-hover:bg-${color}-500`,
        ]"
      ></div>
      <div
        id="tour-layer-controls"
        class="flex-1 h-full flex items-center justify-center py-2"
      >
        <span
          class="text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap transform rotate-180"
          :class="[
            disabled
              ? 'text-gray-400'
              : `text-gray-500 group-hover:text-${color}-700`,
          ]"
          style="writing-mode: vertical-rl; text-orientation: mixed"
        >
          {{ label }}
        </span>
      </div>
    </div>
  </UTooltip>
</template>

<script setup>
defineProps({
  label: String,
  color: { type: String, default: "amber" }, // amber, blue, emerald
  disabled: Boolean,
  tooltipText: String,
  disabledText: {
    type: String,
    default: "Pilih Filter Wilayah Terlebih Dahulu",
  },
});
defineEmits(["click"]);
</script>
