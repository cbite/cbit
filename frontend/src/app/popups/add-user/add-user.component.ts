import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {URLService} from '../../services/url.service';
import {HttpGatewayService} from '../../services/http-gateway.service';
import {User} from '../../pages/user-management/types/User';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'cbit-add-user',
  template: `
    <div class="modal-panel noselect">
      <div class="modal-header">
        <div class="title">Add new user
        </div>
        <span class="close" (click)="onCloseClick()"><i class="fal fa-times"></i></span>
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
              <input type="password" name="pass2" class="form-control" placeholder="Confirm Password"
                     [(ngModel)]="passwordConfirmation">
            </div>

            <div *ngIf="errorMessage">
              <div class="alert alert-danger">{{ errorMessage }}</div>
            </div>

            <div class="button-panel">
              <input *ngIf="!loginProgress" type="submit" name="login" class="btn btn-primary" (click)="addUser()"
                     value="Add User">
              <input *ngIf=" loginProgress" type="submit" name="login" class="btn btn-primary" disabled value="Adding User...">
            </div>
          </form>
        </div>
      </div>
  `
})
export class AddUserComponent {

  username: string;
  realname: string;
  password: string;
  passwordConfirmation: string;

  errorMessage: string;
  inProgress: boolean;
  successCallback: any;

  constructor(private _url: URLService,
              private httpGatewayService: HttpGatewayService,
              public activeModal: NgbActiveModal) {
  }

  public refresh(): void {
    this.username = '';
    this.realname = '';
    this.password = '';
    this.passwordConfirmation = '';
    this.errorMessage = '';
    this.inProgress = false;
  }

  public addUser(): void {
    if (this.password === '') {
      this.errorMessage = 'Please enter a password.';
    } else if (this.password !== this.passwordConfirmation) {
      this.errorMessage = 'Passwords do not match.  Check your inputs and try again.';
    } else {
      this.errorMessage = '';
      this.inProgress = true;
      const addedUserName = this.username;
      const addedRealName = this.realname;

      this.httpGatewayService.put(this._url.userResource(this.username), JSON.stringify({
        'realname': this.realname, 'password': this.password})).subscribe(() => {
          this.successCallback();
        });
      this.activeModal.close();
    }
  }

  public onCloseClick() {
    this.activeModal.close();
  }
}

