import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {StudyService} from '../../services/study.service';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Study} from '../../core/types/study.model';
import {AuthenticationService} from '../../core/authentication/authentication.service';
import {URLService} from '../../services/url.service';
import {HttpGatewayService} from '../../services/http-gateway.service';
import {Observable} from 'rxjs/Observable';
import {StudyState} from './components/study-mentadata-editor.component';

@Component({
  styleUrls: ['./study-management.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <h3>Edit Studies</h3>

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

  constructor(private _url: URLService,
              private _studyService: StudyService,
              private httpGatewayService: HttpGatewayService,
              private _changeDetectorRef: ChangeDetectorRef) {
  }

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
  }

  makeFormGroup(): FormGroup {
    let group: any = {};

    for (let studyId in this.studies) {
      let study = this.studies[studyId];
      group[studyId] = new FormGroup({
        studyId: new FormControl(studyId),
        publicationDate: new FormControl(study._source['*Publication Date']),
        visible: new FormControl(study._source['*Visible'])
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

    const onError = (err, caught) => {
      self.studyState[studyId] = StudyState.Present;
      (<FormGroup>this.form.controls[studyId]).controls['publicationDate'].enable();
      (<FormGroup>this.form.controls[studyId]).controls['visible'].enable();
      self.studySpecificErrorMessage[studyId] = `Error: ${err.statusText}`;
      self._changeDetectorRef.detectChanges();
      return Observable.throw(err);
    };

    this.httpGatewayService.delete(this._url.studyResource(studyId),  onError)
      .subscribe(() => {
        self.studyState[studyId] = StudyState.Deleted;
        self._changeDetectorRef.detectChanges();
      });

    /* $.ajax({
       type: 'DELETE',
       url: this._url.studyResource(studyId),
       headers: this._auth.headers(),
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
     });*/
  }

  saveChanges() {
    let self = this;

    this.savingChanges = true;
    this.saveDone = false;
    this.saveError = '';

    const onError = (err, caught) => {
      self.savingChanges = false;
      self.saveDone = true;
      self.saveError = `Error: ${err.statusText}`;
      self._changeDetectorRef.detectChanges();
      self._studyService.flushCaches();
      return Observable.throw(err);
    };

    this.httpGatewayService.post(self._url.metadataStudiesResource(), JSON.stringify(Object.values(this.form.value).filter((info: { studyId: string }) => self.studyState[info.studyId] == StudyState.Present)), onError)
      .subscribe(() => {
        self.savingChanges = false;
        self.saveDone = true;
        self._changeDetectorRef.detectChanges();
        self._studyService.flushCaches();
      });

    /*$.ajax({
      type: 'POST',
      url: self._url.metadataStudiesResource(),
      headers: this._auth.headers(),
      data: JSON.stringify(Object.values(this.form.value).filter((info: { studyId: string }) =>
      self.studyState[info.studyId] == StudyState.Present)),
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
    });*/
  }
}
