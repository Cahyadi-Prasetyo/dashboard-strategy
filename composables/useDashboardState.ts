import { useState } from '#app';

export const useDashboardState = () => {
    const selectedIndicatorId = useState<string>('dashboard-indicator-id', () => 'pertumbuhan_ekonomi');

    const setIndicator = (id: string) => {
        selectedIndicatorId.value = id;
    };

    return {
        selectedIndicatorId,
        setIndicator
    };
};
