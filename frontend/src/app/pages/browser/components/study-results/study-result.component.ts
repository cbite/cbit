import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {UnifiedMatch} from '../../../../services/study.service';
import {WindowRef} from '../../../../shared/util/WindowRef';
import {getAuthors, getDoisIds, getPubmedIds, getTitle} from '../../../../core/util/study-helper';

@Component({
  selector: 'cbit-study-result',
  styleUrls: ['./study-result.scss'],
  template: `
    <div class="study-panel noselect">
      <div class="header" (click)="onShowStudyDetails()">{{studyTitle}}</div>
      <div class="body">
        <div class="authors" (click)="onShowStudyDetails()">
            by {{authors}}
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

  public studyTitle: string;
  public authors: string;

  constructor(private winRef: WindowRef){
    this.nativeWindow = winRef.getNativeWindow();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.studyTitle = getTitle(this.match.study);
    this.authors = getAuthors(this.match.study);
    this.pubmedIds = getPubmedIds(this.match.study);
    this.doiIds = getDoisIds(this.match.study);
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
