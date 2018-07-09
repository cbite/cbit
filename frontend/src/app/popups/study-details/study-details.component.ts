import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Study} from '../../core/types/study.model';

@Component({
    styleUrls: ['./study-details.scss'],
    template: `
      <div class="modal-panel noselect">
        <div class="modal-header">
          <div class="title">{{study._source.STUDY['Study Title']}}
          </div>
          <span class="close" (click)="onCloseClick()"><i class="fal fa-times"></i></span>
        </div>
        <div class="modal-body">
        </div>
      </div>
    `
  }
)
export class StudyDetailsComponent {

  public study: Study;

  constructor(public activeModal: NgbActiveModal) {
  }

  public onCloseClick() {
    this.activeModal.close();
  }
}
