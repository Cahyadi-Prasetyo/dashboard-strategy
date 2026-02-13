# Dashboard Monitoring Data Sektoral Kepulauan Riau

## 📌 Deskripsi Projek
Platform **Decision Support System (DSS)** berbasis web yang dirancang untuk memantau indikator pembangunan, analisis dampak bencana, dan pengerahan sumber daya lintas sektor secara real-time di Provinsi Kepulauan Riau.

Sistem ini menampilkan data dari **API BPS** dan sumber internal, mencakup ringkasan indikator strategis, distribusi wilayah (peta spasial), serta progres pendataan keluarga dan infrastruktur.

![Status](https://img.shields.io/badge/Status-Development-orange) ![Framework](https://img.shields.io/badge/Framework-Nuxt_3-green)

---

## 🚀 Fitur Utama

### 1. Monitoring Wilayah Terpadu
Visualisasi data sektoral hingga level desa menggunakan **Peta Interaktif (Leaflet)**. Pengguna dapat melihat sebaran data secara spasial untuk memudahkan identifikasi wilayah prioritas.

### 2. Integrasi Data Otomatis (Single Source of Truth)
Mengambil data langsung dari **API BPS** dan API Internal Pemda. Sistem dirancang untuk meminimalisir input manual dan memastikan data yang ditampilkan selalu sinkron dengan sumber resmi.

### 3. Analisis Dampak
Modul khusus untuk mengukur dampak kejadian (bencana/program) terhadap aspek:
-   **Sosial**: Kependudukan, Kemiskinan.
-   **Ekonomi**: Inflasi, PDRB.
-   **Infrastruktur**: Kerusakan sarana publik.

### 4. Input Data Terbatas
Menyediakan fitur penginputan data yang **minimalis dan terkontrol**, khusus untuk pembaruan data yang belum tersedia lewat API. Fitur ini tidak menggantikan sistem pendataan utama, melainkan sebagai pelengkap operasional.

---

## 🛠 Teknologi

-   **Frontend Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3 + TypeScript)
-   **CSS Framework**: Tailwind CSS / Nuxt UI
-   **Maps/GIS**: Leaflet / Mapbox GL
-   **Charting**: ECharts / Chart.js
-   **State Management**: Pinia
-   **Data Fetching**: $fetch / useFetch (Server-side proxy support)

---

## 🔌 Integrasi API BPS

Dashboard ini terhubung dengan **WebAPI BPS** untuk mengambil indikator strategis.

-   **Endpoint**: `https://webapi.bps.go.id/v1/api/list/`
-   **Metode**: Server-side Proxy (via Nuxt Server Routes) untuk keamanan API Key dan transformasi data.

**Parameter Kunci:**
-   `model`: `indicators`
-   `domain`: Kode Provinsi/Kabupaten (e.g., `21` untuk Kepri)
-   **Struktur Data unique**: Response API BPS menggunakan array campuran (Metadata di index 0, Data di index 1), yang akan dinormalisasi oleh backend dashboard sebelum dikirim ke frontend.

---

## 📂 Struktur Folder (High Level)

```bash
/components     # Komponen UI reusable (Charts, Maps, Cards)
/composables    # Logic bisnis (useBpsApi, useRegion)
/pages          # Halaman aplikasi (Routing otomatis Nuxt)
/server         # API Routes & Proxy (Backend for Frontend)
  /api
    /bps        # Proxy endpoint untuk API BPS
/public         # Aset statis (GeoJSON, Images)
/constants      # Konfigurasi tetap (Region ID default, dll)
```

---

## 📦 Instalasi & Pengembangan

Pastikan Anda telah menginstal **Node.js** (LTS version).

```bash
# 1. Install dependencies
npm install

# 2. Setup Environment Variables
cp .env.example .env
# Isi BPS_API_KEY di dalam .env

# 3. Jalankan Development Server
npm run dev
```

Akses aplikasi di `http://localhost:3000`.

---

## 📝 Catatan Penting
-   **Default Region**: Dashboard dikonfigurasi secara default untuk wilayah **Kepulauan Riau (21)**. Konfigurasi ini diatur terpusat di `constants/region-config.ts`.
-   **Branching**: Gunakan branch `develop` untuk pengembangan aktif dan `feature/*` untuk fitur baru. Branch `main` digunakan untuk rilis produksi/stabil.
