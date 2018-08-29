import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Study} from '../../../../core/types/study.model';

export enum StudyState {
  Present,
  Deleting,
  Deleted
}

@Component({
  styleUrls: ['./study-management-list.scss'],
  selector: 'cbit-study-management-list',
  template: `
    <div *ngIf="form" [formGroup]="form">

      <div class="row header">
        <div class="col-4 field">Name</div>
        <div class="col-2 field">Created On</div>
        <div class="col-3 field">ePIC PID</div>
        <div class="col-1 field centered">Visible</div>
        <div class="col-2 field"></div>
      </div>

      <div class="row study" *ngFor="let kv of studies | mapToIterable" [formGroupName]="kv.key">
        <div class="col-4 field" [class.deletedStudyLabel]="isDeleted(kv.key)">
          {{ kv.val._source['STUDY']['Study Title'] }}
          <div *ngIf="studySpecificErrorMessage[kv.key]" class="alert alert-danger">
            {{ studySpecificErrorMessage[kv.key] }}
          </div>
        </div>
        <div class="col-2 field">
          {{kv.val._createdOn | date:'dd-MM-yyyy HH:mm'}}
        </div>
        <div class="col-3 field">
          <input type="text" class="text-input" formControlName="ePicPid"
                 [class.deletedStudyEpicPid]="isDeleted(kv.key)">
        </div>
        <div class="col-1 field centered" style="padding-left: 35px">
          <input type="checkbox" formControlName="visible">
        </div>
        <div class="col-2 field" style="text-align: right;">
          <div *ngIf="!isDeletingStudy(kv.key)">
            <button *ngIf="!isDeleted(kv.key)" class="button-standard small delete" (click)="doDeleteStudy(kv.key)">
              Delete
            </button>
            <button *ngIf=" isDeleted(kv.key)" class="button-standard small delete" disabled="true">Deleted</button>
          </div>
          <div *ngIf=" isDeletingStudy(kv.key)">
            <button class="btn btn-danger" disabled>Deleting...</button>
          </div>
        </div>
      </div>
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
