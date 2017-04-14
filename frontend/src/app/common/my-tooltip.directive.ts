import {
  AfterViewInit, Directive, ElementRef, Input, NgZone, OnDestroy, Renderer2, TemplateRef,
  ViewContainerRef
} from "@angular/core";
import {TooltipService} from "../services/tooltip.service";

@Directive({
  selector: "[my-tooltip]"
})
export class MyTooltipDirective implements AfterViewInit, OnDestroy {

  @Input('my-tooltip') public templateRef: TemplateRef<any>;
  @Input() public placement: string = 'right';
  private listeners: Array<() => void> = [];

  public constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private tooltipService: TooltipService
  ) {}

  public ngAfterViewInit(): void {
    this.listeners = [
      this.renderer.listen(this.elementRef.nativeElement, "mouseenter", (event) => this.mouseenter(event)),
      this.renderer.listen(this.elementRef.nativeElement, "mouseleave", (event) => this.mouseleave(event))
    ];
  }

  public ngOnDestroy(): void {
    for (let unsubscribeFn of this.listeners) {
      unsubscribeFn();
    }
    this.hideTooltip();
  }

  private mouseenter(event: any): void {
    this.showTooltip();
  }

  private mouseleave(event: any): void {
    this.hideTooltip();
  }

  private showTooltip() {
    this.tooltipService.showTooltipFor(this.elementRef, this.templateRef, this.placement);
  }

  private hideTooltip() {
    this.tooltipService.hideTooltipFor(this.elementRef);
  }
}
