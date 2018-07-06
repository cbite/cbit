import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {StudyService} from '../services/study.service';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Study} from '../common/study.model';
import {AuthenticationService} from '../services/authentication.service';
import {ChangePasswordComponent} from '../common/components/change-password.component';
// import {ModalDirective} from 'ngx-bootstrap';
import {URLService} from '../services/url.service';
import {User, UserState} from './user-management.component';

@Component({
  selector: 'cbit-user-editor',
  template: `
    <div *ngIf="form" [formGroup]="form">

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
          <tr *ngFor="let kv of users | mapToIterable" [formGroupName]="kv.key">
            <td [class.deletedUserLabel]="isDeleted(kv.key)">
              {{ kv.key }}
              <div *ngIf="userSpecificErrorMessage[kv.key]" class="alert alert-danger">
                {{ userSpecificErrorMessage[kv.key] }}
              </div>
            </td>
            <td>
              <input type="text" formControlName="realname"
               [class.deletedUserInput]="isDeleted(kv.key)">
            </td>
            <td>
              <button *ngIf="!isDeletingUser(kv.key) && !isDeleted(kv.key)" class="btn btn-primary" (click)="doChangePassword(kv.key)">Change Password</button>
              <button *ngIf=" isDeletingUser(kv.key) ||  isDeleted(kv.key)" class="btn btn-primary" disabled>Change Password</button>
            </td>
            <td>
              <div *ngIf="isCurrentUser(kv.key)">
                <button class="btn btn-danger" disabled>Delete</button>
              </div>
              <div *ngIf="!isCurrentUser(kv.key) && !isDeletingUser(kv.key)">
                <button *ngIf="!isDeleted(kv.key)" class="btn btn-danger" (click)="doDeleteUser(kv.key)">Delete</button>
                <button *ngIf=" isDeleted(kv.key)" class="btn btn-danger" disabled="true">Deleted</button>
              </div>
              <div *ngIf="!isCurrentUser(kv.key) &&  isDeletingUser(kv.key)">
                <button class="btn btn-danger" disabled>Deleting...</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!--<div bsModal #changePasswordModal="bs-modal" class="modal fade" role="dialog" (onShow)="changePasswordPopup.refresh()">-->
      <!--<change-password [modal]="changePasswordModal" [username]="changePasswordUsername"></change-password>-->
    <!--</div>-->
  `,
  styles: [`
    .deletedUserLabel {
      text-decoration: line-through;
    }
    .deletedUserInput {
      text-decoration: line-through;
      background-color: #eee;
      color: #888;
    }
  `]
})
export class UserEditorComponent {
  @Input() users: { [username: string]: User } = {};
  @Input() form: FormGroup;
  @Input() userState: { [username: string]: UserState } = {};
  @Input() userSpecificErrorMessage: { [username: string]: string } = {};

  @Output() deleteUser = new EventEmitter<string>();

  changePasswordUsername: string;
  @ViewChild(ChangePasswordComponent) changePasswordPopup: ChangePasswordComponent;

  //TODO@Sam Fix this!
  // @ViewChild('changePasswordModal') changePasswordModal: ModalDirective;

  constructor(
    private _auth: AuthenticationService
  ) { }

  isDeleted(username: string) {
    return this.userState[username] === UserState.Deleted;
  }

  isCurrentUser(username: string) {
    return username == this._auth.username;
  }

  isDeletingUser(username: string) {
    return this.userState[username] === UserState.Deleting;
  }

  doDeleteUser(username: string) {
    this.deleteUser.emit(username);
  }

  doChangePassword(username: string): void {
    this.changePasswordUsername = username;
    // TODO@Sam Fix it!
    //this.changePasswordModal.show();
  }
}
