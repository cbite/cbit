import {Injectable} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LoginPopupComponent} from '../popups/login/login-popup.component';

@Injectable()
export class PopupService {

  constructor(private modalService: NgbModal) {
  }

  public showLoginPopup() {
    const popupInstance = <LoginPopupComponent> this.modalService.open(LoginPopupComponent, {
      backdrop: 'static',
      windowClass: 'small-window'
    }).componentInstance;
  }

  public showChangePwdPopup() {
    const popupInstance = <LoginPopupComponent> this.modalService.open(LoginPopupComponent, {
      backdrop: 'static',
      windowClass: 'small-window'
    }).componentInstance;
  }
}
