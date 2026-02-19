
export interface BpsIndicator {
    indicator_id: number;
    title: string;
    name: string;
    data_source?: string;
    value: string;
    unit: string;
    year: number;
    status: string;
    updated_at: string;
    indicator_group_id?: number;
    subject_id?: number;
    subject_name?: string;
}

export interface BpsResponseMeta {
    source: string;
    total_indicators: number;
    updated_at: string;
}

export interface StandardizedBpsResponse {
    status: string;
    meta: BpsResponseMeta;
    data: BpsIndicator[];
}
