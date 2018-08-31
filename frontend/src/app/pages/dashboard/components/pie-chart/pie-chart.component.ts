import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import * as Chart from 'chart.js';
import {PieChartData} from './pie-chart.data';
import {borderColors, chartColors} from '../../util/chart.colors';
import {reduceToItems} from './pie-chart-helper';

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

  public countsData = [];
  public labelData = [];

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
    this.prepData();
    this.chart.data.labels = this.labelData;
    this.chart.data.datasets[0].data = this.countsData;
    this.chart.update();
  }

  public prepData() {
    if (this.selectedGrouping === this.groupByStudyOption) {
      const reduced = reduceToItems(this.chartData, 10, this.chartData.studiesCounts);
      this.countsData = reduced.counts;
      this.labelData = reduced.labels;
    } else {
      const reduced = reduceToItems(this.chartData, 10, this.chartData.samplesCounts);
      this.countsData = reduced.counts;
      this.labelData = reduced.labels;
    }
  }

  public refreshChart() {
    const self = this;
    this.prepData();

    this.chart = new Chart(this.ctx, {
      type: 'pie',
      data: {
        labels: this.labelData,
        datasets: [{
          data: this.countsData,
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      },
      options: {
        onClick: function (e) {
          const pointElement = this.getElementAtEvent(e);
          if (pointElement.length>0) {
            const point = pointElement[0];
            const pointValue = point._model.label;
            self.sliceClick.emit(pointValue);
          }
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
