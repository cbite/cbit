import {Component} from '@angular/core';
import {URLService} from '../../core/services/url.service';
import {HttpGatewayService} from '../../core/services/http-gateway.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Observable} from 'rxjs/Observable';
import {AuthenticationService} from '../../core/authentication/authentication.service';

@Component({
  selector: 'cbit-change-password',
  styleUrls: ['./change-password.scss'],
  template: `
    <div class="modal-panel noselect">
      <div class="modal-header">
        <div class="title">Change Password for {{username}}
        </div>
        <span class="close" (click)="onCloseClick()"><i class="fal fa-times"></i></span>
      </div>
      <div class="modal-body">
        <form>
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
          <div class="buttons-panel">
            <input type="button" class="button-standard cancel"
                   (click)="onCloseClick()" value="Cancel">
            <input type="submit" name="login" class="button-standard"
                   (click)="changePassword()" value="Submit">
          </div>
        </form>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  password: string;
  passwordConfirmation: string;

  errorMessage: string;
  inProgress: boolean;
  successCallback: any;
  username: string;

  constructor(private _url: URLService,
              private httpGatewayService: HttpGatewayService,
              private authenticationService: AuthenticationService,
              public activeModal: NgbActiveModal) {
  }

  public changePassword(): void {
    if (this.password === '') {
      this.errorMessage = 'Please enter a password.';
    } else if (this.password !== this.passwordConfirmation) {
      this.errorMessage = 'Passwords do not match.  Check your inputs and try again.';
    } else {
      this.errorMessage = '';
      this.inProgress = true;

      const onError = (err, caught) => {
        this.errorMessage = `Changing password failed: ${err.statusText}!`;
        return Observable.throw(err);
      };

      this.httpGatewayService.post(this._url.userResource(this.username), JSON.stringify({
        'newPassword': this.password
      }), onError).subscribe(() => {
        if (this.username === this.authenticationService.getLoggedInUserName()) {
          this.authenticationService.login(this.username, this.password).subscribe(() => {
            this.successCallback();
            this.activeModal.close();
          });
        } else {
          this.successCallback();
          this.activeModal.close();
        }
      });
    }
  }

  public onCloseClick() {
    this.activeModal.close();
  }
}

