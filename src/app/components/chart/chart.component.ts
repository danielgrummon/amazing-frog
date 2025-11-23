import { Component, ViewChild, ElementRef, Input, OnChanges, AfterViewInit, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables, ChartType } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { TimeSeriesPoint } from '../../models/domain.models';

Chart.register(...registerables);

@Component({
    selector: 'app-chart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './chart.component.html',
    styleUrl: './chart.component.scss'
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
    @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
    @Input() data: TimeSeriesPoint[] = [];
    @Input() title = '';
    @Input() yAxisLabel = '';
    @Input() lineColor = '#3f51b5';

    private chart?: Chart;

    ngAfterViewInit() {
        this.createChart();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.chart && changes['data']) {
            this.updateChart();
        }
    }

    ngOnDestroy() {
        if (this.chart) {
            this.chart.destroy();
        }
    }

    private createChart() {
        if (!this.canvasRef) return;

        const config: ChartConfiguration<'line'> = {
            type: 'line',
            data: {
                datasets: [{
                    label: this.yAxisLabel,
                    data: this.data.map(p => ({ x: new Date(p.time).getTime(), y: p.value })),
                    borderColor: this.lineColor,
                    backgroundColor: this.lineColor + '20',
                    fill: false, // Don't fill under the line
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: this.title,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM d'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: this.yAxisLabel
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };

        this.chart = new Chart(this.canvasRef.nativeElement, config);
    }

    private updateChart() {
        if (!this.chart) return;
        this.chart.data.datasets[0].data = this.data.map(p => ({
            x: new Date(p.time).getTime(),
            y: p.value
        }));
        this.chart.update();
    }
}
