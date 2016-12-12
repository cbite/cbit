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
  EventEmitter,
  ViewContainerRef,
  Renderer
} from '@angular/core'

import {SlideAbleDirective, BoundingRectClass, IEventSlideAble} from './slideable.directive';

export enum RangeHandle {Start, End, Both}


@Component({
  selector: 'ng2-slider',
  template: `
    <div class="slider-input-block">
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
    </div>
    
    <div class="slider-container">
      <div #ribbon
           id="{{id + '-ribbon'}}"
           class="range-ribbon">
      </div>
      <span #start
            slideAble
            #startHandler="slideable"
            slideDirection="horisontal"
            boundElement="{{id + '-ribbon'}}"
            [dynamicRightLimit]="id + '-right-handle'"
            (onStopSliding)="onStopSliding($event)"
            (onSliding)="onSliding($event)"
            [id]="id + '-left-handle'"
            [parent]="instance"
            [step]="stepX"
            class="slider-handle"
            tabindex="0"
            style="left: 0%;"></span>
      <span #end
            slideAble
            #endHandler="slideable"
            slideDirection="horisontal"
            boundElement="{{id + '-ribbon'}}"
            [dynamicLeftLimit]="id + '-left-handle'"
            (onStopSliding)="onStopSliding($event)"
            (onSliding)="onSliding($event)"
            [id]="id + '-right-handle'"
            [step]="stepX"
            class="slider-handle"
            tabindex="0"
            style="left: 100%;"></span>
    </div>
  `,
  styles: [`
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

  @Output('onRangeChanged') rangeChangedEvent = new EventEmitter<Ng2SliderComponent>();



  private range: Range;
  private id: string;

  @ViewChild('ribbon') ribbon:ElementRef;
  @ViewChild('startHandler') private startHandler: SlideAbleDirective;
  @ViewChild('endHandler') private endHandler: SlideAbleDirective;

  // Self-instance
  public instance: Ng2SliderComponent;

  private stepX: any;

  constructor(private CDR:ChangeDetectorRef, private _elementRef: ElementRef) {
    // Create self instance as property for comfortable providing it to SlideAble directive
    this.instance = this;
  }

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

    this.range = new Range({
      element: this.ribbon.nativeElement,
      min: this.min,
      max: this.max
    });

    if (this.startHandler) this.valueChanged({}, RangeHandle.Start);
    if (this.endHandler) this.valueChanged({}, RangeHandle.End);

    this.stepX = this.range.calculateStepX(this.stepValue);

  }

  ngOnChanges() {
    this.ensureValidConfig();
  }

  ensureValidConfig() {
    if (!this.startValue) this.startValue = this.min;
    if (!this.endValue) this.endValue = this.max;
    if (!this.stepValue) this.stepValue = 1;
    // Ensure that max = min + N * stepValue
    this.max = this.pin(this.max);
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

    this.CDR.detectChanges();
    this.CDR.markForCheck();

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
      // Affixing start value to the step grid
      this.startValue = this.pin(this.startValue);

      // Check for case when the start value is over the end value
      if (this.startValue > this.endValue) {
        this.startValue = this.pin(this.endValue);
      }

      // Check for case when the start value is under the minimal value
      if (this.startValue < this.min) {
        this.startValue = this.pin(this.min);
      }

      // Force start handle to redrawing
      this.startHandler.redraw(this.range.calculateXFromValue(this.startValue), 0);
    }

    if (handle == RangeHandle.Both || handle == RangeHandle.End) {
      // Affixing end value to the step grid
      this.endValue = this.pin(this.endValue);

      // Check for case when the end value is under the start value
      if (this.startValue > this.endValue) {
        this.endValue = this.pin(this.endValue);
      }

      // Check for case when the end value is over the maximum value
      if (this.endValue > this.max) {
        this.endValue = this.pin(this.max);
      }

      // Force end handle to redrawing
      this.endHandler.redraw(this.range.calculateXFromValue(this.endValue), 0);
    }

    this.CDR.markForCheck();
    this.CDR.detectChanges();

  }

  rangeChangedTrigger() {
    this.rangeChangedEvent.emit(this);
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

  onStopSliding(event: IEventSlideAble) {
    this.rangeChangedTrigger();
  }

  // Handling 'onsliding' event from SlideAbleDirective
  onSliding(event: IEventSlideAble) {
    var handle = RangeHandle.Both;
    if (event.elementId == this.id+'-left-handle') handle = RangeHandle.Start;
    if (event.elementId == this.id+'-right-handle') handle = RangeHandle.End;
    this.refreshInputBoxByPercent(event.relativePercentHorisontal, handle);
  }
}


export class Range {

  private boundingRect:BoundingRectClass;

  constructor(private config:{element:any, min:any, max:any}) {
    if (typeof(this.config.min == 'string')) this.config.min = parseFloat(this.config.min);
    if (typeof(this.config.max == 'string')) this.config.max = parseFloat(this.config.max);
    this.boundingRect = config.element.getBoundingClientRect();
  }

  // Calculate relative handle position (percent) from value
  calculatePercentFromValue(value:number) {
    return Math.round(100 * (value - this.config.min) / (this.config.max - this.config.min));
  }

  calculateXFromValue(value:number) {
    return  this.boundingRect.left +  Math.round((this.boundingRect.right - this.boundingRect.left) * (value - this.config.min) / (this.config.max - this.config.min));
  }

  // Calculate relative handle position (percent) from his position coordinate
  calculatePercentFromX(x:number) {
    return Math.round(100 * (x - this.boundingRect.left) / (this.boundingRect.right - this.boundingRect.left));
  }

  // Calculate value from handle position coordinate
  calculateValueFromX(x:number) {
    return this.config.min + Math.round((this.config.max - this.config.min) * (x - this.boundingRect.left) / (this.boundingRect.right - this.boundingRect.left));
  }

  calculateStepX(step: any) {
    return step * (this.boundingRect.right - this.boundingRect.left) / (this.config.max - this.config.min);
  }


  getLeftX() {
    return this.boundingRect.left;
  }

  getRightX() {
    return this.boundingRect.right;
  }

}
