import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import * as Chart from 'chart.js';
import {PieChartData} from './pie-chart.data';
import {borderColors, chartColors} from '../../util/chart.colors';

@Component({
  selector: 'cbit-pie-chart',
  styleUrls: ['../dashboard-component.scss'],
  template: `
    <div class="dashboard-component">
      <div class="title">Biomaterial {{selectedGrouping}} {{comparisonText}}
        <cbit-pie-chart-options [options]="groupingOptions"
                                [selectedOption]="selectedGrouping"
                                (optionsChange)="onGroupingChange($event)">
        </cbit-pie-chart-options>
      </div>
      <div class="content">
        <canvas id="{{chartId}}" class="pie-chart"></canvas>
      </div>
    </div>
  `
})
export class PieChartComponent implements AfterViewInit, OnChanges {

  public canvas: any;
  public ctx: any;

  public groupByStudyOption = 'Studies';
  public groupBySamplesOption = 'Samples';

  public chart: Chart;

  public groupingOptions = [this.groupByStudyOption, this.groupBySamplesOption];
  public selectedGrouping = this.groupingOptions[0];

  @Input()
  public chartId: string;

  @Input()
  public comparisonText: string;

  @Input()
  public chartData: PieChartData;

  @Output()
  public sliceClick = new EventEmitter<string>();

  public ngAfterViewInit(): void {
    this.canvas = document.getElementById(this.chartId);
    this.ctx = this.canvas.getContext('2d');
  }

  public onGroupingChange(grouping: string) {
    this.selectedGrouping = grouping;
    this.updateChart();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.chartData && this.ctx) {
      this.refreshChart();
    }
  }

  public updateChart() {
    const countsData = this.selectedGrouping === this.groupByStudyOption ?
      this.chartData.studiesCounts : this.chartData.samplesCounts;
    this.chart.data.datasets[0].data = countsData;
    this.chart.update();
  }

  public refreshChart() {
    const self = this;
    const countsData = this.selectedGrouping === this.groupByStudyOption ?
      this.chartData.studiesCounts : this.chartData.samplesCounts;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.chart = new Chart(this.ctx, {
      type: 'pie',
      data: {
        labels: this.chartData.labels,
        datasets: [{
          data: countsData,
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      },
      options: {
        onClick: function (e) {
          const point = this.getElementAtEvent(e)[0];
          const pointValue = point._model.label;
          self.sliceClick.emit(pointValue);
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
              return data.labels[tooltipItem.index] + ': ' + data.datasets[0].data[tooltipItem.index];
            }
          }
        }
      }
    });
  }
}
