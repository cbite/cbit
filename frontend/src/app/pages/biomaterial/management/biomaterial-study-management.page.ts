import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {StudyService} from '../../../core/services/study.service';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Study} from '../../../core/types/study.model';
import {URLService} from '../../../core/services/url.service';
import {HttpGatewayService} from '../../../core/services/http-gateway.service';
import {Observable} from 'rxjs/Observable';
import {PopupService} from '../../../core/services/popup.service';
import {Router} from '@angular/router';
import {AppUrls} from '../../../router/app-urls';
import {StudyState} from './components/study-management-list.component';

@Component({
  styleUrls: ['./biomaterial-study-management.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <div class="page-title">
          Biomaterial Studies
        </div>

        <div *ngIf="!ready">
          Loading...
          <spinner></spinner>
        </div>

        <div *ngIf="ready" class="container">

          <cbit-study-management-list
            [studies]="studies"
            [studyState]="studyState"
            [studySpecificErrorMessage]="studySpecificErrorMessage"
            [form]="form"
            (deleteStudy)="deleteStudy($event)">
          </cbit-study-management-list>

          <div class="row" style="margin-top: 30px;">
            <div class="col-2">
              <button type="submit" class="button-standard" (click)="saveChanges()"
                      [attr.disabled]="savingChanges || null">
                <span *ngIf="!savingChanges">Save Changes</span>
                <span *ngIf=" savingChanges">Saving Changes...</span>
              </button>
            </div>
            <div class="col-6">
              <ng-container *ngIf="!savingChanges && saveDone">
                <div *ngIf=" !saveError" class="alert alert-success" role="alert">Changes saved!</div>
                <div *ngIf="!!saveError" class="alert alert-danger" role="alert">Save failed: {{ saveError }}</div>
              </ng-container>
            </div>
            <div class="col-4" style="text-align: right">
              <button class="button-standard" (click)="onAddNewStudy()">New Study</button>
              <button class="button-standard" (click)="onEditMetaFields()">Edit Metadata</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BioMaterialStudyManagementPage implements OnInit {
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
              private popupService: PopupService,
              private _changeDetectorRef: ChangeDetectorRef,
              private router: Router) {
  }

  public ngOnInit(): void {
    const self = this;
    this._studyService
      .getAllStudyIds()
      .then(studyIds => {
        return Promise.all(studyIds.map(studyId => this._studyService.getStudy(studyId)));
      })
      .then(studyList => {
        for (const study of studyList) {
          self.studies[study._id] = study;
          self.studyState[study._id] = StudyState.Present;
        }
        self.form = self.makeFormGroup();
        self.ready = true;
        self._changeDetectorRef.detectChanges();
      });
  }

  public onAddNewStudy() {
    this.router.navigateByUrl(AppUrls.newBioMaterialStudyUrl);
  }

  public onEditMetaFields() {
    this.router.navigateByUrl(AppUrls.bioMaterialMetadataUrl);
  }

  public makeFormGroup(): FormGroup {
    const group: any = {};

    for (const studyId in this.studies) {
      const study = this.studies[studyId];
      group[studyId] = new FormGroup({
        studyId: new FormControl(studyId),
        publicationDate: new FormControl(study._source['*Publication Date']),
        visible: new FormControl(study._source['*Visible'])
      });
    }
    return new FormGroup(group);
  }

  deleteStudy(studyId: string) {
    this.popupService.showConfirmationPoupup(`Are you sure you want to delete study ${studyId}?`, () => {
      const onError = (err, caught) => {
        this.studyState[studyId] = StudyState.Present;
        (<FormGroup>this.form.controls[studyId]).controls['publicationDate'].enable();
        (<FormGroup>this.form.controls[studyId]).controls['visible'].enable();
        this.studySpecificErrorMessage[studyId] = `Error: ${err.statusText}`;
        this._changeDetectorRef.detectChanges();
        return Observable.throw(err);
      };

      this.httpGatewayService.delete(this._url.studyResource(studyId), onError)
        .subscribe(() => {
          this.studyState[studyId] = StudyState.Deleted;
          delete this.studySpecificErrorMessage[studyId];
          (<FormGroup>this.form.controls[studyId]).controls['publicationDate'].disable();
          (<FormGroup>this.form.controls[studyId]).controls['visible'].disable();
          this._changeDetectorRef.detectChanges();
        });
    });
  }

  public saveChanges() {
    const self = this;

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

    this.httpGatewayService.post(self._url.metadataStudiesResource(),
      JSON.stringify(Object.values(this.form.value).filter(
        (info: { studyId: string }) => self.studyState[info.studyId] == StudyState.Present)), onError)
      .subscribe(() => {
        self.savingChanges = false;
        self.saveDone = true;
        self._changeDetectorRef.detectChanges();
        self._studyService.flushCaches();
      });
  }
}
