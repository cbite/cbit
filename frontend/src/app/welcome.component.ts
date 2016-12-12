import { Component } from '@angular/core';

@Component({
  template: `
    <div>
      Video tutorial of cBiT here...
    
      <!--
      <div class="container">
        <ng2-slider
          min="0"
          max="150"
          startValue="0"
          endValue="150"
          (onRangeChanged)="rangeValueChanged($event, 'range_3_start', 'range_3_end')">
        </ng2-slider>
        <p class="value-box">
          Values: <span class="value-span" id="range_3_start">0</span> - <span class="value-span" id="range_3_end">150</span>
        </p>
      </div>
      -->
    </div>
  `,
  styles: [`
    .range-ribbon {
      left: 0%;
      width: 100%;
      height: 4px;
      border: solid 1px;
      position: absolute;
      top: 7px;
    }
    .slider-handle {
      width: 8px;
      height: 18px;
      border: solid 1px black;
      position: absolute;
      background-color: #337ab7;
    }
    .slider-handle.sliding {
      width: 2px;
      border: none;
      background-color: #23527c;
    }
    .slider-input-block {
      display: none;
    }
  `]
})
export class WelcomeComponent {
  rangeValueChanged(event: any, start:any, end:any) {
    var start_el = this.getElement(start);
    var end_el = this.getElement(end);
    start_el.innerText = event.startValue;
    end_el.innerText = event.endValue;
  }

  getElement(data:any): any {
    if (typeof(data)=='string') {
      return document.getElementById(data);
    }
    if (typeof(data)=='object' && data instanceof Element) {
      return data;
    }
    return null;
  }
}
