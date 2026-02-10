export default defineNuxtRouteMiddleware(async (to) => {
  // ============================================
  // 🔓 AUTH DINONAKTIFKAN SEMENTARA
  // Fokus development dashboard terlebih dahulu.
  // Hapus 'return' di bawah untuk mengaktifkan kembali auth.
  // ============================================
  return;

  const config = useRuntimeConfig();

  if (String(config.public.maintenanceMode) === "true") {
    return;
  }
  const { user, loggedIn, fetch } = useUserSession();

  // Hanya lakukan fetch user jika ada token sesi dan user belum terisi.
  const sessionToken = useCookie("auth_session");
  if (sessionToken.value && !user.value) {
    await fetch();
  }

  // 1. Daftar halaman public
  const publicRoutes = ["/login", "/callback", "/unauthorized"];

  // 2. Daftar halaman development (WIP)
  // Masukkan path halaman yang ingin dibatasi hanya untuk Admin
  const developmentRoutes = [
    "/dev-map",
    "/tes",
    "/dev-map-brin",
    "/dev-map-pmss",
    "/dev-fasih-image",
  ];

  // Redirect jika belum login & bukan public route
  if (!loggedIn.value && !publicRoutes.includes(to.path)) {
    return navigateTo("/login");
  }

  // Redirect jika sudah login & akses halaman public (misal login lagi)
  if (loggedIn.value && publicRoutes.includes(to.path)) {
    return navigateTo("/");
  }

  // Logic Role: Eksternal tidak boleh akses Monitoring
  // if (
  //   loggedIn.value &&
  //   to.path.startsWith("/monitoring-pendataan") &&
  //   user.value?.roles.includes("Eksternal")
  // ) {
  //   return navigateTo("/unauthorized");
  // }
  if (loggedIn.value && to.path.startsWith("/monitoring-pendataan")) {
    return navigateTo("/unauthorized");
  }

  // 3. Logic Baru: Batasi halaman development hanya untuk Admin
  // Cek apakah route tujuan ada di dalam list developmentRoutes
  const isDevTarget = developmentRoutes.some((route) =>
    to.path.startsWith(route),
  );

  // Cek apakah user BUKAN admin (Ganti 'Admin' sesuai nama role di database Anda)
  const isNotAdmin = !user.value?.roles.includes("Admin");

  if (loggedIn.value && isDevTarget && isNotAdmin) {
    // Arahkan ke unauthorized atau ke home
    return navigateTo("/unauthorized");
  }
});
