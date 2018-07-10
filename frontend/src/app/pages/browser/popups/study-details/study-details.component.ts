import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Study} from '../../../../core/types/study.model';
import {getTitle} from '../../../../core/util/study-helper';

@Component({
    styleUrls: ['./study-details.scss'],
    template: `
      <div class="modal-panel noselect">
        <div class="modal-header">
          <div class="title">{{title}}
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

  public title: string;

  constructor(public activeModal: NgbActiveModal) {
  }

  public setStudy(study: Study) {
    this.title = getTitle(study);
  }

  public onCloseClick() {
    this.activeModal.close();
  }
}
