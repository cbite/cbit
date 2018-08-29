import {AfterViewInit, Directive, ElementRef, Input, OnInit, Renderer} from '@angular/core';

@Directive({
    selector: '[cbitFocusOnInit]'
})
export class FocusOnInitDirective implements AfterViewInit {

    constructor(public renderer: Renderer, public elementRef: ElementRef) {
    }

    ngAfterViewInit(): void {
        this.renderer.invokeElementMethod(
            this.elementRef.nativeElement, 'focus', []);
    }
}
