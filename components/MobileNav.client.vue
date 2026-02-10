<template>
  <div v-if="open" class="fixed inset-0 z-[9999] lg:hidden">
    <!-- backdrop -->
    <Transition name="fade">
      <div
        class="absolute inset-0 bg-black/40"
        @click="emit('close')"
      />
    </Transition>

    <!-- drawer -->
    <Transition name="slide">
      <nav
        class="absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white p-6 shadow-2xl"
      >
        <div class="mb-6 font-semibold text-gray-800">Menu Navigasi</div>

        <NuxtLink
          v-for="item in items"
          :key="item.path"
          :to="item.path"
          @click="emit('close')"
          class="group flex items-center gap-3 px-4 py-3 rounded-xl
                 text-gray-700 transition-all duration-200
                 hover:bg-amber-50 hover:text-amber-700
                 hover:translate-x-1"
          active-class="bg-amber-100 text-amber-800"
        >
          <UIcon
            :name="item.icon"
            class="w-5 h-5 text-amber-500 transition-colors duration-200
                   group-hover:text-amber-700"
          />
          <span class="font-medium">{{ item.name }}</span>
        </NuxtLink>
      </nav>
    </Transition>
  </div>
</template>
<script setup>
const props = defineProps({
  open: Boolean
})
const emit = defineEmits(['close'])

const items = [
  { name: 'Peta Tematik', path: '/', icon: 'i-heroicons-map' },
  // { name: 'Analisis Dampak', path: '/analisis-dampak', icon: 'i-heroicons-presentation-chart-line' },
  { name: 'Analisis Dampak', path: '/analisis-dampak', icon: 'i-heroicons-light-bulb' },
  // { name: 'Monitoring Pendataan', path: '/monitoring-pendataan', icon: 'i-heroicons-clipboard-document-list' },
  { name: 'Tentang', path: '/tentang', icon: 'i-heroicons-information-circle' },
]
</script>
<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  will-change: transform;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
