import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WeatherData } from '../../models/domain.models';

@Component({
    selector: 'app-weather-card',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
    templateUrl: './weather-card.component.html',
    styleUrl: './weather-card.component.scss'
})
export class WeatherCardComponent {
    @Input() weather?: WeatherData | null;
    @Input() loading = false;
}
