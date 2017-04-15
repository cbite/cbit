import {Component, ChangeDetectorRef, OnInit, Input, ElementRef} from "@angular/core";
import {DownloadSelectionService} from "./services/download-selection.service";
import {StudyService} from "./services/study.service";
import {Study, Sample} from "./common/study.model";
import {ModalDirective} from "ngx-bootstrap";
import {AuthenticationService} from "./services/authentication.service";
import {URLService} from "./services/url.service";
import {FormGroup, FormControl} from "@angular/forms";
import * as _ from 'lodash';
import {CollapseStateService} from "./services/collapse-state.service";
import {FieldMeta} from "./common/field-meta.model";

interface DownloadPostResponse {
  download_uuid: string,
  location: string,
  progressUrl: string
}

interface DownloadProgressResponse {
  status: string,
  progress: number,
  errorString?: string
}

enum StudyCheckboxState {
  All,
  None,
  Indeterminate
}

@Component({
  selector: 'download-checkout',
  template: `
    <div class="modal-dialog modal-lg">

      <div class="modal-content">
        <div class="modal-header">
          <button *ngIf="!preparingDownload" type="button" class="close" (click)="modal.hide()">&times;</button>
          <button *ngIf=" preparingDownload" type="button" class="close" disabled>&times;</button>
          <h2 class="modal-title">Download selected studies and samples</h2>
        </div>
        
        <div class="modal-body">
          <p>
            On clicking "Download", an archive will be prepared with the following datasets.
            The archive will download automatically when finished.  You can still remove any
            study or sample by clicking on the checkboxes below. 
          </p>
          
          <div class="checkbox">
            <label for="onlyIncludeMetadata">
              <input type="checkbox" [id]="onlyIncludeMetadata" [(ngModel)]="onlyIncludeMetadata">
              <b>Only include metadata, not gene expression data</b>
            </label>
          </div>
          
          <div *ngIf="!ready">
            <spinner></spinner>
          </div>
          <div *ngIf="ready" [formGroup]="form" class="limitedHeight">
            <ul class="studiesList">
              <li *ngFor="let study of studies" [formGroupName]="study._id">
              
                <div class="fullLabel">
                  <a href="#" (click)="$event.preventDefault(); toggleVisible(study._id)">
                    <span *ngIf=" isVisible(study._id)" class="glyphicon glyphicon-triangle-bottom"></span>
                    <span *ngIf="!isVisible(study._id)" class="glyphicon glyphicon-triangle-right"></span>
                  </a>
                  <div class="checkbox-inline">
                    <input type="checkbox" [id]="'study-' + study._id"
                      (click)="$event.preventDefault(); clickStudyCheckbox(study._id)">
                    <a href="#" (click)="$event.preventDefault(); toggleVisible(study._id)">
                      <b>{{ study._source['STUDY']['Study Title']}}</b>
                    </a>
                  </div>
                </div>
                
                <div *ngIf="isVisible(study._id)">
                  <ul class="samplesList">
                    <li *ngFor="let sample of samplesInStudies[study._id]">
                      <div class="checkbox">
                        <ng-template #tooltipTemplate>
                          <div [innerHtml]="tooltipHtmlFor(study._id, sample)"></div>
                        </ng-template>
                        <div class="tooltipWrapper"
                             [my-tooltip]="tooltipTemplate" placement="right">
                          <label [attr.for]="'study-' + study._id + '-sample-' + sample._id">
                            <input type="checkbox" [id]="'study-' + study._id + '-sample-' + sample._id" [formControlName]="sample._id">
                            <b>{{ sample._source['Sample Name']}}</b>
                          </label>
                          
                          <span *ngFor="let kv of genSampleMiniSummary(study._id, sample) | mapToIterable; let isLast = last">
                            <i>{{ kv.key }}</i>: {{ kv.val }}<span *ngIf="!isLast">, </span>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="modal-footer">
          
          <button *ngIf="!preparingDownload" type="button" class="btn btn-default" (click)="modal.hide()">Close</button>
          <button *ngIf="!preparingDownload" type="button" class="btn btn-primary" (click)="kickOffDownload()">Download</button>
          
          <button *ngIf=" preparingDownload" type="button" class="btn btn-default" disabled>Close</button>
          <button *ngIf=" preparingDownload" type="button" class="btn btn-primary" disabled>Download</button>
          
          <div *ngIf="errorMessage" class="pull-left" style="width: 70%">
            <div class="alert alert-danger" style="text-align: left;">
              {{ errorMessage }}
            </div>
          </div>
          
          <div *ngIf="preparingDownload" class="pull-left" style="width: 50%;">
            <div>
              <label class="prepLabel">Preparing download:</label>
              <div class="progress">
                <div class="progress-bar"
                 [class.progress-bar-striped]="!downloadReady"
                 [class.active]="!downloadReady"
                 [class.progress-bar-success]="downloadReady"
                 role="progressbar" [style.width.%]="preparationProgress">
                </div>
              </div>
            </div>
            <div class="patienceNote">
              Please be patient, this can take a few minutes
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
  .prepLabel {
    float: left;
    margin-right: 1em;
  }
  .progress {
    margin-bottom: 0;
  }
  .limitedHeight {
    max-height: 300px;
    overflow-y: auto;
    padding: 2px;
    margin-bottom: 0;
  }
  ul.studiesList {
    list-style: none;
    padding-left: 10px;
  }
  ul.samplesList {
    list-style: none;
    padding-left: 40px;
  }
  .patienceNote {
    text-align: left;
    font-style: oblique;
    font-size: 80%;
  }
  .tooltipWrapper {
    display: inline-block;
  }
  `]
})
export class DownloadComponent {
  @Input() modal: ModalDirective;
  studies: Study[] = [];
  samplesInStudies: { [studyId: string]: Sample[] } = {};
  commonFieldValues: { [studyId: string]: { [fieldName: string]: any } };
  valueRanges: { [studyId: string]: { [fieldName: string]: number } };
  fieldMetas: { [fieldName: string]: FieldMeta } = {};

  errorMessage: string = '';
  preparingDownload: boolean = false;
  preparationProgress: number = 0;
  downloadReady: boolean = false;

  download_uuid: string;
  downloadLocation: string;
  progressUrl: string;
  ready: boolean = false;

  onlyIncludeMetadata = false;

  private jqElem: JQuery;
  form: FormGroup = new FormGroup({});

  constructor(
    private _url: URLService,
    private _studyService: StudyService,
    private _auth: AuthenticationService,
    private _downloadSelectionService: DownloadSelectionService,
    private changeDetectorRef: ChangeDetectorRef,
    private _elemRef: ElementRef,
    private _collapseStateService: CollapseStateService
  ) { }

  ngOnInit() {
    this.jqElem = $(this._elemRef.nativeElement);
  }

  refresh(): void {
    this.ready = false;
    this.errorMessage = '';
    this.preparingDownload = false;
    this.preparationProgress = 0;
    this.downloadReady = false;
    this.onlyIncludeMetadata = false;

    let studyIds = Object.keys(this._downloadSelectionService.getSelection().selection);

    let studiesPromise: Promise<{ [studyId: string]: Study }> =
      Promise.all(studyIds.map(studyId => {
        return this._studyService.getStudy(studyId)
          .then(study => { return { [studyId]: study } })
      }))
        .then(studiesList => _.merge.apply(_, [{}].concat(studiesList)));

    let samplesInStudiesPromise: Promise<{ [studyId: string]: Sample[] }> =
      Promise.all(studyIds.map(studyId => this._studyService.getIdsOfSamplesInStudy(studyId).then(samplesInStudy => { return { [studyId]: samplesInStudy }; })))
        .then(sampleIdsInStudiesList => {
          let sampleIdsInStudies: { [studyId: string]: string[] } = _.merge.apply(_, sampleIdsInStudiesList);
          let samplesInStudiesPromises: Promise<{ [studyId: string]: Sample[] }>[] = [];
          for (let studyId in sampleIdsInStudies) {
            let sampleIds = sampleIdsInStudies[studyId];
            samplesInStudiesPromises.push(
              Promise.all(sampleIds.map(sampleId => this._studyService.getSample(sampleId)))
                .then(samples => { return { [studyId]: samples.sort((x, y) => x._source['Sample Name'].localeCompare(y._source['Sample Name'])) }})
            );
          }
          return Promise.all(samplesInStudiesPromises).then(samplesInStudies => {
            let result: { [studyId: string]: Sample[] } = _.merge.apply(_, [].concat(samplesInStudies));
            return result;
          });
        });

    let fieldMetasPromise = this._studyService.getAllFieldMetas();

    studiesPromise.then(studies => {
      samplesInStudiesPromise.then(samplesInStudies => {
        fieldMetasPromise.then(fieldMetas => {
          this.studies = Object.values(studies).sort((x, y) => x._source['STUDY']['Study Title'].localeCompare(y._source['STUDY']['Study Title']));
          this.samplesInStudies = samplesInStudies;
          this.fieldMetas = fieldMetas;

          this.commonFieldValues = {};
          for (let studyId in this.samplesInStudies) {
            this.commonFieldValues[studyId] = this._studyService.findCommonFieldValues(this.samplesInStudies[studyId]);
          }

          this.valueRanges = {};
          for (let studyId in this.samplesInStudies) {
            this.valueRanges[studyId] = this._studyService.calcValueRanges(this.samplesInStudies[studyId], this.fieldMetas);
          }

          this.form = this.makeFormGroup();
          this.ready = true;
          this.changeDetectorRef.detectChanges();
        });
      });
    });
  }

  makeFormGroup(): FormGroup {
    let group: any = {};
    let selection = this._downloadSelectionService.getSelection().selection;

    for (let studyId in this.samplesInStudies) {
      let samples = this.samplesInStudies[studyId];
      let samplesGroup = {};
      for (let sample of samples) {
        samplesGroup[sample._id] = new FormControl(selection[studyId][sample._id] || false);
      }
      group[studyId] = new FormGroup(samplesGroup);
    }

    return new FormGroup(group);
  }

  isVisible(studyId: string) {
    return !this._collapseStateService.isCollapsed(`download-study-${studyId}`, true);
  }

  toggleVisible(studyId: string) {
    this._collapseStateService.setCollapsed(`download-study-${studyId}`, !(!this.isVisible(studyId)));
  }

  ngAfterViewChecked(): void {
    for (let studyId in this.samplesInStudies) {
      let state = this.getStudyCheckboxState(studyId);
      let studyCheckbox = this.jqElem.find(`#study-${studyId}`);

      switch (state) {
        case StudyCheckboxState.All:
          studyCheckbox.prop({indeterminate: false, checked: true});
          break;
        case StudyCheckboxState.None:
          studyCheckbox.prop({indeterminate: false, checked: false});
          break;
        case StudyCheckboxState.Indeterminate:
          studyCheckbox.prop({indeterminate: true});
          break;
      }
    }
  }

  getStudyCheckboxState(studyId: string): StudyCheckboxState {
    let formValue = this.form.value;
    let samplesChecked = formValue[studyId];

    let numChecked = Object.values(samplesChecked).filter((checked: boolean) => checked).length;
    let numTotal = Object.values(samplesChecked).length;

    if (numChecked == 0) {
      return StudyCheckboxState.None;
    } else if (numChecked == numTotal) {
      return StudyCheckboxState.All;
    } else {
      return StudyCheckboxState.Indeterminate;
    }
  }

  clickStudyCheckbox(studyId: string): void {
    let state = this.getStudyCheckboxState(studyId);
    let newCheckedState: boolean;

    switch (state) {
      case StudyCheckboxState.All:
      case StudyCheckboxState.Indeterminate:
        newCheckedState = false;
        break;
      case StudyCheckboxState.None:
        newCheckedState = true;
        break;
    }

    for (let sampleControl of Object.values((<FormGroup>this.form.controls[studyId]).controls)) {
      sampleControl.setValue(newCheckedState);
    }

    // Hack!  Don't know why the jQuery changes to the study checkbox in ngAfterViewChecked() don't
    // actually survive, but forcing another call later on seems to do the trick...
    setTimeout(() => {
      this.ngAfterViewChecked();
    }, 4);
  }

  genSampleMiniSummary(studyId: string, sample: Sample): Object {
    return this._studyService.genSampleSummary(this.commonFieldValues[studyId], sample, this.fieldMetas, this.valueRanges[studyId], true);
  }

  genSampleSummary(studyId: string, sample: Sample): Object {
    return this._studyService.genSampleSummary(this.commonFieldValues[studyId], sample, this.fieldMetas, this.valueRanges[studyId], false);
  }

  tooltipHtmlFor(studyId: string, sample: Sample): string {
    let result = '';
    let contents = this.genSampleSummary(studyId, sample);
    for (let key of Object.keys(contents).sort((x: string, y: string) => x.localeCompare(y))) {
      result += `<div><b>${key}</b>: ${contents[key]}</div>`;
    }
    console.log(studyId);
    console.log(sample);
    console.log(result);
    return result;
  }

  kickOffDownload(): void {
    let self = this;

    this.errorMessage = '';
    this.preparingDownload = true;
    this.preparationProgress = 0;
    this.downloadReady = false;

    //let selection = this._downloadSelectionService.getSelection().selection;
    let selection = this.form.value;
    let sampleIds: string[] = [];
    for (let studyId in selection) {
      for (let sampleId in selection[studyId]) {
        if (selection[studyId][sampleId]) {
          sampleIds.push(sampleId);
        }
      }
    }

    $.ajax({
      type: 'POST',
      url: this._url.downloadsResource(),
      headers: this._auth.headers(),
      data: JSON.stringify({
        onlyIncludeMetadata: this.onlyIncludeMetadata,
        sampleIds: sampleIds
      }),
      dataType: 'json',
      success: (data: DownloadPostResponse) => {
        self.download_uuid = data.download_uuid;
        self.downloadLocation = data.location;
        self.progressUrl = data.progressUrl;

        self.schedulePollForProgress();
      },
      error: (jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) => {
        console.log(`Error: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}!`);
        self.errorMessage = "Error while initiating download preparation, please try again";
        self.preparingDownload = false;
        self.changeDetectorRef.detectChanges();
      }
    });
  }

  schedulePollForProgress() {
    let self = this;
    const POLLING_INTERVAL_MS = 1000;
    setTimeout(() => self.doProgressPoll(), POLLING_INTERVAL_MS);
  }

  doProgressPoll() {
    let self = this;

    $.ajax({
      type: 'GET',
      url: this.progressUrl,
      headers: this._auth.headers(),
      dataType: 'json',
      success: (result: DownloadProgressResponse) => {
        self.preparationProgress = result.progress;

        if (result.status === 'ready') {
          self.downloadReady = true;
          setTimeout(() => { self.modal.hide(); }, 1000);

          // Kick off download
          window.location.href = self.downloadLocation;

        } else if (result.status == 'error') {
          self.errorMessage = `Error: ${result.errorString}!`;
          self.preparingDownload = false;
        } else {
          self.schedulePollForProgress();
        }
      },
      error: (jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) => {
        console.log(`Error: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}!`);
        self.errorMessage = "Error while preparing download, please try again";
        self.preparingDownload = false;
      },
      complete: () => {
        self.changeDetectorRef.detectChanges();
      }
    })
  }
}
