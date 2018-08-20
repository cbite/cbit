import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'cbit-change-password',
  styleUrls: ['./confirmation.scss'],
  template: `
    <div class="modal-panel noselect">
      <div class="modal-body">
        <form>
          <div>{{confirmationMessage}}</div>
          <div class="buttons-panel">
            <input type="submit" name="cancel" class="button-standard small cancel" (click)="onCancel()"
                   value="No">
            <input type="submit" name="ok" class="button-standard small" (click)="onConfirm()"
                   value="Yes">
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

