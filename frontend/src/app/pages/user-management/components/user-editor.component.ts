import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {User, UserState} from '../types/User';

@Component({
  selector: 'cbit-user-editor',
  styleUrls: ['./user-editor.scss'],
  template: `
    <div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>Real name</th>
            <th>Change password?</th>
            <th>Delete?</th>
          </tr>
        </thead>
        <tbody>
            <tr *ngFor="let user of users">
              <td>{{user.username}}</td>
              <td>{{user.realname}}</td>
              <td><button (click)="onChangePwdClicked(user.username)" class="btn btn-primary">
                Change Password</button></td>
              <td><button (click)="onDeleteClicked(user.username)" class="btn btn-danger">
                Delete</button></td>
            </tr>
        </tbody>
      </table>
    </div>
  `
})
export class UserEditorComponent {

  @Input() users: User[];

  @Output() deleteUser = new EventEmitter<string>();

  @Output() changePwd = new EventEmitter<string>();

  public onChangePwdClicked(username) {
    this.changePwd.emit(username);
  }

  public onDeleteClicked(username) {
    this.deleteUser.emit(username);
  }
}
