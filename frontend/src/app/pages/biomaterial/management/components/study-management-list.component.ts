import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Study} from '../../../../core/types/study.model';

export enum StudyState {
  Present,
  Deleting,
  Deleted
};

@Component({
  styleUrls: ['./study-management-list.scss'],
  selector: 'cbit-study-management-list',
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
              <button *ngIf="!isDeleted(kv.key)" class="button-standard delete" (click)="doDeleteStudy(kv.key)">Delete</button>
              <button *ngIf=" isDeleted(kv.key)" class="button-standard delete" disabled="true">Deleted</button>
            </div>
            <div *ngIf=" isDeletingStudy(kv.key)">
              <button class="btn btn-danger" disabled>Deleting...</button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  `
})
export class StudyManagementListComponent {
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
