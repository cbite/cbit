import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {StudyService} from "./services/study.service";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {Study} from "./common/study.model";

// TODO: Refactor this component and the uploader's field-metadata-form into a single metadata editor
@Component({
  selector: 'study-metadata-editor',
  template: `
    <div [formGroup]="_form">
    
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Study Title</th>
            <th>Sorting Date</th>
            <th>Visible</th>
            <th>Delete?</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let kv of studies | mapToIterable" [formGroupName]="kv.key">
            <td [class.deletedStudyLabel]="isDeleted(kv.key)">
              {{ kv.val._source['STUDY']['Study Title'] }}
            </td>
            <td>
              <input type="text" formControlName="sortingDate"
               [attr.disabled]="isDeleted(kv.key)"
               [class.deletedStudySortingDate]="isDeleted(kv.key)">
            </td>
            <td style="align-content: center">
              <input type="checkbox" formControlName="visible"
                [disabled]="isDeleted(kv.key)">
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
    .deletedStudySortingDate {
      text-decoration: line-through;
      background-color: #eee;
      color: #888;
    }
  `]
})
export class StudyMetadataEditorComponent implements OnInit, OnChanges {
  @Input() studies: { [studyId: string]: Study } = {};
  @Input() deletedStudies: { [studyId: string]: boolean } = {};
  deletingStudies: { [studyId: string]: boolean } = {};
  @Output() form = new EventEmitter<FormGroup>();
  @Output() deleteStudy = new EventEmitter<string>();
  _form: FormGroup;

  ngOnInit() {
    this._form = this.makeFormGroup();
    this.form.emit(this._form);
  }

  ngOnChanges() {
    this._form = this.makeFormGroup();
    this.form.emit(this._form);
  }

  isDeleted(studyId: string) {
    return studyId in this.deletedStudies;
  }

  doDeleteStudy(studyId: string) {
    this.deletingStudies[studyId] = true;
    this.deleteStudy.emit(studyId);
  }
  isDeletingStudy(studyId: string) {
    return (studyId in this.deletingStudies) && !(studyId in this.deletedStudies);
  }

  makeFormGroup(): FormGroup {
    let group: any = {};

    for (let studyId in this.studies) {
      let study = this.studies[studyId];
      group[studyId] = new FormGroup({
        sortingDate:   new FormControl('blahblah'),
        visible:       new FormControl(true)
      });
    }
    return new FormGroup(group);
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
      [deletedStudies]="deletedStudies"
      (form)="updateForm($event)"
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
  deletedStudies: { [studyId: string]: boolean } = {};
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
          //self.deletedStudies[study._id] = true;
        }
        self.ready = true;
      });
    ;
  }

  updateForm(form: FormGroup) {
    this.form = form;
  }

  deleteStudy(studyId: string) {
    console.log(`Deleting study ${studyId}`);
  }

  saveChanges() {
    let self = this;

    this.savingChanges = true;
    this.saveDone = false;
    this.saveError = '';

    $.ajax({
      type: 'POST',
      url: 'http://localhost:23456/studies/_multi',
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
    })
  }
}
