import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FieldMetaService} from '../../../../core/services/field-meta.service';
import {ClassifiedProperties} from '../../../../core/services/study.service';

@Component({
    styleUrls: ['./properties-description.scss'],
    template: `
      <div class="modal-panel noselect">
        <div class="modal-header">
          <div class="title">Full list of properties
          </div>
          <span class="close" (click)="onCloseClick()"><i class="fal fa-times"></i></span>
        </div>
        <div class="modal-body">
            <cbit-properties-visibility title="FILTERS"
                                   [classifiedPropertiesForGivenVisibility]="classifiedProperties['visible'] || {}">
            </cbit-properties-visibility>
        </div>
      </div>
    `
  }
)
export class PropertiesDescriptionComponent {

  public title: string;
  classifiedProperties: ClassifiedProperties = {};

  constructor(public activeModal: NgbActiveModal, private fieldMetaService: FieldMetaService) {
    fieldMetaService.getAllFieldMetas()
      .then(fieldMetas => {
        this.classifiedProperties = this.fieldMetaService.classifyProperties(fieldMetas);
      });
  }

  public onCloseClick() {
    this.activeModal.close();
  }
}
