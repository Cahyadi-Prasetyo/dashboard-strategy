
import type { StandardizedBpsResponse, BpsIndicator } from '~/types/bps';

export const useBps = () => {
    const indicators = useState<BpsIndicator[]>('bps-indicators', () => []);
    const loading = useState<boolean>('bps-loading', () => false);
    const error = useState<string | null>('bps-error', () => null);
    const lastUpdate = useState<string | null>('bps-last-update', () => null);

    const fetchIndicators = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $fetch<StandardizedBpsResponse>('/api/bps/indicators');

            if (response.status === 'success') {
                indicators.value = response.data;
                lastUpdate.value = response.meta.updated_at;
            } else {
                error.value = (response as any).message || 'Gagal mengambil data indikator';
            }
        } catch (err: any) {
            console.error('BPS Fetch Error:', err);
            error.value = err.message || 'Terjadi kesalahan sistem';
        } finally {
            loading.value = false;
        }
    };

    // Helper untuk mengambil indikator spesifik
    const getIndicatorById = (id: number) => {
        return indicators.value.find(i => i.indicator_id === id);
    };

    const getIndicatorByTitle = (title: string) => {
        return indicators.value.find(i => i.title.toLowerCase().includes(title.toLowerCase()));
    };

    return {
        indicators,
        loading,
        error,
        lastUpdate,
        fetchIndicators,
        getIndicatorById,
        getIndicatorByTitle
    };
};
