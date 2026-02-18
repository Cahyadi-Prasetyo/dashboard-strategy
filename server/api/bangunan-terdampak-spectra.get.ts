
import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
    // Mock data for building impact analysis
    return {
        success: true,
        data: [
            { id: 1, type: "Rumah Tinggal", damage_level: "Berat", location: "Area A" },
            { id: 2, type: "Sekolah", damage_level: "Sedang", location: "Area B" },
            { id: 3, type: "Puskesmas", damage_level: "Ringan", location: "Area C" }
        ],
        summary: {
            total_affected: 15,
            level_breakdown: {
                "Berat": 5,
                "Sedang": 7,
                "Ringan": 3
            }
        },
        message: "Data bangunan terdampak (Mock)"
    };
});
