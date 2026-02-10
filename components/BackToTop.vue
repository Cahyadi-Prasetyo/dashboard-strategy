<template>
  <Transition name="fade-slide">
    <button
      v-if="show"
      @click="scrollToTop"
      class="fixed bottom-6 left-6 z-50 bg-amber-500 text-white px-5 py-3 rounded-xl shadow-2xl hover:bg-amber-600 transition-all flex items-center gap-2 group"
    >
      <UIcon
        name="ph:arrow-circle-up-fill"
        class="w-6 h-6 transform group-hover:scale-110 transition-transform"
      />
      <span class="font-semibold">Kembali ke Atas</span>
    </button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const show = ref(false);

const handleScroll = () => {
  show.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
