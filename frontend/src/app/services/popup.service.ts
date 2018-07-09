import {Injectable} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LoginPopupComponent} from '../popups/login/login-popup.component';
import {AddUserComponent} from '../popups/add-user/add-user.component';

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

  public showAddUserPopup(successCallback: any) {
    const popupInstance = <AddUserComponent> this.modalService.open(AddUserComponent, {
      backdrop: 'static',
      windowClass: 'small-window'
    }).componentInstance;
    popupInstance.successCallback = successCallback;
  }
}
