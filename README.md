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

## 🔌 Integrasi Eksternal & Keamanan Data (BPS WebAPI)

Dashboard ini terhubung dengan **WebAPI BPS (Badan Pusat Statistik)** untuk menampilkan indikator strategis terkini. Interaksi dengan API pihak ketiga dilakukan melalui mekanisme **Server-side Proxy** untuk menjamin keamanan & integritas data.

## 🔐 Keamanan & Integritas Data

Dashboard ini menerapkan standar keamanan **Zero-Trust** untuk melindungi data sensitif dan infrastruktur, khususnya dalam integrasi dengan sistem eksternal (BPS).

### 1. Server-Side Processing
Seluruh komunikasi dengan API pihak ketiga dilakukan melalui **Internal Proxy Server**. Tidak ada permintaan (request) yang dikirim langsung dari browser pengguna ke server data eksternal, sehingga :
-   Melindungi **API Key/Credential** dari akses publik.
-   Mencegah paparan struktur data internal.

### 2. Environment Isolation
Akses ke layanan eksternal dikonfigurasi menggunakan **Environment Variables** yang terenkripsi di level server. Pastikan server produksi memiliki konfigurasi yang sesuai untuk:
-   `BPS_API_KEY`: Kunci akses layanan data.
-   `BPS_API_BASE_URL`: Endpoint layanan data.

---

## � Panduan Deployment

Dashboard ini dirancang untuk dijalankan di lingkungan modern yang mendukung **Node.js** atau containerization (Docker).

### Prasyarat System
-   **Runtime**: Node.js (LTS Version)
-   **Package Manager**: NPM / Yarn / PNPM

### Instalasi
1.  Unduh source code aplikasi.
2.  Install dependensi sistem: `npm install`
3.  Konfigurasi environment variable sesuai panduan keamanan.
4.  Jalankan mode pengembangan: `npm run dev` atau build untuk produksi: `npm run build`.

---

## 📝 Catatan Pengembangan
-   **Regional Config**: Sistem secara default dikonfigurasi untuk memantau wilayah **Kepulauan Riau**. Penyesuaian wilayah dapat dilakukan melalui konfigurasi global aplikasi.
-   **Version Control**: Pengembangan dilakukan dengan alur kerja Git Flow standar (Main, Develop, Feature).
