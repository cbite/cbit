import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import * as Chart from 'chart.js';
import {PieChartData} from './pie-chart.data';
import {borderColors, chartColors} from '../../util/chart.colors';

@Component({
  selector: 'cbit-pie-chart-options',
  styleUrls: ['./pie-chart-options.scss'],
  template: `
      <div class="options"
           (mouseleave)="onMouseLeaveOptions()"
           (mouseenter)="onMouseEnterOptions()">
        {{selectedOption}} <i class="far fa-angle-down"></i>
        <div class="options-panel" *ngIf="isOptionsOpen">
          <div class="option"
               *ngFor="let option of options"
               (click)="onOptionClicked(option)">{{option}}</div>
        </div>
      </div>
  `
})
export class PieChartOptionsComponent {

  @Input()
  public selectedOption: string;
  @Input()
  public options: string[];

  public isOptionsOpen = false;

  @Output()
  public optionsChange = new EventEmitter<string>();

  public onOptionClicked(option: string) {
    this.isOptionsOpen = false;
    this.optionsChange.emit(option);
  }

  public onMouseLeaveOptions() {
    this.isOptionsOpen = false;
  }

  public onMouseEnterOptions() {
    this.isOptionsOpen = true;
  }
}
