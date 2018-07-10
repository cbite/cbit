import {Injectable} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LoginPopupComponent} from '../popups/login/login-popup.component';
import {AddUserComponent} from '../popups/add-user/add-user.component';
import {User} from '../pages/user-management/types/User';
import {ChangePasswordComponent} from '../popups/change-password/change-password.component';
import {ConfirmationComponent} from '../popups/confirmation/confirmation.component';
import {StudyDetailsComponent} from '../pages/browser/popups/study-details/study-details.component';
import {Study} from '../core/types/study.model';
import {FieldsDescriptionComponent} from '../pages/browser/popups/fields-description/fields-description.component';

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

  public showStudyDetailsPopup(study: Study) {
    const popupInstance = <StudyDetailsComponent> this.modalService.open(StudyDetailsComponent, {
      backdrop: 'static',
      windowClass: 'large-window'
    }).componentInstance;
    popupInstance.setStudy(study);
  }

  public showFieldDescriptionPopup() {
    const popupInstance = <FieldsDescriptionComponent> this.modalService.open(FieldsDescriptionComponent, {
      backdrop: 'static',
      windowClass: 'small-window'
    }).componentInstance;
  }
}
