export interface BpsIndicator {
  indicator_id: number;
  title: string;
  name: string;
  data_source: string;
  value: string;
  unit: string;
  year: number;
  status: string;
  updated_at: string;
  indicator_group_id: number;
  subject_id: number;
  subject_name: string;
}

export interface BpsResponseMeta {
  page: number;
  pages: number;
  per_page: number;
  count: number;
  total: number;
}

// The raw response from BPS API is an array where:
// [0] is "status: OK"
// [1] is the metadata object
// [2] is the array of data objects
export type BpsRawResponse = [
  { status: string },
  BpsResponseMeta,
  BpsIndicator[]
];

export interface StandardizedBpsResponse {
  status: string;
  meta: BpsResponseMeta;
  data: BpsIndicator[];
}
