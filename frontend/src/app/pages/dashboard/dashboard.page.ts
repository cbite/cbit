import {Component, Input, AfterViewInit} from '@angular/core';
import * as Chart from 'chart.js';

@Component({
  styleUrls: ['./dashboard.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <h4>cBiT Dashboard</h4>
        <div class="dashboard-component">
            <canvas id="myChart" style="height: 200px; width: 400px"></canvas>
        </div>
      </div>
    </div>
  `
})
export class DashboardPage implements AfterViewInit {

  public canvas: any;
  public ctx: any;

  ngAfterViewInit(): void {
    this.canvas = document.getElementById('myChart');
    this.ctx = this.canvas.getContext('2d');
    const myChart = new Chart(this.ctx, {
      type: 'pie',
      data: {
        labels: ['New', 'In Progress', 'On Hold'],
        datasets: [{
          label: '# of Votes',
          data: [1, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false
      }
    });
  }
}
