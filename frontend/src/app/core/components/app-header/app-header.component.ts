import {
  Component, OnInit, animate, transition, style, state, trigger, OnDestroy,
  ChangeDetectorRef, EventEmitter, Output, ViewChild
} from '@angular/core';
import {Router} from '@angular/router';
import {DownloadSelectionService} from '../../../services/download-selection.service';
import {DownloadComponent} from '../../../common/components/download.component';
import {AuthenticationService} from '../../authentication/authentication.service';
import {FiltersService} from '../../../services/filters.service';
import {ChangePasswordComponent} from '../../../common/components/change-password.component';
import {PopupService} from '../../../services/popup.service';
import {ApplicationState} from '../../redux/reducers/index';
import {Store} from '@ngrx/store';

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
      <div class="admin-link" *ngIf="!(loggedInUser$ | async)" (click)="onLoginClick()">
        <span style="margin-right: 5px"><i class="fas fa-lock-alt"></i></span> Admin
      </div>
      <div class="admin-link" *ngIf="(loggedInUser$ | async)">
        {{(loggedInUser$ | async).displayName}}
      </div>
    </div>

    <!--<li *ngIf="isAdmin()" dropdown class="dropdown" [class.active]="isCurrentRoute('/upload') || isCurrentRoute('/studies') || isCurrentRoute('/metadata') || isCurrentRoute('/users')">-->
    <!--<a dropdownToggle>-->
    <!--<span class="glyphicon glyphicon-wrench"></span>-->
    <!--Admin (logged in as {{ getRealname() }})-->
    <!--<span class="caret"></span>-->
    <!--</a>-->

    <!--<ul dropdownMenu class="dropdown-menu">-->
    <!--<li [class.active]="isCurrentRoute('/upload')">-->
    <!--<a routerLink="/upload"  ><span class="glyphicon glyphicon-cloud-upload"></span> Upload Study</a>-->
    <!--</li>-->
    <!--<li [class.active]="isCurrentRoute('/studies')">-->
    <!--<a routerLink="/studies"  ><span class="glyphicon glyphicon-list-alt"></span> Manage Studies</a>-->
    <!--</li>-->
    <!--<li [class.active]="isCurrentRoute('/metadata')">-->
    <!--<a routerLink="/metadata"  ><span class="glyphicon glyphicon-wrench"></span> Edit Field Metadata</a>-->
    <!--</li>-->
    <!--<li role="separator" class="divider"></li>-->
    <!--<li>-->
    <!--<a href="#" (click)="$event.preventDefault(); changePasswordModal.show()"><span class="glyphicon glyphicon-lock"></span> Change Password</a>-->
    <!--</li>-->
    <!--<li [class.active]="isCurrentRoute('/users')">-->
    <!--<a routerLink="/users"  ><span class="glyphicon glyphicon-user"></span> Manage Users</a>-->
    <!--</li>-->
    <!--<li>-->
    <!--<a href="#" (click)="$event.preventDefault(); logout()"><span class="glyphicon glyphicon-log-out"></span> Log out</a>-->
    <!--</li>-->
    <!--</ul>-->
    <!--</li>-->

    <!--<div bsModal #loginModal="bs-modal" class="modal fade" role="dialog" (onShow)="loginPopup.refresh()">-->
    <!--<login [modal]="loginModal"></login>-->
    <!--</div>-->

    <!--<div bsModal #changePasswordModal="bs-modal" class="modal fade" role="dialog" (onShow)="changePasswordPopup.refresh()">-->
    <!--<change-password [modal]="changePasswordModal" [username]="_auth.username"></change-password>-->
    <!--</div>-->

    <!--<div bsModal #downloadModal="bs-modal" class="modal fade" role="dialog" (onShow)="downloadCheckout.refresh()">-->
    <!--<download-checkout [modal]="downloadModal"></download-checkout>-->
  `
})
export class AppHeaderComponent implements OnInit, OnDestroy {

  public loggedInUser$ = this.store.select(state => state.application.loggedInUser);

  constructor(private authenticationService: AuthenticationService,
              private store: Store<ApplicationState>,
              private router: Router,
              private popupService: PopupService) {
  }

  public getAdminName() {
    return this.authenticationService.getAdminName();
  }

  public logout() {
    this.authenticationService.logout();
    this.router.navigate(['/browse']);
  }

  onLoginClick() {
    this.popupService.showLoginPopup();
  }

  // navBarCollapsed = true;
  // isSelectionEmpty = true;
  // stopStream = new Subject<string>();
  // @ViewChild(DownloadComponent) downloadCheckout: DownloadComponent;
  // @ViewChild(ChangePasswordComponent) changePasswordPopup: ChangePasswordComponent;

  ngOnInit(): void {
    // this._downloadSelectionService.selection
    //   .takeUntil(this.stopStream)
    //   .subscribe(selection => {
    //     this.updateDownloadSelectionStats();
    //
    //     // Force Angular2 change detection to see ready = true change.
    //     // Not sure why it's not being picked up automatically
    //     this.changeDetectorRef.detectChanges();
    //   });
  }

  ngOnDestroy() {
    // this.stopStream.next('stop');
  }

  updateDownloadSelectionStats() {
    // const curSelection = this._downloadSelectionService.getSelection();
    // this.isSelectionEmpty = (Object.keys(curSelection.selection).length === 0);
  }

  clearSelection() {
    // this._downloadSelectionService.clearSelection();
  }
}
