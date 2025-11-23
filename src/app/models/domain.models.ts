// Domain models for application data
export interface State {
    state_code: string;
    state_name: string;
}

export interface County {
    county_code: string;
    county_name: string;
    state_code: string;
}

export interface MonitoringLocation {
    id: string;
    name: string;
    type: string;
    county_name: string;
    latitude: number;
    longitude: number;
}

export interface TimeSeriesPoint {
    time: string; // ISO 8601 date
    value: number;
}

export interface TimeSeriesData {
    locationId: string;
    parameterCode: string;
    parameterName: string;
    unit: string;
    points: TimeSeriesPoint[];
    hasData: boolean; // true if points.length > 0
}
