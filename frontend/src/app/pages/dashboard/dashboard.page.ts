import {Component, Input, AfterViewInit} from '@angular/core';
import * as Chart from 'chart.js';

@Component({
  styleUrls: ['./dashboard.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <div class="page-title">cBiT Dashboard</div>
        <div class="page-subtitle">BioMaterial Studies | Tendon Studies</div>
        <div>
          <div class="dashboard-component">
            <div class="title">Studies by Gene Expression Type</div>
            <div class="content">
              <canvas id="study-types-chart" class="study-types-chart"></canvas>
            </div>
          </div>
          <div class="dashboard-component" style="margin-left: 30px;">
            <div class="title">Biomaterial Studies by Material Class</div>
            <div class="content">
              <canvas id="material-class-chart" class="material-class-chart"></canvas>
            </div>
          </div>
        </div>
        <div style="margin-top: 30px">
          <div class="dashboard-component">
            <div class="title">Studies by Publication Date</div>
            <div class="content">
              <canvas id="studies-publication-chart" class="studies-publication-chart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardPage implements AfterViewInit {

  public canvas: any;
  public ctx: any;

  public chartColors = ['rgba(138, 178, 219, 0.5)', 'rgba(89, 197, 162, 0.5)', 'rgba(255, 163, 116, 0.5)', '#726BCA', '#F16D8C'];
  public borderColors = ['rgba(138, 178, 219, 1)', 'rgba(89, 197, 162, 1)', 'rgba(255, 163, 116, 1)'];

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

    this.canvas = document.getElementById('studies-publication-chart');
    this.ctx = this.canvas.getContext('2d');
    const studiesPublicationChart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: ['2016', '2017', '2018'],
        datasets: [
          {
            backgroundColor: this.chartColors[0],
            borderColor: this.borderColors[0],
            borderWidth: 1,
            label: '# studies',
            data: [7, 10, 14]
          }
        ]
      },
      options: {
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
        },
        legend: {
          display: false
        }
      }
    });
  }
}
