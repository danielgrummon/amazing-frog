import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MonitoringLocation } from '../../models/domain.models';

@Component({
    selector: 'app-site-card',
    standalone: true,
    imports: [CommonModule, MatCardModule],
    templateUrl: './site-card.component.html',
    styleUrl: './site-card.component.scss'
})
export class SiteCardComponent {
    @Input() location?: MonitoringLocation;
}
