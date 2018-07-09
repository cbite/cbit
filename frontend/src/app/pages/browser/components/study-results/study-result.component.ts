import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {UnifiedMatch} from '../../../../services/study.service';
import {RawStudyPublication, Study} from '../../../../core/types/study.model';
import {WindowRef} from '../../../../shared/util/WindowRef';

@Component({
  selector: 'cbit-study-result',
  styleUrls: ['./study-result.scss'],
  template: `
    <div class="study-panel noselect">
      <div class="header" (click)="onShowStudyDetails()">{{match.study._source.STUDY['Study Title']}}</div>
      <div class="body">
        <div class="authors" (click)="onShowStudyDetails()">
            by {{ match.study._source['STUDY']['Study Researchers Involved'] }}
        </div>
        <div class="samples" (click)="onShowStudyDetails()">
          <span style="margin-right: 5px;"><i class="far fa-ellipsis-v"></i></span> {{ match.sampleMatches.length }} matching samples
        </div>
        <div class="links">
          <div class="link" *ngFor="let doi of doiIds" (click)="onOpenExternal('DOI', doi)">
            <i class="far fa-link"></i> DOI
          </div>
          <div class="link" *ngFor="let pubmedId of pubmedIds" (click)="onOpenExternal('PubMed', doi)">
            <i class="far fa-link"></i> PubMed
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudyResultComponent implements OnChanges {

  @Input()
  public match: UnifiedMatch;

  @Output()
  public showDetails = new EventEmitter<UnifiedMatch>();

  public pubmedIds = [];
  public doiIds = [];
  private nativeWindow: any;

  constructor(private winRef: WindowRef){
    this.nativeWindow = winRef.getNativeWindow();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.pubmedIds = this.pubmedIdsOf(this.match.study);
    this.doiIds = this.doisOf(this.match.study);
  }

  private pubmedIdsOf(study: Study): string[] {
    return (((study && study._source && study._source['STUDY PUBLICATIONS']) || [])
        .filter((p: RawStudyPublication) => p['Study PubMed ID'])
        .map((p: RawStudyPublication) => p['Study PubMed ID'])
    );
  }

  private doisOf(study: Study): string[] {
    return (((study && study._source && study._source['STUDY PUBLICATIONS']) || [])
        .filter((p: RawStudyPublication) => p['Study Publication DOI'])
        .map((p: RawStudyPublication) => p['Study Publication DOI'])
    );
  }

  public onOpenExternal(source: string, id: string) {
    if (source === 'DOI') {
      this.nativeWindow.open(`https://dx.doi.org/${id}`);
    } else if (source === 'PubMed') {
      this.nativeWindow.open(`https://www.ncbi.nlm.nih.gov/pubmed/${id}`);
    }
  }

  public onShowStudyDetails() {
    this.showDetails.emit(this.match);
  }
}
