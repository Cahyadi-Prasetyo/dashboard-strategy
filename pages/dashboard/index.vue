
<template>
    <div class="h-full w-full">
        <!-- Map Component (Self-contained data) -->
        <KepriMap :data="[]" />
    </div>
</template>

<script setup lang="ts">
import KepriMap from '~/components/dashboard/KepriMap.vue';

definePageMeta({
  layout: 'dashboard'
});
</script>
