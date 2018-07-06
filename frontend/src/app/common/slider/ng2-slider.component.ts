/**
 * Created by Targus on 21.03.2016.
 * @author Bogdan Shapoval (targus) <it.targus@gmail.com>
 */

// declare var __moduleName: string, module:any;

import {
  Component,
  Input,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter
} from '@angular/core'

import {HorizontallySlidableDirective} from './horizontally-slidable.directive';

export enum RangeHandle {Start, End, Both}


@Component({
  selector: 'ng2-slider',
  template: `
    <!--<div class="slider-input-block">
      <input type="number"
             id="{{id + '-start-value'}}"
             name="{{id + '-start-value'}}"
             [step]="stepValue"
             [min]="min"
             [max]="max"
             [(ngModel)]="startValueStr"
             (change)="valueChanged($event, 0)"
             #startInput
      />
    </div>
    <div class="slider-input-block">
      <input type="number"
             id="{{id + '-end-value'}}"
             class="slider-input-box"
             name="{{id + '-end-value'}}"
             [step]="stepValue"
             [min]="min"
             [max]="max"
             [(ngModel)]="endValueStr"
             (change)="valueChanged($event, 1)"
             #endInput
      />
    </div>-->
    
    <div class="slider-container">
      <div #ribbon
           id="{{id + '-ribbon'}}"
           class="range-ribbon">
      </div>
      <div #ribbonInRange
           id="{{id + '-ribbon-inrange'}}"
           class="range-ribbon-inrange"
           [style.left.px]="leftPx()"
           [style.width.px]="widthPx()"
           >
      </div>
      <span #start
            horizontallySlidable
            #startHandle="slidable"
            boundElement="{{id + '-ribbon'}}"
            [dynamicRightLimit]="id + '-right-handle'"
            (onStopSliding)="onStopSliding($event, 'start')"
            (onSliding)="onSliding($event, 'start')"
            [id]="id + '-left-handle'"
            [step]="stepX"
            class="slider-handle"
            tabindex="0"
            style="left: 0%;"></span>
      <span #end
            horizontallySlidable
            #endHandle="slidable"
            boundElement="{{id + '-ribbon'}}"
            [dynamicLeftLimit]="id + '-left-handle'"
            (onStopSliding)="onStopSliding($event, 'end')"
            (onSliding)="onSliding($event, 'end')"
            [id]="id + '-right-handle'"
            [step]="stepX"
            class="slider-handle"
            tabindex="0"
            style="left: 100%;"></span>
    </div>
  `,
  styles: [`
    /* Default styles */
    .slider-container {
      position: relative;
      clear: both;
      height: 26px;
      margin-top: 7px;
      margin-bottom: 12px;
    }
    .range-ribbon {
      position: absolute;
      width: 100%;
      height: 10px;
      border: 1px solid #ddd;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      border-radius: 4px;
      background: #eee 50% top repeat-x;
      color: #333;
      top: 4px;
    }
    .range-ribbon-inrange {
      position: absolute;
      width: 100%;
      height: 10px;
      border: 1px solid #ddd;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      border-radius: 4px;
      background: #337ab7 50% top repeat-x;
      color: #333;
      top: 4px;
    }
    .slider-handle {
      box-sizing: content-box;
      position: absolute;
      border: 1px solid #ccc;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      border-radius: 4px;
      background: #f6f6f6 50% 50% repeat-x;
      width: 18px;
      height: 18px;
      box-sizing: border-box;
    }
    .slider-handle.sliding {
      border: 1px solid #fbcb09;
      background: #fdf5ce 50% 50% repeat-x;
    }
    
    /* Spice things up */
    .range-ribbon {
      left: 0%;
      width: 100%;
      height: 4px;
      border: solid 1px;
      position: absolute;
      top: 7px;
    }
    .range-ribbon-inrange {
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Ng2SliderComponent {

  private _min: number;
  private _max: number;
  private _startValue: number;
  private _endValue: number;
  private _stepValue: number;

  @Input() set min(value: number) { this._min = +value; }
  get min(): number { return this._min; }
  @Input() set max(value: number) { this._max = +value; }
  get max(): number { return this._max; }

  @Input() set startValue(value: number) { this._startValue = +value; }
  get startValue(): number { return this._startValue; }
  @Input() set endValue(value: number) { this._endValue = +value; }
  get endValue(): number { return this._endValue; }
  @Input() set stepValue(value: number) { this._stepValue = +value; }
  get stepValue(): number { return this._stepValue; }

  get startValueStr(): string {
    let precision = this.calculatePrecision(this.stepValue)
    return this.startValue.toFixed(precision);
  }
  set startValueStr(value: string) { this.startValue = +value; }
  get endValueStr(): string {
    let precision = this.calculatePrecision(this.stepValue)
    return this.endValue.toFixed(precision);
  }
  set endValueStr(value: string) { this.endValue = +value; }

  @Output() onRangeChanged = new EventEmitter<number[]>();
  @Output() onRangeChanging = new EventEmitter<number[]>();



  private range: Range;
  private id: string;

  @ViewChild('ribbon') ribbon:ElementRef;
  @ViewChild('ribbonInRange') ribbonInRange:ElementRef;
  @ViewChild('startHandle') private startHandle: HorizontallySlidableDirective;
  @ViewChild('endHandle') private endHandle: HorizontallySlidableDirective;

  constructor(
    private CDR:ChangeDetectorRef,
    private _elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.ensureValidConfig();
  }

  ngAfterViewInit() {

    this.ensureValidConfig();

    // If "id" was not set, create it randomly (8 signs)
    if (!this._elementRef.nativeElement.id) {
      this.id = Math.random().toString(36).slice(2, 10);
      this._elementRef.nativeElement.id = this.id;
    } else {
      this.id = this._elementRef.nativeElement.id
    }

    if (this.startHandle) this.valueChanged({}, RangeHandle.Start);
    if (this.endHandle) this.valueChanged({}, RangeHandle.End);
  }

  ngOnChanges() {
    this.ensureValidConfig();
    this.refreshUI();
  }

  ensureValidConfig() {
    if (!this.startValue) this.startValue = this.min;
    if (!this.endValue) this.endValue = this.max;
    if (!this.stepValue) this.stepValue = 1;
    // Ensure that max = min + N * stepValue
    this.max = this.pin(this.max);
  }

  refreshUI() {
    this.CDR.markForCheck();
    this.CDR.detectChanges();

    if (this.startHandle) this.valueChanged({}, RangeHandle.Start);
    if (this.endHandle) this.valueChanged({}, RangeHandle.End);
  }

  // Pin a value to the nearest multiple of `stepValue` above `min`
  pin(value: number): number {
    return this.min + Math.round((value - this.min) / this.stepValue) * this.stepValue;
  }

  refreshInputBoxByPercent(percent: any, handle:RangeHandle) {
    let value = this.pin(this.min + (this.max-this.min)*percent/100);
    switch (handle) {
      case RangeHandle.Start:
        this.startValue = value;
        break;
      case RangeHandle.End:
        this.endValue = value;
        break;
      default:
        break;
    }

    this.CDR.markForCheck();
    this.CDR.detectChanges();

    return value;
  }

  calculatePrecision (x: any) {
    // @ToDo: make precision calculation method
    return 0;
  }

  /**
   * Set new handle position when value was changed in input-box
   * @param handle
   */
  valueChanged(el: any, handle:RangeHandle = RangeHandle.Both) {

    if (handle == RangeHandle.Both || handle == RangeHandle.Start) {

      // Align to grid and ensure value is within range
      this.startValue = Math.max(this.min, Math.min(this.endValue, this.startValue));

      this.startHandle.redraw(this.calculateXFromValue(this.startValue), 0);
    }

    if (handle == RangeHandle.Both || handle == RangeHandle.End) {
      // Align to grid and ensure value is within range
      this.endValue = Math.max(this.startValue, Math.min(this.max, this.endValue));

      this.endHandle.redraw(this.calculateXFromValue(this.endValue), 0);
    }

    this.CDR.markForCheck();
    this.CDR.detectChanges();

  }

  leftPx(): number {
    let zeroLeft = this.ribbonInRange.nativeElement.getBoundingClientRect().left - parseInt(getComputedStyle(this.ribbonInRange.nativeElement).left);
    if (isNaN(zeroLeft)) zeroLeft = 0;
    let result = this.calculateXFromValue(this.startValue) - zeroLeft;
    return result;
  }

  widthPx(): number {
    let result = this.calculateXFromValue(this.endValue) - this.calculateXFromValue(this.startValue);
    return result;
  }

  rangeChangedTrigger() {
    this.onRangeChanged.emit([this.startValue, this.endValue]);
  }

  setStartValue(v: any) {
    this.startValue = v;
    this.valueChanged(RangeHandle.Start);
    this.CDR.detectChanges();
    this.CDR.markForCheck();
  }

  setEndValue(v: any) {
    this.endValue = v;
    this.valueChanged(RangeHandle.End);
    this.CDR.detectChanges();
    this.CDR.markForCheck();
  }

  onStopSliding(relativePercent: number, handleName: string) {
    this.rangeChangedTrigger();
  }

  // Handling 'onsliding' event from SlideAbleDirective
  onSliding(relativePercent: number, handleName: string) {
    var handle = RangeHandle.Both;
    if (handleName === 'start') handle = RangeHandle.Start;
    if (handleName === 'end') handle = RangeHandle.End;
    this.refreshInputBoxByPercent(relativePercent, handle);

    this.onRangeChanging.emit([this.startValue, this.endValue]);
  }

  get stepX(): number {
    let boundingRect = this.ribbon.nativeElement.getBoundingClientRect();
    let result = this.stepValue * (boundingRect.right - boundingRect.left) / (this.max - this.min);
    return result;
  }

  calculateXFromValue(value: number): number {
    let boundingRect = this.ribbon.nativeElement.getBoundingClientRect();
    return boundingRect.left + (boundingRect.right - boundingRect.left) * (value - this.min) / (this.max - this.min);
  }
}
