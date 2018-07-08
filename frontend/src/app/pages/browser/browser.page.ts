import {Component, ChangeDetectorRef, OnInit, OnDestroy} from '@angular/core';
import {StudyService, UnifiedMatch} from '../../services/study.service';
import {Study, Sample, RawStudyPublication} from '../../common/study.model';
import {Router} from '@angular/router';
import {FiltersService} from '../../services/filters.service';
import {Observable, Subject} from 'rxjs';
import {DownloadSelectionService} from '../../services/download-selection.service';
import {CollapseStateService} from '../../services/collapse-state.service';
import {FieldMeta} from '../../common/field-meta.model';
import {AuthenticationService} from '../../core/authentication/authentication.service';

@Component({
  styleUrls: ['./browser.scss'],
  template: `
    <div class="container-fluid">
      <div class="row no-gutters">
        <div class="col-3 sidebar">
          <cbit-filter-sidebar></cbit-filter-sidebar>
        </div>

        <div class="col-9 main">
          <cbit-study-results></cbit-study-results>
        </div>
        
        
          <!--<filter-sidebar [allFieldsModal]="allFieldsModal"></filter-sidebar>-->


          <!--<div class="h1">-->
            <!--Results-->
            <!--<spinner *ngIf="!ready"></spinner>-->
            <!--<button class="btn btn-success addAllResultsButton" (click)="addAllResultsToSelection()">-->
              <!--<span class="glyphicon glyphicon-plus"></span> Select All Results-->
            <!--</button>-->
          <!--</div>-->
          <!--<div class="resultsCounts">-->
            <!--{{ numMatchingStudies }} studies, {{ numMatchingSamples }} samples-->
          <!--</div>-->

          <!--<div *ngIf="fieldMetasReady" class="row">-->

            <!--&lt;!&ndash; Have to expand *ngFor manually here to insert clearfix every 3 items &ndash;&gt;-->
            <!--<ng-template ngFor let-studyMatch [ngForOf]="matches" let-i="index">-->
              <!--<div class="col-md-4">-->

                <!--<div class="panel"-->
                     <!--[class.panel-default]="studySelectedState(studyMatch) === 'no'"-->
                     <!--[class.panel-success]="studySelectedState(studyMatch) === 'yes'"-->
                     <!--[class.panel-warning]="studySelectedState(studyMatch) === 'partial'"-->
                <!--&gt;-->
                  <!--<div class="panel-heading">-->

                    <!--<a (click)="$event.preventDefault(); detailModal.show()" href="#">-->
                      <!--<h3 class="panel-title" style="float:left;width:80%">{{ studyMatch.study._source['STUDY']['Study Title'] }}</h3>-->
                    <!--</a>-->
                    <!--<div *ngIf="!studyMatch.study._source['*Visible']" class="embargo">[Invisible to public!]</div>-->

                    <!--<div [ngSwitch]="studySelectedState(studyMatch)" class="panel-heading-plus-minus-buttons">-->

                      <!--<a *ngSwitchCase="'no'" href="#" class="btn btn-success btn-xs" role="button"-->
                         <!--(click)="$event.preventDefault(); selectStudy(studyMatch)">-->
                        <!--<span class="glyphicon glyphicon-plus"></span>-->
                      <!--</a>-->

                      <!--<a *ngSwitchCase="'partial'" href="#" class="btn btn-success btn-xs" role="button"-->
                         <!--(click)="$event.preventDefault(); selectStudy(studyMatch)">-->
                        <!--<span class="glyphicon glyphicon-plus"></span>-->
                      <!--</a>-->
                      <!--<a *ngSwitchCase="'partial'" href="#" class="btn btn-danger btn-xs" role="button"-->
                         <!--(click)="$event.preventDefault(); deselectStudy(studyMatch)">-->
                        <!--<span class="glyphicon glyphicon-minus"></span>-->
                      <!--</a>-->

                      <!--<a *ngSwitchCase="'yes'" href="#" class="btn btn-danger btn-xs" role="button"-->
                         <!--(click)="$event.preventDefault(); deselectStudy(studyMatch)">-->
                        <!--<span class="glyphicon glyphicon-minus"></span>-->
                      <!--</a>-->

                    <!--</div>-->
                    <!--<div class="clearfix"></div>-->
                  <!--</div>-->
                  <!--<div class="panel-body">-->
                    <!--<p>by {{ studyMatch.study._source['STUDY']['Study Researchers Involved'] }}</p>-->

                    <!--<a (click)="setSamplesShown(studyMatch.study._id, !areSamplesShown(studyMatch.study._id))" href="javascript:void(0)">-->
                      <!--<span *ngIf="!areSamplesShown(studyMatch.study._id)" class="glyphicon glyphicon-triangle-right"></span>-->
                      <!--<span *ngIf=" areSamplesShown(studyMatch.study._id)" class="glyphicon glyphicon-triangle-bottom"></span>-->
                      <!--{{ studyMatch.sampleMatches.length }} matching samples-->
                      <!--({{ countMatchingSamplesInSelection(studyMatch) }} selected)-->
                    <!--</a>-->

                    <!--<div *ngIf="areSamplesShown(studyMatch.study._id)">-->
                      <!--<ul style="list-style: none">-->
                        <!--<li *ngFor="let sampleMatch of sortSampleMatches(studyMatch.sampleMatches)">-->
                          <!--<ng-template #tooltipTemplate>-->
                            <!--<div [innerHtml]="tooltipHtmlFor(studyMatch.study._id, sampleMatch)"></div>-->
                          <!--</ng-template>-->
                          <!--<div [my-tooltip]="tooltipTemplate" [placement]="tooltipPlacementForIndex(i)">-->

                            <!--<a *ngIf="!isSampleSelected(studyMatch.study._id, sampleMatch._id)" href="#"-->
                               <!--class="btn btn-success btn-xs" role="button"-->
                               <!--(click)="$event.preventDefault(); selectSample(studyMatch.study._id, sampleMatch._id)">-->
                              <!--<span class="glyphicon glyphicon-plus"></span>-->
                            <!--</a>-->

                            <!--<a *ngIf="isSampleSelected(studyMatch.study._id, sampleMatch._id)" href="#"-->
                               <!--class="btn btn-danger btn-xs" role="button"-->
                               <!--(click)="$event.preventDefault(); deselectSample(studyMatch.study._id, sampleMatch._id)">-->
                              <!--<span class="glyphicon glyphicon-minus"></span>-->
                            <!--</a>-->

                            <!--<b>{{ sampleMatch._source['Sample Name'] }}</b>-->
                            <!--<span *ngFor="let kv of genSampleMiniSummary(studyMatch.study._id, sampleMatch) | mapToIterable; let isLast = last">-->
                              <!--<i>{{ kv.key }}</i>: {{ kv.val }}<span *ngIf="!isLast">, </span>-->
                            <!--</span>-->
                          <!--</div>-->
                        <!--</li>-->
                      <!--</ul>-->
                    <!--</div>-->
                  <!--</div>-->
                  <!--<div class="panel-footer">-->
                    <!--<div class="btn-group btn-group-xs" style="float:right">-->
                      <!--<a *ngFor="let pubmedId of pubmedIdsOf(studyMatch.study)"-->
                         <!--target="_blank"-->
                         <!--class="btn btn-default" role="button"-->
                         <!--pubmed-link [pubmedId]="pubmedId">-->
                        <!--PubMed-->
                      <!--</a>-->

                      <!--<a *ngFor="let doi of doisOf(studyMatch.study)"-->
                         <!--target="_blank"-->
                         <!--class="btn btn-default" role="button"-->
                         <!--doi-link [doi]="doi">-->
                        <!--DOI-->
                      <!--</a>-->

                      <!--<a *ngIf="isAdmin()"-->
                         <!--[href]="studyMatch.study._source['*Archive URL']"-->
                         <!--class="btn btn-default" role="button">-->
                        <!--<span class="glyphicon glyphicon-download-alt"></span>-->
                        <!--Download-->
                      <!--</a>-->
                    <!--</div>-->
                    <!--<div class="clearfix"></div>-->
                  <!--</div>-->
                <!--</div>-->

              <!--</div>-->

              <!--&lt;!&ndash;<div bsModal #detailModal="bs-modal" class="modal fade" role="dialog">&ndash;&gt;-->
                <!--&lt;!&ndash;<div class="modal-dialog">&ndash;&gt;-->

                  <!--&lt;!&ndash;<div class="modal-content">&ndash;&gt;-->
                    <!--&lt;!&ndash;<div class="modal-header">&ndash;&gt;-->
                      <!--&lt;!&ndash;<button type="button" class="close" (click)="detailModal.hide()">&times;</button>&ndash;&gt;-->
                      <!--&lt;!&ndash;<h4 class="modal-title">{{ studyMatch.study._source['STUDY']['Study Title'] }}</h4>&ndash;&gt;-->
                    <!--&lt;!&ndash;</div>&ndash;&gt;-->
                    <!--&lt;!&ndash;<div class="modal-body">&ndash;&gt;-->
                      <!--&lt;!&ndash;<study [studyId]="studyMatch.study._id"></study>&ndash;&gt;-->
                    <!--&lt;!&ndash;</div>&ndash;&gt;-->
                    <!--&lt;!&ndash;<div class="modal-footer">&ndash;&gt;-->
                      <!--&lt;!&ndash;<button type="button" class="btn btn-default" (click)="detailModal.hide()">Close</button>&ndash;&gt;-->
                    <!--&lt;!&ndash;</div>&ndash;&gt;-->
                  <!--&lt;!&ndash;</div>&ndash;&gt;-->

                <!--&lt;!&ndash;</div>&ndash;&gt;-->
              <!--&lt;!&ndash;</div>&ndash;&gt;-->


              <!--<div *ngIf="((i + 1) % 3) === 0" class="clearfix"></div>-->
            <!--</ng-template>-->
          <!--</div>-->

        <!--</div>-->

        <!--<div class="col-xs-3 footer-fixed-bottom nav">-->
          <!--<li>-->
            <!--<a href="javascript:void(0)" (click)="clearFilters()">-->
              <!--<span class="glyphicon glyphicon-ban-circle"></span> Clear Filters-->
            <!--</a>-->
          <!--</li>-->
        <!--</div>-->


      <!--<div bsModal #allFieldsModal="bs-modal" class="modal fade" role="dialog" (onShow)="allFields.refresh()">-->
        <!--<div class="modal-dialog">-->

          <!--<div class="modal-content">-->
            <!--<div class="modal-header">-->
              <!--<button type="button" class="close" (click)="allFieldsModal.hide()">&times;</button>-->
              <!--<h4 class="modal-title">Full list of fields</h4>-->
            <!--</div>-->
            <!--<div class="modal-body">-->
              <!--<all-fields #allFields="allFields"></all-fields>-->
            <!--</div>-->
            <!--<div class="modal-footer">-->
              <!--<button type="button" class="btn btn-default" (click)="allFieldsModal.hide()">Close</button>-->
            <!--</div>-->
          <!--</div>-->

        <!--</div>-->
      <!--</div>-->
    </div>
  `
})
export class BrowserPage implements OnInit, OnDestroy {

  matches: UnifiedMatch[] = [];
  sampleKeys: string[];
  commonKeys: { [studyId: string]: { [key: string]: any } };
  valueRanges: { [studyId: string]: { [fieldName: string]: number } };
  numMatchingStudies = 0;
  numMatchingSamples = 0;
  ready = false;
  stopStream = new Subject<string>();
  fieldMetasReady = false;
  fieldMetas: { [fieldName: string]: FieldMeta } = {};

  constructor(
    private _router: Router,
    private _studyService: StudyService,
    private _filtersService: FiltersService,
    private _downloadSelectionService: DownloadSelectionService,
    private changeDetectorRef: ChangeDetectorRef,
    private _collapseStateService: CollapseStateService,
    private _auth: AuthenticationService
  ) { }

  areSamplesShown(studyId: string) { return !this._collapseStateService.isCollapsed(`samples-for-study-${studyId}`, true); }
  setSamplesShown(studyId: string, value: boolean) { this._collapseStateService.setCollapsed(`samples-for-study-${studyId}`, !value); }

  ngOnInit(): void {

    this.fieldMetasReady = false;
    this._studyService.getAllFieldMetas().then(fieldMetas => {
      this.fieldMetas = fieldMetas;
      this.fieldMetasReady = true;

      // Use switchMap to cancel in-flight queries if new filters are applied in the meantime
      this._filtersService.filters
        .switchMap(filters => {
          this.ready = false;
          this.changeDetectorRef.detectChanges();
          return Observable.fromPromise(<Promise<UnifiedMatch[]>> this._studyService.getUnifiedMatchesAsync(filters));
        })
        .takeUntil(this.stopStream)
        .subscribe(rawMatches => {
          this.updateMatches(rawMatches);
          this.ready = true;

          // Force Angular2 change detection to see ready = true change.
          // Not sure why it's not being picked up automatically
          this.changeDetectorRef.detectChanges();
        });

      this._downloadSelectionService.selection
        .takeUntil(this.stopStream)
        .subscribe(selection => {
          this.updateDownloadSelectionStats();

          // Force Angular2 change detection to see ready = true change.
          // Not sure why it's not being picked up automatically
          this.changeDetectorRef.detectChanges();
        });
    });
  }

  ngOnDestroy() {
    this.stopStream.next('stop');
  }

  updateDownloadSelectionStats() {
    const curSelection = this._downloadSelectionService.getSelection();
  }

  updateMatches(rawMatches: UnifiedMatch[]): void {
    this.matches = rawMatches.sort((a, b) =>
      (
        // Descending by Publication Date
        -(a.study._source['*Publication Date']
          .localeCompare(b.study._source['*Publication Date']))

        ||

        // ...then ascending by study title
        (a.study._source['STUDY']['Study Title']
          .localeCompare(b.study._source['STUDY']['Study Title']))
      )
    );

    const keys = new Set<string>();
    this.matches.forEach(studyMatch => {
      studyMatch.sampleMatches.forEach(sampleMatch => Object.keys(sampleMatch._source).forEach(key => keys.add(key)));
    });
    keys.delete('Sample Name');
    this.sampleKeys = Array.from(keys).sort();

    this.commonKeys = {};
    for (const studyMatch of this.matches) {
      this.commonKeys[studyMatch.study._id] = this._studyService.findCommonFieldValues(studyMatch.sampleMatches);
    }

    this.valueRanges = {};
    for (const studyMatch of this.matches) {
      this.valueRanges[studyMatch.study._id] = this._studyService.calcValueRanges(studyMatch.sampleMatches, this.fieldMetas);
    }

    this.numMatchingStudies = this.matches.length;
    this.numMatchingSamples = this.matches.reduce((soFar, studyMatch) => soFar + studyMatch.sampleMatches.length, 0);
  }

  genSampleSummary(studyId: string, sample: Sample): Object {
    return this._studyService.genSampleSummary(this.commonKeys[studyId], sample, this.fieldMetas, this.valueRanges[studyId], false);
  }

  genSampleMiniSummary(studyId: string, sample: Sample): Object {
    return this._studyService.genSampleSummary(this.commonKeys[studyId], sample, this.fieldMetas, this.valueRanges[studyId], true);
  }

  tooltipHtmlFor(studyId: string, sample: Sample): string {
    let result = '';
    const contents = this.genSampleSummary(studyId, sample);
    for (const key of Object.keys(contents).sort((x: string, y: string) => x.localeCompare(y))) {
      result += `<div><b>${key}</b>: ${contents[key]}</div>`;
    }
    return result;
  }

  tooltipPlacementForIndex(i: number): string {
    if ((i % 3) === 2) {
      return 'left';
    } else {
      return 'right';
    }
  }

  sortSampleMatches(sampleMatches: Sample[]): Sample[] {
    // YUCK! Despite what the mappings in ElasticSearch say, 'Sample Name' in the JSON results can be an integer!
    return sampleMatches.sort((a, b) => (a._source['Sample Name'] + '').localeCompare((b._source['Sample Name'] + '')));
  }

  addAllResultsToSelection() {
    // Reduce matches to study & sample ids (probably should be working with that as our primitive data anyway)
    const allToAdd:  { [studyId: string]: { [sampleId: string]: boolean } } = {};

    for (const studyMatch of this.matches) {
      const studyToAdd = allToAdd[studyMatch.study._id] = {};
      for (const sample of studyMatch.sampleMatches) {
        studyToAdd[sample._id] = true;
      }
    }

    console.log(JSON.stringify(allToAdd));

    // Filtering for excluded studies / samples is done in DownloadSelectionService
    this._downloadSelectionService.addToSelection(allToAdd);
  }

  selectStudy(match: UnifiedMatch): void {
    const toAdd = { [match.study._id]: {} };
    for (const sampleMatch of match.sampleMatches) {
      toAdd[match.study._id][sampleMatch._id] = true;
    }
    this._downloadSelectionService.addToSelection(toAdd);
  }

  deselectStudy(match: UnifiedMatch): void {
    const toRemove = { [match.study._id]: {} };
    for (const sampleMatch of match.sampleMatches) {
      toRemove[match.study._id][sampleMatch._id] = true;
    }
    this._downloadSelectionService.removeFromSelection(toRemove);
  }

  countMatchingSamplesInSelection(match: UnifiedMatch): number {
    const studyId = match.study._id;
    const selection = this._downloadSelectionService.getSelection().selection;

    let numSelectedSamples = 0;
    if (studyId in selection) {
      for (const sampleMatch of match.sampleMatches) {
        if (sampleMatch._id in selection[studyId]) {
          numSelectedSamples++;
        }
      }
    }
    return numSelectedSamples;
  }

  // Returns either 'yes', 'no', or 'partial'
  studySelectedState(match: UnifiedMatch): string {
    const numSampleMatches = match.sampleMatches.length;
    const numSelectedSamples = this.countMatchingSamplesInSelection(match);

    if (numSelectedSamples === 0) {
      return 'no';
    } else if (numSelectedSamples === numSampleMatches) {
      return 'yes';
    } else {
      return 'partial';
    }
  }

  isSampleSelected(studyId: string, sampleId: string): boolean {
    const selection = this._downloadSelectionService.getSelection().selection;
    return (studyId in selection) && (sampleId in selection[studyId]);
  }

  selectSample(studyId: string, sampleId: string): void {
    this._downloadSelectionService.addToSelection({
      [studyId]: {
        [sampleId]: true
      }
    });
  }

  deselectSample(studyId: string, sampleId: string): void {
    this._downloadSelectionService.removeFromSelection({
      [studyId]: {
        [sampleId]: true
      }
    });
  }

  proceedToDownload() {
    this._router.navigate(['/download']);
  }

  clearFilters(): void {
    this._filtersService.clearFilters();
  }

  pubmedIdsOf(study: Study): string[] {
    return (((study && study._source && study._source['STUDY PUBLICATIONS']) || [])
        .filter((p: RawStudyPublication) => p['Study PubMed ID'])
        .map((p: RawStudyPublication) => p['Study PubMed ID'])
    );
  }

  doisOf(study: Study): string[] {
    return (((study && study._source && study._source['STUDY PUBLICATIONS']) || [])
        .filter((p: RawStudyPublication) => p['Study Publication DOI'])
        .map((p: RawStudyPublication) => p['Study Publication DOI'])
    );
  }

  isAdmin() {
    // return !this._auth.isGuest;
    return true;
  }
}
