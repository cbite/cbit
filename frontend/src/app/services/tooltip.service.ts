// Adapted from ngx-bootstrap's tooltip module, but built to ensure that only one
// tooltip is ever visible at a time

import {ElementRef, Injectable, NgZone, TemplateRef} from "@angular/core";
import {TooltipContainer} from "../common/tooltip-container.component";

@Injectable()
export class TooltipService {

  tooltipContainer: TooltipContainer = null;
  tooltipElementRef: ElementRef;
  targetElementRef: ElementRef;
  placement: string;
  mouseX: number;
  mouseY: number;

  constructor(
    private ngZone: NgZone
  ) {}

  registerTooltipContainer(tooltipContainer: TooltipContainer, tooltipElementRef: ElementRef): void {
    if (this.tooltipContainer !== null) {
      console.log(`Warning, second call to registerContainer.  Old container = ${this.tooltipContainer}, new container = ${tooltipContainer}`);
      return;
    }

    this.tooltipContainer = tooltipContainer;
    this.tooltipElementRef = tooltipElementRef;
    this.targetElementRef = null;

    // Continuously update the position of the tooltip after each run through Angular event loop,
    // and every 100ms regardless to be sure
    this.ngZone.onStable.subscribe(() => this.repositionTooltip());
    setInterval(() => this.repositionTooltip(), 10);

    // Check to hide tooltip when mouse moves out of bounding box (sometimes "mouseleave" events don't fire)
    document.addEventListener("mousemove", (e) => {
      this.mouseX = e.pageX;
      this.mouseY = e.pageY;
    }, true);
    setInterval(() => this.checkMouseInsideTooltipTarget(), 100);
  }

  public showTooltipFor(targetElementRef: ElementRef, templateRef: TemplateRef<any>, placement: string, mousePageX?: number, mousePageY?: number) {
    this.mouseX = mousePageX || this.mouseX;
    this.mouseY = mousePageY || this.mouseY;
    this.targetElementRef = targetElementRef;
    this.placement = placement;
    this.tooltipContainer.show(templateRef, placement);
    this.repositionTooltip();
  }

  public hideTooltipFor(targetElementRef: ElementRef) {
    if (this.targetElementRef === targetElementRef) {
      this.targetElementRef = null;
      this.tooltipContainer.hide();
    }
  }

  private repositionTooltip() {
    if (!!this.targetElementRef) {
      this.doPositionElements(this.targetElementRef.nativeElement, this.tooltipElementRef.nativeElement, this.placement);
    }
  }

  private checkMouseInsideTooltipTarget() {
    if (!!this.targetElementRef) {
      let element = this.targetElementRef.nativeElement;
      let elOffset = this.offset(element);

      //console.log(`x in [${elOffset.left}, ${elOffset.right}], y in [${elOffset.top}, ${elOffset.bottom}].  Current position (${this.mouseX}, ${this.mouseY})`);

      if (!(this.mouseX >= elOffset.left && this.mouseX <= elOffset.right && this.mouseY >= elOffset.top && this.mouseY <= elOffset.bottom)) {
        this.hideTooltipFor(this.targetElementRef);
      }
    }
  }

  public offset(element: HTMLElement): ClientRect {
    const elBcr = element.getBoundingClientRect();
    const viewportOffset = {
      top: window.pageYOffset - document.documentElement.clientTop,
      left: window.pageXOffset - document.documentElement.clientLeft
    };

    let elOffset = {
      height: elBcr.height || element.offsetHeight,
      width: elBcr.width || element.offsetWidth,
      top: elBcr.top + viewportOffset.top,
      bottom: elBcr.bottom + viewportOffset.top,
      left: elBcr.left + viewportOffset.left,
      right: elBcr.right + viewportOffset.left
    };

    return elOffset;
  }

  public positionElements(hostElement: HTMLElement, targetElement: HTMLElement, placement: string):
  ClientRect {
    const hostElPosition = this.offset(hostElement);
    const shiftWidth: any = {
      left: hostElPosition.left,
      center: hostElPosition.left + hostElPosition.width / 2 - targetElement.offsetWidth / 2,
      right: hostElPosition.left + hostElPosition.width
    };
    const shiftHeight: any = {
      top: hostElPosition.top,
      center: hostElPosition.top + hostElPosition.height / 2 - targetElement.offsetHeight / 2,
      bottom: hostElPosition.top + hostElPosition.height
    };
    const targetElBCR = targetElement.getBoundingClientRect();
    const placementPrimary = placement.split(' ')[0] || 'top';
    const placementSecondary = placement.split(' ')[1] || 'center';

    let targetElPosition: ClientRect = {
      height: targetElBCR.height || targetElement.offsetHeight,
      width: targetElBCR.width || targetElement.offsetWidth,
      top: 0,
      bottom: targetElBCR.height || targetElement.offsetHeight,
      left: 0,
      right: targetElBCR.width || targetElement.offsetWidth
    };

    switch (placementPrimary) {
      case 'top':
        targetElPosition.top = hostElPosition.top - targetElement.offsetHeight;
        targetElPosition.bottom += hostElPosition.top - targetElement.offsetHeight;
        targetElPosition.left = shiftWidth[placementSecondary];
        targetElPosition.right += shiftWidth[placementSecondary];
        break;
      case 'bottom':
        targetElPosition.top = shiftHeight[placementPrimary];
        targetElPosition.bottom += shiftHeight[placementPrimary];
        targetElPosition.left = shiftWidth[placementSecondary];
        targetElPosition.right += shiftWidth[placementSecondary];
        break;
      case 'left':
        targetElPosition.top = shiftHeight[placementSecondary];
        targetElPosition.bottom += shiftHeight[placementSecondary];
        targetElPosition.left = hostElPosition.left - targetElement.offsetWidth;
        targetElPosition.right += hostElPosition.left - targetElement.offsetWidth;
        break;
      case 'right':
        targetElPosition.top = shiftHeight[placementSecondary];
        targetElPosition.bottom += shiftHeight[placementSecondary];
        targetElPosition.left = shiftWidth[placementPrimary];
        targetElPosition.right += shiftWidth[placementPrimary];
        break;
    }

    targetElPosition.top = Math.round(targetElPosition.top);
    targetElPosition.bottom = Math.round(targetElPosition.bottom);
    targetElPosition.left = Math.round(targetElPosition.left);
    targetElPosition.right = Math.round(targetElPosition.right);

    return targetElPosition;
  }

  public doPositionElements(
    hostElement: HTMLElement, targetElement: HTMLElement, placement: string): void {
    const pos = this.positionElements(hostElement, targetElement, placement);

    targetElement.style.top = `${pos.top}px`;
    targetElement.style.left = `${pos.left}px`;
  }
}
