import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { WeatherData, WeatherForecast } from '../models/domain.models';
import { ErrorHandlerService } from './error-handler.service';

interface WeatherPointResponse {
    properties: {
        relativeLocation: {
            properties: {
                city: string;
                state: string;
            };
        };
        gridId: string;
        gridX: number;
        gridY: number;
    };
}

interface WeatherForecastResponse {
    properties: {
        periods: Array<{
            number: number;
            name: string;
            temperature: number;
            temperatureUnit: string;
            windSpeed: string;
            windDirection: string;
            icon: string;
            shortForecast: string;
            detailedForecast: string;
            probabilityOfPrecipitation: {
                value: number | null;
            };
        }>;
    };
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
    private readonly http = inject(HttpClient);
    private readonly errorHandler = inject(ErrorHandlerService);
    private readonly baseUrl = 'https://api.weather.gov';

    getWeatherForLocation(latitude: number, longitude: number): Observable<WeatherData> {
        // Round to 4 decimal places to match API expectations
        const lat = latitude.toFixed(4);
        const lon = longitude.toFixed(4);

        return this.http.get<WeatherPointResponse>(`${this.baseUrl}/points/${lat},${lon}`).pipe(
            switchMap(pointResponse => {
                const props = pointResponse.properties;
                const gridId = props.gridId;
                const gridX = props.gridX;
                const gridY = props.gridY;

                return this.http.get<WeatherForecastResponse>(
                    `${this.baseUrl}/gridpoints/${gridId}/${gridX},${gridY}/forecast`
                ).pipe(
                    map(forecastResponse => {
                        const periods = forecastResponse.properties.periods;
                        const currentPeriod = periods[0]; // First period is current/next

                        const forecast: WeatherForecast | null = currentPeriod ? {
                            temperature: currentPeriod.temperature,
                            temperatureUnit: currentPeriod.temperatureUnit,
                            windSpeed: currentPeriod.windSpeed,
                            windDirection: currentPeriod.windDirection,
                            icon: currentPeriod.icon,
                            name: currentPeriod.name,
                            probabilityOfPrecipitation: currentPeriod.probabilityOfPrecipitation?.value || 0,
                            shortForecast: currentPeriod.shortForecast,
                            detailedForecast: currentPeriod.detailedForecast
                        } : null;

                        return {
                            location: {
                                city: props.relativeLocation.properties.city,
                                state: props.relativeLocation.properties.state
                            },
                            currentForecast: forecast,
                            hasData: !!forecast
                        };
                    })
                );
            }),
            catchError(error => {
                console.error('Weather API Error:', error);
                return of({
                    location: { city: '', state: '' },
                    currentForecast: null,
                    hasData: false
                });
            })
        );
    }
}
