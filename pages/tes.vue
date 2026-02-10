<template>
  <div class="load-tester">
    <div class="container">
      <div class="header">
        <h1>🚀 API Load Tester</h1>
        <p>
          Test API dengan payload besar untuk detect SQL Server 2100 parameter
          limit
        </p>
      </div>

      <div class="content">
        <div class="warning">
          ⚠️ <strong>Warning:</strong> Test ini akan generate request dengan
          jumlah parameter yang besar. Gunakan di development environment!
        </div>

        <!-- API Configuration -->
        <div class="config-section">
          <div class="config-title">⚙️ API Configuration</div>
          <div class="config-grid">
            <div class="input-group">
              <label>Base URL</label>
              <input v-model="config.baseUrl" type="text" />
            </div>
            <div class="input-group">
              <label>API Endpoint</label>
              <select v-model="config.endpoint">
                <option value="/api/data">/api/data</option>
                <option value="/api/data-per-wilayah">
                  /api/data-per-wilayah
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Load Test Parameters -->
        <div class="config-section">
          <div class="config-title">📊 Load Test Parameters</div>
          <div class="config-grid">
            <div class="input-group">
              <label>Jumlah Region IDs</label>
              <input
                v-model.number="config.numRegions"
                type="number"
                min="1"
                max="5000"
              />
              <small>Recommended: 50, 100, 500, 1000, 2000</small>
            </div>
            <div class="input-group">
              <label>Jumlah Indicator IDs</label>
              <input
                v-model.number="config.numIndicators"
                type="number"
                min="1"
                max="50"
              />
              <small>Recommended: 5, 10, 20</small>
            </div>
            <div class="input-group">
              <label>Region Type</label>
              <select v-model="config.regionType">
                <option value="provinsi">Provinsi (2 digit)</option>
                <option value="kabupaten">Kabupaten (4 digit)</option>
                <option value="kecamatan">Kecamatan (7 digit)</option>
                <option value="desa">Desa (10 digit)</option>
              </select>
            </div>
            <div class="input-group">
              <label>Tahun (Optional)</label>
              <input
                v-model.number="config.tahun"
                type="number"
                min="2000"
                max="2030"
              />
            </div>
          </div>
          <button
            class="btn btn-primary"
            :disabled="isLoading"
            @click="runTest"
          >
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>▶️</span>
            {{ isLoading ? "Running test..." : "Run Load Test" }}
          </button>
        </div>

        <!-- Results -->
        <div v-if="results.length > 0" class="results">
          <div
            v-for="(result, index) in results"
            :key="index"
            :class="['result-card', result.success ? 'success' : 'error']"
          >
            <div class="result-header">
              <div class="result-title">
                {{ result.success ? "✅ SUCCESS" : "❌ ERROR" }}
              </div>
              <div class="result-time">{{ result.timestamp }}</div>
            </div>

            <div class="stats">
              <div class="stat-card">
                <div class="stat-value">{{ result.stats.regionCount }}</div>
                <div class="stat-label">Region IDs</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ result.stats.indicatorCount }}</div>
                <div class="stat-label">Indicator IDs</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ result.stats.duration }}ms</div>
                <div class="stat-label">Duration</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ result.stats.resultCount }}</div>
                <div class="stat-label">Results</div>
              </div>
            </div>

            <div class="result-body">
              <strong>Request Payload:</strong>
              <pre>{{ JSON.stringify(result.payload, null, 2) }}</pre>

              <hr />

              <strong>{{ result.success ? "Response:" : "Error:" }}</strong>
              <pre>{{
                result.success
                  ? JSON.stringify(result.response, null, 2)
                  : result.error
              }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

// Configuration
const config = reactive({
  baseUrl: "http://localhost:3000",
  endpoint: "/api/data",
  numRegions: 500,
  numIndicators: 10,
  regionType: "desa",
  tahun: 2024,
});

// State
const isLoading = ref(false);
const results = ref<any[]>([]);

// Helper: Generate Region IDs
function generateRegionIds(count: number, type: string): string[] {
  const ids: string[] = [];
  const formats: Record<string, number> = {
    provinsi: 2,
    kabupaten: 4,
    kecamatan: 7,
    desa: 10,
  };
  const length = formats[type] || 10;

  for (let i = 0; i < count; i++) {
    const id = String(
      Math.floor(Math.random() * Math.pow(10, length)),
    ).padStart(length, "0");
    ids.push(id);
  }
  return ids;
}

// Helper: Generate Indicator IDs
function generateIndicatorIds(count: number): string[] {
  const ids: string[] = [];
  const baseIndicators = [
    "desa_terdampak",
    "populasi",
    "luas_wilayah",
    "kepadatan",
    "rtm",
    "jumlah_kk",
  ];

  for (let i = 0; i < count; i++) {
    if (i < baseIndicators.length) {
      ids.push(baseIndicators[i]!);
    } else {
      ids.push(`indicator_${i + 1}`);
    }
  }
  return ids;
}

// Main Test Function
async function runTest() {
  isLoading.value = true;

  // Generate data
  const regionIds = generateRegionIds(config.numRegions, config.regionType);
  const indicatorIds = generateIndicatorIds(config.numIndicators);

  const payload = {
    regionIds,
    indicatorIds,
    tahun: config.tahun,
  };

  const startTime = performance.now();
  let success = false;
  let responseData: any = null;
  let errorMessage: string | null = null;

  try {
    console.log("🚀 Sending request to:", config.endpoint);
    console.log("📦 Payload:", {
      regionCount: regionIds.length,
      indicatorCount: indicatorIds.length,
      tahun: config.tahun,
    });

    // ✅ OPSI 1: Pakai $fetch (recommended untuk Nuxt)
    // const response = await $fetch(config.endpoint, {
    //   method: 'POST',
    //   body: payload
    // })

    // ✅ OPSI 2: Pakai fetch biasa dengan full URL
    const url = config.baseUrl
      ? config.baseUrl + config.endpoint
      : config.endpoint;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);

    console.log("📡 Response status:", response.status, response.statusText);

    if (response.ok) {
      try {
        responseData = await response.json();
        success = true;
        console.log("✅ Success! Results:", responseData?.length || 0);
      } catch (jsonError: any) {
        errorMessage = `JSON Parse Error: ${jsonError.message}`;
        console.error("❌ JSON parsing failed:", jsonError);
      }
    } else {
      try {
        const errorText = await response.text();
        errorMessage = `HTTP ${response.status}: ${errorText || response.statusText}`;
        console.error("❌ HTTP Error:", errorMessage);
      } catch (textError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    }

    addResult(success, payload, responseData, duration, errorMessage);
  } catch (err: any) {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);

    // Detailed error messages
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      errorMessage = `Network Error: Cannot reach ${config.baseUrl || config.endpoint}. Check server status.`;
    } else if (err.name === "AbortError") {
      errorMessage = "Request Timeout: Server took too long to respond";
    } else {
      errorMessage = `${err.name}: ${err.message}`;
    }

    console.error("❌ Request failed:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });

    addResult(false, payload, null, duration, errorMessage);
  } finally {
    isLoading.value = false;
  }
}

// Add result to list
function addResult(
  success: boolean,
  payload: any,
  response: any,
  duration: string,
  error: string | null,
) {
  const result = {
    success,
    payload,
    response,
    error,
    timestamp: new Date().toLocaleTimeString(),
    stats: {
      regionCount: payload.regionIds.length,
      indicatorCount: payload.indicatorIds.length,
      duration,
      resultCount: success ? response?.length || 0 : 0,
    },
  };

  results.value.unshift(result);
}
</script>

<style scoped>
.load-tester {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.header h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.header p {
  opacity: 0.9;
  font-size: 14px;
}

.content {
  padding: 30px;
}

.warning {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #92400e;
}

.config-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
}

.config-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.input-group input,
.input-group select {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group small {
  color: #666;
  font-size: 12px;
}

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100%;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.results {
  margin-top: 30px;
}

.result-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  border-left: 4px solid #667eea;
}

.result-card.success {
  border-left-color: #10b981;
  background: #ecfdf5;
}

.result-card.error {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-title {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.result-time {
  font-size: 14px;
  color: #666;
  font-family: "Courier New", monospace;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.stat-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.result-body {
  background: white;
  padding: 15px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  font-family: "Courier New", monospace;
  font-size: 13px;
}

.result-body hr {
  margin: 15px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
}

pre {
  margin: 10px 0 0 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
