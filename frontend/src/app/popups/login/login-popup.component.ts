import {ChangeDetectorRef, Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {URLService} from '../../services/url.service';
import {AuthenticationService} from '../../services/authentication.service';
import {FiltersService} from '../../services/filters.service';

@Component({
    styleUrls: ['./login-popup.scss'],
    template: `
      <div class="modal-panel noselect">
        <div class="modal-header">
          <div class="title">Login
          </div>
          <span class="close" (click)="onCloseClick()"><i class="fal fa-times"></i></span>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <input type="text" name="user" class="form-control" placeholder="Username" [(ngModel)]="username">
            </div>
            <div class="form-group">
              <input type="password" name="pass" class="form-control" placeholder="Password" [(ngModel)]="password">
            </div>

            <div *ngIf="errorMessage">
              <div class="alert alert-danger">
                {{ errorMessage }}
              </div>
            </div>

            <div class="form-group">
              <input *ngIf="!loggingIn" type="submit" name="login" class="btn btn-primary" (click)="login()"
                     value="Login">
              <input *ngIf=" loggingIn" type="submit" name="login" class="btn btn-primary" disabled value="Logging in...">
            </div>
          </form>
        </div>
      </div>
    `
  }
)
export class LoginPopupComponent {

  username: string;
  password: string;
  errorMessage: string;
  loggingIn: boolean;

  constructor(private _url: URLService,
              private _auth: AuthenticationService,
              private _filtersService: FiltersService,
              private changeDetectorRef: ChangeDetectorRef,
              public activeModal: NgbActiveModal) {
  }

  refresh(): void {
    this.username = '';
    this.password = '';
    this.errorMessage = '';
    this.loggingIn = false;
  }

  login(): void {
    // let self = this;
    //
    // this.loggingIn = true;
    // $.ajax({
    //   type: 'GET',
    //   url: this._url.userResource(this.username),
    //   headers: {
    //     Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`
    //   },
    //   dataType: 'json',
    //   success: (data: GetUserResponse) => {
    //     self._auth.login(this.username, this.password, data.realname);
    //     self._filtersService.pulse();
    //     // TODO@Sam Fix it!
    //     // self.modal.hide();
    //   },
    //   error: () => {
    //     self.errorMessage = 'Login failed!';
    //     self.loggingIn = false;
    //   },
    //   complete: () => {
    //     self.changeDetectorRef.detectChanges();
    //   }
    // })
  }

  public onCloseClick() {
    this.activeModal.close();
  }
}
