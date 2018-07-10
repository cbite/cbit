import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {StudyService} from '../../../core/services/study.service';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Study} from '../../../core/types/study.model';
import {AuthenticationService} from '../../../core/authentication/authentication.service';
import {URLService} from '../../../core/services/url.service';
import {HttpGatewayService} from '../../../core/services/http-gateway.service';
import {Observable} from 'rxjs/Observable';

export enum StudyState {
  Present,
  Deleting,
  Deleted
};

// TODO: Refactor this component and the uploader's field-metadata-form into a single metadata editor
@Component({
  selector: 'study-metadata-editor',
  template: `
    <div *ngIf="form" [formGroup]="form">

      <table class="table table-striped">
        <thead>
        <tr>
          <th>Study Title</th>
          <th>Publication Date</th>
          <th>Visible</th>
          <th>Delete?</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let kv of studies | mapToIterable" [formGroupName]="kv.key">
          <td [class.deletedStudyLabel]="isDeleted(kv.key)">
            {{ kv.val._source['STUDY']['Study Title'] }}
            <div *ngIf="studySpecificErrorMessage[kv.key]" class="alert alert-danger">
              {{ studySpecificErrorMessage[kv.key] }}
            </div>
          </td>
          <td>
            <input type="text" formControlName="publicationDate"
                   [class.deletedStudyPublicationDate]="isDeleted(kv.key)">
          </td>
          <td style="align-content: center">
            <input type="checkbox" formControlName="visible">
          </td>
          <td>
            <div *ngIf="!isDeletingStudy(kv.key)">
              <button *ngIf="!isDeleted(kv.key)" class="btn btn-danger" (click)="doDeleteStudy(kv.key)">Delete</button>
              <button *ngIf=" isDeleted(kv.key)" class="btn btn-danger" disabled="true">Deleted</button>
            </div>
            <div *ngIf=" isDeletingStudy(kv.key)">
              <button class="btn btn-danger" disabled>Deleting...</button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .deletedStudyLabel {
      text-decoration: line-through;
    }

    .deletedStudyPublicationDate {
      text-decoration: line-through;
      background-color: #eee;
      color: #888;
    }
  `]
})
export class StudyMetadataEditorComponent {
  @Input() studies: { [studyId: string]: Study } = {};
  @Input() form: FormGroup;
  @Input() studyState: { [studyId: string]: StudyState } = {};
  @Input() studySpecificErrorMessage: { [studyId: string]: string } = {};

  @Output() deleteStudy = new EventEmitter<string>();

  isDeleted(studyId: string) {
    return this.studyState[studyId] === StudyState.Deleted;
  }

  isDeletingStudy(studyId: string) {
    return this.studyState[studyId] === StudyState.Deleting;
  }

  doDeleteStudy(studyId: string) {
    this.deleteStudy.emit(studyId);
  }
}
