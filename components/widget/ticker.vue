<script setup>
const props = defineProps({
  alerts: { type: Array, default: () => [] },
  speed: { type: Number, default: 50 }, // durasi animasi dalam detik
});

const getSeverityColor = (title) => {
  const text = title.toLowerCase();
  if (text.includes("ekstrem") || text.includes("bahaya")) {
    return { bg: "bg-red-700", border: "border-red-800", text: "text-red-100" };
  }
  if (text.includes("sedang") || text.includes("waspada")) {
    return {
      bg: "bg-orange-600",
      border: "border-orange-700",
      text: "text-orange-100",
    };
  }
  return {
    bg: "bg-yellow-600",
    border: "border-yellow-700",
    text: "text-yellow-100",
  };
};

const extractLocation = (title) => {
  // Ekstrak lokasi dari title (format: "Hujan Lebat disertai Petir di [Lokasi]")
  const match = title.match(/di (.+)$/);
  return match ? match[1] : "";
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
};
</script>

<template>
  <div
    v-if="alerts.length > 0"
    :class="[
      'ticker-container overflow-hidden py-1 shadow-lg border-y',
      getSeverityColor(alerts[0]?.title || '').bg,
      getSeverityColor(alerts[0]?.title || '').border,
    ]"
  >
    <div class="flex items-center">
      <!-- Label Fixed -->
      <div
        class="px-4 pr-6 bg-black/20 z-10 flex items-center gap-2 font-bold shadow-lg backdrop-blur-sm border-r border-white/10"
      >
        <UIcon
          name="i-heroicons-bolt"
          class="w-5 h-5 text-white animate-pulse"
        />
        <span
          class="whitespace-nowrap uppercase text-xs text-white font-extrabold tracking-wider"
        >
          Peringatan Cuaca
        </span>
      </div>

      <!-- Scrolling Content -->
      <div class="ticker-wrapper relative flex overflow-hidden flex-1">
        <div
          class="ticker-content flex whitespace-nowrap"
          :style="{ animationDuration: `${speed}s` }"
        >
          <div
            v-for="(alert, index) in [...alerts, ...alerts]"
            :key="`alert-${index}`"
            class="ticker-item flex items-center gap-3 px-6 text-white"
          >
            <!-- Icon Peringatan -->
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-4 h-4 flex-shrink-0"
            />

            <!-- Alert Title -->
            <span class="font-bold text-sm">
              {{ alert.title }}
            </span>

            <!-- Time Badge -->
            <span
              class="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-sm"
            >
              <UIcon name="i-heroicons-clock" class="w-3 h-3" />
              {{ formatTime(alert.pubDate) }}
            </span>

            <!-- Separator -->
            <span class="text-white/40 mx-2">•</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticker-wrapper {
  width: 100%;
  mask-image: linear-gradient(
    to right,
    transparent,
    black 5%,
    black 95%,
    transparent
  );
}

.ticker-content {
  display: flex;
  animation: scroll-left linear infinite;
  will-change: transform;
}

.ticker-content:hover {
  animation-play-state: paused;
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.ticker-item {
  flex-shrink: 0;
}
</style>
