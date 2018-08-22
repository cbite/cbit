import {AfterViewInit, Component} from '@angular/core';
import * as Chart from 'chart.js';

@Component({
  selector: 'cbit-material-class-chart',
  styleUrls: ['./dashboard-component.scss'],
  template: `
    <div class="dashboard-component" style="margin-left: 30px;">
      <div class="title">Biomaterial Studies by Material Class</div>
      <div class="content">
        <canvas id="material-class-chart" class="material-class-chart"></canvas>
      </div>
    </div>
  `
})
export class MaterialClassChartComponent implements AfterViewInit {

  public chartColors = ['rgba(138, 178, 219, 0.5)', 'rgba(89, 197, 162, 0.5)', 'rgba(255, 163, 116, 0.5)', '#726BCA', '#F16D8C'];
  public borderColors = ['rgba(138, 178, 219, 1)', 'rgba(89, 197, 162, 1)', 'rgba(255, 163, 116, 1)'];

  public canvas: any;
  public ctx: any;

  ngAfterViewInit(): void {
    this.canvas = document.getElementById('material-class-chart');
    this.ctx = this.canvas.getContext('2d');
    const materialClassChart = new Chart(this.ctx, {
      type: 'pie',
      data: {
        labels: ['ceramic', 'polymer'],
        datasets: [{
          label: 'Material Class',
          data: [2, 3],
          backgroundColor: [
            this.chartColors[1],
            this.chartColors[0],
          ],
          borderColor: [
            this.borderColors[1],
            this.borderColors[0],
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        legend: {
          position: 'right'
        }
      }
    });
  }
}
