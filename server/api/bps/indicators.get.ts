
import { defineEventHandler } from 'h3';
// @ts-ignore
import bpsData from '../../data/bps-indicators.json';

export default defineEventHandler(async (event) => {
    // Simulasi delay jaringan agar terasa seperti API beneran
    // await new Promise(resolve => setTimeout(resolve, 500));

    try {
        return {
            status: 'success',
            meta: {
                source: 'local_json',
                total_indicators: bpsData.length,
                updated_at: new Date().toISOString()
            },
            data: bpsData
        };

    } catch (error: any) {
        return {
            status: 'error',
            message: 'Gagal memuat data lokal',
            original_error: error.message
        };
    }
});
