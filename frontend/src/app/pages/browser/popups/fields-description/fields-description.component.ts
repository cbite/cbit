import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    styleUrls: ['./fields-description.scss'],
    template: `
      <div class="modal-panel noselect">
        <div class="modal-header">
          <div class="title">Full list of fields
          </div>
          <span class="close" (click)="onCloseClick()"><i class="fal fa-times"></i></span>
        </div>
        <div class="modal-body">
        </div>
      </div>
    `
  }
)
export class FieldsDescriptionComponent {

  public title: string;

  constructor(public activeModal: NgbActiveModal) {
  }

  public onCloseClick() {
    this.activeModal.close();
  }
}
