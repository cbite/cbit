import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Study} from '../../../../core/types/study.model';
import {getTitle} from '../../../../core/util/study-helper';
import {StudyAndSamples, StudyService} from '../../../../core/services/study.service';
import {getDisplayFields, StudyField} from '../../../../core/util/study-display-category-helper';

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
          <h5>Extra Info</h5>
          <ul>
            <li *ngFor="let field of studyFields">
              <b>{{field.label}}:</b>

              <div *ngIf="field.isIsMultiValued()">
                <ol>
                  <li *ngFor="let multiValue of field.value">
                    <ul>
                      <li *ngFor="let itemValue of multiValue | mapToIterable">
                        <i>{{ itemValue.key }}</i>: {{ itemValue.val }}
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div *ngIf="!field.isIsMultiValued()">
                <ul>
                  <li *ngFor="let value of field.value | mapToIterable">
                    <i>{{ value.key }}</i>: {{ value.val }}
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    `
  }
)
export class StudyDetailsComponent {

  public title: string;
  studyFields: StudyField[] = [];

  constructor(public activeModal: NgbActiveModal, private studyService: StudyService) {
  }

  public setStudy(study: Study) {
    this.title = getTitle(study);
    this.studyFields = getDisplayFields(study);
  }

  public onCloseClick() {
    this.activeModal.close();
  };
}
