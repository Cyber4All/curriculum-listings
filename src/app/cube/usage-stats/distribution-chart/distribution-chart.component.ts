import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PieChart, DoughnutChart } from 'app/cube/shared/types';

@Component({
  selector: 'cube-distribution-chart',
  templateUrl: 'distribution-chart.component.html',
  styleUrls: ['distribution-chart.component.scss']
})
export class DistributionChartComponent implements OnInit {
  @Input() chart: PieChart | DoughnutChart;
  @Output() chartNotHovered: EventEmitter<void> = new EventEmitter<void>();
  constructor() {}

  ngOnInit() {}
  handleMouseleave() {
    this.chartNotHovered.emit();
  }
}
