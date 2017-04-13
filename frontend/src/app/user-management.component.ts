import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {StudyService} from "./services/study.service";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {Study} from "./common/study.model";
import {AuthenticationService} from "./services/authentication.service";
import {ChangePasswordComponent} from "./change-password.component";
import {ModalDirective} from "ngx-bootstrap";
import {URLService} from "./services/url.service";

enum UserState {
  Present,
  Deleting,
  Deleted
};

interface User {
  username: string,
  realname: string
}

@Component({
  selector: 'user-editor',
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
      
    <div bsModal #changePasswordModal="bs-modal" class="modal fade" role="dialog" (onShow)="changePasswordPopup.refresh()">
      <change-password [modal]="changePasswordModal" [username]="changePasswordUsername"></change-password>
    </div>
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
  @ViewChild("changePasswordModal") changePasswordModal: ModalDirective;

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
    this.changePasswordModal.show();
  }
}


@Component({
  selector: 'add-user',
  template: `
    <div class="modal-dialog">

      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" (click)="modal.hide()">&times;</button>
          <h2 class="modal-title">Add New User</h2>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <input type="text" name="username" class="form-control" placeholder="Username" [(ngModel)]="username">
            </div>
            <div class="form-group">
              <input type="text" name="realname" class="form-control" placeholder="Real Name" [(ngModel)]="realname">
            </div>
            <div class="form-group">
              <input type="password" name="pass1" class="form-control" placeholder="Password" [(ngModel)]="password">
            </div>
            <div class="form-group">
              <input type="password" name="pass2" class="form-control" placeholder="Confirm Password" [(ngModel)]="passwordConfirmation">
            </div>
            
            <div *ngIf="errorMessage">
              <div class="alert alert-danger">
                {{ errorMessage }}
              </div>
            </div>
            
            <div class="form-group">
              <input *ngIf="!adding" type="submit" name="login" class="btn btn-primary" (click)="addUser()" value="Add User">
              <input *ngIf=" adding" type="submit" name="login" class="btn btn-primary" disabled value="Adding User...">
            </div>
				  </form>
        </div>
      </div>

    </div>
  `
})
export class AddUserComponent {
  @Input() modal: ModalDirective;
  username: string;
  realname: string;
  password: string;
  passwordConfirmation: string;

  @Output() userAdded = new EventEmitter<User>();

  errorMessage: string;
  adding: boolean;

  constructor(
    private _url: URLService,
    private _auth: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  refresh(): void {
    this.username = '';
    this.realname = '';
    this.password = '';
    this.passwordConfirmation = '';
    this.errorMessage = '';
    this.adding = false;
  }

  addUser(): void {
    let self = this;

    if (this.password === '') {
      this.errorMessage = 'Please enter a password.';
    } else if (this.password !== this.passwordConfirmation) {
      this.errorMessage = 'Passwords do not match.  Check your inputs and try again.'
    } else {
      this.errorMessage = '';

      this.adding = true;

      // Capture a few variables for success action later
      let addedUserName = this.username;
      let addedRealName = this.realname;

      $.ajax({
        type: 'PUT',
        url: this._url.userResource(this.username),
        headers: this._auth.headers(),
        dataType: 'json',
        data: JSON.stringify({
          "realname": this.realname,
          "password": this.password
        }),
        success: () => {
          self.modal.hide();
          self.userAdded.emit({
            username: addedUserName,
            realname: addedRealName
          });
        },
        error: () => {
          self.errorMessage = 'Failed to add new user!';
          self.adding = false;
        },
        complete: () => {
          self.changeDetectorRef.detectChanges();
        }
      })
    }
  }
}


@Component({
  template: `
  <h2>Manage Users</h2>

  <div *ngIf="!ready">
    Loading...
    <spinner></spinner>
  </div>
  <div *ngIf="ready" class="container">
    <user-editor
      [users]="users"
      [userState]="userState"
      [userSpecificErrorMessage]="userSpecificErrorMessage"
      [form]="form"
      (deleteUser)="deleteUser($event)"
      ></user-editor>
    <div class="row">

      <div class="col-xs-4">
        <button type="submit" class="btn btn-success" (click)="addUserModal.show()">
          <span class="glyphicon glyphicon-plus"></span> Add New User
        </button>
        
        <button type="submit" class="btn btn-primary" (click)="saveChanges()"
          [attr.disabled]="savingChanges || null">
          <span *ngIf="!savingChanges">Save Changes</span>
          <span *ngIf=" savingChanges">Saving Changes...</span>
        </button>
      </div>

      <div class="col-xs-8" *ngIf="!savingChanges && saveDone">
        <div *ngIf=" !saveError" class="alert alert-success" role="alert">Changes saved!</div>
        <div *ngIf="!!saveError" class="alert alert-danger" role="alert">Save failed: {{ saveError }}</div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12">
        <!-- Footer whitespace -->
      </div>
    </div>
  </div>
    
  <div bsModal #addUserModal="bs-modal" class="modal fade" role="dialog" (onShow)="addUserPopup.refresh()">
    <add-user [modal]="addUserModal" (userAdded)="userAdded($event)"></add-user>
  </div>
  `
})
export class UserManagementComponent implements OnInit {
  @ViewChild(AddUserComponent) addUserPopup: AddUserComponent;

  ready = false;
  users: { [username: string]: User } = {};
  userState: { [username: string]: UserState } = {};
  userSpecificErrorMessage: { [username: string]: string } = {};
  form: FormGroup;

  savingChanges = false;
  saveDone = false;
  saveError = '';

  constructor(
    private _url : URLService,
    private _auth : AuthenticationService,
    private _changeDetectorRef : ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    let self = this;

    $.ajax({
      type: 'GET',
      url: this._url.usersResource(),
      headers: this._auth.headers(),
      dataType: 'json',
      success: (userList: User[]) => {
        for (let user of userList) {
          self.users[user.username] = user;
          self.userState[user.username] = UserState.Present;
        }
        self.form = self.makeFormGroup();
        self.ready = true;
        self._changeDetectorRef.detectChanges();
      }
    });
  }

  userAdded(newUserInfo: User) {
    let username = newUserInfo.username;
    this.users = Object.assign(Object.assign({}, this.users), {[username]: newUserInfo});  // Important to create a new object for Angular2 change detection to be triggered
    this.userState[username] = UserState.Present;
    this.form.addControl(username, this.formGroupForUser(newUserInfo));
    this._changeDetectorRef.detectChanges();
  }

  formGroupForUser(user: User): FormGroup {
    return new FormGroup({
      username:        new FormControl(user.username),
      realname:        new FormControl(user.realname)
    });
  }

  makeFormGroup(): FormGroup {
    let group: any = {};

    for (let username in this.users) {
      let user = this.users[username];
      group[username] = this.formGroupForUser(user);
    }
    return new FormGroup(group);
  }

  deleteUser(username: string) {
    let self = this;

    this.userState[username] = UserState.Deleting;
    delete self.userSpecificErrorMessage[username];
    (<FormGroup>this.form.controls[username]).controls['realname'].disable();

    $.ajax({
      type: 'DELETE',
      url: this._url.userResource(username),
      headers: this._auth.headers(),
      contentType: 'application/json',
      success: () => {
        self.userState[username] = UserState.Deleted;
      },
      error: (jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) => {
        self.userState[username] = UserState.Present;
        (<FormGroup>this.form.controls[username]).controls['realname'].enable();
        self.userSpecificErrorMessage[username] = `Error: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}`;
      },
      complete: () => {
        self._changeDetectorRef.detectChanges();
      }
    })
  }

  saveChanges() {
    let self = this;

    this.savingChanges = true;
    this.saveDone = false;
    this.saveError = '';

    $.ajax({
      type: 'POST',
      url: this._url.usersResource(),
      headers: this._auth.headers(),
      data: JSON.stringify(Object.values(this.form.value).filter((info: User) => self.userState[info.username] == UserState.Present)),
      dataType: 'json',
      success: function(response) {
        self.savingChanges = false;
        self.saveDone = true;

        // Update current user's data if logged in
        let curUserNewRealname = (<FormGroup>self.form.controls[self._auth.username]).controls['realname'].value;
        if (curUserNewRealname !== self._auth.realname) {
          self._auth.login(self._auth.username, self._auth.password, curUserNewRealname);
        }

        self._changeDetectorRef.detectChanges();
      },
      error: function(jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) {
        self.savingChanges = false;
        self.saveDone = true;
        self.saveError = `Error: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}`;
        self._changeDetectorRef.detectChanges();
      }
    });
  }
}
