<template>
  <div class="h-screen w-full flex flex-col relative">
    <div class="bg-white border-b p-4 shadow-sm z-10">
      <h1 class="text-xl font-bold text-gray-800">Peta Wilayah Sumatera</h1>
      <p class="text-sm text-gray-500">Visualisasi Batas Desa & Centroid</p>
    </div>

    <div id="map" class="flex-1 z-0"></div>

    <div
      v-if="loading"
      class="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-[9999]"
    >
      <div
        class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"
      ></div>
      <span class="text-gray-600 font-medium animate-pulse">{{
        loadingStatus
      }}</span>
    </div>

    <div
      v-if="selectedInfo"
      class="absolute top-20 right-4 bg-white p-4 rounded-lg shadow-xl max-w-xs z-[1000] border border-gray-100"
    >
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-bold text-gray-800">{{ selectedInfo.name }}</h3>
        <button
          @click="selectedInfo = null"
          class="text-gray-400 hover:text-red-500 font-bold"
        >
          ✕
        </button>
      </div>
      <div class="space-y-1 text-sm text-gray-600">
        <p><strong>ID Desa:</strong> {{ selectedInfo.id }}</p>
        <p><strong>Kecamatan:</strong> {{ selectedInfo.kecamatan }}</p>
        <p><strong>Kab/Kota:</strong> {{ selectedInfo.kabupaten }}</p>
        <p><strong>Provinsi:</strong> {{ selectedInfo.provinsi }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, shallowRef, onBeforeUnmount, ref } from "vue";

// State
const loading = ref(true);
const loadingStatus = ref("Menyiapkan peta...");
const selectedInfo = ref(null);

const map = shallowRef(null);
const geoJsonLayer = shallowRef(null);
const markerLayer = shallowRef(null); // Ref baru untuk layer marker

let L = null;

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const initMap = async () => {
  try {
    const leafletModule = await import("leaflet");
    L = leafletModule.default || leafletModule;
    await import("leaflet/dist/leaflet.css");

    // 1. Inisialisasi Map
    map.value = L.map("map", {
      preferCanvas: true, // Wajib agar titik-titik dirender di Canvas (Ringan)
      zoomControl: true,
      zoomAnimation: true,
      wheelDebounceTime: 150,
    }).setView([-0.9, 100.5], 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map.value);

    // 2. Load Data
    loadingStatus.value = "Memuat data dari assets...";

    // Sesuaikan path ini dengan struktur folder Anda
    const [centroidModule, boundaryModule] = await Promise.all([
      import("~/assets/data/map/data_centroid_sumatera_20251.json"),
      import("~/assets/data/map/batas_wilayah_sumatera_20251.json"),
    ]);

    const centroidData = centroidModule.default || centroidModule;
    const geojsonData = boundaryModule.default || boundaryModule;

    // 3. Indexing Data
    const villageDict = {};
    for (let i = 0; i < centroidData.length; i++) {
      villageDict[centroidData[i].id] = centroidData[i];
    }

    loadingStatus.value = "Merender peta...";

    // 4. Render GeoJSON (Batas Wilayah)
    geoJsonLayer.value = L.geoJSON(geojsonData, {
      smoothFactor: 1.5,
      style: () => ({
        fillColor: getRandomColor(),
        weight: 1,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.4, // Sedikit lebih transparan agar titik terlihat
      }),
      onEachFeature: (feature, layer) => {
        const detailDesa = villageDict[feature.properties.iddesa];

        layer.on({
          mouseover: (e) => {
            e.target.setStyle({ weight: 2, color: "#333", fillOpacity: 0.7 });
          },
          mouseout: (e) => {
            geoJsonLayer.value.resetStyle(e.target);
          },
          click: (e) => {
            map.value.fitBounds(e.target.getBounds());
            if (detailDesa) selectedInfo.value = detailDesa;
          },
        });

        if (detailDesa) {
          layer.bindTooltip(detailDesa.name, {
            permanent: false,
            direction: "center",
            className: "bg-white px-2 py-1 border rounded text-xs",
          });
        }
      },
    }).addTo(map.value);

    // 5. Render Centroid (Titik Merah Kecil)
    // Kita gunakan LayerGroup agar bisa diatur (misal: hide saat zoom out jauh)
    markerLayer.value = L.layerGroup();

    // Loop centroidData
    for (let i = 0; i < centroidData.length; i++) {
      const village = centroidData[i];

      // Pastikan ada koordinat valid
      if (village.latitude && village.longitude) {
        // GUNAKAN circleMarker (Canvas) BUKAN Marker (DOM Image)
        const dot = L.circleMarker([village.latitude, village.longitude], {
          radius: 3, // Ukuran titik kecil
          fillColor: "#ff0000", // Warna merah menyala
          color: "#ffffff", // Outline putih
          weight: 1,
          opacity: 1,
          fillOpacity: 0.9,
          interactive: true, // Bisa diklik
        });

        dot.bindTooltip(village.name, {
          direction: "top",
          offset: [0, -5],
          className:
            "text-xs font-bold text-red-600 bg-white/90 border-0 shadow-sm",
        });

        dot.on("click", () => {
          selectedInfo.value = village;
          // Fly to location
          map.value.flyTo([village.latitude, village.longitude], 14);
        });

        dot.addTo(markerLayer.value);
      }
    }

    markerLayer.value.addTo(map.value); // Tampilkan layer marker

    map.value.fitBounds(geoJsonLayer.value.getBounds());
  } catch (error) {
    console.error("Error Map:", error);
    alert("Gagal memuat peta: " + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (map.value) map.value.remove();
});
</script>

<style>
#map {
  background: #f8f9fa;
}
</style>
