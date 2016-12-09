import {Component, ChangeDetectorRef, OnInit, Input} from "@angular/core";
import {DownloadSelectionService} from "./services/download-selection.service";
import {StudyService} from "./services/study.service";
import {Study} from "./common/study.model";
import {ModalDirective} from "ng2-bootstrap";

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
          
          <div *ngIf="preparingDownload" class="pull-left" style="width: 50%;">
            <label class="prepLabel">Preparing download:</label>
            <div class="progress">
              <div class="progress-bar progress-bar-striped active" role="progressbar" [style.width.%]="preparationProgress">
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

  preparingDownload: boolean = false;
  preparationProgress: number = 0;

  constructor(
    private _studyService: StudyService,
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

    this.preparingDownload = false;
    this.preparationProgress = 0;
  }

  kickOffDownload(): void {
    let self = this;

    this.preparingDownload = true;
    let intervalId = setInterval(() => {
      self.preparationProgress += 5;
      self.changeDetectorRef.detectChanges();

      if (self.preparationProgress === 100) {
        clearInterval(intervalId);
        setTimeout(() => { self.modal.hide(); }, 200);
      }
    }, 500);
  }
}
