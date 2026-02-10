<template>
  <div class="min-h-screen bg-white">
    <HeaderNav @open-mobile-nav="mobileNavOpen = true" />
    <ClientOnly>
      <MobileNav
        :open="mobileNavOpen"
        @close="mobileNavOpen = false"
      />
    </ClientOnly>

    <main class="w-full">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import HeaderNav from "~/components/HeaderNav.vue";
import Footer from "~/components/Footer.vue";
import MobileNav from "~/components/MobileNav.client.vue";
import { ref, watch } from 'vue'

const mobileNavOpen = ref(false);
const route = useRoute()

watch(() => route.path, () => {
  mobileNavOpen.value = false
})

</script>
