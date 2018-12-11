import {Component, OnInit, ChangeDetectorRef, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {StudyService, UnifiedMatch} from '../../../core/services/study.service';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Study} from '../../../core/types/study.model';
import {URLService} from '../../../core/services/url.service';
import {HttpGatewayService} from '../../../core/services/http-gateway.service';
import {Observable} from 'rxjs/Observable';
import {PopupService} from '../../../core/services/popup.service';
import {Router} from '@angular/router';
import {AppUrls} from '../../../router/app-urls';
import {StudyState} from './components/study-management-list.component';
import {getAuthors, getPublicationDate, getTitle} from '../../../core/util/study-helper';

@Component({
  styleUrls: ['./biomaterial-study-management.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <div class="page-title">
          Biomaterial Studies
        </div>
        <div class="sort-title">Sorted by</div>
        <div class="sorting"
             (mouseleave)="onMouseLeaveSorting()"
             (mouseenter)="onMouseEnterSorting()">
          {{sortField}} <i class="far fa-angle-down"></i>
          <div class="sorting-options" *ngIf="isSortingOpen">
            <div class="sorting-option"
                 *ngFor="let field of sortFields" (click)="onSortFieldClicked(field)">{{field}}
            </div>
          </div>
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
  studies: Study[];
  studyState: { [studyId: string]: StudyState } = {};
  studySpecificErrorMessage: { [studyId: string]: string } = {};
  form: FormGroup;
  studyList: Study[];

  savingChanges = false;
  saveDone = false;
  saveError = '';

  public sortFields = ['Publication Date', 'Name', 'Author'];
  public sortField = 'Publication Date';
  public isSortingOpen = false;

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
        this.studyList = studyList;
        self.studies = self.sortStudies(studyList);

        for (const study of studyList) {
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
    this.studies.forEach(study => {
      group[study._id] = new FormGroup({
        studyId: new FormControl(study._id),
        ePicPid: new FormControl(study._source['*ePIC PID']),
        visible: new FormControl(study._source['*Visible'])
      });
    });
    return new FormGroup(group);
  }

  private sortStudies(studyList: Study[]) {
    let sortedList = [];

    switch (this.sortField) {
      case 'Publication Date':
        // Sort descending by Publication Date then ascending by Study Title
        sortedList = studyList.sort((a, b) =>
          (
            -(getPublicationDate(a).localeCompare(getPublicationDate(b)))
            || (getTitle(a).localeCompare(getTitle(b)))
          )
        ).slice(0);
        break;
      case 'Name':
        // Sort ascending by Study Title then descending by Publication Date
        sortedList = studyList.sort((a, b) =>
          (
            (getTitle(a).localeCompare(getTitle(b))) ||
            -(getPublicationDate(a).localeCompare(getPublicationDate(b)))
          )
        ).slice(0);
        break;
      case 'Author':
        // Sort ascending by Authors then descending by Publication Date
        sortedList = studyList.sort((a, b) =>
          (
            (getAuthors(a).localeCompare(getAuthors(b)))
            || (getTitle(a).localeCompare(getTitle(b)))
          )
        ).slice(0);
        break;
    }

    return sortedList;
  }

  deleteStudy(studyId: string) {
    this.popupService.showConfirmationPoupup(`Are you sure you want to delete study ${studyId}?`, () => {
      const onError = (err, caught) => {
        this.studyState[studyId] = StudyState.Present;
        (<FormGroup>this.form.controls[studyId]).controls['ePicPid'].enable();
        (<FormGroup>this.form.controls[studyId]).controls['visible'].enable();
        this.studySpecificErrorMessage[studyId] = `Error: ${err.statusText}`;
        this._changeDetectorRef.detectChanges();
        return Observable.throw(err);
      };

      this.httpGatewayService.delete(this._url.studyResource(studyId), onError)
        .subscribe(() => {
          this.studyState[studyId] = StudyState.Deleted;
          delete this.studySpecificErrorMessage[studyId];
          (<FormGroup>this.form.controls[studyId]).controls['ePicPid'].disable();
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

  public onSortFieldClicked(sortField: string) {
    this.isSortingOpen = false;
    this.sortField = sortField;
    this.studies = this.sortStudies(this.studyList);
    this._changeDetectorRef.detectChanges();
  }

  public onMouseLeaveSorting() {
    this.isSortingOpen = false;
  }

  public onMouseEnterSorting() {
    this.isSortingOpen = true;
  }
}
