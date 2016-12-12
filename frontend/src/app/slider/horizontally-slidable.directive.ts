/**
 * Angular 2 directive that turn element to slider handle.
 * Created by Targus on 23.03.2016.
 * Last changed: 15.04.2016
 *
 * @version 1.0.4
 * @author Bogdan Shapoval (targus) <it.targus@gmail.com>
 */

import {Directive, Input, Output, Renderer, ElementRef, EventEmitter} from '@angular/core'

export class BoundingRectClass {
  left:number;
  right:number;
  top:number;
  bottom:number;
}

const DEFAULT_SIGNATURES = {
  top: 'parent:top',
  left: 'parent:left',
  bottom: 'parent:bottom',
  right: 'parent:right'
};

@Directive({
  selector: '[horizontallySlidable]',
  host: {
    '(mousedown)': 'slideStart($event)',
    '(touchstart)': 'slideStart($event)'
  },
  exportAs: 'slidable'
})
export class HorizontallySlidableDirective {

  private signatures:any = {
    top: '',
    left: '',
    bottom: '',
    right: ''
  };

  @Input() set boundElement(elementId: any) {
    this.signatures = {
      top:    elementId + ':top',
      bottom: elementId + ':bottom',
      left:   elementId + ':left',
      right:  elementId + ':right'
    }
  };

  // Setting dynamic limits of sliding
  private dynamicLimits:any = {};

  @Input() set dynamicRightLimit(signature:string) {
    this.dynamicLimits.right = signature;
  }

  @Input() set dynamicLeftLimit(signature:string) {
    this.dynamicLimits.left = signature;
  }

  @Input() step: any = 1;

  @Output('onStartSliding') startSlidingEvent = new EventEmitter<number>();
  @Output('onSliding') slidingEvent = new EventEmitter<number>();
  @Output('onStopSliding') stopSlidingEvent = new EventEmitter<number>();

  public boundingRect:BoundingRectClass;
  private dynamicLimitRect:BoundingRectClass;

  constructor(
    private el:ElementRef,
    private renderer: Renderer
  ) { }

  private zeroLeft: any;
  private zeroTop: any;

  // Dummies for callback functions
  public checkXBeforeRedraw: any = null;

  private lastX: any = null;
  private lastY: any = null;

  private scrollPositionX: number;

  ngOnInit() {
    this.dynamicLimitRect = this.dynamicLimitRect || new BoundingRectClass();
  }

  ngAfterViewInit() {
    this.scrollPositionX = window.pageXOffset;
  }

  slideStart(e: any) {

    // deny dragging and selecting
    document.ondragstart = function () {
      return false;
    };
    document.body.onselectstart = function () {
      return false;
    };

    // Calculate dynamic limits every time when sliding was started
    this.calcDynamicLimits();

    function dragProcess(event: any) {
      this.redraw(event.clientX, event.clientY);
    }

    function dragProcessTouch(event: any) {
      var touches = event.changedTouches;
      console.log('Touch');
      for (var i = 0; i < touches.length; i++) {
        if (touches[i].target == this.el.nativeElement) {
          console.log('Redraw');
          this.redraw(touches[i].clientX, touches[i].clientY);
        }
      }
    }

    document.onmousemove = dragProcess.bind(this);
    document.ontouchmove = dragProcessTouch.bind(this);

    document.onmouseup = this.slideStop.bind(this);
    document.ontouchend = this.slideStop.bind(this);


    if (!this.lastY) {
      this.lastY = this.el.nativeElement.getBoundingClientRect().top - parseInt(getComputedStyle(this.el.nativeElement).top) + Math.round(this.el.nativeElement.getBoundingClientRect().height / 2);
      if (isNaN(this.lastY)) this.lastY = Math.round(this.el.nativeElement.getBoundingClientRect().height / 2);
    }

    if (window.pageXOffset != this.scrollPositionX) {
      let delta = window.pageXOffset - this.scrollPositionX;
      if (this.lastX) this.lastX -= delta;
      if (this.zeroLeft) this.zeroLeft -= delta;
      this.scrollPositionX = window.pageXOffset;
    }

    this.lastX = this.el.nativeElement.getBoundingClientRect().left + Math.round(this.el.nativeElement.getBoundingClientRect().width / 2);

    this.boundingRect = new BoundingRectClass();
    this.calcMargins();

    // Change styles
    this.renderer.setElementClass(this.el.nativeElement, 'sliding', true);
    if (this.lastX) {
      this.el.nativeElement.style.left = this.lastX - this.zeroLeft - Math.round(this.el.nativeElement.getBoundingClientRect().width / 2) + 'px';
    }

    this.startSlidingEvent.emit(this.relativePercent());
  }

  /**
   * Move handle and change value in according to coordinate
   *
   * @param x
   * @param y
   * @returns {*}
   */
  redraw(x: any, y: any) {

    // We can't calculate any values that depends from coordinates in ngOnInit, because may be not all page was rendered
    // That's why we calculate these values here
    if (!this.boundingRect) {
      this.boundingRect = new BoundingRectClass();
      this.calcMargins();
    }

    if (window.pageXOffset != this.scrollPositionX) {
      let delta = window.pageXOffset - this.scrollPositionX;
      if (this.lastX) this.lastX -= delta;
      if (this.zeroLeft) this.zeroLeft -= delta;
      this.scrollPositionX = window.pageXOffset;
    }

    if (typeof(this.zeroLeft) === 'undefined') {
      this.zeroLeft = this.el.nativeElement.getBoundingClientRect().left - parseInt(getComputedStyle(this.el.nativeElement).left);
      if (isNaN(this.zeroLeft)) this.zeroLeft = 0;
    }
    if (typeof(this.zeroTop) === 'undefined') {
      this.zeroTop = this.el.nativeElement.getBoundingClientRect().top - parseInt(getComputedStyle(this.el.nativeElement).top);
      if (isNaN(this.zeroTop)) this.zeroTop = 0;
    }

    if (this.lastX) {
      let k = (x - this.lastX) / this.step;
      x = this.lastX + Math.round(k) * this.step;
    }

    if (x - this.boundingRect.left < -0.8) {
      x = this.lastX + Math.ceil((this.boundingRect.left - this.lastX) / this.step) * this.step;
    }
    if (x - this.boundingRect.right > 0.8) {
      x = this.lastX + Math.floor((this.boundingRect.right - this.lastX) / this.step) * this.step;
    }

    if (!!this.dynamicLimitRect.left && x < this.dynamicLimitRect.left) x = this.dynamicLimitRect.left;
    if (!!this.dynamicLimitRect.right && x > this.dynamicLimitRect.right) x = this.dynamicLimitRect.right;

    // Check callback result to make decigion change horisontal position or not
    if ((typeof(this.checkXBeforeRedraw) !== 'function' || this.checkXBeforeRedraw(x, y)) && x != this.lastX) {
      this.el.nativeElement.style.left = x - this.zeroLeft - Math.round(this.el.nativeElement.getBoundingClientRect().width / 2) + 'px';
      this.lastX = x;
    }

    this.slidingEvent.emit(this.relativePercent());
  }

  slideStop(event: any) {
    this.stopSlidingEvent.emit(this.relativePercent());
    document.onmousemove = null;
    document.ontouchmove = null;
    document.onmouseup = null;
    document.ontouchend = null;

    this.renderer.setElementClass(this.el.nativeElement, 'sliding', false);
    var newLeft = this.lastX - this.zeroLeft - Math.round(this.el.nativeElement.getBoundingClientRect().width / 2);
    this.el.nativeElement.style.left = newLeft + 'px';
  }

  relativePercent(): number {
    let realBoundingRect = this.el.nativeElement.getBoundingClientRect();
    return 100 * (realBoundingRect.left + (realBoundingRect.width / 2) - this.boundingRect.left) / (this.boundingRect.right - this.boundingRect.left);
  }

  // Calculating all margins of common sliding area
  calcMargins() {
    for (let idx in Object.assign({}, DEFAULT_SIGNATURES, this.signatures)) {
      let el: any, side: any;
      [el, side] = this.splitSignature(this.signatures[idx]);
      if (!side) {
        if (idx == 'top' || idx == 'bottom') side = 'center-y';
        if (idx == 'left' || idx == 'right') side = 'center-x';
      }
      let result = this.getMargin(el, side);
      this.boundingRect[idx] = result;
    }
  }

  // Calculating dynamic sliding limits
  calcDynamicLimits() {
    for (let idx in this.dynamicLimits) {
      if (!this.dynamicLimits[idx]) continue;
      let el: any, side: any;
      [el, side] = this.splitSignature(this.dynamicLimits[idx]);
      if (!side) {
        if (idx == 'top' || idx == 'bottom') side = 'center-y';
        if (idx == 'left' || idx == 'right') side = 'center-x';
      }
      let result = this.getMargin(el, side);
      this.dynamicLimitRect[idx] = result;
    }
  }

  // Extract from 'element:side' fromat element object and side
  // If element missed or not finded, get parent as element
  splitSignature(signature:string) {
    let tmp = signature.split(':', 2);
    let el: any, side: any;
    side = tmp[1];
    if (tmp[0] == '') {
      el = this.el.nativeElement.parentElement;
    } else {
      el = document.getElementById(tmp[0]);
      if (!el) el = this.el.nativeElement.parentElement;
    }
    el = el || null;
    side = side || null;
    return [el, side];
  }

  // Getting coordinate of certain side (or center) of DOM-element
  getMargin(el: Element, side: string): number {
    let boundingRect = el.getBoundingClientRect();
    let result: any;
    switch (side.toLowerCase()) {
      case 'left':
      case 'right':
      case 'top':
      case 'bottom':
        return boundingRect[side];
      case 'center-x':
        return boundingRect.left + Math.round(boundingRect.width / 2);
      case 'center-y':
        return boundingRect.top + Math.round(boundingRect.height / 2);
      default:
        return undefined;
    }
  }
}
