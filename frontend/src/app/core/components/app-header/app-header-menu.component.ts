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
      <span style="margin-right: 5px">
        <i class="far fa-angle-down"></i></span> {{loggedInUser.displayName}}
      <div class="header-menu" *ngIf="isOpen">
        <div class="header-menu-link" (click)="onMenuClick('upload_study')">Upload Study</div>
        <div class="header-menu-link" (click)="onMenuClick('manage_studies')">Manage Studies</div>
        <div class="header-menu-link" (click)="onMenuClick('edit_metadata')">Edit Field Metadata</div>
        <div class="header-menu-link" (click)="onMenuClick('change_password')">Change Password</div>
        <div class="header-menu-link" (click)="onMenuClick('manage_users')">Manage Users</div>
        <div class="header-menu-link" (click)="onLogoutClick()">Logout</div>
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
