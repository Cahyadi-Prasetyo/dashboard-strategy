<template>
  <div
    class="p-4 rounded-lg bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-amber-400/30 hover:bg-amber-400/5 transition-all duration-300 group cursor-pointer"
  >
    <div
      class="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300"
    >
      {{ icon }}
    </div>
    <h3 class="text-sm font-semibold text-white mb-1">{{ title }}</h3>
    <p
      class="text-xs text-slate-400 group-hover:text-slate-300 transition-colors"
    >
      {{ description }}
    </p>
  </div>
</template>

<script lang="ts" setup>
interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

defineProps<FeatureItemProps>();
</script>
