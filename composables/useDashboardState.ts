import { useState } from '#app';
import { INDICATORS } from '~/constants/indicators';

export const useDashboardState = () => {
    const selectedIndicatorId = useState<string>('dashboard-indicator-id', () => INDICATORS[0].id);

    const activeIndicator = computed(() =>
        INDICATORS.find(i => i.id === selectedIndicatorId.value) || INDICATORS[0]
    );

    const setIndicator = (id: string) => {
        selectedIndicatorId.value = id;
    };

    return {
        selectedIndicatorId,
        activeIndicator,
        setIndicator
    };
};
