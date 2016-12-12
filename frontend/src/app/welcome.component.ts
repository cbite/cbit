import {Component, ChangeDetectorRef} from '@angular/core';

@Component({
  template: `
    <div>
      Video tutorial of cBiT here...
    
      
      <div class="container">
        <div class="row">
          <div class="col-xs-4">
            <ng2-slider
              min="0"
              max="150"
              startValue="0"
              endValue="150"
              stepValue="10"
              (onRangeChanged)="rangeValueChanged($event)"
              (onRangeChanging)="rangeValueChanging($event)">
            </ng2-slider>
            <p>
              Values (final): {{ startValue }} - {{ endValue }}
            </p>
            <p>
              Values (changing): {{ startValueChanging }} - {{ endValueChanging }}
            </p>
          </div>
        </div>
      </div>
      
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

  startValueChanging: number;
  endValueChanging: number;
  startValue: number;
  endValue: number;

  constructor(
    private _cdr: ChangeDetectorRef
  ) { }

  rangeValueChanging(newRange: number[]) {
    if (this.startValueChanging !== newRange[0] || this.endValueChanging !== newRange[1]) {
      console.log(`Changing: ${JSON.stringify(newRange)}`);
      [this.startValueChanging, this.endValueChanging] = newRange;
      this._cdr.detectChanges();
    }
  }

  rangeValueChanged(newRange: number[]) {
    if (this.startValue !== newRange[0] || this.endValue !== newRange[1]) {
      console.log(`Changed: ${JSON.stringify(newRange)}`);
      [this.startValue, this.endValue] = newRange;
      this._cdr.detectChanges();
    }
  }
}
