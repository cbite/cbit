import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {StudyService} from '../services/study.service';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Study} from '../common/study.model';
import {AuthenticationService} from '../services/authentication.service';
import {ChangePasswordComponent} from '../common/components/change-password.component';
// import {ModalDirective} from 'ngx-bootstrap';
import {URLService} from '../services/url.service';
import {User} from './user-management.component';

@Component({
  selector: 'cbit-add-user',
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
  //TODO@Sam Fix this!
  //@Input() modal: ModalDirective;
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
    const self = this;

    if (this.password === '') {
      this.errorMessage = 'Please enter a password.';
    } else if (this.password !== this.passwordConfirmation) {
      this.errorMessage = 'Passwords do not match.  Check your inputs and try again.';
    } else {
      this.errorMessage = '';

      this.adding = true;

      // Capture a few variables for success action later
      const addedUserName = this.username;
      const addedRealName = this.realname;

      $.ajax({
        type: 'PUT',
        url: this._url.userResource(this.username),
        headers: this._auth.headers(),
        dataType: 'json',
        data: JSON.stringify({
          'realname': this.realname,
          'password': this.password
        }),
        success: () => {
          //TODO@Sam Fix this!
          //self.modal.hide();
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
      });
    }
  }
}

