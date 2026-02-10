// ~/utils/map-visuals.ts
import { DAMAGE_CONFIG } from "~/constants/map-config";

// --- TAMBAHAN BARU: Icon Photo Duotone (SVG) ---
export const getPhotoIconSvg = () => {
  // Icon ph:image-duotone style (White)
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="w-3.5 h-3.5 text-white opacity-90">
      <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,84a12,12,0,1,1-12,12A12,12,0,0,1,176,84Zm-28,52,24,24,32-32,12,12V184H40V148l48-48,40,40Z" fill="currentColor"></path>
    </svg>
  `;
};

export const getInfraIconSvg = (type: string) => {
  const cls = "w-4 h-4 text-white";
  switch (type) {
    case "pendidikan":
      return `<svg class="${cls}" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/></svg>`;
    case "kesehatan":
      return `<svg class="${cls}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
    case "ekonomi":
      return `<svg class="${cls}" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" /></svg>`;
    case "sosial":
      return `<svg class="${cls}" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>`;
    default:
      return `<div class="w-2 h-2 bg-white rounded-full"></div>`;
  }
};

export const getMarkerColor = (type: string, kerusakanId: any = null) => {
  if (type === "keluarga" && kerusakanId !== null) {
    // 5 adalah default (Abu-abu/Tidak Diketahui) jika null
    const id = (kerusakanId || 5) as keyof typeof DAMAGE_CONFIG;
    const cfg = DAMAGE_CONFIG[id] || DAMAGE_CONFIG[5];
    return cfg.color;
  }
  const colors: Record<string, string> = {
    keluarga: "#14b8a6",
    pendidikan: "#3b82f6",
    kesehatan: "#ef4444",
    ekonomi: "#10b981",
    sosial: "#a855f7",
  };
  return colors[type] || "#3b82f6";
};

export const formatMapNumber = (num: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(num);

export const getId = (item: any) => {
  if (!item) return null;
  if (typeof item === "string" || typeof item === "number") return item;
  return item.id || item.kode || null;
};

// ==========================================
// HIGHLIGHT MARKER (SAAT DI-KLIK)
// ==========================================
export const highlightMarkerInGroup = (L: any, group: any, loc: any) => {
  if (!group || typeof group.eachLayer !== "function") {
    return;
  }

  group.eachLayer((layer: any) => {
    const mLatLng = layer.getLatLng();
    const isMatch =
      mLatLng.lat.toFixed(6) === loc.lat.toFixed(6) &&
      mLatLng.lng.toFixed(6) === loc.lng.toFixed(6);

    const color = layer.originalColor || "#14b8a6";
    const type = layer.dataType || "keluarga";
    const isKeluarga = type === "keluarga";

    // Ambil konten asli (jika ada icon) dari options.html sebelumnya jika perlu,
    // tapi disini kita rebuild style-nya
    const hasPhoto = layer.hasCompletePhotos;
    let innerContent = "";

    if (isMatch) {
      // === UKURAN JUMBO (SAAT DIKLIK) ===
      if (isKeluarga) {
        // Jika ada foto lengkap, tambahkan icon di tengah marker highlight
        if (hasPhoto) {
          innerContent = `<div style="transform: scale(1.3);">${getPhotoIconSvg()}</div>`;
        }

        layer.setIcon(
          L.divIcon({
            className: "custom-marker",
            html: `
            <div style="
                background-color: ${color}; width: 36px; height: 36px; 
                border-radius: 50%; border: 3px solid #fbbf24; 
                box-shadow: 0 4px 12px rgba(251, 191, 36, 0.6); 
                transform: scale(1.1);
                display: flex; align-items: center; justify-content: center;
            ">
                ${innerContent}
            </div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          }),
        );
      } else {
        // Infrastruktur Highlight
        const svgIcon = getInfraIconSvg(type);
        layer.setIcon(
          L.divIcon({
            className: "custom-marker",
            html: `
            <div style="
              background-color: ${color}; width: 40px; height: 40px;
              border-radius: 8px; border: 3px solid #fbbf24;
              box-shadow: 0 4px 12px rgba(251, 191, 36, 0.6);
              display: flex; align-items: center; justify-content: center;
              transform: scale(1.1);
            ">
              <div style="transform: scale(1.5);">${svgIcon}</div>
            </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          }),
        );
      }
      layer.setZIndexOffset(1000);
    } else {
      resetSingleMarker(L, layer);
    }
  });
};

export const resetAllMarkers = (L: any, group: any) => {
  if (!group || typeof group.eachLayer !== "function") {
    return;
  }
  group.eachLayer((layer: any) => {
    resetSingleMarker(L, layer);
  });
};

// ==========================================
// NORMAL MARKER (SAAT TIDAK DI-KLIK / RESET)
// ==========================================
const resetSingleMarker = (L: any, layer: any) => {
  const color = layer.originalColor || "#14b8a6";
  const type = layer.dataType || "keluarga";
  const isKeluarga = type === "keluarga";
  const hasPhoto = layer.hasCompletePhotos;

  // === UKURAN NORMAL ===
  if (isKeluarga) {
    let innerContent = "";
    // Jika ada foto lengkap, render icon di dalam
    if (hasPhoto) {
      innerContent = getPhotoIconSvg();
    }

    // Tambahkan flexbox untuk centering icon
    layer.setIcon(
      L.divIcon({
        className: "custom-marker",
        html: `
        <div style="
            background-color: ${color}; width: 28px; height: 28px; 
            border-radius: 50%; border: 1.5px solid white; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
        ">
            ${innerContent}
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    );
  } else {
    // Infrastruktur Normal
    const svgIcon = getInfraIconSvg(type);
    layer.setIcon(
      L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${color}; width: 32px; height: 32px;
            border-radius: 6px; border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
          ">
            ${svgIcon}
          </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    );
  }
  layer.setZIndexOffset(0);
};

const DAMAGE_PRIORITY: Record<number, number> = {
  1: 3, // Rusak Berat (Prioritas Tertinggi)
  2: 2, // Rusak Sedang
  3: 1, // Rusak Ringan
  4: 0, // Tidak Rusak / Aman
  5: 0, // Tidak Diketahui
};

// Helper untuk mendapatkan bobot
const getDamageWeight = (kerusakanId: any) => {
  const id = kerusakanId || 5;
  return DAMAGE_PRIORITY[id] || 0;
};

// 2. Fungsi untuk membuat Cluster Icon
export const createClusterIcon = (cluster: any, L: any) => {
  const childMarkers = cluster.getAllChildMarkers();

  // Cari marker dengan kerusakan TERPARAH di dalam cluster ini
  let maxWeight = -1;
  let worstColor = "#3b82f6"; // Default biru

  for (const marker of childMarkers) {
    // Kita akan menyisipkan property 'damageId' dan 'originalColor' saat membuat marker nanti
    const w = marker.options.damageWeight || 0;

    if (w > maxWeight) {
      maxWeight = w;
      worstColor = marker.options.originalColor || "#3b82f6";
    }
  }

  const count = cluster.getChildCount();

  // Buat HTML Icon (Lingkaran dengan warna terparah + jumlah angka)
  return L.divIcon({
    html: `
      <div style="
        background-color: ${worstColor};
        width: 40px; height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-family: sans-serif;
        font-size: 14px;
      ">
        ${count}
      </div>
    `,
    className: "marker-cluster-custom",
    iconSize: L.point(40, 40),
  });
};

// Export juga logic prioritas biar bisa dipake di main file jika perlu
export { getDamageWeight };
