import {Component, ChangeDetectorRef, OnInit, OnDestroy} from '@angular/core';
import {StudyService, UnifiedMatch} from "./services/study.service";
import {Study, Sample, RawStudyPublication} from "./common/study.model";
import {Router} from "@angular/router";
import {FiltersService} from "./services/filters.service";
import {HIDDEN_SAMPLE_FILTER_LABELS} from "./filters/sample-filters.component";
import {Observable, Subject} from "rxjs";
import {DownloadSelectionService} from "./services/download-selection.service";
import {CollapseStateService} from "./services/collapse-state.service";

export const KEYS_IN_MINI_SUMMARY = {
  // Key = value name in sample metadata
  // Value = name to use in mini-summary
  'Assay Type':              'Assay Type',
  'Control':                 'Control',
  'Organism':                'Organism',
  'Cell type':               'Cell type',
  'Strain abbreviation':     'Strain',
  'Organ':                   'Organ',
  'Compound abbreviation':   'Compound',
  'Dose (mM)':               'Dose (mM)',  // TODO: Use sensible units, i.e. unitful number between 1 and 1000
  'Material abbreviation':   'Material',
  'Material Class':          'Material Class',
  'Material Shape':          'Material Shape'
};

@Component({
  selector: 'browser',
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-3 sidebar">
          <filter-sidebar [allFieldsModal]="allFieldsModal"></filter-sidebar>
        </div>
    
        <div class="col-xs-9 col-xs-offset-3 main">
    
          <div class="h1">
            Results
            <spinner *ngIf="!ready"></spinner>
            <button class="btn btn-success addAllResultsButton" (click)="addAllResultsToSelection()">
              <span class="glyphicon glyphicon-plus"></span> Select All Results
            </button>
          </div>
          <div class="resultsCounts">
            {{ numMatchingStudies }} studies, {{ numMatchingSamples }} samples
          </div>
    
          <div class="row">
    
            <!-- Have to expand *ngFor manually here to insert clearfix every 3 items -->
            <template ngFor let-studyMatch [ngForOf]="matches" let-i="index">
              <div class="col-md-4">
    
                <div class="panel"
                     [class.panel-default]="studySelectedState(studyMatch) === 'no'"
                     [class.panel-success]="studySelectedState(studyMatch) === 'yes'"
                     [class.panel-warning]="studySelectedState(studyMatch) === 'partial'"
                >
                  <div class="panel-heading">
    
                    <a (click)="$event.preventDefault(); detailModal.show()" href="#">
                      <h3 class="panel-title" style="float:left;width:80%">{{ studyMatch.study._source['STUDY']['Study Title'] }}</h3>
                    </a>
                    <div *ngIf="!studyMatch.study._source['*Visible']" class="embargo">[Invisible to public!]</div>
    
                    <div [ngSwitch]="studySelectedState(studyMatch)" class="panel-heading-plus-minus-buttons">
    
                      <a *ngSwitchCase="'no'" href="#" class="btn btn-success btn-xs" role="button"
                         (click)="$event.preventDefault(); selectStudy(studyMatch)">
                        <span class="glyphicon glyphicon-plus"></span>
                      </a>
    
                      <a *ngSwitchCase="'partial'" href="#" class="btn btn-success btn-xs" role="button"
                         (click)="$event.preventDefault(); selectStudy(studyMatch)">
                        <span class="glyphicon glyphicon-plus"></span>
                      </a>
                      <a *ngSwitchCase="'partial'" href="#" class="btn btn-danger btn-xs" role="button"
                         (click)="$event.preventDefault(); deselectStudy(studyMatch)">
                        <span class="glyphicon glyphicon-minus"></span>
                      </a>
    
                      <a *ngSwitchCase="'yes'" href="#" class="btn btn-danger btn-xs" role="button"
                         (click)="$event.preventDefault(); deselectStudy(studyMatch)">
                        <span class="glyphicon glyphicon-minus"></span>
                      </a>
    
                    </div>
                    <div class="clearfix"></div>
                  </div>
                  <div class="panel-body">
                    <p>by {{ studyMatch.study._source['STUDY']['Study Researchers Involved'] }}</p>
    
                    <a (click)="setSamplesShown(studyMatch.study._id, !areSamplesShown(studyMatch.study._id))" href="javascript:void(0)">
                      <span *ngIf="!areSamplesShown(studyMatch.study._id)" class="glyphicon glyphicon-triangle-right"></span>
                      <span *ngIf=" areSamplesShown(studyMatch.study._id)" class="glyphicon glyphicon-triangle-bottom"></span>
                      {{ studyMatch.sampleMatches.length }} matching samples
                      ({{ countMatchingSamplesInSelection(studyMatch) }} selected)
                    </a>
    
                    <div *ngIf="areSamplesShown(studyMatch.study._id)">
                      <ul style="list-style: none">
                        <li *ngFor="let sampleMatch of sortSampleMatches(studyMatch.sampleMatches)">
                          <div class="showonhover">
    
                            <a *ngIf="!isSampleSelected(studyMatch.study._id, sampleMatch._id)" href="#"
                               class="btn btn-success btn-xs" role="button"
                               (click)="$event.preventDefault(); selectSample(studyMatch.study._id, sampleMatch._id)">
                              <span class="glyphicon glyphicon-plus"></span>
                            </a>
    
                            <a *ngIf="isSampleSelected(studyMatch.study._id, sampleMatch._id)" href="#"
                               class="btn btn-danger btn-xs" role="button"
                               (click)="$event.preventDefault(); deselectSample(studyMatch.study._id, sampleMatch._id)">
                              <span class="glyphicon glyphicon-minus"></span>
                            </a>
    
                            <b>{{ sampleMatch._source['Sample Name'] }}</b>
                            <span *ngFor="let kv of filteredDistinctKeyValues(studyMatch.study._id, sampleMatch) | mapToIterable; let isLast = last">
                              <i>{{ kv.key }}</i>: {{ kv.val }}<span *ngIf="!isLast">, </span>
                            </span>
    
                            <div class="hovertext">
                              <div *ngFor="let kv of distinctKeyValues(studyMatch.study._id, sampleMatch) | mapToIterable">
                                <b>{{ kv.key }}</b>: {{ kv.val }}
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="panel-footer">
                    <div class="btn-group btn-group-xs" style="float:right">
                      <a *ngFor="let pubmedId of pubmedIdsOf(studyMatch.study)"
                         target="_blank"
                         class="btn btn-default" role="button"
                         pubmed-link [pubmedId]="pubmedId">
                        PubMed
                      </a>
    
                      <a *ngFor="let doi of doisOf(studyMatch.study)"
                         target="_blank"
                         class="btn btn-default" role="button"
                         doi-link [doi]="doi">
                        DOI
                      </a>
    
                      <a [href]="studyMatch.study._source['*Archive URL']"
                         class="btn btn-default" role="button">
                        <span class="glyphicon glyphicon-download-alt"></span>
                        Download
                      </a>
                    </div>
                    <div class="clearfix"></div>
                  </div>
                </div>
    
              </div>
    
              <div bsModal #detailModal="bs-modal" class="modal fade" role="dialog">
                <div class="modal-dialog">
    
                  <div class="modal-content">
                    <div class="modal-header">
                      <button type="button" class="close" (click)="detailModal.hide()">&times;</button>
                      <h4 class="modal-title">{{ studyMatch.study._source['STUDY']['Study Title'] }}</h4>
                    </div>
                    <div class="modal-body">
                      <study [studyId]="studyMatch.study._id"></study>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-default" (click)="detailModal.hide()">Close</button>
                    </div>
                  </div>
    
                </div>
              </div>
    
    
              <div *ngIf="((i + 1) % 3) === 0" class="clearfix"></div>
            </template>
          </div>
    
        </div>
    
        <div class="col-xs-3 footer-fixed-bottom nav">
          <li>
            <a href="javascript:void(0)" (click)="clearFilters()">
              <span class="glyphicon glyphicon-ban-circle"></span> Clear Filters
            </a>
          </li>
        </div>
      </div>
    
    
      <div bsModal #allFieldsModal="bs-modal" class="modal fade" role="dialog" (onShow)="allFields.refresh()">
        <div class="modal-dialog">
    
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" (click)="allFieldsModal.hide()">&times;</button>
              <h4 class="modal-title">Full list of fields</h4>
            </div>
            <div class="modal-body">
              <all-fields #allFields="allFields"></all-fields>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" (click)="allFieldsModal.hide()">Close</button>
            </div>
          </div>
    
        </div>
      </div>
    </div>
  `,
  styles: [`
    .showonhover .hovertext {
      display: none;
      position:relative;
      font-size: 10px;
      left: 20%;
      z-index: 999;
      background:#e0e0e0;
      padding:0px 7px;
      border: 1px solid #c0c0c0;
      box-shadow: 2px 4px 5px rgba(0, 0, 0, 0.4);
    
      opacity: 0;
      transition:opacity 0.4s ease-out;
    }
    .showonhover:hover .hovertext {
      position: absolute;
      display: block;
      opacity: 1;
    }
    
    /*
     * Sidebar
     */
    
    .sidebar {
      position: fixed;
      top: 51px;
      bottom: 0;
      margin-bottom: 60px;
      left: 0;
      z-index: 1000;
      display: block;
      padding: 10px;
      overflow-x: hidden;
      overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
      background-color: #f5f5f5;
      border-right: 1px solid #eee;
    }
    
    /*
     * Footer
     */
    
    .footer-fixed-bottom {
      position: fixed;
      bottom: 0px;
      height: 60px;
      left: 0;
      z-index: 1001;
      display: block;
      padding: 10px;
      overflow-x: hidden;
      overflow-y: hidden;
      background-color: #f5f5f5;
      border-top: 1px solid #eee;
      border-right: 1px solid #eee;
    }
    
    /*
     * Main content
     */
    
    .main {
      padding-right: 20px;
      padding-left: 20px;
    }
    .main .page-header {
      margin-top: 0;
    }
    
    .resultsCounts {
      font-size: 90%;
      margin-bottom: 20px;
      font-style: oblique;
    }
    
    .addAllResultsButton {
      float: right;
      margin-top: 20px;
    }
    
    /*
     * Corrections for panel headings
     */
    div.panel-heading {
      position: relative;
    }
    
    div.panel-heading-plus-minus-buttons {
      position: absolute;
      top: 10px;
      right: 10px;
    }
    
    div.panel-heading embargo {
      font-style: italic;
    }
  `]
})
export class BrowserComponent implements OnInit, OnDestroy {

  matches: UnifiedMatch[] = [];
  sampleKeys: string[];
  commonKeys: { [studyId: string]: { [key: string]: any } };
  numMatchingStudies: number = 0;
  numMatchingSamples: number = 0;
  ready = false;
  stopStream = new Subject<string>();

  constructor(
    private _router: Router,
    private _studyService: StudyService,
    private _filtersService: FiltersService,
    private _downloadSelectionService: DownloadSelectionService,
    private changeDetectorRef: ChangeDetectorRef,
    private _collapseStateService: CollapseStateService
  ) { }

  areSamplesShown(studyId: string) { return !this._collapseStateService.isCollapsed(`samples-for-study-${studyId}`, true); }
  setSamplesShown(studyId: string, value: boolean) { this._collapseStateService.setCollapsed(`samples-for-study-${studyId}`, !value); }

  ngOnInit(): void {
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
      })
  }

  ngOnDestroy() {
    this.stopStream.next('stop');
  }

  updateDownloadSelectionStats() {
    let curSelection = this._downloadSelectionService.getSelection();
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

    let keys = new Set<string>();
    this.matches.forEach(studyMatch => {
      studyMatch.sampleMatches.forEach(sampleMatch => Object.keys(sampleMatch._source).forEach(key => keys.add(key)));
    });
    keys.delete('Sample Name');
    this.sampleKeys = Array.from(keys).sort();

    this.commonKeys = {};
    for (let studyMatch of this.matches) {
      let studyCommonKeys = {};
      if (studyMatch.sampleMatches.length > 0) {
        let firstSampleMatch = studyMatch.sampleMatches[0];
        for (let key in firstSampleMatch._source) {
          studyCommonKeys[key] = firstSampleMatch._source[key];
        }

        for (let sampleMatch of studyMatch.sampleMatches) {
          for (let commonKey in studyCommonKeys) {
            if (!(commonKey in sampleMatch._source) ||
              (sampleMatch._source[commonKey] !== studyCommonKeys[commonKey])) {
              delete studyCommonKeys[commonKey];
            }
          }
        }
      }

      this.commonKeys[studyMatch.study._id] = studyCommonKeys;
    }

    this.numMatchingStudies = this.matches.length;
    this.numMatchingSamples = this.matches.reduce((soFar, studyMatch) => soFar + studyMatch.sampleMatches.length, 0);
  }

  distinctKeyValues(studyId: string, sample: Sample): Object {
    let ignoreSampleKeys = {
      'Sample ID': true
    }
    var result = {};
    for (let key of Object.keys(sample._source)
        .filter(key => !(key in this.commonKeys[studyId]))
        .filter(key => !(key in ignoreSampleKeys))
        .filter(key => !(key in HIDDEN_SAMPLE_FILTER_LABELS))
        .filter(key => sample._source[key] !== sample._source['Sample Name'])) {

      let keyWithoutStar = (key.substr(0,1) === '*' ? key.substr(1) : key);
      result[keyWithoutStar] = sample._source[key];
    }
    return result;
  }

  filteredDistinctKeyValues(studyId: string, sample: Sample): Object {
    var result = {};
    for (let key of Object.keys(sample._source)) {
      if ((key in KEYS_IN_MINI_SUMMARY) &&
        !(key in this.commonKeys[studyId]) &&
        (sample._source[key] !== sample._source['Sample Name'])
      ) {
        let shortKey = KEYS_IN_MINI_SUMMARY[key];
        result[shortKey] = sample._source[key];
      }
    }
    return result;
  }

  sortSampleMatches(sampleMatches: Sample[]): Sample[] {
    // YUCK! Despite what the mappings in ElasticSearch say, 'Sample Name' in the JSON results can be an integer!
    return sampleMatches.sort((a, b) => (a._source['Sample Name'] + '').localeCompare((b._source['Sample Name'] + '')))
  }

  addAllResultsToSelection() {
    // Reduce matches to study & sample ids (probably should be working with that as our primitive data anyway)
    let allToAdd:  { [studyId: string]: { [sampleId: string]: boolean } } = {};

    for (let studyMatch of this.matches) {
      let studyToAdd = allToAdd[studyMatch.study._id] = {};
      for (let sample of studyMatch.sampleMatches) {
        studyToAdd[sample._id] = true;
      }
    }

    console.log(JSON.stringify(allToAdd));

    // Filtering for excluded studies / samples is done in DownloadSelectionService
    this._downloadSelectionService.addToSelection(allToAdd);
  }

  selectStudy(match: UnifiedMatch): void {
    let toAdd = { [match.study._id]: {} };
    for (let sampleMatch of match.sampleMatches) {
      toAdd[match.study._id][sampleMatch._id] = true;
    }
    this._downloadSelectionService.addToSelection(toAdd);
  }

  deselectStudy(match: UnifiedMatch): void {
    let toRemove = { [match.study._id]: {} };
    for (let sampleMatch of match.sampleMatches) {
      toRemove[match.study._id][sampleMatch._id] = true;
    }
    this._downloadSelectionService.removeFromSelection(toRemove);
  }

  countMatchingSamplesInSelection(match: UnifiedMatch): number {
    let studyId = match.study._id;
    let selection = this._downloadSelectionService.getSelection().selection;

    let numSelectedSamples = 0;
    if (studyId in selection) {
      for (let sampleMatch of match.sampleMatches) {
        if (sampleMatch._id in selection[studyId]) {
          numSelectedSamples++;
        }
      }
    }
    return numSelectedSamples
  }

  // Returns either 'yes', 'no', or 'partial'
  studySelectedState(match: UnifiedMatch): string {
    let numSampleMatches = match.sampleMatches.length;
    let numSelectedSamples = this.countMatchingSamplesInSelection(match);

    if (numSelectedSamples === 0) {
      return 'no';
    } else if (numSelectedSamples === numSampleMatches) {
      return 'yes';
    } else {
      return 'partial';
    }
  }

  isSampleSelected(studyId: string, sampleId: string): boolean {
    let selection = this._downloadSelectionService.getSelection().selection;
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
        .map((p: RawStudyPublication) => p['Study PubMed ID'])
    );
  }

  doisOf(study: Study): string[] {
    return (((study && study._source && study._source['STUDY PUBLICATIONS']) || [])
      .map((p: RawStudyPublication) => p['Study Publication DOI'])
    );
  }
}
