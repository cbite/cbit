import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {User, UserState} from '../types/User';

@Component({
  selector: 'cbit-user-editor',
  styleUrls: ['./user-editor.scss'],
  template: `
    <div>
      <div class="row header">
        <div class="col-6 field">Username</div>
        <div class="col-2 field">Real name</div>
        <div class="col-4 field"></div>
      </div>

      <div class="row study" *ngFor="let user of users">
        <div class="col-6 field">{{user.username}}</div>
        <div class="col-2 field">{{user.realname}}</div>
        <div class="col-4 field" style="text-align: right;">
          <button (click)="onChangePwdClicked(user.username)" class="button-standard small">
            Change Password
          </button>
          <button (click)="onDeleteClicked(user.username)" class="button-standard small delete">
            Delete
          </button>
        </div>
      </div>
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
