import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../authentication/authentication.service';
import {PopupService} from '../../../services/popup.service';
import {ApplicationState} from '../../redux/reducers/index';
import {Store} from '@ngrx/store';
import {AppUrls} from '../../../router/app-urls';

@Component({
  selector: 'cbit-app-header',
  styleUrls: ['app-header.scss'],
  template: `
    <div class="header">
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
             routerLinkActive="active"
             routerLink="/faq">FAQ
        </div>
        <div class="header-link"
             routerLinkActive="active"
             routerLink="/browse">Browse
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

  public loggedInUser$ = this.store.select(state => state.application.loggedInUser);

  constructor(private authenticationService: AuthenticationService,
              private store: Store<ApplicationState>,
              private router: Router,
              private popupService: PopupService) {
  }

  public onMenuClick(target) {
    switch (target) {
      case 'upload_study':
        this.router.navigateByUrl(AppUrls.uploadUrl);
        break;
      case 'manage_studie':
        this.router.navigateByUrl(AppUrls.studiesUrl);
        break;
      case 'edit_metadata':
        this.router.navigateByUrl(AppUrls.metadataUrl);
        break;
      case 'change_password':
        this.popupService.showChangePwdPopup();
        break;
      case 'manage_users':
        this.router.navigateByUrl(AppUrls.usersUrl);
        break;
      default:
    }
  }

  public onLogoutClick() {
    this.authenticationService.logout();
    this.router.navigateByUrl(AppUrls.welcomeUrl);
  }

  public onLoginClick() {
    this.popupService.showLoginPopup();
  }
}
