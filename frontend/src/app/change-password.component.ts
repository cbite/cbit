import {Component, ChangeDetectorRef, OnInit, Input} from "@angular/core";
import {DownloadSelectionService} from "./services/download-selection.service";
import {StudyService} from "./services/study.service";
import {Study} from "./common/study.model";
import {ModalDirective} from "ng2-bootstrap";
import {AuthenticationService} from "./services/authentication.service";
import {FiltersService} from "./services/filters.service";

@Component({
  selector: 'change-password',
  template: `
    <div class="modal-dialog">

      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" (click)="modal.hide()">&times;</button>
          <h2 class="modal-title">Change password for {{ username }}</h2>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <input type="password" name="pass1" class="form-control" placeholder="New Password" [(ngModel)]="password">
            </div>
            <div class="form-group">
              <input type="password" name="pass2" class="form-control" placeholder="Confirm New Password" [(ngModel)]="passwordConfirmation">
            </div>
            
            <div *ngIf="errorMessage">
              <div class="alert alert-danger">
                {{ errorMessage }}
              </div>
            </div>
            
            <div class="form-group">
              <input *ngIf="!changing" type="submit" name="login" class="btn btn-primary" (click)="changePassword()" value="Change Password">
              <input *ngIf=" changing" type="submit" name="login" class="btn btn-primary" disabled value="Changing Password...">
            </div>
				  </form>
        </div>
      </div>

    </div>
  `
})
export class ChangePasswordComponent {
  @Input() modal: ModalDirective;
  @Input() username: string;
  password: string;
  passwordConfirmation: string;
  errorMessage: string;
  changing: boolean;

  constructor(
    private _auth: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  refresh(): void {
    this.password = '';
    this.passwordConfirmation = '';
    this.errorMessage = '';
    this.changing = false;
  }

  changePassword(): void {
    let self = this;

    if (this.password === '') {
      this.errorMessage = 'Please enter a password.';
    } else if (this.password !== this.passwordConfirmation) {
      this.errorMessage = 'Passwords do not match.  Check your inputs and try again.'
    } else {
      this.errorMessage = '';

      this.changing = true;
      $.ajax({
        type: 'POST',
        url: `http://localhost:23456/users/${this.username}`,
        headers: this._auth.headers(),
        dataType: 'json',
        data: JSON.stringify({
          "newPassword": this.password
        }),
        success: () => {
          if (this.username == this._auth.username) {
            self._auth.login(this._auth.username, this.password, this._auth.realname);
          }
          self.modal.hide();
        },
        error: () => {
          self.errorMessage = 'Password change failed!';
          self.changing = false;
        },
        complete: () => {
          self.changeDetectorRef.detectChanges();
        }
      })
    }
  }
}
