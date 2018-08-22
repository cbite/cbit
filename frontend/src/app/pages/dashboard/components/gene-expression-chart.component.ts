import {AfterViewInit, Component} from '@angular/core';
import * as Chart from 'chart.js';

@Component({
  selector: 'cbit-gene-expression-chart',
  styleUrls: ['./dashboard-component.scss'],
  template: `
    <div class="dashboard-component">
      <div class="title">Studies by Gene Expression Type</div>
      <div class="content">
        <canvas id="study-types-chart" class="study-types-chart"></canvas>
      </div>
    </div>

  `
})
export class GeneExpressionChartComponent implements AfterViewInit {

  public chartColors = ['rgba(138, 178, 219, 0.5)', 'rgba(89, 197, 162, 0.5)', 'rgba(255, 163, 116, 0.5)', '#726BCA', '#F16D8C'];
  public borderColors = ['rgba(138, 178, 219, 1)', 'rgba(89, 197, 162, 1)', 'rgba(255, 163, 116, 1)'];

  public canvas: any;
  public ctx: any;

  ngAfterViewInit(): void {
    this.canvas = document.getElementById('study-types-chart');
    this.ctx = this.canvas.getContext('2d');
    const studyTypesChart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: ['Microarray', 'RNA Sequencing'],
        datasets: [{
          label: 'Bio Material',
          data: [7, 12],
          borderWidth: 1,
          backgroundColor: this.chartColors[0],
          borderColor: this.borderColors[0]
        }, {
          label: 'Tendons',
          data: [3, 5],
          borderWidth: 1,
          backgroundColor: this.chartColors[1],
          borderColor: this.borderColors[1]
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
          },
          ],
          yAxes: [{
            type: 'linear',
            ticks: {
              min: 0
            }
          }]
        }
      }
    });
  }
}
