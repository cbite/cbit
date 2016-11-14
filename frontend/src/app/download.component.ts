import {Component, ChangeDetectorRef, OnInit} from "@angular/core";
import {DownloadSelectionService} from "./services/download-selection.service";
import {StudyService} from "./services/study.service";
import {Study} from "./common/study.model";

@Component({
  template: `
  <h1>Download Studies in Cart</h1>
  <p>
    In Cart: {{ numSamplesInCart }} samples from {{ numStudiesInCart }} studies. 
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
  `
})
export class DownloadComponent implements OnInit {
  numStudiesInCart: number = 0;
  numSamplesInCart: number = 0;
  studies: Study[] = [];

  constructor(
    private _studyService: StudyService,
    private _downloadSelectionService: DownloadSelectionService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    let studyIds = Object.keys(this._downloadSelectionService.getSelection().inCart);
    this.numStudiesInCart = studyIds.length;
    this.numSamplesInCart =
      Object.values(this._downloadSelectionService.getSelection().inCart)
        .reduce((soFar, samples) => soFar + Object.keys(samples).length, 0);

    Promise.all(studyIds.map(studyId => this._studyService.getStudyAndRelatedSamplesAsync(studyId)))
      .then(studiesAndSamples => studiesAndSamples.map(studyAndSample => studyAndSample.study))
      .then(studies => {
        this.studies = studies;
        this.changeDetectorRef.detectChanges();
      })
  }
}
