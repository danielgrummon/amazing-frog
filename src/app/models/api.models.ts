// GeoJSON API response interfaces
export interface GeoJSONResponse {
    features: GeoJSONFeature[];
    numberReturned?: number;
}

export interface GeoJSONFeature {
    id?: string;
    properties: any;
    geometry?: {
        coordinates: [number, number]; // [longitude, latitude]
    };
}
