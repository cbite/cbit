import {Component, ChangeDetectorRef, OnInit, Input} from "@angular/core";
import {DownloadSelectionService} from "./services/download-selection.service";
import {StudyService} from "./services/study.service";
import {Study} from "./common/study.model";
import {ModalDirective} from "ng2-bootstrap";
import {AuthenticationService} from "./services/authentication.service";
import {URLService} from "./services/url.service";

interface DownloadPostResponse {
  download_uuid: string,
  location: string,
  progressUrl: string
}

interface DownloadProgressResponse {
  status: string,
  progress: number
}

@Component({
  selector: 'download-checkout',
  template: `
    <div class="modal-dialog modal-lg">

      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" (click)="modal.hide()">&times;</button>
          <h2 class="modal-title">Download selected studies and samples</h2>
        </div>
        <div class="modal-body">
          <p>
            Selected {{ numSelectedSamples }} samples from {{ numSelectedStudies }} studies. 
          </p>
          <p>
          For the moment, can only download study archives in full and individually.
          Please click on the links below to download relevant study archives.
          </p>
          <ol>
            <li *ngFor="let study of studies">
              <a [href]="study._source['*Archive URL']">{{ study._source['STUDY']['Study Title']}}</a>
            </li>
          </ol>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" (click)="modal.hide()">Close</button>
          <button *ngIf="!preparingDownload" type="button" class="btn btn-primary" (click)="kickOffDownload()">Download</button>
          <button *ngIf=" preparingDownload" type="button" class="btn btn-primary" disabled>Download</button>
          
          <div *ngIf="errorMessage" class="pull-left" style="width: 70%">
            <div class="alert alert-danger" style="text-align: left;">
              {{ errorMessage }}
            </div>
          </div>
          
          <div *ngIf="preparingDownload" class="pull-left" style="width: 50%;">
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
  `]
})
export class DownloadComponent {
  @Input() modal: ModalDirective;
  numSelectedStudies: number = 0;
  numSelectedSamples: number = 0;
  studies: Study[] = [];

  errorMessage: string = '';
  preparingDownload: boolean = false;
  preparationProgress: number = 0;
  downloadReady: boolean = false;

  download_uuid: string;
  downloadLocation: string;
  progressUrl: string;

  constructor(
    private _url: URLService,
    private _studyService: StudyService,
    private _auth: AuthenticationService,
    private _downloadSelectionService: DownloadSelectionService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  refresh(): void {
    let studyIds = Object.keys(this._downloadSelectionService.getSelection().selection);
    this.numSelectedStudies = studyIds.length;
    this.numSelectedSamples =
      Object.values(this._downloadSelectionService.getSelection().selection)
        .reduce((soFar, samples) => soFar + Object.keys(samples).length, 0);

    Promise.all(studyIds.map(studyId => this._studyService.getStudy(studyId)))
      .then(studies => {
        this.studies = studies;
        this.changeDetectorRef.detectChanges();
      })

    this.errorMessage = '';
    this.preparingDownload = false;
    this.preparationProgress = 0;
    this.downloadReady = false;
  }

  kickOffDownload(): void {
    let self = this;

    this.errorMessage = '';
    this.preparingDownload = true;
    this.preparationProgress = 0;
    this.downloadReady = false;

    let selection = this._downloadSelectionService.getSelection().selection;
    let sampleIds: string[] = [];
    for (let studyId in selection) {
      for (let sampleId in selection[studyId]) {
        sampleIds.push(sampleId);
      }
    }

    $.ajax({
      type: 'POST',
      url: this._url.downloadsResource(),
      headers: this._auth.headers(),
      data: JSON.stringify(sampleIds),
      dataType: 'json',
      success: (data: DownloadPostResponse) => {
        self.download_uuid = data.download_uuid;
        self.downloadLocation = data.location;
        self.progressUrl = data.progressUrl;

        self.schedulePollForProgress();
      },
      error: (jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) => {
        self.errorMessage = `Error: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}!`;
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

        } else {
          self.schedulePollForProgress();
        }
      },
      error: (jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) => {
        self.errorMessage = `Error: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}!`;
        self.preparingDownload = false;
      },
      complete: () => {
        self.changeDetectorRef.detectChanges();
      }
    })
  }
}
