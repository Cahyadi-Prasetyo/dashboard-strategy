
import { defineEventHandler } from 'h3';
// @ts-ignore
import indicatorsConfig from '../../data/indicators-config.json';

export default defineEventHandler(async (event) => {
    try {
        return {
            status: 'success',
            meta: {
                source: 'indicators_config',
                total_indicators: indicatorsConfig.length,
                updated_at: new Date().toISOString()
            },
            data: indicatorsConfig
        };

    } catch (error: any) {
        return {
            status: 'error',
            message: 'Gagal memuat konfigurasi indikator',
            original_error: error.message
        };
    }
});
