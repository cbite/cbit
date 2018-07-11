import {Component, OnInit, OnDestroy} from '@angular/core';
import {StudyService, UnifiedMatch} from '../../core/services/study.service';
import {FiltersService} from './services/filters.service';
import {FieldMetaService} from '../../core/services/field-meta.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Study} from '../../core/types/study.model';
import {PopupService} from '../../core/services/popup.service';
import {getPublicationDate, getTitle} from '../../core/util/study-helper';

@Component({
  styleUrls: ['./browser.scss'],
  template: `
    <div class="container-fluid no-gutters">
      <div class="row no-gutters">
        <div class="col-3 sidebar">
          <cbit-browser-sidebar (fullPropertiesListClick)="onFullPropertiesListClicked()"></cbit-browser-sidebar>
        </div>

        <div class="col-9 main">
          <cbit-study-results [matches]="matches" (showDetails)="onShowDetailsClicked($event)"
                              (download)="onDownload($event)"></cbit-study-results>
        </div>
      </div>
    </div>
  `
})
export class BrowserPage implements OnInit, OnDestroy {

  public matches: UnifiedMatch[] = [];

  private stopStream = new Subject<string>();

  constructor(private fieldMetaService: FieldMetaService,
              private studyService: StudyService,
              private filtersService: FiltersService,
              private popupService: PopupService) {
  }

  ngOnInit(): void {
    this.fieldMetaService.getAllFieldMetas().then(fieldMetas => {
      // this.fieldMetas = fieldMetas;

      // Use switchMap to cancel in-flight queries if new filters are applied in the meantime
      this.filtersService.filters.switchMap(filters => {
        return Observable.fromPromise(<Promise<UnifiedMatch[]>>this.studyService.getUnifiedMatchesAsync(filters));
      }).takeUntil(this.stopStream)
        .subscribe(rawMatches => {
          this.updateMatches(rawMatches);
        });
    });
  }

  public onShowDetailsClicked(match: UnifiedMatch) {
    this.popupService.showStudyDetailsPopup(match.study);
  }

  public onFullPropertiesListClicked() {
    this.popupService.showPropertiesDescriptionPopup();
  }

  public onDownload(study: Study) {
    this.studyService.downloadStudy(study);
  }

  public ngOnDestroy() {
    this.stopStream.next('stop');
  }

  private updateMatches(rawMatches: UnifiedMatch[]): void {
    // Sort descending by Publication Date then ascending by Study Title
    this.matches = rawMatches.sort((a, b) =>
      (
        -(getPublicationDate(a.study).localeCompare(getPublicationDate(b.study)))
        || (getTitle(a.study).localeCompare(getTitle(b.study)))
      )
    );
  }
}
