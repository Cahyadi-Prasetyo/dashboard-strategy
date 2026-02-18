
import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    // Mock aggregate data structure
    // This is a generic structure usually expected by charts or summary cards
    return {
        success: true,
        data: {
            summary: {
                total: Math.floor(Math.random() * 1000) + 100,
                trend: "+5.2%",
                last_updated: new Date().toISOString()
            },
            breakdown: [
                { label: "Kategori A", value: 300 },
                { label: "Kategori B", value: 500 },
                { label: "Kategori C", value: 200 },
            ],
            // Add spatial aggregate usually needed for maps choropleth
            spatial_aggregate: {}
        },
        message: "Data agregat simulasi (Mock)"
    };
});
