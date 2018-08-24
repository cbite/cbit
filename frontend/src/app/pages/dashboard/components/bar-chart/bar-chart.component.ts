import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as Chart from 'chart.js';
import {borderColors, chartColors} from '../../util/chart.colors';
import {BarChartData} from './bar-chart.data';
import {LinearTickOptions} from 'chart.js';

@Component({
  selector: 'cbit-bar-chart',
  styleUrls: ['../dashboard-component.scss'],
  template: `
    <div class="dashboard-component">
      <div class="title">{{title}}</div>
      <div class="content">
        <canvas id="{{chartId}}" class="study-types-chart"></canvas>
      </div>
    </div>

  `
})
export class BarChartComponent implements AfterViewInit, OnChanges {

  @Input()
  public chartData: BarChartData;

  @Input()
  public chartId: string;

  @Input()
  public title: string;

  @Input()
  public stacked = false;

  public canvas: any;
  public ctx: any;

  public ngAfterViewInit(): void {
    this.canvas = document.getElementById(this.chartId);
    this.ctx = this.canvas.getContext('2d');
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.chartData && this.ctx) {
      const max = Math.max(...this.chartData.studiesCounts[0].concat(this.chartData.studiesCounts[1]));
      const tickOptions = <LinearTickOptions> {beginAtZero: true};
      // prevents decimal y-axis on small numbers
      if (max < 5) {
        tickOptions.stepSize = 1;
      }
      const studyTypesChart = new Chart(this.ctx, {
          type: 'bar',
          data: {
            labels: this.chartData.labels,
            datasets: [{
              label: 'Biomaterial',
              data: this.chartData.studiesCounts[0],
              borderWidth: 1,
              backgroundColor: chartColors[0],
              borderColor: borderColors[0]
            }, {
              label: 'Tendon',
              data: this.chartData.studiesCounts[1],
              borderWidth: 1,
              backgroundColor: chartColors[1],
              borderColor: borderColors[1]
            }]
          },
          options: {
            responsive: false,
            legend: {
              position: 'right'
            },
            scales: {
              xAxes: [{
                type: 'category',
                stacked: this.stacked,
              },
              ],
              yAxes: [{
                type: 'linear',
                stacked: this.stacked,
                ticks: tickOptions
              }]
            }
          }
        }
      );
    }
  }
}
