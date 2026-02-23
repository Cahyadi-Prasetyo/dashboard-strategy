
import { defineEventHandler, getQuery } from 'h3';
// @ts-ignore
import indicatorsConfig from '../../data/indicators-config.json';
// @ts-ignore
import fallbackData from '../../data/kepri-indicators.json';
// @ts-ignore
import regionsConfig from '../../data/regions-config.json';

const KEPRI_DOMAIN = '2100';
const REGION_IDS = (regionsConfig as any[]).map((r: any) => r.id);

interface BpsDataResponse {
    status: string;
    'data-availability'?: string;
    datacontent?: Record<string, number>;
    vervar?: Array<{ val: number; label: string }>;
    tahun?: Array<{ val: number; label: string }>;
    var?: Array<{ val: number; label: string; unit: string }>;
}

interface ThResponse {
    status: string;
    'data-availability'?: string;
    data?: [{ page: number; pages: number; total: number }, Array<{ th_id: number; th: string }>];
}

// Cache for th_id lookups (variable -> latest th_id)
const thCache: Record<number, { th_id: number; year: string; expiry: number }> = {};

/**
 * Get the latest th_id (period ID) for a given variable
 */
async function getLatestThId(bpsVar: number, apiKey: string, baseUrl: string): Promise<{ th_id: number; year: string } | null> {
    // Check cache (cache for 1 hour)
    const cached = thCache[bpsVar];
    if (cached && cached.expiry > Date.now()) {
        return { th_id: cached.th_id, year: cached.year };
    }

    try {
        const url = `${baseUrl}?model=th&domain=${KEPRI_DOMAIN}&var=${bpsVar}&key=${apiKey}`;
        const response = await $fetch<ThResponse>(url);

        if (response.status === 'OK' && response.data && response.data[1]?.length > 0) {
            // BPS returns in descending order, first item is latest
            const latest = response.data[1][0];
            thCache[bpsVar] = {
                th_id: latest.th_id,
                year: latest.th,
                expiry: Date.now() + 3600000 // 1 hour cache
            };
            return { th_id: latest.th_id, year: latest.th };
        }
    } catch (err) {
        console.warn(`[BPS API] Failed to fetch th for var ${bpsVar}:`, err);
    }
    return null;
}

/**
 * Fetch data for a specific variable from BPS API
 */
async function fetchIndicatorData(bpsVar: number, thId: number, apiKey: string, baseUrl: string): Promise<Record<string, number> | null> {
    try {
        const url = `${baseUrl}?model=data&domain=${KEPRI_DOMAIN}&var=${bpsVar}&th=${thId}&key=${apiKey}`;
        const response = await $fetch<BpsDataResponse>(url);

        if (response.status === 'OK' && response.datacontent) {
            return response.datacontent;
        }
    } catch (err) {
        console.warn(`[BPS API] Failed to fetch data for var ${bpsVar}:`, err);
    }
    return null;
}

/**
 * Parse datacontent key to extract region ID
 * Key format: {vervar_id}{var_id_padded}{turvar_id}{th_id_padded}
 * Example: "210066601400" -> vervar=2100, var=666, turvar=0, th=140, turtahun=0
 */
function parseDataContentKey(key: string, bpsVar: number): string | null {
    // The vervar (region ID) is the first 4 characters
    const regionId = key.substring(0, 4);
    if (REGION_IDS.includes(regionId)) {
        return regionId;
    }
    return null;
}

/**
 * Extract per-region values from datacontent
 */
function extractRegionValues(datacontent: Record<string, number>, bpsVar: number): Record<string, number> {
    const result: Record<string, number> = {};

    for (const [key, value] of Object.entries(datacontent)) {
        const regionId = parseDataContentKey(key, bpsVar);
        if (regionId && typeof value === 'number') {
            result[regionId] = value;
        }
    }

    return result;
}

// Region data from JSON config
const REGION_NAMES: Record<string, string> = Object.fromEntries(
    (regionsConfig as any[]).map((r: any) => [r.id, r.name])
);

const REGION_COORDS: Record<string, [number, number]> = Object.fromEntries(
    (regionsConfig as any[]).filter((r: any) => r.type !== 'provinsi').map((r: any) => [r.id, r.coords])
);

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const apiKey = config.bpsApiKey;
    const baseUrl = config.bpsApiBaseUrl || 'https://webapi.bps.go.id/v1/api/list';

    // If no API key configured, return fallback data
    if (!apiKey) {
        console.warn('[BPS API] No API key configured, using fallback data');
        return {
            status: 'success',
            source: 'fallback',
            indicators: indicatorsConfig,
            regions: fallbackData
        };
    }

    try {
        // Step 1: For each indicator, get latest th_id and fetch data
        const indicatorDataMap: Record<string, Record<string, number>> = {};
        const yearMap: Record<string, string> = {};

        const fetchPromises = indicatorsConfig.map(async (indicator: any) => {
            const thInfo = await getLatestThId(indicator.bpsVar, apiKey, baseUrl);
            if (!thInfo) {
                console.warn(`[BPS API] No period data for indicator ${indicator.id} (var=${indicator.bpsVar})`);
                return;
            }

            yearMap[indicator.id] = thInfo.year;
            const datacontent = await fetchIndicatorData(indicator.bpsVar, thInfo.th_id, apiKey, baseUrl);
            if (datacontent) {
                indicatorDataMap[indicator.id] = extractRegionValues(datacontent, indicator.bpsVar);
            }
        });

        await Promise.all(fetchPromises);

        // Step 2: Transform into per-region format (same as kepri-indicators.json)
        const kabkotIds = (regionsConfig as any[]).filter((r: any) => r.type !== 'provinsi').map((r: any) => r.id);
        const regions = kabkotIds.map(regionId => {
            const indicators: Record<string, number> = {};

            for (const indicator of indicatorsConfig as any[]) {
                const regionValues = indicatorDataMap[indicator.id];
                if (regionValues && regionValues[regionId] !== undefined) {
                    indicators[indicator.id] = regionValues[regionId];
                } else {
                    // Fallback to local data for this indicator
                    const fallbackRegion = fallbackData.find((d: any) => d.id === regionId);
                    indicators[indicator.id] = fallbackRegion?.indicators?.[indicator.id as keyof typeof fallbackRegion.indicators] ?? 0;
                }
            }

            return {
                id: regionId,
                name: REGION_NAMES[regionId] || regionId,
                coords: REGION_COORDS[regionId] || [0, 0],
                indicators
            };
        });

        return {
            status: 'success',
            source: 'bps_api',
            meta: {
                years: yearMap,
                fetched_at: new Date().toISOString()
            },
            indicators: indicatorsConfig,
            regions
        };

    } catch (error: any) {
        console.error('[BPS API] Unexpected error:', error);

        // Return fallback data on any error
        return {
            status: 'success',
            source: 'fallback',
            error_detail: error.message,
            indicators: indicatorsConfig,
            regions: fallbackData
        };
    }
});
