export interface BPSIndicator {
    id: string;
    label: string;
    description: string;
    unit: string;
    source: string;
}

export interface RegionData {
    id: string; // Kode Wilayah (e.g., '2100' for Prov Kepri)
    name: string;
    values: Record<string, number>; // Mapping indicator ID to value
}
