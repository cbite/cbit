// Adapted from ng2-bootstrap's collapse directive on 23 Nov 2016
// https://github.com/valor-software/ng2-bootstrap/blob/development/components/collapse/collapse.directive.ts
// Commit: 0d4e93b
//
// In the end, I couldn't find a way for Angular2's built-in animation to play nicely with a Directive.
// I resorted to emulating the standard bootstrap collapse plugin via jQuery.  Not the cleanest thing, but it works well!

// Usage (from ng2-bootstrap docs):
//
// - HTML:
//
//   <button type="button" class="btn btn-primary"
//           (click)="isCollapsed = !isCollapsed">
//     Toggle collapse
//   </button>
//   <div (collapsed)="collapsed($event)"
//        (expanded)="expanded($event)"
//        [collapse]="isCollapsed"
//        class="card card-block card-header">
//     <div class="well well-lg">Some content</div>
//   </div>
//
// - TypeScript
//
//   export class CollapseDemoComponent {
//     public isCollapsed:boolean = false;
//
//     public collapsed(event:any):void {
//       console.log(event);
//     }
//
//     public expanded(event:any):void {
//       console.log(event);
//     }
//   }


import { Directive, ElementRef, EventEmitter, HostBinding, Input, Output, Renderer } from '@angular/core';
import * as $ from 'jquery';

enum State {
  Uninitialized,
  Collapsing,
  Collapsed,
  Expanding,
  Expanded
}
const TRANSITION_DURATION = 350;  // ms, see bootstrap/less/component-animations.less

@Directive({selector: '[collapse]'})
export class CollapseDirective {

  private state = State.Uninitialized;
  get isExpandingOrExpanded() { return this.state == State.Expanding || this.state == State.Expanded; }
  get isCollapsedOrCollapsing() { return this.state == State.Collapsing || this.state == State.Collapsed; }

  @Output() public collapsed:EventEmitter<any> = new EventEmitter<any>(false);
  @Output() public expanded:EventEmitter<any> = new EventEmitter<any>(false);

  private jqElem: JQuery;
  public constructor(private _el:ElementRef, private _renderer:Renderer) {
    this.jqElem = $(this._el.nativeElement);
  }

  @Input()
  public set collapse(shouldBeCollapsed:boolean) {
    if (this.state != State.Uninitialized) {

      if (shouldBeCollapsed) {
        this.hide();
      } else {
        this.show();
      }

    } else {

      this.state = (shouldBeCollapsed ? State.Collapsed : State.Expanded);

      this.jqElem.removeClass("collapse collapsing in");
      if (shouldBeCollapsed) {
        this.jqElem.addClass("collapse");
      } else {
        this.jqElem.addClass("collapse in").height(this.jqElem[0].scrollHeight);;
      }

    }
  }

  public get collapse():boolean {
    return this.isCollapsedOrCollapsing;
  }

  public hide():void {
    let that = this;
    if (this.isExpandingOrExpanded) {

      this.state = State.Collapsing;
      this.jqElem.removeClass('collapse in').addClass('collapsing').height(0);

      setTimeout(function() {
        if (that.state == State.Collapsing) {
          that.state = State.Collapsed;
          that.jqElem.removeClass('collapsing').addClass('collapse');
          that.collapsed.emit(this);
        }
      }, TRANSITION_DURATION);
    }
  }

  public show():void {
    let that = this;
    if (this.isCollapsedOrCollapsing) {

      this.state = State.Expanding;
      this.jqElem.removeClass('collapse in').addClass('collapsing').height(this.jqElem[0].scrollHeight);

      setTimeout(function() {
        if (that.state == State.Expanding) {
          that.state = State.Expanded;
          that.jqElem.removeClass('collapsing').addClass('collapse in');
          that.expanded.emit(this);
        }
      }, TRANSITION_DURATION);
    }
  }
}
