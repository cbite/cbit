import {Component} from '@angular/core';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {AuthenticationService} from '../../authentication/authentication.service';
import {PopupService} from '../../services/popup.service';
import {ApplicationState} from '../../redux/reducers/index';
import {Store} from '@ngrx/store';
import {AppUrls} from '../../../router/app-urls';

@Component({
  selector: 'cbit-app-header',
  styleUrls: ['app-header.scss'],
  template: `
    <div class="header noselect">
      <img src="../../../../assets/images/logo_dark.png" class="logo">
      <div class="header-links">
        <div class="header-link"
             routerLinkActive="active"
             routerLink="/welcome">Welcome
        </div>
        <div class="header-link"
             routerLinkActive="active"
             routerLink="/about">About
        </div>
        <div class="header-link"
             routerLinkActive="people"
             routerLink="/people">People
        </div>
        <div class="header-link"
             routerLinkActive="active"
             routerLink="/faq">FAQ
        </div>
        <div class="header-link studies"
             [class.active]="browseActive"
             (mouseenter)="onMouseEnterCBiT()"
             (mouseleave)="onMouseLeaveCBiT()">
            <div class="link" routerLink="dashboard">Enter cBiT</div>
            <div class="header-submenu" *ngIf="isCBITMenuOpen">
              <div class="header-submenu-link" routerLink="dashboard" (click)="onMouseLeaveCBiT()">
                <i class="fas fa-caret-right" style="margin-right: 10px"></i> Dashboard
              </div>
              <div class="header-submenu-link" routerLink="biomaterial/browse" (click)="onMouseLeaveCBiT()">
                <i class="fas fa-caret-right" style="margin-right: 10px"></i> Bio Material Studies
              </div>
              <div class="header-submenu-link" routerLink="tendons/browse" (click)="onMouseLeaveCBiT()">
                <i class="fas fa-caret-right" style="margin-right: 10px"></i> Tendon Studies
              </div>
            </div>
        </div>
      </div>
      <cbit-app-header-menu
        [loggedInUser]="(loggedInUser$ | async)"
        (loginClick)="onLoginClick()"
        (logoutClick)="onLogoutClick()"
        (menuClick)="onMenuClick($event)">
      </cbit-app-header-menu>
    </div>
  `
})
export class AppHeaderComponent {

  public browseActive = false;
  public isCBITMenuOpen = false;
  public loggedInUser$ = this.store.select(state => state.application.loggedInUser);

  constructor(private authenticationService: AuthenticationService,
              private store: Store<ApplicationState>,
              private router: Router,
              private popupService: PopupService) {

    this.router.events
      .filter(e => e instanceof   NavigationStart)
      .subscribe((event: NavigationStart) => {
        this.browseActive = event.url.includes('browse');
      });
  }

  public onMenuClick(target) {
    switch (target) {
      case 'manage_biomaterial_studies':
        this.router.navigateByUrl(AppUrls.manageBioMaterialStudiesUrl);
        break;
      case 'manage_tendons_studies':
        this.router.navigateByUrl(AppUrls.manageTendonsStudiesUrl);
        break;
     case 'manage_users':
        this.router.navigateByUrl(AppUrls.usersUrl);
        break;
      default:
    }
  }

  public onMouseEnterCBiT() {
    this.isCBITMenuOpen = true;
  }

  public onMouseLeaveCBiT() {
    this.isCBITMenuOpen = false;
  }

  public onLogoutClick() {
    this.authenticationService.logout();
    this.router.navigateByUrl(AppUrls.welcomeUrl);
  }

  public onLoginClick() {
    this.popupService.showLoginPopup();
  }
}
