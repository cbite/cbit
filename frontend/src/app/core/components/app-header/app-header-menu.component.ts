import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LoggedInUser} from '../../authentication/loggedInUser';

@Component({
  selector: 'cbit-app-header-menu',
  styleUrls: ['app-header-menu.scss'],
  template: `
    <div class="admin-link" *ngIf="!loggedInUser" (click)="onLoginClick()">
      <span style="margin-right: 5px">
        <i class="fas fa-lock-alt"></i></span> Admin
    </div>
    <div class="admin-link menu" *ngIf="loggedInUser"
         (mouseenter)="onMouseEnter()"
         (mouseleave)="onMouseLeave()">
      <div>
        <div class="icon"><i class="far fa-angle-down"></i></div>
        <div class="label">{{loggedInUser.displayName}}</div>
      </div>
      <div class="header-menu" *ngIf="isOpen">
        <div class="header-menu-link" (click)="onMenuClick('upload_study')">
          <div class="icon"><i class="far fa-upload"></i></div>
          <div class="label">Upload Study</div>
        </div>
        <div class="header-menu-link" (click)="onMenuClick('manage_studies')">
          <div class="icon"><i class="far fa-edit"></i></div>
          <div class="label">Manage Studies</div>
        </div>
        <div class="header-menu-link" (click)="onMenuClick('edit_metadata')">
          <div class="icon"><i class="far fa-edit"></i></div>
          <div class="label">Edit Field Labels</div>
        </div>
        <div class="header-menu-link" (click)="onMenuClick('manage_tendons_studies')">
          <div class="icon"><i class="far fa-edit"></i></div>
          <div class="label">Tendons Studies</div>
        </div>
        <div class="header-menu-link" (click)="onMenuClick('manage_users')">
          <div class="icon"><i class="far fa-users"></i></div>
          <div class="label">Manage Users</div>
        </div>
        <div class="header-menu-link" (click)="onLogoutClick()">
          <div class="icon"><i class="far fa-sign-out"></i></div>
          <div class="label">Logout</div>
        </div>
      </div>
    </div>
  `
})
export class AppHeaderMenuComponent {

  @Input()
  public loggedInUser: LoggedInUser;

  @Output()
  public loginClick = new EventEmitter();

  @Output()
  public logoutClick = new EventEmitter();

  @Output()
  public menuClick = new EventEmitter();

  public isOpen = false;

  public onLoginClick() {
    this.loginClick.emit();
  }

  public onLogoutClick() {
    this.logoutClick.emit();
  }

  public onMouseEnter() {
    this.isOpen = true;
  }

  public onMouseLeave() {
    this.isOpen = false;
  }

  public onMenuClick(target) {
    this.menuClick.emit(target);
  }
}
