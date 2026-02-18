
import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const id = query.id as string || '21'; // Default Kepri

    // Mock coordinate logic (Region Centroids)
    const coordinates: Record<string, { lat: number, lng: number, zoom: number }> = {
        '21': { lat: 3.9456514, lng: 108.142867, zoom: 8 }, // Kepri
        '2101': { lat: 1.082828, lng: 104.486256, zoom: 10 }, // Bintan (Example)
        '2171': { lat: 1.1301, lng: 104.0529, zoom: 11 }, // Batam
    };

    const coord = coordinates[id] || coordinates['21'];

    return {
        success: true,
        data: coord
    };
});
