import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {StudyService} from '../../services/study.service';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Study} from '../../common/study.model';
import {AuthenticationService} from '../../core/authentication/authentication.service';
import {ChangePasswordComponent} from '../../common/components/change-password.component';
// import {ModalDirective} from 'ngx-bootstrap';
import {URLService} from '../../services/url.service';
import {AddUserComponent} from './add-user.component';
import {HttpGatewayService} from '../../services/http-gateway.service';
import {Observable} from 'rxjs/Observable';

@Component({
  template: `
    <h2>Manage Users</h2>

    <div *ngIf="!ready">
      Loading...
      <spinner></spinner>
    </div>
    <div *ngIf="ready" class="container">
      <cbit-user-editor
        [users]="users"
        [userState]="userState"
        [userSpecificErrorMessage]="userSpecificErrorMessage"
        [form]="form"
        (deleteUser)="deleteUser($event)"
      ></cbit-user-editor>
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

    <!--<div bsModal #addUserModal="bs-modal" class="modal fade" role="dialog" (onShow)="addUserPopup.refresh()">-->
    <!--<cbit-add-user [modal]="addUserModal" (userAdded)="userAdded($event)"></cbit-add-user>-->
    <!--</div>-->
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

  constructor(private _url: URLService,
              private httpGatewayService: HttpGatewayService,
              private _changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    const self = this;
    this.httpGatewayService.get(this._url.usersResource()).subscribe((userList: User[]) => {
        for (const user of userList) {
          self.users[user.username] = user;
          self.userState[user.username] = UserState.Present;
        }
        self.form = self.makeFormGroup();
        self.ready = true;
        self._changeDetectorRef.detectChanges();
      }
    );
  }

  userAdded(newUserInfo: User) {
    // const username = newUserInfo.username;
    // this.users = Object.assign(Object.assign({}, this.users), {[username]: newUserInfo});
    // Important to create a new object for Angular2 change detection to be triggered
    // this.userState[username] = UserState.Present;
    // this.form.addControl(username, this.formGroupForUser(newUserInfo));
    // this._changeDetectorRef.detectChanges();
  }

  formGroupForUser(user: User): FormGroup {
    return new FormGroup({
      username: new FormControl(user.username),
      realname: new FormControl(user.realname)
    });
  }

  makeFormGroup(): FormGroup {
    const group: any = {};

    // for (const username in this.users) {
    //   const user = this.users[username];
    //   group[username] = this.formGroupForUser(user);
    // }
    return new FormGroup(group);
  }

  deleteUser(username: string) {
    const self = this;

    this.userState[username] = UserState.Deleting;
    delete self.userSpecificErrorMessage[username];
    (<FormGroup>this.form.controls[username]).controls['realname'].disable();

    const onError = (err, caught) => {
      self.userState[username] = UserState.Present;
      (<FormGroup>this.form.controls[username]).controls['realname'].enable();
      self.userSpecificErrorMessage[username] = `Error: ${err}`;
      self._changeDetectorRef.detectChanges();
      return Observable.of(null);
    };

    this.httpGatewayService.delete(this._url.userResource(username),  onError)
      .subscribe(() => {
        this.userState[username] = UserState.Deleted;
        this._changeDetectorRef.detectChanges();
      });

    /* $.ajax({
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
     });*/
  }

  saveChanges() {
    const self = this;

    this.savingChanges = true;
    this.saveDone = false;
    this.saveError = '';

    // $.ajax({
    //   type: 'POST',
    //   url: this._url.usersResource(),
    //   headers: this._auth.headers(),
    //   data: JSON.stringify(Object.values(this.form.value).filter((info: User) => self.userState[info.username] == UserState.Present)),
    //   dataType: 'json',
    //   success: function(response) {
    //     self.savingChanges = false;
    //     self.saveDone = true;
    //
    //     // Update current user's data if logged in
    //     // const curUserNewRealname = (<FormGroup>self.form.controls[self._auth.username]).controls['realname'].value;
    //     // if (curUserNewRealname !== self._auth.realname) {
    //     //   self._auth.login(self._auth.username, self._auth.password, curUserNewRealname);
    //     // }
    //
    //     self._changeDetectorRef.detectChanges();
    //   },
    //   error: function(jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) {
    //     self.savingChanges = false;
    //     self.saveDone = true;
    //     self.saveError = `Error: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}`;
    //     self._changeDetectorRef.detectChanges();
    //   }
    // });
  }
}

export enum UserState {
  Present,
  Deleting,
  Deleted
}

export interface User {
  username: string;
  realname: string;
}
