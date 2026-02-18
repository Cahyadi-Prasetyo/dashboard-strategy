
import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);

    const apiKey = config.bpsApiKey;
    const baseUrl = config.bpsApiBaseUrl || 'https://webapi.bps.go.id/v1/api/list/';

    if (!apiKey) {
        // Return mock data or error if no API key is present, 
        // but for now let's just log a warning and return an empty structure
        console.warn('BPS API Key is missing. Please set BPS_API_KEY in .env');
        return {
            status: 'error',
            message: 'BPS API Key is missing',
            data: [],
            meta: {
                page: 1,
                pages: 1,
                per_page: 10,
                count: 0,
                total: 0
            }
        };
    }

    try {
        const params = new URLSearchParams({
            model: 'indicators',
            lang: 'ind',
            domain: (query.domain as string) || '0000', // Default to National if not provided, or change to Kepri code if known
            key: apiKey,
            page: (query.page as string) || '1',
        });

        const response = await $fetch(`${baseUrl}${params.toString()}`);

        // BPS API usually returns JSON, sometimes with a specific structure.
        // Based on documentation, if successful, it returns:
        // { "status": "OK", "data-availability": "available", "data": [...] }
        // Or sometimes it's an array based on the implementation plan description.
        // Let's assume the implementation plan's description of "mixed array" is correct for now, 
        // but we might need to adjust based on actual response.
        // plan says: data[0] -> metadata, data[1] -> indicators

        // Let's inspect the response type if possible or just map it blindly for now based on the plan.
        // Actually, looking at generic BPS API wrappers, the structure is often:
        // response.data[0] is metadata
        // response.data[1] is the actual list

        const rawData = response as any;

        if (rawData.status === 'OK' && Array.isArray(rawData.data) && rawData.data.length >= 2) {
            const meta = rawData.data[0];
            const indicators = rawData.data[1];

            return {
                status: 'success',
                meta: {
                    page: meta.page,
                    pages: meta.pages,
                    per_page: meta.per_page,
                    count: meta.count,
                    total: meta.total
                },
                data: indicators
            };
        } else {
            // Fallback or error handling
            return {
                status: 'error',
                message: 'Invalid response structure from BPS API',
                original: rawData
            }
        }

    } catch (error: any) {
        return {
            status: 'error',
            message: error.message,
            data: null
        };
    }
});
