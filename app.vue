<template>
  <UApp
    :toaster="{
      position: 'top-center',
    }"
  >
    <NuxtLayout>
      <NuxtPage :keepalive="{ max: 10 }" />
    </NuxtLayout>
  </UApp>
</template>
<script setup lang="ts"></script>

<style>
/* Fix Driver.js ketutupan Peta Leaflet */
div#driver-popover-item {
  z-index: 10000 !important;
}
.driver-overlay {
  z-index: 9999 !important;
}
.driver-active-element {
  z-index: 10000 !important; /* Biar elemen yang disorot naik ke atas overlay */
  position: relative;
}
</style>
