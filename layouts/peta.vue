<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden bg-white">
    <HeaderNav @open-mobile-nav="mobileNavOpen = true" class="shrink-0" />

    <ClientOnly>
      <MobileNav :open="mobileNavOpen" @close="mobileNavOpen = false" />
    </ClientOnly>

    <main class="flex-1 w-full relative overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<script setup>
import MobileNav from "~/components/MobileNav.client.vue";
import { ref, watch } from "vue";

const mobileNavOpen = ref(false);
const route = useRoute();

watch(
  () => route.path,
  () => {
    mobileNavOpen.value = false;
  },
);
</script>
