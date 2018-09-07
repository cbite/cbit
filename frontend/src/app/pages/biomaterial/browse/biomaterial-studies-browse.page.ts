import {Component, OnInit, OnDestroy} from '@angular/core';
import {StudyService, UnifiedMatch} from '../../../core/services/study.service';
import {FiltersService, FiltersState} from './services/filters.service';
import {FieldMetaService} from '../../../core/services/field-meta.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Study} from '../../../core/types/study.model';
import {PopupService} from '../../../core/services/popup.service';
import {getAuthors, getPublicationDate, getTitle} from '../../../core/util/study-helper';
import {AppUrls} from '../../../router/app-urls';
import {ActivatedRoute, Router} from '@angular/router';
import {CollapseStateService} from '../../../core/services/collapse-state.service';

@Component({
  styleUrls: ['./biomaterial-studies-browse.scss'],
  template: `
    <div class="container-fluid no-gutters">
      <div class="row no-gutters">
        <div class="col-3 sidebar">
          <cbit-browser-sidebar (fullPropertiesListClick)="onFullPropertiesListClicked()"></cbit-browser-sidebar>
        </div>
        <div class="col-9">
          <div class="header">
            <span class="link" (click)="goToDashboard()"><i class="fas fa-chart-bar"></i> Dashboard</span>
            <span style="margin: 0 5px;"><i class="far fa-angle-right"></i></span> Biomaterial
          </div>
          <div class="results">
            <cbit-study-results [matches]="matches"
                                [filters]="filters"
                                [sortField]="sortField"
                                [sortFields]="sortFields"
                                (sortingChange)="onSortingChanged($event)"
                                (showDetails)="onShowDetailsClicked($event)"
                                (removeFilter)="onRemoveFilter($event)"
                                (download)="onDownload($event)"></cbit-study-results>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BioMaterialStudiesBrowsePage implements OnInit, OnDestroy {

  public rawMatches: UnifiedMatch[] = [];
  public matches: UnifiedMatch[] = [];

  private stopStream = new Subject<string>();

  public sortFields = ['Publication Date', 'Name', 'Author'];
  public sortField = 'Author';

  public filters: FiltersState;

  constructor(private fieldMetaService: FieldMetaService,
              private studyService: StudyService,
              private filtersService: FiltersService,
              private collapsedStateService: CollapseStateService,
              private popupService: PopupService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.fieldMetaService.getAllFieldMetas().then(fieldMetas => {
      // Use switchMap to cancel in-flight queries if new filters are applied in the meantime
      this.filtersService.filters.switchMap(filters => {
        this.filters = filters;
        return Observable.fromPromise(<Promise<UnifiedMatch[]>>this.studyService.getUnifiedMatchesAsync(filters));
      }).takeUntil(this.stopStream)
        .subscribe(rawMatches => {
          this.rawMatches = rawMatches;
          this.updateMatches();
        });
    });

    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['category'] && queryParams['value']) {
        this.filtersService.clearFilters();
        this.filtersService.setSampleFilterNone(queryParams['category']);
        this.filtersService.setSampleFilter(queryParams['category'], queryParams['value'], true);
      }
    });
  }

  public onShowDetailsClicked(match: UnifiedMatch) {
    this.router.navigateByUrl(AppUrls.replaceStudyId(AppUrls.studyUrl, match.study._id));
  }

  public onFullPropertiesListClicked() {
    this.popupService.showPropertiesDescriptionPopup();
  }

  public onDownload(study: Study) {
    this.studyService.downloadStudy(study);
  }

  public onRemoveFilter(category: string) {
    this.filtersService.setSampleFilterAll(category);
  }

  public goToDashboard() {
    this.router.navigateByUrl(AppUrls.dashboardUrl);
  }

  public ngOnDestroy() {
    this.stopStream.next('stop');
  }

  public onSortingChanged(sortField: string) {
    this.sortField = sortField;
    this.updateMatches();
  }

  private updateMatches(): void {
    if (this.rawMatches) {
      switch (this.sortField) {
        case 'Publication Date':
          // Sort descending by Publication Date then ascending by Study Title
          this.matches = this.rawMatches.sort((a, b) =>
            (
              -(getPublicationDate(a.study).localeCompare(getPublicationDate(b.study)))
              || (getTitle(a.study).localeCompare(getTitle(b.study)))
            )
          ).slice(0);
          break;
        case 'Name':
          // Sort ascending by Study Title then descending by Publication Date
          this.matches = this.rawMatches.sort((a, b) =>
            (
              (getTitle(a.study).localeCompare(getTitle(b.study)))
              || -(getPublicationDate(a.study).localeCompare(getPublicationDate(b.study)))
            )
          ).slice(0);
          break;
        case 'Author':
          // Sort ascending by Authors then descending by Publication Date
          this.matches = this.rawMatches.sort((a, b) =>
            (
              (getAuthors(a.study).localeCompare(getAuthors(b.study)))
              || -(getPublicationDate(a.study).localeCompare(getPublicationDate(b.study)))
            )
          ).slice(0);
          break;
      }
    }
  }
}
