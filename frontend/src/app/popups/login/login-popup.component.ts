import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthenticationService} from '../../core/authentication/authentication.service';

@Component({
    styleUrls: ['./login-popup.scss'],
    template: `
      <div class="modal-panel noselect">
        <div class="modal-header">
          <div class="title">Access ADMIN Area
          </div>
          <span class="close" (click)="onCloseClick()"><i class="fal fa-times"></i></span>
        </div>
        <div class="modal-body">
          <div *ngIf="errorMessage">
            <div class="alert alert-danger">
              {{ errorMessage }}
            </div>
          </div>
          <form>
            <div class="form-group">
              <input type="text" #usernameInput name="user" class="form-control" placeholder="Username" [(ngModel)]="username">
            </div>
            <div class="form-group">
              <input type="password" name="pass" class="form-control" placeholder="Password" [(ngModel)]="password">
            </div>
            <div class="button-panel">
              <input *ngIf="!loginProgress" type="submit" name="login" class="login" (click)="login()"
                     value="Login">
              <input *ngIf=" loginProgress" type="submit" name="login" class="login" disabled value="Logging in...">
            </div>
          </form>
        </div>
      </div>
    `
  }
)
export class LoginPopupComponent implements AfterViewInit {

  public username: string;
  public password: string;
  public errorMessage: string;
  public loginProgress: boolean;

  @ViewChild('usernameInput')
  private usernameInput;

  constructor(private authenticationService: AuthenticationService,
              public activeModal: NgbActiveModal) {
  }

  public ngAfterViewInit(): void {
    this.usernameInput.nativeElement.focus();
  }

  public refresh(): void {
    this.username = '';
    this.password = '';
    this.errorMessage = '';
    this.loginProgress = false;
  }

  public login(): void {
    this.loginProgress = true;
    this.authenticationService.login(
      this.username,
      this.password).subscribe((success) => {
      this.loginProgress = false;

        if (success) {
          this.activeModal.close();
        } else {
          this.errorMessage = 'Login failed - please try again';
        }
    });
  }

  public onCloseClick() {
    this.activeModal.close();
  }
}
