<template>
  <div class="relative h-screen bg-gray-50 font-sans overflow-y-auto">
    <section
      class="fixed inset-0 bg-cover bg-center overflow-hidden"
      style="background-image: url(&quot;/images/hero-bg.png&quot;)"
    >
      <div
        class="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/80 to-slate-900/90"
      ></div>

      <div class="absolute inset-0 opacity-40">
        <AnimatedParticles />
      </div>

      <div
        class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-pulse"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-pulse"
        style="animation-delay: 2s"
      ></div>
    </section>

    <div
      class="relative z-10 min-h-screen flex items-center justify-center py-4"
    >
      <div class="w-full max-w-6xl mb-0 group relative">
        <div
          class="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"
        ></div>

        <div
          class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(420px,1fr)] bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] border border-white/20 ring-1 ring-white/10 overflow-hidden relative"
        >
          <div
            class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"
          ></div>
          <div
            class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30"
          ></div>

          <div
            class="px-2 py-10 flex flex-col justify-center relative overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20 pointer-events-none"
            ></div>

            <div
              class="space-y-2 text-center w-full flex flex-col items-center relative z-10"
            >
              <!-- Logo row atas -->
              <div class="transition-transform mb-2 flex justify-center">
                <div class="w-full px-4">
                  <div
                    class="mb-2 flex gap-x-4 md:gap-x-8 justify-center bg-white/90 backdrop-blur-sm py-2 px-4 rounded-xl"
                  >
                    <img
                      class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      src="/images/logo/kemenkopmk_logo.png"
                      alt="KEMENKOPMK"
                    />
                    <img
                      class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      src="/images/logo/kemendagri.png"
                      alt="Kemendagri"
                    />
                    <img
                      class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      src="/images/logo/bps.png"
                      alt="BPS"
                    />
                    <img
                      class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      src="/images/logo/big.png"
                      alt="BIG"
                    />

                    <img
                      class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      src="/images/logo/brin_logo.png"
                      alt="BRIN"
                    />
                    <img
                      class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      src="/images/logo/bmkg.png"
                      alt="BMKG"
                    />
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 w-full px-8 mb-2">
                <div
                  class="h-px flex-1 bg-gradient-to-r from-transparent via-white/50 to-white/20"
                ></div>
                <div
                  class="flex items-center gap-2 text-white/70 text-[10px] font-medium tracking-widest uppercase"
                >
                  berkolaborasi dengan
                </div>
                <div
                  class="h-px flex-1 bg-gradient-to-l from-transparent via-white/50 to-white/20"
                ></div>
              </div>

              <div class="flex justify-center mb-2">
                <div
                  class="mb-2 flex gap-x-4 justify-center bg-white/90 backdrop-blur-sm py-2 px-4 rounded-xl"
                >
                    <img
                      class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      src="/images/logo/bnpb.png"
                      alt="BNPB"
                    />
                    <img
                      class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      src="/images/logo/kemenkes.png"
                      alt="Kemenkes"
                    />
                    <img
                      class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      src="/images/logo/kemendikti.png"
                      alt="Kemendikti"
                    />
                    <img
                      class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      src="/images/logo/kkp.png"
                      alt="KKP"
                    />
                    <img
                      class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      src="/images/logo/bappenas_logo.png"
                      alt="Bappenas"
                    />
                  <img
                    class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                    src="/images/logo/kemenbud_logo.png"
                    alt="KEMENBUD"
                  />
                  <img
                    class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                    src="/images/logo/kemendag_logo.png"
                    alt="KEMENDAG"
                  />
                  <img
                    class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                    src="/images/logo/kemenpu_logo.png"
                    alt="KEMENPU"
                  />
                  <img
                    class="h-8 w-auto object-contain opacity-90 hover:opacity-100 hover:brightness-110 transition-all duration-300 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                    src="/images/logo/kemenumkm_logo.png"
                    alt="KEMENUMKM"
                  />
                </div>
              </div>

              <!-- Title badge + heading -->
              <div
                class="flex flex-col items-center gap-2 w-full max-w-6xl mt-2"
              >
                <span
                  class="inline-flex items-center px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium bg-white/25 text-white border border-white/30 shadow-sm backdrop-blur-md"
                >
                  Dashboard Monitoring
                </span>

                <h2
                  class="shimmer-text text-2xl font-extrabold leading-tight tracking-tight"
                  style="filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5))"
                >
                  Dashboard Strategis Kepulauan Riau
                </h2>
              </div>

              <!-- Peta -->
              <div class="relative w-full max-w-sm mx-auto mt-2">
                <div class="relative drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                  <img
                    src="/images/sumatera.png"
                    alt="Peta Sumatera"
                    class="w-full max-w-[260px] lg:max-w-[320px] h-auto opacity-95 hover:opacity-100 transition-opacity duration-500"
                  />

                  <div
                    v-for="(hotspot, index) in hotspots"
                    :key="index"
                    class="absolute hotspot-marker"
                    :style="{
                      left: hotspot.x + '%',
                      top: hotspot.y + '%',
                    }"
                  >
                    <div class="hotspot-ring border-white/50"></div>
                    <div
                      class="hotspot-dot bg-white shadow-[0_0_10px_white]"
                    ></div>
                    <div
                      class="hotspot-tooltip bg-black/60 backdrop-blur-md border border-white/10 text-white"
                    >
                      {{ hotspot.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="px-5 flex flex-col justify-center bg-white/5">
            <div
              class="text-center w-full flex flex-col items-center relative z-10"
            >
              <div class="flex flex-col items-center gap-2 w-full max-w-6xl">
                <h2
                  class="shimmer-text text-2xl font-extrabold leading-tight tracking-tight drop-shadow-sm"
                >
                  Selamat Datang
                </h2>

                <UButton
                  :loading="isSsoLoading"
                  loading-icon="eos-icons:loading"
                  @click="loginWithSSO"
                  size="md"
                  color="neutral"
                  variant="ghost"
                  class="justify-center w-full mb-2 font-semibold border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all shadow-lg shadow-black/10 backdrop-blur-md group cursor-pointer"
                >
                  <img
                    src="/images/logo/bps.png"
                    alt="BPS"
                    class="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform"
                  />
                  <span class="ml-2">Masuk dengan SSO BPS</span>
                </UButton>
              </div>

              <div class="flex items-center w-full my-6">
                <div class="flex-1 border-t border-white/10"></div>

                <span
                  class="px-3 text-gray-400 text-xs uppercase font-medium tracking-wider"
                >
                  Atau via email
                </span>

                <div class="flex-1 border-t border-white/10"></div>
              </div>
              <UForm
                :schema="loginSchemaWithCaptcha"
                :state="credential"
                class="grid gap-4 grid-cols-1"
                @submit="onSubmit"
              >
                <UFormField name="email" :ui="{ error: 'mt-2' }">
                  <template #label>
                    <span class="text-gray-200 font-medium text-sm ml-1"
                      >Email</span
                    >
                  </template>

                  <UInput
                    v-model="credential.email"
                    size="lg"
                    class="w-full"
                    placeholder="Contoh: alan@gmail.com"
                    :ui="{
                      base: 'bg-black/50 text-white placeholder-gray-200 focus:bg-black/60 focus:ring-2 focus:ring-blue-400/60 border-white/20 hover:border-white/40 transition-all backdrop-blur-md rounded-xl shadow-inner',
                    }"
                  />

                  <template #error="{ error }">
                    <span
                      class="text-red-400 text-xs italic flex items-center gap-1"
                    >
                      {{ error }}
                    </span>
                  </template>
                </UFormField>

                <UFormField name="password" :ui="{ error: 'mt-2' }">
                  <template #label>
                    <span class="text-gray-200 font-medium text-sm ml-1"
                      >Password</span
                    >
                  </template>

                  <UInput
                    size="lg"
                    v-model="credential.password"
                    class="w-full"
                    placeholder="Minimal 8 Karakter"
                    :type="showPassword ? 'text' : 'password'"
                    :ui="{
                      base: 'bg-black/50 text-white placeholder-gray-200 focus:bg-black/60 focus:ring-2 focus:ring-blue-400/60 border-white/20 hover:border-white/40 transition-all backdrop-blur-md rounded-xl shadow-inner',
                    }"
                  >
                    <template #trailing>
                      <UButton
                        type="button"
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        :icon="
                          showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                        "
                        @click="showPassword = !showPassword"
                        class="text-gray-400 hover:text-white"
                      />
                    </template>
                  </UInput>
                  <template #error="{ error }">
                    <span
                      class="text-red-400 text-xs italic flex items-center gap-1"
                    >
                      {{ error }}
                    </span>
                  </template>
                </UFormField>

                <UFormField name="captcha" :ui="{ error: 'mt-2' }">
                  <template #label>
                    <span class="text-gray-200 font-medium text-sm ml-1"
                      >Verifikasi Keamanan</span
                    >
                  </template>
                  <div class="space-y-3">
                    <div class="flex items-center gap-2">
                      <div
                        class="border border-white/20 rounded-xl p-2 bg-white/80 backdrop-blur-sm"
                      >
                        <canvas
                          ref="captchaCanvas"
                          width="140"
                          height="20"
                          class="block opacity-90"
                        ></canvas>
                      </div>
                      <UButton
                        type="button"
                        color="neutral"
                        variant="solid"
                        size="lg"
                        icon="i-lucide-refresh-cw"
                        @click="generateCaptcha"
                        class="flex-shrink-0 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-xl"
                      />
                      <p class="text-xs text-gray-400/80 text-start">
                        Captcha akan diperbarui otomatis setiap 5 menit
                      </p>
                    </div>

                    <!-- Captcha Input -->
                    <UInput
                      v-model="captchaInput"
                      @input="credential.captcha = captchaInput"
                      size="lg"
                      class="w-full"
                      placeholder="Masukkan kode captcha"
                      maxlength="6"
                      :ui="{
                        base: 'bg-black/50 text-white placeholder-gray-200 focus:bg-black/60 focus:ring-2 focus:ring-blue-400/60 border-white/20 hover:border-white/40 transition-all backdrop-blur-md rounded-xl shadow-inner',
                      }"
                      variant="none"
                    />
                  </div>
                  <template #error="{ error }">
                    <span class="text-red-400 text-xs italic flex items-center">
                      {{ error }}
                    </span>
                  </template>
                </UFormField>

                <UButton
                  loading-auto
                  :disabled="isLoading || isInvalid"
                  loading-icon="i-lucide-loader"
                  type="submit"
                  color="neutral"
                  size="lg"
                  variant="ghost"
                  class="justify-center w-full mb-2 font-semibold border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all shadow-lg shadow-black/10 backdrop-blur-sm group"
                >
                  Masuk
                </UButton>
              </UForm>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
useHead({
  title: "Login",
});

import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";
import AnimatedParticles from "~/components/AnimatedParticles.vue";

definePageMeta({
  layout: false,
});

const toast = useToast();
const route = useRoute();
const router = useRouter();
const redirectUrl = route.query.callbackUrl
  ? String(route.query.callbackUrl)
  : "/";

const showPassword = ref(false);
const isLoading = ref(false);
const isSsoLoading = ref(false);

const hotspots = ref([
  { name: "Aceh", x: 14, y: 12 },
  { name: "Sumatera Utara", x: 35, y: 30 },
  { name: "Sumatera Barat", x: 47, y: 54 },
]);

const captchaText = ref("");
const captchaInput = ref("");
const captchaCanvas = ref<HTMLCanvasElement>();
const captchaTimer = ref<ReturnType<typeof setInterval> | undefined>();

const loginSchemaWithCaptcha = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
  captcha: z.string().min(1, "Captcha wajib diisi"),
});

type Schema = z.output<typeof loginSchemaWithCaptcha>;
const credential = reactive<Partial<Schema>>({
  email: "",
  password: "",
  captcha: "",
});

const isInvalid = computed(() => {
  const result = loginSchemaWithCaptcha.safeParse(credential);
  return !result.success; // Akan bernilai true jika ada field yang belum valid
});

function generateCaptchaText(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function drawCaptcha() {
  if (!captchaCanvas.value) return;

  const canvas = captchaCanvas.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
      Math.random() * 255
    }, 0.3)`;
    ctx.lineWidth = Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }

  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const text = captchaText.value;
  for (let i = 0; i < text.length; i++) {
    ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${
      Math.random() * 100
    })`;
    ctx.save();
    ctx.translate(23 + i * 20, canvas.height / 2);
    ctx.rotate((Math.random() - 0.5) * 0.5);
    ctx.fillText(text[i] || "", 0, 0);
    ctx.restore();
  }

  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
      Math.random() * 255
    }, 0.3)`;
    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      2,
      2,
    );
  }
}

function generateCaptcha() {
  captchaText.value = generateCaptchaText();
  captchaInput.value = "";
  credential.captcha = "";
  nextTick(() => {
    drawCaptcha();
  });
}

function setupCaptchaTimer() {
  if (captchaTimer.value) {
    clearInterval(captchaTimer.value);
  }
  captchaTimer.value = setInterval(
    () => {
      generateCaptcha();
      toast.add({
        title: "Captcha Diperbarui",
        description: "Captcha telah diperbaharui secara otomatis",
        color: "info",
        icon: "ph:arrow-clockwise-duotone",
        duration: 3000,
      });
    },
    5 * 60 * 1000,
  );
}

onMounted(() => {
  generateCaptcha();
  setupCaptchaTimer();

  const errorMsg = route.query.error as string;
  if (errorMsg) {
    toast.add({
      title: "Login SSO Gagal!",
      description: decodeURIComponent(errorMsg),
      color: "error",
      icon: "i-ph-x-circle-duotone",
    });
  }
});

onUnmounted(() => {
  if (captchaTimer.value) {
    clearInterval(captchaTimer.value);
  }
});
async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (captchaInput.value !== captchaText.value) {
    toast.add({
      title: "Captcha Salah",
      description: "Silakan masukkan kode captcha yang benar",
      color: "error",
      icon: "ph:x-circle-duotone",
    });
    generateCaptcha();
    return;
  }

  isLoading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        email: event.data.email,
        password: event.data.password,
      },
    });

    if (response.success) {
      toast.add({
        title: "Login Berhasil!",
        description: "Selamat datang kembali",
        color: "success",
        icon: "ph:check-circle-duotone",
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
      const { fetch: refreshSession } = useUserSession();
      await refreshSession();
      await navigateTo("/");
    }
  } catch (error: any) {
    credential.password = "";
    credential.email = "";
    toast.add({
      title: "Login gagal",
      description: error.data?.message || "Terjadi kesalahan saat login",
      color: "error",
      icon: "ph:x-circle-duotone",
    });

    isLoading.value = false;
    generateCaptcha();
  }
}
async function loginWithSSO() {
  isSsoLoading.value = true;
  try {
    const ssoUrl = "/api/auth/sso";
    window.location.href = ssoUrl;
  } catch (error: any) {
    toast.add({
      title: "Login SSO Gagal!",
      description: error.data?.message || "Terjadi kesalahan saat login SSO",
      color: "error",
      icon: "ph:x-circle-duotone",
    });
    isSsoLoading.value = false;
  }
}
</script>

<style scoped>
/* Hotspot Styles */
.hotspot-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
}

.hotspot-dot {
  width: 14px;
  height: 14px;
  background: radial-gradient(circle, #ff4444, #cc0000);
  border-radius: 50%;
  position: relative;
  z-index: 3;
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.8);
  animation: pulse-dot 2s ease-in-out infinite;
}

.hotspot-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 48px;
  height: 48px;
  border: 2px solid #ff6666;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-ring 2s ease-out infinite;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
}

.hotspot-ring-2 {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 36px;
  height: 36px;
  border: 2px solid #ff4444;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-ring 2s ease-out infinite 0.5s;
  z-index: 2;
}

.hotspot-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  margin-bottom: 8px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.hotspot-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

.hotspot-marker:hover .hotspot-tooltip {
  opacity: 1;
}

@keyframes pulse-dot {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

@keyframes shine {
  from {
    background-position: 0% center;
  }
  to {
    background-position: -200% center;
  }
}

.shimmer-text {
  /* 1. Buat gradasi: Abu (Mati) -> Putih (Kilap) -> Abu (Mati) */
  background: linear-gradient(
    to right,
    #94a3b8 0%,
    /* Warna Awal: Slate-400 (Abu metalik) */ #ffffff 50%,
    /* Tengah: Putih Terang (Kilauannya) */ #94a3b8 100%
      /* Warna Akhir: Slate-400 */
  );

  /* 2. Perbesar ukuran background agar bisa digeser */
  background-size: 200% auto;

  /* 3. Potong background mengikuti bentuk teks */
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  /* 4. Jalankan animasi (geser background) */
  animation: shine 3s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .hotspot-dot {
    width: 8px;
    height: 8px;
  }

  .hotspot-ring {
    width: 28px;
    height: 28px;
  }

  .hotspot-ring-2 {
    width: 20px;
    height: 20px;
  }
}
</style>
