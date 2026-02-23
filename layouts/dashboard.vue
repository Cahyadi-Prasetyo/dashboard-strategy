
<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
    
    <!-- Main Content Full Width (No Sidebar) -->
    <main class="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-950 relative w-full">
        <!-- Header -->
        <header class="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-20">
            <!-- Brand / Title (Moved here because Sidebar is gone) -->
            <div class="flex items-center gap-3">
               <img src="/logo-bps.png" alt="Logo BPS" class="w-9 h-9 rounded-xl object-contain shadow-lg" />
               <div>
                 <h1 class="font-bold text-base tracking-tight leading-tight">Dashboard Strategis</h1>
                 <p class="text-[10px] text-gray-500 dark:text-gray-400">Provinsi Kepulauan Riau</p>
               </div>
            </div>

        </header>

        <!-- Page Content -->
        <div class="flex-1 overflow-hidden relative">
             <slot />
        </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Layout logic here if needed
</script>
