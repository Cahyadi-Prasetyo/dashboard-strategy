// composables/useAppTour.js
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const useAppTour = () => {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      stagePadding: 5, // Memberi ruang ekstra di sekitar tombol
      popoverClass: "driverjs-theme custom-tour-z", // Tambahkan class custom
      overlayColor: "#000",
      overlayOpacity: 0.75,
      steps: [
        // {
        //   element: "#filter-wilayah-spatial",
        //   popover: {
        //     title: "Filter Wilayah", // Saya ubah judul sedikit
        //     description:
        //       "Pilih filter wilayah terlebih dahulu untuk memulai menggunakan peta",
        //   },
        // },
        {
          element: "#map-pasca #tour-fullscreen-btn",
          popover: {
            title: "Layer Statistik",
            description:
              "Gunakan tombol ini untuk mengatur layer statistik bencana",
          },
        },
        {
          element: "#tour-fullscreen-btn",
          popover: {
            title: "Layar Penuh",
            description: "Klik untuk memperbesar peta hingga memenuhi layar.",
          },
        },
        {
          element: "#tour-mode-view",
          popover: {
            title: "Mode Tampilan",
            description:
              "Ubah tampilan antara Split (Bandingkan Pra/Pasca) atau Fokus satu peta.",
          },
        },
        // {
        //   element: "#tour-legend-area",
        //   popover: {
        //     title: "Legenda & Kontrol",
        //     description:
        //       "Informasi warna, batas wilayah, dan transparansi peta.",
        //   },
        // },
      ],
    });

    driverObj.drive();
  };

  return { startTour };
};
