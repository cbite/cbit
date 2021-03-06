import {Injectable} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LoginPopupComponent} from '../../popups/login/login-popup.component';
import {AddUserComponent} from '../../popups/add-user/add-user.component';
import {ChangePasswordComponent} from '../../popups/change-password/change-password.component';
import {ConfirmationComponent} from '../../popups/confirmation/confirmation.component';
import {Study} from '../types/study.model';
import {PropertiesDescriptionComponent} from '../../pages/biomaterial/browse/popups/properties-description/properties-description.component';

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

  public showAddUserPopup(successCallback: any) {
    const popupInstance = <AddUserComponent> this.modalService.open(AddUserComponent, {
      backdrop: 'static',
      windowClass: 'small-window'
    }).componentInstance;
    popupInstance.successCallback = successCallback;
  }

  public showChangePasswordPoupup(username: string, successCallback: any) {
    const popupInstance = <ChangePasswordComponent> this.modalService.open(ChangePasswordComponent, {
      backdrop: 'static',
      windowClass: 'small-window'
    }).componentInstance;
    popupInstance.username = username;
    popupInstance.successCallback = successCallback;
  }

  public showConfirmationPoupup(confirmationMessage: string, confirmCallback: any,
                                cancelCallback: any = () => {}) {
    const popupInstance = <ConfirmationComponent> this.modalService.open(ConfirmationComponent, {
      backdrop: 'static',
      windowClass: 'small-window'
    }).componentInstance;
    popupInstance.confirmationMessage = confirmationMessage;
    popupInstance.cancelCallback = cancelCallback;
    popupInstance.confirmCallback = confirmCallback;
  }

  public showPropertiesDescriptionPopup() {
    const popupInstance = <PropertiesDescriptionComponent> this.modalService.open(PropertiesDescriptionComponent, {
      backdrop: 'static',
      windowClass: 'medium-window'
    }).componentInstance;
  }
}
