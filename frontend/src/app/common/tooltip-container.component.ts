import {Component, ElementRef, TemplateRef, ViewChild, ViewContainerRef} from "@angular/core";
import {TooltipService} from "../services/tooltip.service";

@Component({
  selector: "tooltip-container",
  template: `
    <div [style.display]="shown ? 'block' : 'none'">
      <div class="tooltip-arrow"></div>
      <div class="tooltip-inner"><div #container></div></div>
    </div>
  `,
  host: {
    '[class]': '"tooltip in tooltip-" + placement + " " + placement'
  }
})
export class TooltipContainer {
  @ViewChild('container', { read: ViewContainerRef }) _vcr: ViewContainerRef;
  shown: boolean = false;
  placement: string;

  constructor(
    private tooltipService: TooltipService,
    private tooltipElementRef: ElementRef
  ) {
    this.tooltipService.registerTooltipContainer(this, tooltipElementRef);
  }

  public show(templateRef: TemplateRef<any>, placement: string) {
    this.shown = true;
    this.placement = placement;
    this._vcr.clear();
    this._vcr.createEmbeddedView(templateRef);
  }

  public hide() {
    this.shown = false;
    this._vcr.clear();
  }
}
