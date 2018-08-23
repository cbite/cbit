import {AfterViewInit, Component} from '@angular/core';
import * as Chart from 'chart.js';
import {borderColors, chartColors} from '../util/chart.colors';

@Component({
  selector: 'cbit-studies-publication-chart',
  styleUrls: ['./dashboard-component.scss'],
  template: `
    <div class="dashboard-component">
      <div class="title">Studies by Publication Date</div>
      <div class="content">
        <canvas id="studies-publication-chart" class="studies-publication-chart"></canvas>
      </div>
    </div>
  `
})
export class StudiesPublicationChartComponent implements AfterViewInit {

  public canvas: any;
  public ctx: any;

  ngAfterViewInit(): void {
    this.canvas = document.getElementById('studies-publication-chart');
    this.ctx = this.canvas.getContext('2d');
    const studiesPublicationChart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: ['2016', '2017', '2018'],
        datasets: [
          {
            backgroundColor: chartColors[0],
            borderColor: borderColors[0],
            borderWidth: 1,
            label: 'Bio Material',
            data: [7, 10, 14]
          },
          {
            backgroundColor: chartColors[1],
            borderColor: borderColors[1],
            borderWidth: 1,
            label: 'Tendons',
            data: [7, 10, 14]
          }
        ]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'category',
            stacked: true,
          },
          ],
          yAxes: [{
            type: 'linear',
            stacked: true,
            ticks: {
              min: 0
            }
          }]
        },
        legend: {
          display: true,
          position: 'right'
        }
      }
    });
  }
}
