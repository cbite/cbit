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
  @Input() set dynamicRightLimit(signature:string) { this.dynamicLimits.right = signature; }
  @Input() set dynamicLeftLimit(signature:string)  { this.dynamicLimits.left  = signature; }

  @Input() step: any = 1;

  @Output('onStartSliding') startSlidingEvent = new EventEmitter<number>();
  @Output('onSliding') slidingEvent = new EventEmitter<number>();
  @Output('onStopSliding') stopSlidingEvent = new EventEmitter<number>();

  constructor(
    private el:ElementRef,
    private renderer: Renderer
  ) { }

  private lastViewportX: number;

  // Convert pixel coordinates (i.e., where (0,0) is the viewport's top-left corner) to local coordinates
  // (i.e., what you can directly set for styles "left" and "top")
  viewportToLocalX(viewportX: number): number {
    let boundingRect = this.el.nativeElement.getBoundingClientRect();
    let computedStyle = getComputedStyle(this.el.nativeElement);

    return viewportX - boundingRect.left + parseInt(computedStyle.left);
  }

  slideStart(e: any) {

    // deny dragging and selecting
    document.ondragstart = () => false;
    document.body.onselectstart = () => false;

    document.onmousemove = (event: any) => { this.redraw(event.clientX, event.clientY, true); }
    document.ontouchmove = (event: any) => {
      var touches = event.changedTouches;
      for (var i = 0; i < touches.length; i++) {
        if (touches[i].target == this.el.nativeElement) {
          this.redraw(touches[i].clientX, touches[i].clientY, true);
        }
      }
    }

    document.onmouseup = (event: any) => { this.slideStop(event); }
    document.ontouchend = (event: any) => { this.slideStop(event); }

    let handleRect = this.recalcHandleRect();
    this.lastViewportX = handleRect.left + Math.round(handleRect.width / 2);

    // Change styles
    this.renderer.setElementClass(this.el.nativeElement, 'sliding', true);

    this.startSlidingEvent.emit(this.relativePercent());
  }

  redraw(viewportX: number, viewportY: number, emit?: boolean) {

    let handleRect = this.recalcHandleRect();
    let slidingDomainRect = this.recalcSlidingDomainRect();
    let dynamicLimitsRect = this.recalcDynamicLimitsRect();

    // Pin viewportX to be an integer multiple of this.step above slidingDomainRect.left, and then definitely within slidingDomainRect
    let minX = dynamicLimitsRect.left || slidingDomainRect.left;
    let maxX = dynamicLimitsRect.right || slidingDomainRect.right;
    let pinnedViewportX = Math.max(minX, Math.min(maxX, this.pin(viewportX, slidingDomainRect)));

    if (pinnedViewportX !== this.lastViewportX) {
      let pinnedLocalX = this.viewportToLocalX(pinnedViewportX);
      this.el.nativeElement.style.left = pinnedLocalX - Math.round(handleRect.width / 2) + 'px';
      this.lastViewportX = pinnedViewportX;

      if (emit) {
        this.slidingEvent.emit(this.relativePercent());
      }
    }
  }

  slideStop(event: any) {
    document.onmousemove = null;
    document.ontouchmove = null;
    document.onmouseup = null;
    document.ontouchend = null;

    this.renderer.setElementClass(this.el.nativeElement, 'sliding', false);

    this.stopSlidingEvent.emit(this.relativePercent());
  }




  pin(viewportX: number, slidingDomainRect: BoundingRectClass): number {
    return Math.round((viewportX - slidingDomainRect.left) / this.step) * this.step + slidingDomainRect.left;
  }

  relativePercent(): number {
    let handleRect = this.recalcHandleRect();
    let slidingDomainRect = this.recalcSlidingDomainRect();
    return Math.min(100, Math.max(0, 100 * (handleRect.left + (handleRect.width / 2) - slidingDomainRect.left) / (slidingDomainRect.right - slidingDomainRect.left)));
  }

  recalcHandleRect(): ClientRect {
    return this.el.nativeElement.getBoundingClientRect();
  }

  recalcSlidingDomainRect(): BoundingRectClass {
    let result = new BoundingRectClass();
    for (let idx in Object.assign({}, DEFAULT_SIGNATURES, this.signatures)) {
      let el: any, side: any;
      [el, side] = this.splitSignature(this.signatures[idx]);
      if (!side) {
        if (idx == 'top' || idx == 'bottom') side = 'center-y';
        if (idx == 'left' || idx == 'right') side = 'center-x';
      }
      let thisResult = this.getElementCoordinate(el, side);
      result[idx] = thisResult;
    }
    return result;
  }

  recalcDynamicLimitsRect(): BoundingRectClass {
    let result = new BoundingRectClass();
    for (let idx in this.dynamicLimits) {
      if (!this.dynamicLimits[idx]) continue;
      let el: any, coordName: any;
      [el, coordName] = this.splitSignature(this.dynamicLimits[idx]);
      if (!coordName) {
        if (idx == 'top' || idx == 'bottom') coordName = 'center-y';
        if (idx == 'left' || idx == 'right') coordName = 'center-x';
      }
      let thisResult = this.getElementCoordinate(el, coordName);
      result[idx] = thisResult;
    }
    return result;
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
  getElementCoordinate(el: Element, coordName: string): number {
    let boundingRect = el.getBoundingClientRect();
    let result: any;
    switch (coordName.toLowerCase()) {
      case 'left':
      case 'right':
      case 'top':
      case 'bottom':
        return boundingRect[coordName];
      case 'center-x':
        return boundingRect.left + Math.round(boundingRect.width / 2);
      case 'center-y':
        return boundingRect.top + Math.round(boundingRect.height / 2);
      default:
        return undefined;
    }
  }
}
