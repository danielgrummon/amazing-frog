import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, of, combineLatest, merge } from 'rxjs';
import { filter, switchMap, tap, shareReplay, startWith, catchError, map } from 'rxjs/operators';

import { UsgsApiService } from '../../services/usgs-api.service';
import { WeatherService } from '../../services/weather.service';
import { State, County, MonitoringLocation, TimeSeriesData, WeatherData } from '../../models/domain.models';
import { ChartComponent } from '../chart/chart.component';
import { SiteCardComponent } from '../site-card/site-card.component';
import { WeatherCardComponent } from '../weather-card/weather-card.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCardModule,
        MatProgressSpinnerModule,
        ChartComponent,
        SiteCardComponent,
        WeatherCardComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    private readonly usgsService = inject(UsgsApiService);
    private readonly weatherService = inject(WeatherService);

    // Form controls - initialize with disabled state
    stateControl = new FormControl<string | null>(null);
    countyControl = new FormControl<string | null>({ value: null, disabled: true });
    locationControl = new FormControl<string | null>({ value: null, disabled: true });

    // Loading states
    statesLoading = signal(true);
    countiesLoading = signal(false);
    locationsLoading = signal(false);
    chartsLoading = signal(false);
    weatherLoading = signal(false);

    // Data streams - explicitly type to include null
    states$!: Observable<State[]>;
    counties$!: Observable<County[]>;
    locations$!: Observable<MonitoringLocation[]>;
    selectedLocation$!: Observable<MonitoringLocation | undefined>;
    gageHeightData$: Observable<TimeSeriesData | null> = new Observable();
    streamflowData$: Observable<TimeSeriesData | null> = new Observable();
    weatherData$!: Observable<WeatherData | null>;

    ngOnInit() {
        this.setupStreams();

        // Trigger the states API call immediately
        this.states$.subscribe();

        // Subscribe to counties and locations streams to keep them alive
        this.counties$.subscribe();
        this.locations$.subscribe();

        // Eagerly subscribe to chart observables to trigger the source
        this.gageHeightData$.subscribe();
        this.streamflowData$.subscribe();
    }

    private setupStreams() {
        // States stream
        this.states$ = this.usgsService.getStates().pipe(
            tap(() => this.statesLoading.set(false)),
            catchError(() => {
                this.statesLoading.set(false);
                return of([]);
            }),
            shareReplay(1)
        );

        // Counties stream
        this.counties$ = this.stateControl.valueChanges.pipe(
            filter(state => !!state),
            tap(() => {
                this.countyControl.reset();
                this.countyControl.disable();
                this.locationControl.reset();
                this.locationControl.disable();
                this.countiesLoading.set(true);
            }),
            switchMap(state => this.usgsService.getCounties(state!).pipe(
                tap(() => {
                    this.countiesLoading.set(false);
                    this.countyControl.enable();
                }),
                catchError(() => {
                    this.countiesLoading.set(false);
                    this.countyControl.enable();
                    return of([]);
                })
            )),
            shareReplay(1)
        );

        // Locations stream
        this.locations$ = this.countyControl.valueChanges.pipe(
            filter(county => !!county),
            tap(() => {
                this.locationControl.reset();
                this.locationControl.disable();
                this.locationsLoading.set(true);
            }),
            switchMap(county => {
                const state = this.stateControl.value!;
                return this.usgsService.getMonitoringLocations(state, county!).pipe(
                    tap(() => {
                        this.locationsLoading.set(false);
                        this.locationControl.enable();
                    }),
                    catchError(() => {
                        this.locationsLoading.set(false);
                        this.locationControl.enable();
                        return of([]);
                    })
                );
            }),
            shareReplay(1)
        );

        // Selected location stream
        this.selectedLocation$ = combineLatest([
            this.locationControl.valueChanges.pipe(startWith(null)),
            this.locations$.pipe(startWith([]))
        ]).pipe(
            map(([locationId, locations]) =>
                locations.find(loc => loc.id === locationId)
            )
        );

        // Date range for last 60 days
        const getDateRange = () => {
            const today = new Date();
            const endDate = new Date(today);
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 90);

            const start = startDate.toISOString().split('T')[0];
            const end = endDate.toISOString().split('T')[0];

            return { start, end };
        };

        // Gage height data stream
        this.gageHeightData$ = this.locationControl.valueChanges.pipe(
            switchMap((loc): Observable<TimeSeriesData | null> => {
                if (!loc) {
                    this.chartsLoading.set(false);
                    return of(null);
                }

                const { start, end } = getDateRange();
                this.chartsLoading.set(true);

                return this.usgsService.getGageHeight(loc, start, end).pipe(
                    tap(() => this.chartsLoading.set(false)),
                    catchError(() => {
                        this.chartsLoading.set(false);
                        return of(null);
                    })
                );
            }),
            shareReplay({ bufferSize: 1, refCount: false })
        );

        // Streamflow data stream
        this.streamflowData$ = this.locationControl.valueChanges.pipe(
            switchMap((loc): Observable<TimeSeriesData | null> => {
                if (!loc) return of(null);

                const { start, end } = getDateRange();

                return this.usgsService.getStreamflow(loc, start, end).pipe(
                    catchError(() => of(null))
                );
            }),
            shareReplay({ bufferSize: 1, refCount: false })
        );

        // Weather data stream - triggered by location selection
        this.weatherData$ = this.selectedLocation$.pipe(
            tap(location => {
                if (location) {
                    this.weatherLoading.set(true);
                }
            }),
            switchMap((location): Observable<WeatherData | null> => {
                if (!location) {
                    this.weatherLoading.set(false);
                    return of(null);
                }

                return this.weatherService.getWeatherForLocation(
                    location.latitude,
                    location.longitude
                ).pipe(
                    tap(() => this.weatherLoading.set(false)),
                    catchError(() => {
                        this.weatherLoading.set(false);
                        return of(null);
                    })
                );
            }),
            shareReplay({ bufferSize: 1, refCount: false })
        );
    }
}
