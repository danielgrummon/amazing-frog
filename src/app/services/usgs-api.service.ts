import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { GeoJSONResponse } from '../models/api.models';
import { State, County, MonitoringLocation, TimeSeriesData } from '../models/domain.models';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({ providedIn: 'root' })
export class UsgsApiService {
    private readonly http = inject(HttpClient);
    private readonly errorHandler = inject(ErrorHandlerService);
    private readonly baseUrl = 'https://api.waterdata.usgs.gov/ogcapi/v0';

    getStates(): Observable<State[]> {
        return this.http.get<GeoJSONResponse>(`${this.baseUrl}/collections/states/items`, {
            params: { f: 'json', country_code: 'US', limit: '10000' }
        }).pipe(
            map(response => response.features
                .map(f => ({
                    state_code: f.properties.state_fips_code,
                    state_name: f.properties.state_name
                }))
                .sort((a, b) => a.state_name.localeCompare(b.state_name))
            ),
            shareReplay(1),
            catchError(this.errorHandler.handleError.bind(this.errorHandler))
        );
    }

    getCounties(stateFipsCode: string): Observable<County[]> {
        return this.http.get<GeoJSONResponse>(`${this.baseUrl}/collections/counties/items`, {
            params: {
                f: 'json',
                country_code: 'US',
                state_fips_code: stateFipsCode,
                limit: '10000'
            }
        }).pipe(
            map(response => response.features
                .map(f => ({
                    county_code: f.properties.county_fips_code,
                    county_name: f.properties.county_name,
                    state_code: f.properties.state_fips_code
                }))
                .sort((a, b) => a.county_name.localeCompare(b.county_name))
            ),
            catchError(this.errorHandler.handleError.bind(this.errorHandler))
        );
    }

    getMonitoringLocations(stateFipsCode: string, countyFipsCode: string): Observable<MonitoringLocation[]> {
        return this.http.get<GeoJSONResponse>(`${this.baseUrl}/collections/monitoring-locations/items`, {
            params: {
                f: 'json',
                country_code: 'US',
                state_code: stateFipsCode,
                county_code: countyFipsCode,
                agency_code: 'USGS',
                site_type: 'Stream',
                limit: '1000'
            }
        }).pipe(
            map(response => response.features.map(f => ({
                id: f.id || '',
                name: f.properties.monitoring_location_name,
                type: f.properties.site_type || f.properties.monitoring_location_type || 'Stream',
                county_name: f.properties.county_name,
                latitude: f.geometry?.coordinates[1] || 0,
                longitude: f.geometry?.coordinates[0] || 0
            }))),
            catchError(this.errorHandler.handleError.bind(this.errorHandler))
        );
    }

    getGageHeight(locationId: string, startDate: string, endDate: string): Observable<TimeSeriesData> {
        return this.getTimeSeries(locationId, '00065', startDate, endDate, 'Gage Height', 'ft');
    }

    getStreamflow(locationId: string, startDate: string, endDate: string): Observable<TimeSeriesData> {
        return this.getTimeSeries(locationId, '00060', startDate, endDate, 'Streamflow', 'ft³/s');
    }

    private getTimeSeries(
        locationId: string,
        parameterCode: string,
        startDate: string,
        endDate: string,
        parameterName: string,
        unit: string
    ): Observable<TimeSeriesData> {
        const datetime = `${startDate}/${endDate}`;

        return this.http.get<GeoJSONResponse>(`${this.baseUrl}/collections/daily/items`, {
            params: {
                monitoring_location_id: locationId,
                parameter_code: parameterCode,
                statistic_id: '00003',
                datetime: datetime,
                limit: '10000',
                f: 'json'
            }
        }).pipe(
            map(response => {
                const points = response.features
                    .map(f => ({
                        time: f.properties.time,
                        value: f.properties.value
                    }))
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

                return {
                    locationId,
                    parameterCode,
                    parameterName,
                    unit,
                    points,
                    hasData: (response.numberReturned || 0) > 0 && points.length > 0
                };
            }),
            catchError(this.errorHandler.handleError.bind(this.errorHandler))
        );
    }
}
