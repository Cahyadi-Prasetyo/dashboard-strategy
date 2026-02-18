
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const lat = body?.lat;
    const lng = body?.lng;

    // Simulate location details based on coordinates
    // In a real app, this would query a GIS database (PostGIS)
    return {
        success: true,
        data: {
            lokasi: {
                provinsi: "Kepulauan Riau",
                kabupaten: "Bintan (Simulasi)",
                kecamatan: "Bintan Timur",
                desa: "Kijang Kota",
                lat: lat || 0,
                lng: lng || 0
            },
            statistik: {
                populasi: 12500,
                risiko_bencana: "Sedang",
                fasilitas_terdekat: 5
            },
            message: "Detail lokasi ditemukan (Mock)"
        }
    };
});
