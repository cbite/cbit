import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'cbit-change-password',
  styleUrls: ['./confirmation.scss'],
  template: `
    <div class="modal-panel noselect">
      <div class="modal-header">
        <div class="title">Are you sure?
        </div>
        <span class="close" (click)="onCloseClick()"><i class="fal fa-times"></i></span>
      </div>
      <div class="modal-body">
        <form>
          <div>{{confirmationMessage}}</div>
          <div class="button-panel">
            <input type="submit" name="ok" class="btn btn-primary" (click)="onConfirm()"
                   value="Yes">
            <input type="submit" name="cancel" class="btn btn-secondary" (click)="onCancel()"
                   value="No">
          </div>
        </form>
      </div>
    </div>
  `
})
export class ConfirmationComponent {
  confirmationMessage: string;
  confirmCallback: any;
  cancelCallback: any;

  constructor(public activeModal: NgbActiveModal) {
  }

  public onConfirm(): void {
    this.confirmCallback();
    this.activeModal.close();
  }

  public onCancel(): void {
    this.cancelCallback();
    this.activeModal.close();
  }

  public onCloseClick() {
    this.cancelCallback();
    this.activeModal.close();
  }
}

