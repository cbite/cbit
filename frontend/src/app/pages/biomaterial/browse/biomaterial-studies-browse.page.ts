import {Component, OnInit, OnDestroy} from '@angular/core';
import {StudyService, UnifiedMatch} from '../../../core/services/study.service';
import {FiltersService} from './services/filters.service';
import {FieldMetaService} from '../../../core/services/field-meta.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Study} from '../../../core/types/study.model';
import {PopupService} from '../../../core/services/popup.service';
import {getPublicationDate, getTitle} from '../../../core/util/study-helper';
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
            <cbit-study-results [matches]="matches" (showDetails)="onShowDetailsClicked($event)"
                                (download)="onDownload($event)"></cbit-study-results>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BioMaterialStudiesBrowsePage implements OnInit, OnDestroy {

  public matches: UnifiedMatch[] = [];

  private stopStream = new Subject<string>();

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
        return Observable.fromPromise(<Promise<UnifiedMatch[]>>this.studyService.getUnifiedMatchesAsync(filters));
      }).takeUntil(this.stopStream)
        .subscribe(rawMatches => {
          this.updateMatches(rawMatches);
        });
    });

    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['category'] && queryParams['value']) {
        this.filtersService.clearFilters();
        this.filtersService.setSampleFilterNone(queryParams['category']);
        this.filtersService.setSampleFilter(queryParams['category'], queryParams['value'], true);

       /* this.collapsedStateService.setCollapsed(`fsall-material-main`, true);
        this.collapsedStateService.setCollapsed(`fsall-technical-main`, true);
        this.collapsedStateService.setCollapsed(`fsall-biological-main`, true);
        this.collapsedStateService.setCollapsed(`sample-filters-${queryParams['category']}`, false);*/
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

  public goToDashboard() {
    this.router.navigateByUrl(AppUrls.dashboardUrl);
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
