import {Component, EventEmitter, Input, OnChanges, SimpleChanges, Output} from '@angular/core';
import {UnifiedMatch} from '../../../../../core/services/study.service';
import {Study} from '../../../../../core/types/study.model';

@Component({
  selector: 'cbit-study-results',
  styleUrls: ['./study-results.scss'],
  template: `
    <div class="title-panel">
      <div class="title">Results</div>
      {{ numMatchingStudies }} studies, {{ numMatchingSamples }} samples
    </div>

    <div class="container-fluid">
      <ng-container *ngFor="let row of (matches | splitByTwoPipe)">
        <div class="row" style="margin-top: 20px">
          <div class="col-6" *ngFor="let match of row">
            <cbit-study-result [match]="match"
                               (showDetails)="onShowDetails(match)"
                               (download)="onDownload($event)">
            </cbit-study-result>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class StudyResultsComponent implements OnChanges {

  @Input()
  public matches: UnifiedMatch[] = [];

  @Output()
  public showDetails = new EventEmitter<UnifiedMatch>();

  @Output()
  public download = new EventEmitter<Study>();

  public numMatchingStudies = 0;
  public numMatchingSamples = 0;

  public ngOnChanges(changes: SimpleChanges): void {
    this.numMatchingStudies = this.matches.length;
    this.numMatchingSamples = this.matches.reduce((soFar, studyMatch) => soFar + studyMatch.sampleMatches.length, 0);
  }

  public onShowDetails(match: UnifiedMatch) {
    this.showDetails.emit(match);
  }

  public onDownload(study: Study) {
    this.download.emit(study);
  }
}
