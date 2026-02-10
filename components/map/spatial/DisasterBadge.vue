<template>
  <UBadge
    variant="subtle"
    size="md"
    class="hidden sm:flex items-center gap-1.5 px-3 transition-colors duration-300"
    :class="badgeConfig.colors"
    :ui="{ rounded: 'rounded-md' }"
  >
    <UIcon :name="badgeConfig.icon" class="w-4 h-4" />
    <span class="font-bold uppercase tracking-wider text-[11px]">
      {{ badgeConfig.label }}
    </span>
  </UBadge>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // Terima nilai 'pra' atau 'pasca'
  type: {
    type: String,
    required: true,
    validator: (value) => ["pra", "pasca"].includes(value),
  },
});

const badgeConfig = computed(() => {
  if (props.type === "pra") {
    return {
      label: "Pra Bencana",
      icon: "i-heroicons-shield-check",
      colors: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20",
    };
  } else {
    // Default ke Pasca
    return {
      label: "Pasca Bencana",
      icon: "ph:map-trifold-duotone",
      colors: "bg-rose-50 text-rose-600 ring-1 ring-rose-500/20",
    };
  }
});
</script>
