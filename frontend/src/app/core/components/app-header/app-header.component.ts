import {
  Component, OnInit, animate, transition, style, state, trigger, OnDestroy,
  ChangeDetectorRef, EventEmitter, Output, ViewChild
} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {DownloadSelectionService} from '../../../services/download-selection.service';
import {DownloadComponent} from '../../../common/components/download.component';
import {AuthenticationService} from '../../../services/authentication.service';
import {LoginComponent} from '../../../common/components/login.component';
import {FiltersService} from '../../../services/filters.service';
import {ChangePasswordComponent} from '../../../common/components/change-password.component';

@Component({
  selector: 'cbit-app-header',
  styleUrls: ['app-header.scss'],
  template: `
    <div class="header">
      <img src="../../../../assets/images/logo_dark.png" class="logo">
      <div class="header-links">
        <div class="header-link"
             routerLinkActive="active" 
             routerLink="/welcome">Welcome</div>
        <div class="header-link" 
             [class.active]="isCurrentRoute('/about')"
             routerLink="/about">About</div>
        <div class="header-link" 
             [class.active]="isCurrentRoute('/faq')"
             routerLink="/faq">FAQ</div>
        <div class="header-link"
             [class.active]="isCurrentRoute('/browse')"
             routerLink="/browse">Browse</div>
      </div>
      <div class="admin-link"><span style="margin-right: 5px"><i class="fas fa-lock-alt"></i></span> Admin</div>
    </div>
      <!--<div class="container-fluid">-->

        <!--<div class="navbar-header">-->
          <!--<button type="button" class="navbar-toggle collapsed" (click)="navBarCollapsed = !navBarCollapsed" aria-controls="navbar">-->
            <!--<span class="sr-only">Toggle navigation</span>-->
            <!--<span class="icon-bar"></span>-->
            <!--<span class="icon-bar"></span>-->
            <!--<span class="icon-bar"></span>-->
          <!--</button>-->
          <!--<a class="navbar-brand" href="#" (click)="$event.preventDefault()">-->
            <!--<img src="../../../../assets/images/cbit_logo.png"></a>-->
        <!--</div>-->

        <!--<div id="navbar" [collapse]="navBarCollapsed" class="navbar-collapse">-->
          <!--<ul class="nav navbar-nav">-->

            <!--<li [class.active]="isCurrentRoute('/welcome')">-->
              <!--<a routerLink="/welcome">Welcome</a>-->
            <!--</li>-->
            <!--<li [class.active]="isCurrentRoute('/about')">-->
              <!--<a routerLink="/about">About</a>-->
            <!--</li>-->
            <!--<li [class.active]="isCurrentRoute('/faw')">-->
              <!--<a routerLink="/faq">FAQ</a>-->
            <!--</li>-->
            <!--<li [class.active]="isCurrentRoute('/browse')">-->
              <!--<a routerLink="/browse"  >Browse</a>-->
            <!--</li>-->

            <!--<li *ngIf="!isAdmin()">-->
              <!--<a href="#" (click)="$event.preventDefault(); loginModal.show()">-->
                <!--<span class="glyphicon glyphicon-lock"></span>-->
                <!--Admin (login required)-->
              <!--</a>-->
            <!--</li>-->

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


          <!--</ul>-->

          <!--<ul class="nav navbar-nav navbar-right">-->

            <!--<li dropdown class="dropdown" [class.selectionLI]="!isSelectionEmpty">-->
              <!--<a dropdownToggle class="selectionLink">-->
                <!--<selection-indicator></selection-indicator>-->
                <!--<span class="caret"></span>-->
              <!--</a>-->

              <!--<ul dropdownMenu class="dropdown-menu">-->
                <!--<li [class.disabled]="isSelectionEmpty">-->
                  <!--<a href="#" (click)="$event.preventDefault(); clearSelection()">-->
                    <!--<span class="glyphicon glyphicon-ban-circle"></span>-->
                    <!--Clear Selection-->
                  <!--</a>-->
                <!--</li>-->

                <!--<li [class.disabled]="isSelectionEmpty">-->
                  <!--<a href="#" (click)="$event.preventDefault(); isSelectionEmpty || downloadModal.show()">-->
                    <!--<span class="glyphicon glyphicon-download-alt"></span>-->
                    <!--Download-->
                  <!--</a>-->
                <!--</li>-->
              <!--</ul>-->
            <!--</li>-->

          <!--</ul>-->
        <!--</div>-->

      <!--</div>-->
    <!--</div>-->

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
  navBarCollapsed = true;
  isSelectionEmpty = true;
  stopStream = new Subject<string>();
  @ViewChild(DownloadComponent) downloadCheckout: DownloadComponent;
  @ViewChild(LoginComponent) loginPopup: LoginComponent;
  @ViewChild(ChangePasswordComponent) changePasswordPopup: ChangePasswordComponent;

  constructor(
    private _auth: AuthenticationService,
    private _downloadSelectionService: DownloadSelectionService,
    private changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _filtersService: FiltersService
  ) { }

  ngOnInit(): void {
    this._downloadSelectionService.selection
      .takeUntil(this.stopStream)
      .subscribe(selection => {
        this.updateDownloadSelectionStats();

        // Force Angular2 change detection to see ready = true change.
        // Not sure why it's not being picked up automatically
        this.changeDetectorRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.stopStream.next('stop');
  }

  isAdmin() {
    return !this._auth.isGuest;
  }

  getRealname() {
    if (this._auth.isGuest) {
      return 'Guest';
    } else {
      return this._auth.realname;
    }
  }

  logout() {
    this._auth.logout();
    this._filtersService.pulse();

    // Go to Browse pane in case we were in an admin-only screen
    this._router.navigate(['/browse']);
  }

  adminRealName() {
    return this._auth.realname;
  }

  updateDownloadSelectionStats() {
    const curSelection = this._downloadSelectionService.getSelection();
    this.isSelectionEmpty = (Object.keys(curSelection.selection).length === 0);
  }

  isCurrentRoute(route: string): boolean {
    return this._router.isActive(route, true);
  }

  clearSelection() {
    this._downloadSelectionService.clearSelection();
  }
}
