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
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.css']
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
