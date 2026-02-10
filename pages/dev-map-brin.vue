<template>
  <div class="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">
    <div
      class="w-96 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10"
    >
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <h1 class="font-bold text-lg text-gray-800">BRIN Service Lab</h1>
        <p class="text-xs text-gray-500 mt-1">
          Tools test koneksi WMS, WFS & Assets
        </p>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div class="border border-purple-100 rounded-xl p-3 bg-purple-50/30">
          <div class="flex items-center gap-2 mb-3">
            <UBadge color="purple" variant="solid">Local Asset</UBadge>
            <span class="text-xs font-bold text-gray-700"
              >File dari Folder Assets</span
            >
          </div>

          <div class="space-y-3">
            <p class="text-[10px] text-gray-500">
              Memuat file <code>bangunan_terdampak_joined.json</code> langsung
              dari folder assets.
            </p>
            <UButton
              block
              size="sm"
              color="purple"
              :loading="loadingLocal"
              icon="i-heroicons-document-text"
              @click="addLocalAssetLayer"
            >
              Tampilkan Data Bangunan
            </UButton>
          </div>
        </div>

        <div class="border border-blue-100 rounded-xl p-3 bg-blue-50/30">
          <div class="flex items-center gap-2 mb-3">
            <UBadge color="blue" variant="solid">WMS</UBadge>
            <span class="text-xs font-bold text-gray-700">Web Map Service</span>
          </div>

          <div class="space-y-3">
            <UFormGroup label="Base URL WMS">
              <UInput v-model="wmsUrl" size="xs" />
            </UFormGroup>

            <UButton
              block
              size="xs"
              color="blue"
              variant="soft"
              :loading="loadingWms"
              @click="fetchWmsCapabilities"
            >
              1. Get Capabilities (List Layers)
            </UButton>

            <UFormGroup label="Pilih Layer">
              <USelect
                v-model="selectedWmsLayer"
                :items="wmsLayerList"
                placeholder="Pilih Layer..."
                size="xs"
                :disabled="wmsLayerList.length === 0"
              />
            </UFormGroup>

            <UButton
              block
              size="sm"
              color="blue"
              :disabled="!selectedWmsLayer"
              @click="addWmsLayerToMap"
            >
              2. Tampilkan di Peta
            </UButton>
          </div>
        </div>

        <div class="border border-emerald-100 rounded-xl p-3 bg-emerald-50/30">
          <div class="flex items-center gap-2 mb-3">
            <UBadge color="emerald" variant="solid">WFS</UBadge>
            <span class="text-xs font-bold text-gray-700"
              >Web Feature Service</span
            >
          </div>

          <div class="space-y-3">
            <UFormGroup label="Base URL WFS">
              <UInput v-model="wfsUrl" size="xs" />
            </UFormGroup>

            <UButton
              block
              size="xs"
              color="emerald"
              variant="soft"
              :loading="loadingWfs"
              @click="fetchWfsCapabilities"
            >
              1. Get Capabilities (List Features)
            </UButton>

            <UFormGroup label="Pilih Feature Type">
              <USelect
                v-model="selectedWfsLayer"
                :items="wfsLayerList"
                placeholder="Pilih Feature..."
                size="xs"
                :disabled="wfsLayerList.length === 0"
              />
            </UFormGroup>

            <div class="flex gap-2">
              <UInput
                v-model="wfsMaxFeatures"
                type="number"
                size="xs"
                placeholder="Max"
                class="w-20"
              />
              <UButton
                block
                class="flex-1"
                size="sm"
                color="emerald"
                :disabled="!selectedWfsLayer"
                @click="addWfsLayerToMap"
              >
                2. Fetch & Render
              </UButton>
            </div>
          </div>
        </div>

        <div
          class="bg-gray-900 text-green-400 p-3 rounded-lg text-[10px] font-mono h-40 overflow-y-auto"
        >
          <div v-if="logs.length === 0" class="text-gray-600 italic">
            Ready...
          </div>
          <div
            v-for="(log, i) in logs"
            :key="i"
            class="mb-1 border-b border-gray-800 pb-1"
          >
            <span class="text-gray-500">[{{ log.time }}]</span> {{ log.msg }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 relative bg-slate-200">
      <div id="map-dev" class="w-full h-full z-0"></div>

      <div
        class="absolute bottom-5 right-5 bg-white p-3 rounded-lg shadow-lg z-[1000] max-w-xs text-xs"
      >
        <h4 class="font-bold mb-2">Layer Aktif:</h4>
        <ul v-if="activeLayers.length > 0" class="space-y-1">
          <li
            v-for="l in activeLayers"
            :key="l.name"
            class="flex justify-between items-center gap-2 border-b border-gray-100 pb-1"
          >
            <div class="flex flex-col">
              <span class="font-semibold">{{ l.name }}</span>
              <span class="text-[10px] text-gray-500">{{ l.type }}</span>
            </div>
            <UButton
              icon="i-heroicons-trash"
              size="2xs"
              color="red"
              variant="ghost"
              @click="removeLayer(l)"
            />
          </li>
        </ul>
        <span v-else class="text-gray-400 italic">Belum ada layer</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// --- STATE UTAMA ---
const map = ref(null);
const activeLayers = ref([]);
const logs = ref([]);

// --- STATE LOCAL ASSET ---
const loadingLocal = ref(false);

// --- STATE WMS ---
const wmsUrl = ref("https://spectra.brin.go.id/services/wms");
const loadingWms = ref(false);
const wmsLayerList = ref([]);
const selectedWmsLayer = ref(null);

// --- STATE WFS ---
const wfsUrl = ref("https://spectra.brin.go.id/services/wfs");
const loadingWfs = ref(false);
const wfsLayerList = ref([]);
const selectedWfsLayer = ref(null);
const wfsMaxFeatures = ref(50);

// --- UTILS ---
const addLog = (msg) => {
  const time = new Date().toLocaleTimeString();
  logs.value.unshift({ time, msg });
};

// --- INIT MAP ---
onMounted(async () => {
  if (!process.client) return;
  const L = await import("leaflet");
  await import("leaflet/dist/leaflet.css");

  // Default view Indonesia
  map.value = L.map("map-dev").setView([-2.5, 118.0], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map.value);

  addLog("Map initialized.");
});

// --- MODIFIKASI: FUNCTION LOAD LOCAL ASSET ---
const addLocalAssetLayer = async () => {
  if (!map.value) return;
  const L = await import("leaflet");
  loadingLocal.value = true;
  addLog("Loading Local Asset: bangunan_terdampak_joined.json...");

  try {
    // IMPORT DYNAMIC DARI FOLDER ASSETS
    // Pastikan path ini sesuai dengan struktur folder kamu
    // Misalnya: ~/assets/data/bangunan_terdampak_joined.json
    const module = await import("~/assets/data/map/data_jalan_PU.json");
    const geoJsonData = module.default || module;

    if (!geoJsonData || !geoJsonData.features) {
      throw new Error("Format GeoJSON tidak valid atau kosong.");
    }

    // Buat Layer GeoJSON
    const localLayer = L.geoJSON(geoJsonData, {
      style: {
        color: "#9333ea", // Warna ungu (purple-600)
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5,
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          let popupContent =
            "<div style='font-size:11px'><strong>Detail Bangunan</strong><br/>";
          for (const [key, val] of Object.entries(feature.properties)) {
            popupContent += `<b>${key}:</b> ${val}<br/>`;
          }
          popupContent += "</div>";
          layer.bindPopup(popupContent);
        }
      },
    });

    localLayer.addTo(map.value);

    // Zoom ke area data tersebut
    const bounds = localLayer.getBounds();
    if (bounds.isValid()) {
      map.value.fitBounds(bounds);
    }

    activeLayers.value.push({
      name: "Bangunan Terdampak (Local)",
      type: "JSON Asset",
      layerInstance: localLayer,
    });

    addLog(
      `Success! Loaded ${geoJsonData.features.length} features form assets.`,
    );
  } catch (e) {
    console.error(e);
    addLog(`Error Local Asset: ${e.message}`);
    // Hint: Jika error "Failed to fetch dynamically imported module",
    // cek apakah file benar-benar ada di folder assets dan namanya benar.
  } finally {
    loadingLocal.value = false;
  }
};

// --- WMS LOGIC ---
const fetchWmsCapabilities = async () => {
  loadingWms.value = true;
  wmsLayerList.value = [];
  addLog(`Fetching WMS Capabilities...`);

  try {
    const response = await fetch(
      `${wmsUrl.value}?service=WMS&version=1.1.0&request=GetCapabilities`,
    );
    if (!response.ok) throw new Error("Gagal fetch capabilities");

    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");

    const layers = xmlDoc.getElementsByTagName("Layer");
    const result = [];

    for (let i = 0; i < layers.length; i++) {
      const nameNode = layers[i].getElementsByTagName("Name")[0];
      const titleNode = layers[i].getElementsByTagName("Title")[0];

      if (
        nameNode &&
        nameNode.textContent &&
        layers[i].parentNode.nodeName === "Layer"
      ) {
        result.push({
          label: titleNode ? titleNode.textContent : nameNode.textContent,
          value: nameNode.textContent,
        });
      }
    }

    wmsLayerList.value = result;
    addLog(`Found ${result.length} WMS layers.`);
  } catch (e) {
    addLog(`Error WMS: ${e.message}`);
  } finally {
    loadingWms.value = false;
  }
};

const addWmsLayerToMap = async () => {
  if (!map.value || !selectedWmsLayer.value) return;
  const L = await import("leaflet");

  addLog(`Adding WMS Layer: ${selectedWmsLayer.value}`);

  const wmsLayer = L.tileLayer.wms(wmsUrl.value, {
    layers: selectedWmsLayer.value,
    format: "image/png",
    transparent: true,
    version: "1.1.0",
    attribution: "BRIN Spectra",
  });

  wmsLayer.addTo(map.value);

  activeLayers.value.push({
    name: selectedWmsLayer.value,
    type: "WMS",
    layerInstance: wmsLayer,
  });
};

// --- WFS LOGIC ---
const fetchWfsCapabilities = async () => {
  loadingWfs.value = true;
  wfsLayerList.value = [];
  addLog(`Fetching WFS Capabilities...`);

  try {
    const response = await fetch(
      `${wfsUrl.value}?service=WFS&version=2.0.0&request=GetCapabilities`,
    );
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");

    const featureTypes = xmlDoc.getElementsByTagName("FeatureType");
    const result = [];

    for (let i = 0; i < featureTypes.length; i++) {
      const nameNode = featureTypes[i].getElementsByTagName("Name")[0];
      const titleNode = featureTypes[i].getElementsByTagName("Title")[0];
      if (nameNode) {
        result.push({
          label: titleNode ? titleNode.textContent : nameNode.textContent,
          value: nameNode.textContent,
        });
      }
    }
    wfsLayerList.value = result;
    addLog(`Found ${result.length} WFS Feature Types.`);
  } catch (e) {
    addLog(`Error WFS: ${e.message}`);
  } finally {
    loadingWfs.value = false;
  }
};

const addWfsLayerToMap = async () => {
  if (!map.value || !selectedWfsLayer.value) return;
  const L = await import("leaflet");

  addLog(`Fetching WFS Data: ${selectedWfsLayer.value}...`);

  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeName: selectedWfsLayer.value,
    outputFormat: "application/json",
    srsName: "EPSG:4326",
    count: wfsMaxFeatures.value,
  });

  const url = `${wfsUrl.value}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const geoJsonData = await response.json();

    if (!geoJsonData.features || geoJsonData.features.length === 0) {
      addLog("Warning: GeoJSON kosong.");
      return;
    }

    const vectorLayer = L.geoJSON(geoJsonData, {
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          let popupContent =
            "<div style='max-height: 200px; overflow-y: auto;'><table>";
          for (const [key, val] of Object.entries(feature.properties)) {
            popupContent += `<tr><td style='font-weight:bold; padding-right:5px;'>${key}:</td><td>${val}</td></tr>`;
          }
          popupContent += "</table></div>";
          layer.bindPopup(popupContent);
        }
      },
    });

    vectorLayer.addTo(map.value);
    map.value.fitBounds(vectorLayer.getBounds());

    activeLayers.value.push({
      name: selectedWfsLayer.value,
      type: "WFS",
      layerInstance: vectorLayer,
    });

    addLog(`WFS Layer added: ${geoJsonData.features.length} features.`);
  } catch (e) {
    addLog(`Error Fetch WFS: ${e.message}`);
  }
};

const removeLayer = (layerItem) => {
  if (map.value && layerItem.layerInstance) {
    map.value.removeLayer(layerItem.layerInstance);
    activeLayers.value = activeLayers.value.filter((l) => l !== layerItem);
    addLog(`Removed layer: ${layerItem.name}`);
  }
};
</script>
