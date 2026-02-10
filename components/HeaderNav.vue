<template>
  <header
    class="sticky top-0 z-60 w-full bg-white/90 backdrop-blur-md border-b border-gray-100"
  >
    <div class="w-full px-6 lg:px-15">
      <div class="flex items-center justify-between h-16 relative">
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300"
          >
            <UIcon name="i-heroicons-circle-stack" class="w-6 h-6" />
          </div>
          <div class="flex flex-col">
            <span
              class="font-bold text-gray-900 text-lg leading-tight tracking-tight"
            >
              Data Tunggal
            </span>
            <span
              class="text-amber-600 text-xs font-bold uppercase tracking-widest"
            >
              Bencana Sumatera
            </span>
          </div>
        </NuxtLink>

        <nav
          class="hidden lg:flex items-center gap-2 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2 whitespace-nowrap',
              isActive(item.path)
                ? 'bg-amber-100 text-amber-900 shadow-sm ring-1 ring-amber-200'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            <UIcon
              v-if="item.icon"
              :name="item.icon"
              class="w-5 h-5 flex-shrink-0"
            />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation menu"
            class="lg:hidden p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
            @click="emit('open-mobile-nav')"
          >
            <UIcon name="i-heroicons-bars-3" class="w-6 h-6 text-gray-700" />
          </button>
          <UserMenu />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const route = useRoute();
const { user } = useUserSession();
const emit = defineEmits(["open-mobile-nav"]);

const navItems = ref([
  { name: "Peta Tematik", path: "/", icon: "i-heroicons-map" },
  {
    name: "Statistik Bencana",
    path: "/analisis-dampak",
    icon: "i-heroicons-light-bulb",
  },
  {
    name: "Pendataan",
    path: "/pendataan",
    icon: "i-heroicons-clipboard-document-list",
  },
  {
    name: "Tentang",
    path: "/tentang",
    icon: "i-heroicons-information-circle",
  },
]);

const isActive = (path) => {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
};
</script>
