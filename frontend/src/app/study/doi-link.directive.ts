import {Input, Directive, HostBinding} from '@angular/core';

@Directive({
  selector: '[doi-link]'
})
export class DOILinkDirective {
  @Input() doi: string
  @HostBinding('href')
  get href(): string { return `https://dx.doi.org/${this.doi}`; }
}
