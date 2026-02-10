<template>
  <div
    class="bg-gray-50 p-4 rounded-xl border border-gray-200 h-full flex flex-col"
  >
    <div
      v-if="!isFilterComplete"
      class="flex flex-col items-center justify-center py-12 text-center h-full"
    >
      <div class="bg-amber-100 p-4 rounded-full mb-4">
        <UIcon name="i-heroicons-funnel" class="w-10 h-10 text-amber-600" />
      </div>
      <p class="text-gray-800 font-bold text-base mb-1">
        Pilih Wilayah Terlebih Dahulu
      </p>
      <p class="text-gray-500 text-sm max-w-[250px]">
        Silakan lengkapi filter wilayah sampai level
        <span class="font-bold text-gray-700">Desa/Kelurahan</span>.
      </p>
    </div>

    <div
      v-else-if="!selectedLocation"
      class="flex flex-col items-center justify-center py-12 text-center h-full"
    >
      <div class="bg-blue-50 p-4 rounded-full mb-4 animate-pulse">
        <UIcon
          name="i-heroicons-cursor-arrow-rays"
          class="w-10 h-10 text-blue-500"
        />
      </div>
      <p class="text-gray-800 font-bold text-base mb-1">
        Siap Menampilkan Detail
      </p>
      <p class="text-gray-500 text-sm max-w-[250px]">
        Klik salah satu
        <span class="font-bold text-gray-700">Marker / Titik</span>
        di peta untuk melihat informasi detailnya.
      </p>
    </div>

    <div
      v-else
      class="space-y-4 overflow-y-auto custom-scrollbar p-4 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div class="flex items-start gap-3">
          <div
            :class="[
              'w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center shadow-inner text-white',
              getIconBgColor(selectedLocation.type),
            ]"
          >
            <component :is="getIconComponent(selectedLocation.type)" />
          </div>
          <div class="flex-1 min-w-0">
            <h4
              class="font-bold text-gray-900 text-base truncate leading-tight"
            >
              {{ selectedLocation.name }}
            </h4>

            <p class="text-xs text-gray-500 mt-1 font-medium">
              {{
                selectedLocation.type === "keluarga"
                  ? "Kepala Keluarga"
                  : getInfrastructureCategory(selectedLocation.type)
              }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ selectedLocation.village }}
            </p>

            <div
              class="flex items-center gap-1 mt-2.5 text-[10px] text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded w-fit"
            >
              <UIcon name="i-heroicons-map-pin" class="w-3 h-3" />
              <span>
                {{ selectedLocation.lat.toFixed(6) }},
                {{ selectedLocation.lng.toFixed(6) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="hasPhotos"
        class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-3"
      >
        <p
          class="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1"
        >
          Dokumentasi Lapangan
        </p>

        <div
          v-if="isLoadingPhotos"
          class="flex flex-col justify-center items-center py-6 gap-2"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-6 h-6 animate-spin text-gray-400"
          />
          <span class="text-xs text-gray-400">Memuat foto...</span>
        </div>

        <div v-else>
          <div v-if="selectedLocation.type === 'keluarga'">
            <div v-if="signedUrls.sebelum" class="mb-3">
              <p
                class="text-[10px] font-semibold text-gray-600 mb-1.5 flex items-center gap-1"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Pra
                Bencana
              </p>
              <div
                class="relative group overflow-hidden rounded-lg bg-gray-100 cursor-pointer h-24 border border-gray-100"
                @click="openImageModal(signedUrls.sebelum, 'Pra Bencana')"
              >
                <img
                  :src="signedUrls.sebelum"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  @error="handleImageError"
                />
              </div>
              <p class="text-[10px] text-gray-400 mt-2 font-medium">
                Sumber : Registrasi Sosial Ekonomi Nasional, 2022
              </p>
            </div>

            <div v-if="signedUrls.pasca && signedUrls.pasca.length > 0">
              <p
                class="text-[10px] font-semibold text-gray-600 mb-1.5 flex items-center gap-1"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> Pasca
                Bencana
              </p>
              <div class="grid grid-cols-3 gap-2">
                <div
                  v-for="(url, idx) in signedUrls.pasca"
                  :key="idx"
                  class="relative group overflow-hidden rounded-lg bg-gray-100 cursor-pointer aspect-square border border-gray-100"
                  @click="
                    openImageModal(
                      url,
                      `Pasca Bencana ${idx + 1}`,
                      signedUrls.pasca,
                    )
                  "
                >
                  <img
                    :src="url"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    @error="handleImageError"
                  />
                </div>
              </div>
            </div>
            <p class="text-[10px] text-gray-400 mt-2 font-medium">
              Sumber : Pendataan Lapangan, 14 Jan-3 Feb 2026
            </p>
          </div>

          <div v-else-if="signedUrls.utama">
            <div
              class="relative group overflow-hidden rounded-lg bg-gray-100 cursor-pointer h-32 border border-gray-100"
              @click="openImageModal(signedUrls.utama, selectedLocation.name)"
            >
              <img
                :src="signedUrls.utama"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                @error="handleImageError"
              />
              <div
                class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-magnifying-glass-plus"
                  class="w-5 h-5 text-white drop-shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h5
          class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-4 h-4 text-gray-400"
          />
          Kategori Kerusakan
        </h5>

        <div class="flex items-center">
          <span
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 shadow-sm',
              getDamageInfo(selectedLocation.jenis_kerusakan).style,
            ]"
          >
            <span class="w-2 h-2 rounded-full bg-current opacity-75"></span>
            {{ getDamageInfo(selectedLocation.jenis_kerusakan).label }}
          </span>
        </div>

        <p class="text-[10px] text-gray-400 mt-2 font-medium">
          Sumber : Satgas Bencana
        </p>
      </div>

      <div
        v-if="selectedLocation.type === 'keluarga'"
        class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
      >
        <h5
          class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"
        >
          <UIcon name="i-heroicons-home-modern" class="w-4 h-4 text-gray-400" />
          Detail Kondisi
        </h5>

        <div class="space-y-3">
          <div
            class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-500 mt-0.5"
            >
              <UIcon name="i-heroicons-squares-2x2" class="w-3.5 h-3.5" />
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-gray-400">
                Lantai
              </p>
              <p
                :class="[
                  'text-xs font-medium',
                  getConditionColor(selectedLocation.conditions?.floor),
                ]"
              >
                {{ selectedLocation.conditions?.floor || "-" }}
              </p>
            </div>
          </div>
          <div
            class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-500 mt-0.5"
            >
              <UIcon name="i-heroicons-rectangle-group" class="w-3.5 h-3.5" />
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-gray-400">
                Dinding
              </p>
              <p
                :class="[
                  'text-xs font-medium',
                  getConditionColor(selectedLocation.conditions?.wall),
                ]"
              >
                {{ selectedLocation.conditions?.wall || "-" }}
              </p>
            </div>
          </div>
          <div
            class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-500 mt-0.5"
            >
              <UIcon name="i-heroicons-chevron-double-up" class="w-3.5 h-3.5" />
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-gray-400">Atap</p>
              <p
                :class="[
                  'text-xs font-medium',
                  getConditionColor(selectedLocation.conditions?.roof),
                ]"
              >
                {{ selectedLocation.conditions?.roof || "-" }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UModal
      v-model:open="showImageModal"
      fullscreen
      :ui="{
        wrapper: 'z-[2000]',
        base: 'h-full flex items-center justify-center bg-transparent shadow-none',
        overlay: { background: 'bg-black/95 backdrop-blur-sm' },
        width: 'w-full max-w-none',
        padding: 'p-0',
        container: 'flex items-center justify-center min-h-full',
      }"
    >
      <template #content>
        <div
          class="relative w-full h-full flex flex-col items-center justify-center"
          @click="showImageModal = false"
        >
          <button
            type="button"
            @click.stop="showImageModal = false"
            class="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors z-50 cursor-pointer"
          >
            <UIcon name="i-heroicons-x-mark" class="w-8 h-8" />
          </button>

          <button
            v-if="currentGallery.length > 1"
            type="button"
            @click.stop="prevImage"
            class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/80 hover:bg-white/50 text-white transition-all hover:scale-110 focus:outline-none z-50 cursor-pointer"
          >
            <UIcon name="i-heroicons-chevron-left" class="w-8 h-8" />
          </button>

          <div
            class="relative max-w-full max-h-full flex flex-col items-center justify-center p-4"
            @click.stop
          >
            <img
              :src="activeImageUrl"
              class="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl z-20 transition-all duration-300"
              @error="handleImageError"
            />

            <div
              v-if="activeImageLabel"
              class="mt-4 bg-gray-900/60 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-3 z-20 border border-white/10"
            >
              <p class="text-white text-sm font-medium">
                {{ activeImageLabel }}
              </p>
              <span
                v-if="currentGallery.length > 1"
                class="text-xs text-white border-l pl-3"
              >
                {{ currentGalleryIndex + 1 }} / {{ currentGallery.length }}
              </span>
            </div>
          </div>

          <button
            v-if="currentGallery.length > 1"
            type="button"
            @click.stop="nextImage"
            class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/80 hover:bg-black/50 text-white transition-all hover:scale-110 focus:outline-none z-50 cursor-pointer"
          >
            <UIcon name="i-heroicons-chevron-right" class="w-8 h-8" />
          </button>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { h, ref, computed, watch } from "vue";

const props = defineProps({
  selectedLocation: { type: Object, default: null },
  isFilterComplete: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);

defineShortcuts({
  escape: {
    usingInput: true,
    handler: () => {
      if (showImageModal.value) showImageModal.value = false;
    },
  },
  arrowLeft: {
    usingInput: true,
    handler: () => {
      if (showImageModal.value && currentGallery.value.length > 1) prevImage();
    },
  },
  arrowRight: {
    usingInput: true,
    handler: () => {
      if (showImageModal.value && currentGallery.value.length > 1) nextImage();
    },
  },
});

const signedUrls = ref({
  sebelum: null,
  utama: null,
  pasca: [],
});
const isLoadingPhotos = ref(false);

function extractKeyFromUrl(fullUrl) {
  if (!fullUrl) return null;
  const regex = /\/fasih1-dev\/(.+?\.jpg)/i;
  const match = fullUrl.match(regex);
  if (match && match[1]) return decodeURIComponent(match[1]);
  return null;
}

async function getFreshUrl(expiredUrl) {
  const objectKey = extractKeyFromUrl(expiredUrl);
  if (!objectKey) return expiredUrl;
  try {
    const data = await $fetch("/api/sign-fasih-url", {
      method: "POST",
      body: { key: objectKey },
    });
    return data.url;
  } catch (err) {
    return null;
  }
}

function buildPhotoUrl(rawPath) {
  if (!rawPath) return null;
  const cleanPath = String(rawPath).trim();
  if (cleanPath.startsWith("http")) return cleanPath;
  const encodedPath = encodeURIComponent(cleanPath);
  return `/api/s3-image?path=${encodedPath}`;
}

watch(
  () => props.selectedLocation,
  async (newVal) => {
    signedUrls.value = { sebelum: null, utama: null, pasca: [] };
    if (!newVal) return;
    isLoadingPhotos.value = true;
    try {
      if (newVal.type === "keluarga") {
        if (newVal.url_photo_sebelum) {
          if (newVal.url_photo_sebelum.includes("fasih1-dev")) {
            signedUrls.value.sebelum = await getFreshUrl(
              newVal.url_photo_sebelum,
            );
          } else {
            signedUrls.value.sebelum = buildPhotoUrl(newVal.url_photo_sebelum);
          }
        }
        const pascaRaw = [
          newVal.url_photo1,
          newVal.url_photo2,
          newVal.url_photo3,
        ].filter(Boolean);
        if (pascaRaw.length > 0) {
          const promises = pascaRaw.map((url) => getFreshUrl(url));
          const results = await Promise.all(promises);
          signedUrls.value.pasca = results.filter((u) => u !== null);
        }
      } else {
        if (newVal.url_photo) {
          if (newVal.url_photo.includes("fasih1-dev")) {
            signedUrls.value.utama = await getFreshUrl(newVal.url_photo);
          } else {
            signedUrls.value.utama = buildPhotoUrl(newVal.url_photo);
          }
        }
      }
    } catch (e) {
      console.error("Error processing photos:", e);
    } finally {
      isLoadingPhotos.value = false;
    }
  },
  { immediate: true },
);

const showImageModal = ref(false);
const activeImageUrl = ref("");
const activeImageLabel = ref("");
const currentGallery = ref([]);
const currentGalleryIndex = ref(0);

const hasPhotos = computed(() => {
  const l = props.selectedLocation;
  if (!l) return false;
  if (l.type === "keluarga") {
    return (
      !!signedUrls.value.sebelum ||
      (signedUrls.value.pasca && signedUrls.value.pasca.length > 0)
    );
  }
  return !!signedUrls.value.utama;
});

const openImageModal = (url, label, gallery = []) => {
  if (!url) return;
  activeImageUrl.value = url;
  activeImageLabel.value = label || "";

  if (Array.isArray(gallery) && gallery.length > 0) {
    currentGallery.value = gallery;
    const idx = gallery.indexOf(url);
    currentGalleryIndex.value = idx !== -1 ? idx : 0;
  } else {
    currentGallery.value = [url];
    currentGalleryIndex.value = 0;
  }
  showImageModal.value = true;
};

const nextImage = () => {
  if (currentGallery.value.length <= 1) return;
  currentGalleryIndex.value =
    (currentGalleryIndex.value + 1) % currentGallery.value.length;
  updateActiveImage();
};

const prevImage = () => {
  if (currentGallery.value.length <= 1) return;
  currentGalleryIndex.value =
    (currentGalleryIndex.value - 1 + currentGallery.value.length) %
    currentGallery.value.length;
  updateActiveImage();
};

const updateActiveImage = () => {
  activeImageUrl.value = currentGallery.value[currentGalleryIndex.value];
};

const handleImageError = (e) => {
  e.target.style.display = "none";
};

const getIconBgColor = (type) => {
  const colors = {
    keluarga: "bg-teal-500",
    pendidikan: "bg-blue-500",
    kesehatan: "bg-red-500",
    ekonomi: "bg-green-500",
    sosial: "bg-purple-500",
  };
  return colors[type] || "bg-teal-500";
};

const getDamageInfo = (val) => {
  const v = Number(val);
  switch (v) {
    case 1:
      return {
        label: "Rusak Ringan",
        style: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case 2:
      return {
        label: "Rusak Sedang",
        style: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case 3:
      return {
        label: "Rusak Berat",
        style: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case 4:
      return {
        label: "Hanyut",
        style: "bg-purple-50 text-purple-700 border-purple-200",
      };
    case 5:
      return {
        label: "Tidak Diketahui",
        style: "bg-slate-100 text-slate-600 border-slate-200",
      };
    default:
      return {
        label: "Data Kosong / -",
        style: "bg-gray-50 text-gray-400 border-gray-100 border-dashed",
      };
  }
};

const getConditionColor = (condition) => {
  if (!condition) return "text-gray-500";
  const text = String(condition).toLowerCase();
  if (text.includes("baik") || text.includes("layak"))
    return "text-emerald-600";
  if (text.includes("sebagian kecil") || text.includes("plester"))
    return "text-amber-600";
  if (
    text.includes("sebagian besar") ||
    text.includes("seluruh") ||
    text.includes("runtuh") ||
    text.includes("rusak") ||
    text.includes("tidak ada")
  ) {
    return "text-rose-600";
  }
  return "text-gray-700";
};

const getInfrastructureCategory = (type) => {
  const map = {
    pendidikan: "Infrastruktur Pendidikan",
    kesehatan: "Infrastruktur Kesehatan",
    ekonomi: "Infrastruktur Ekonomi",
    sosial: "Infrastruktur Sosial",
  };
  return map[type] || "Permukiman";
};

const getIconComponent = (type) => {
  const iconClass = "w-6 h-6 text-white";
  const iconMap = {
    keluarga: () =>
      h("svg", {
        class: iconClass,
        fill: "currentColor",
        viewBox: "0 0 20 20",
        innerHTML:
          '<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />',
      }),
    pendidikan: () =>
      h("svg", {
        class: iconClass,
        fill: "currentColor",
        viewBox: "0 0 20 20",
        innerHTML:
          '<path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />',
      }),
    kesehatan: () =>
      h("svg", {
        class: iconClass,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        viewBox: "0 0 24 24",
        innerHTML:
          '<path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />',
      }),
    ekonomi: () =>
      h("svg", {
        class: iconClass,
        fill: "currentColor",
        viewBox: "0 0 20 20",
        innerHTML:
          '<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />',
      }),
    sosial: () =>
      h("svg", {
        class: iconClass,
        fill: "currentColor",
        viewBox: "0 0 20 20",
        innerHTML:
          '<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />',
      }),
  };
  return iconMap[type] || iconMap.keluarga;
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
