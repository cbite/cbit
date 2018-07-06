import {Component, ViewContainerRef} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'cbit-app',
  styleUrls: ['app.scss'],
  template: `
    <tooltip-container></tooltip-container>
    <cbit-app-header></cbit-app-header>
      <router-outlet></router-outlet>
    <cbit-app-footer></cbit-app-footer>
  `
})
export class AppComponent {

  // HACK FOR NG2-BOOTSTRAP MODALS!
  // See https://valor-software.com/ngx-bootstrap/#/modals
  constructor(
    private viewContainerRef: ViewContainerRef,
    private _router: Router
  ) {
  }

  isInIntro(): boolean {
    const isExact = true;
    return this._router.isActive('/welcome', isExact) || this._router.isActive('/about', isExact);
  }

  isInBrowser(): boolean {
    const isExact = true;
    return this._router.isActive('/browse', isExact);
  }
}
