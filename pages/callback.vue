<template>
  <div class="fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black/40 backdrop-blur-[2px] overflow-auto">Mengalihkan ke halaman beranda...</div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [],
  layout:false
});

const route = useRoute();
const toast = useToast();

onMounted(async () => {
  const code = route.query.code
  if (code) {
    try {
      await $fetch('/api/auth/sso', {
        method: 'POST',
        body: { code }
      })

      toast.add({
        title: "Login Berhasil!",
        description: "Selamat datang kembali",
        color: "success",
        icon: "ph:check-circle-duotone",
        });

        await new Promise((resolve) => setTimeout(resolve, 500));

        navigateTo("/");
    } catch (e: any) {
      const msg = e.data?.statusMessage || 'Login Gagal'
      
      navigateTo(`/login?error=${encodeURIComponent(msg)}`)
    }
  }
})
</script>

