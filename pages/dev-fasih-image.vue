<template>
  <div class="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
    <div
      class="w-full max-w-3xl bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
    >
      <div
        class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3"
      >
        <div class="h-8 w-1.5 bg-amber-500 rounded-full"></div>
        <div>
          <h1 class="text-xl font-bold text-gray-900">
            Dev Tool: Generate Fasih Image
          </h1>
          <p class="text-sm text-gray-500">
            Generate signed URL baru berdasarkan Survey Period ID dan Filename.
          </p>
        </div>
      </div>

      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label
              for="surveyPeriod"
              class="block text-sm font-medium text-gray-700"
            >
              Survey Period ID (Folder UUID) <span class="text-red-500">*</span>
            </label>
            <input
              id="surveyPeriod"
              v-model="inputForm.surveyPeriod"
              type="text"
              placeholder="Contoh: 7d235679-1557-458b-8023-6c1319dd74b0"
              class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-amber-500 focus:ring-amber-500"
            />
            <p class="text-[10px] text-gray-400">
              UUID folder tempat gambar berada.
            </p>
          </div>

          <div class="space-y-1">
            <label
              for="filename"
              class="block text-sm font-medium text-gray-700"
            >
              Filename (Nama File Asli) <span class="text-red-500">*</span>
            </label>
            <input
              id="filename"
              v-model="inputForm.filename"
              type="text"
              placeholder="Contoh: c234f80c..._r501_p7#1__c.jpg"
              class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-amber-500 focus:ring-amber-500"
            />
            <p class="text-[10px] text-gray-400">
              Pastikan karakter spesial seperti # ditulis apa adanya (jangan
              di-encode jadi %23).
            </p>
          </div>
        </div>

        <div>
          <button
            @click="generateSignedUrl"
            :disabled="isLoading || !isFormValid"
            class="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 focus:ring-4 focus:ring-amber-300 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg
              v-if="isLoading"
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span v-if="isLoading">Memproses...</span>
            <span v-else>Generate Gambar</span>
          </button>
        </div>

        <hr class="border-gray-200" />

        <div
          v-if="errorMessage"
          class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5 shrink-0 mt-0.5"
          >
            <path
              fill-rule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <p class="font-bold">Gagal</p>
            <p class="text-sm">{{ errorMessage }}</p>
          </div>
        </div>

        <div
          v-if="generatedResult"
          class="space-y-4 animate-in fade-in duration-300"
        >
          <div>
            <h3 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-5 h-5 text-green-500"
              >
                <path
                  fill-rule="evenodd"
                  d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                  clip-rule="evenodd"
                />
              </svg>
              Result: Signed URL
            </h3>
            <div class="relative">
              <textarea
                readonly
                :value="generatedResult.url"
                class="w-full h-32 p-3 text-xs font-mono bg-slate-800 text-green-400 rounded-lg border border-slate-700 focus:outline-none resize-none custom-scrollbar"
              ></textarea>
              <p class="text-[10px] text-gray-500 mt-1 text-right">
                URL ini akan expired dalam 1 jam.
              </p>
            </div>
          </div>

          <div>
            <h3 class="font-bold text-gray-900 mb-2">Preview Gambar</h3>
            <div
              class="bg-gray-100 rounded-xl border border-gray-200 p-2 min-h-[200px] flex items-center justify-center overflow-hidden relative group"
            >
              <img
                :src="generatedResult.url"
                alt="Generated Preview"
                class="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm z-10"
                @load="imageStatus = 'loaded'"
                @error="handleImageError"
              />

              <div
                v-if="imageStatus === 'loading'"
                class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20"
              >
                <svg
                  class="animate-spin h-8 w-8 text-gray-400 mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span class="text-sm text-gray-500"
                  >Memuat preview gambar...</span
                >
              </div>

              <div
                v-if="imageStatus === 'error'"
                class="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-4 text-center z-20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-10 h-10 text-red-400 mb-2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <p class="text-sm font-bold text-red-600">
                  Gambar Tidak Dapat Dimuat (403/404)
                </p>
                <p class="text-xs text-red-500 mt-1 max-w-sm">
                  Meskipun URL berhasil di-sign, S3 menolak menampilkannya.
                  Kemungkinan: Path/Filename salah, atau file tidak ada di
                  bucket 'fasih1-dev'.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="!isLoading && !errorMessage"
          class="py-12 flex flex-col items-center justify-center text-center text-gray-500 opacity-60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-16 h-16 mb-4 text-gray-300"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008H12V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <p class="text-sm">Masukkan detail file di atas untuk memulai.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";

// --- State ---
const inputForm = reactive({
  surveyPeriod: "",
  filename: "",
});

const isLoading = ref(false);
const errorMessage = ref(null);
const generatedResult = ref(null);
const imageStatus = ref("idle"); // 'idle' | 'loading' | 'loaded' | 'error'

// --- Computed ---
const isFormValid = computed(() => {
  return (
    inputForm.surveyPeriod.trim().length > 0 &&
    inputForm.filename.trim().length > 0
  );
});

// --- Actions ---
async function generateSignedUrl() {
  if (!isFormValid.value) return;

  // Reset previous states
  isLoading.value = true;
  errorMessage.value = null;
  generatedResult.value = null;
  imageStatus.value = "loading"; // Set image loading status

  // 1. Construct Key yang Benar (Folder + Filename)
  // Penting: Jangan di-encode dulu di sini. Biarkan nama asli.
  const combinedKey = `${inputForm.surveyPeriod.trim()}/${inputForm.filename.trim()}`;

  // console.log("🚀 DEV TOOL: Requesting sign for key:", combinedKey);

  try {
    // 2. Panggil API Signer yang sudah ada
    const data = await $fetch("/api/sign-fasih-url", {
      method: "POST",
      body: { key: combinedKey },
    });

    if (data && data.url) {
      // console.log("✅ DEV TOOL: Signed URL received");
      generatedResult.value = data;
      // imageStatus akan berubah jadi 'loaded' atau 'error' via event handler <img>
    } else {
      throw new Error("Respon API tidak valid (tidak ada URL).");
    }
  } catch (err) {
    // console.error("❌ DEV TOOL Error:", err);
    errorMessage.value =
      err.message || "Terjadi kesalahan saat menghubungi server.";
    imageStatus.value = "idle";
  } finally {
    isLoading.value = false;
  }
}

function handleImageError() {
  if (generatedResult.value) {
    // console.error(
    //   "❌ DEV TOOL: Image failed to load from S3 (403/404) even with signed URL.",
    // );
    imageStatus.value = "error";
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
