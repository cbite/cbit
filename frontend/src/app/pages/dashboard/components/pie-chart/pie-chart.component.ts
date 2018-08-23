import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as Chart from 'chart.js';
import {PieChartData} from './pie-chart.data';
import {borderColors, chartColors} from '../../util/chart.colors';

@Component({
  selector: 'cbit-pie-chart',
  styleUrls: ['../dashboard-component.scss'],
  template: `
    <div class="dashboard-component">
      <div class="title">{{title}}</div>
      <div class="content">
        <canvas id="{{chartId}}" class="pie-chart"></canvas>
      </div>
    </div>
  `
})
export class PieChartComponent implements AfterViewInit, OnChanges {

  public canvas: any;
  public ctx: any;

  @Input()
  public chartId: string;

  @Input()
  public title: string;

  @Input()
  public chartData: PieChartData;

  public ngAfterViewInit(): void {
    this.canvas = document.getElementById(this.chartId);
    this.ctx = this.canvas.getContext('2d');
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.chartData && this.ctx) {
      const materialClassChart = new Chart(this.ctx, {
        type: 'pie',
        data: {
          labels: this.chartData.labels,
          datasets: [{
            data: this.chartData.studiesCounts,
            backgroundColor: chartColors,
            borderColor: borderColors,
            borderWidth: 1
          }]
        },
        options: {
          onClick: function (e) {
            const point = this.getElementAtEvent(e);
          },
          onHover: function (e: any) {
            const point = <any>this.getElementAtEvent(e);
            if (point.length) {
              e.target.style.cursor = 'pointer';
            } else {
              e.target.style.cursor = 'default';
            }
          },
          responsive: false,
          legend: {
            position: 'right'
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                return this.chartData.labels[tooltipItem.index] + ': ' + this.chartData.studiesCounts[tooltipItem.index];
              }.bind(this)
            }
          }
        }
      });
    }
  }
}
