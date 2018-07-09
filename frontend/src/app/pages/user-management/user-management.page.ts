import {Component, OnInit} from '@angular/core';
import {URLService} from '../../services/url.service';
import {HttpGatewayService} from '../../services/http-gateway.service';
import {User} from './types/User';
import {PopupService} from '../../services/popup.service';

@Component({
  styleUrls: ['./user-management.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <h2>Manage Users</h2>

        <div *ngIf="inProgress">Loading...
          <spinner></spinner>
        </div>
        <div *ngIf="!inProgress" class="container">

          <cbit-user-editor [users]="users"
                            (changePwd)="onChangePwdClicked($event)"
                            (deleteUser)="onDeleteUserClicked($event)">
          </cbit-user-editor>

          <button class="btn btn-success" (click)="onAddUserClicked()">
            <span class="glyphicon glyphicon-plus"></span> Add New User
          </button>

        </div>
      </div>
    </div>
  `
})
export class UserManagementPage implements OnInit {

  public users: User[];
  public inProgress = false;

  constructor(private urlService: URLService,
              private httpGatewayService: HttpGatewayService,
              private popupService: PopupService) {
  }

  public ngOnInit(): void {
    this.refreshList();
  }

  public onChangePwdClicked(username: string) {
    this.popupService.showChangePasswordPoupup(username, this.refreshList.bind(this));
  }

  public onDeleteUserClicked(username: string) {
    this.popupService.showConfirmationPoupup(`Are you sure you want to delete user ${username}?`, () => {
      this.httpGatewayService.delete(this.urlService.userResource(username)).subscribe(() => {
        const index = this.users.findIndex(u => u.username === username);
        this.users.splice(index, 1);
      });
    });
  }

  public refreshList() {
    this.inProgress = true;
    this.httpGatewayService.get(this.urlService.usersResource()).subscribe((users: User[]) => {
      this.users = users;
      this.inProgress = false;
    });
  }

  public onAddUserClicked() {
    this.popupService.showAddUserPopup(this.refreshList.bind(this));
  }
}
