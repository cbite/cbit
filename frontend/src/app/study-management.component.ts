import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {StudyService} from "./services/study.service";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {Study} from "./common/study.model";

enum StudyState {
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


@Component({
  template: `
  <h2>Edit Studies</h2>

  <div *ngIf="!ready">
    Loading...
    <spinner></spinner>
  </div>
  <div *ngIf="ready" class="container">
    <study-metadata-editor
      [studies]="studies"
      [studyState]="studyState"
      [studySpecificErrorMessage]="studySpecificErrorMessage"
      [form]="form"
      (deleteStudy)="deleteStudy($event)"
      ></study-metadata-editor>
    <div class="row">

      <div class="col-xs-2">
        <button type="submit" class="btn btn-primary" (click)="saveChanges()"
          [attr.disabled]="savingChanges || null">
          <span *ngIf="!savingChanges">Save Changes</span>
          <span *ngIf=" savingChanges">Saving Changes...</span>
        </button>
      </div>

      <div class="col-xs-10" *ngIf="!savingChanges && saveDone">
        <div *ngIf=" !saveError" class="alert alert-success" role="alert">Changes saved!</div>
        <div *ngIf="!!saveError" class="alert alert-danger" role="alert">Save failed: {{ saveError }}</div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12">
        <!-- Footer whitespace -->
      </div>
    </div>
  </div>
  `
})
export class StudyManagementComponent implements OnInit {
  ready = false;
  studies: { [studyId: string]: Study } = {};
  studyState: { [studyId: string]: StudyState } = {};
  studySpecificErrorMessage: { [studyId: string]: string } = {};
  form: FormGroup;

  savingChanges = false;
  saveDone = false;
  saveError = '';

  constructor(
    private _studyService : StudyService,
    private _changeDetectorRef : ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    let self = this;
    this._studyService
      .getAllStudyIds()
      .then(studyIds => {
        return Promise.all(studyIds.map(studyId => this._studyService.getStudy(studyId)));
      })
      .then(studyList => {
        for (let study of studyList) {
          self.studies[study._id] = study;
          self.studyState[study._id] = StudyState.Present;
        }
        self.form = self.makeFormGroup();
        self.ready = true;
        self._changeDetectorRef.detectChanges();
      });
    ;
  }

  makeFormGroup(): FormGroup {
    let group: any = {};

    for (let studyId in this.studies) {
      let study = this.studies[studyId];
      group[studyId] = new FormGroup({
        studyId:         new FormControl(studyId),
        publicationDate: new FormControl(study._source['*Publication Date']),
        visible:         new FormControl(study._source['*Visible'])
      });
    }
    return new FormGroup(group);
  }

  deleteStudy(studyId: string) {
    let self = this;

    this.studyState[studyId] = StudyState.Deleting;
    delete self.studySpecificErrorMessage[studyId];
    (<FormGroup>this.form.controls[studyId]).controls['publicationDate'].disable();
    (<FormGroup>this.form.controls[studyId]).controls['visible'].disable();

    $.ajax({
      type: 'DELETE',
      url: `http://localhost:23456/studies/${studyId}`,
      contentType: 'application/json',
      success: (data: string[]) => {
        self.studyState[studyId] = StudyState.Deleted;
      },
      error: (jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) => {
        self.studyState[studyId] = StudyState.Present;
        (<FormGroup>this.form.controls[studyId]).controls['publicationDate'].enable();
        (<FormGroup>this.form.controls[studyId]).controls['visible'].enable();
        self.studySpecificErrorMessage[studyId] = `Error: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}`;
      },
      complete: () => {
        self._changeDetectorRef.detectChanges();
      }
    })
  }

  saveChanges() {
    let self = this;

    this.savingChanges = true;
    this.saveDone = false;
    this.saveError = '';

    $.ajax({
      type: 'POST',
      url: 'http://localhost:23456/metadata/studies',
      data: JSON.stringify(Object.values(this.form.value)),
      dataType: 'json',
      success: function(response) {
        self.savingChanges = false;
        self.saveDone = true;
        self._changeDetectorRef.detectChanges();
      },
      error: function(jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) {
        self.savingChanges = false;
        self.saveDone = true;
        self.saveError = `Error: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}`;
        self._changeDetectorRef.detectChanges();
      },
      complete: function() {
        // Whatever happened, caches are stale now
        self._studyService.flushCaches();
      }
    });
  }
}
