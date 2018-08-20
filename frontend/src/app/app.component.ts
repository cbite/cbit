import {Component, ViewContainerRef} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from '../environments/environment';
import {GoogleAnalyticsService} from './services/google-analytics.service';
import {ApplicationState} from './core/redux/reducers';
import {Store} from '@ngrx/store';

@Component({
  selector: 'cbit-app',
  styleUrls: ['app.scss'],
  template: `
    <tooltip-container></tooltip-container>
    <cbit-app-header></cbit-app-header>
    <router-outlet></router-outlet>
    <cbit-app-footer></cbit-app-footer>
    <div [hidden]="!(showLoader$|async)" class="loader-overlay">
      <cbit-page-spinner class="loader"></cbit-page-spinner>
    </div>
  `
})
export class AppComponent {
  public showLoader$ = this.store.select(state => state.application.showLoader);
  // HACK FOR NG2-BOOTSTRAP MODALS!
  // See https://valor-software.com/ngx-bootstrap/#/modals
  constructor(
    private viewContainerRef: ViewContainerRef,
    private _router: Router,
    private googleAnalyticsService: GoogleAnalyticsService,
    private store: Store<ApplicationState>
  ) {
    this.appendGaTrackingCode();
  }

  private appendGaTrackingCode() {
    try {
      const script = document.createElement('script');
      script.innerHTML = `
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', '` + environment.googleAnalyticsTrackingId + `', 'auto');
      `;
      document.head.appendChild(script);
    } catch (ex) {
      console.error('Error appending google analytics');
      console.error(ex);
    }
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
