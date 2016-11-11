import {Component, Input, ChangeDetectorRef, OnInit, OnDestroy} from '@angular/core';
import {StudyService, UnifiedMatch, SampleMatch} from "./services/study.service";
import {Study, Sample} from "./common/study.model";
import {Router} from "@angular/router";
import {FiltersService, FiltersState} from "./services/filters.service";
import {FormControl, Form} from "@angular/forms";
import {HIDDEN_SAMPLE_FILTER_LABELS} from "./filters/filter-sidebar.component";
import {Observable, Subject} from "rxjs";

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
  `],
  providers: [StudyService]
})
export class BrowserComponent implements OnInit, OnDestroy {

  matches: UnifiedMatch[] = [];
  sampleKeys: string[];
  commonKeys: { [studyId: string]: { [key: string]: any } };
  areSamplesHidden: { [studyId: string]: boolean } = {};
  numMatchingStudies: number = 0;
  numMatchingSamples: number = 0;
  numExcludedStudies: number = 0;
  numExcludedSamples: number = 0;
  ready = false;
  stopStream = new Subject<string>();

  constructor(
    private _router: Router,
    private _studyService: StudyService,
    private _filtersService: FiltersService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  selectStudy(study: Study): void {
    let link = ['/study', study.id];
    this._router.navigate(link);
  }

  ngOnInit(): void {
    // Use switchMap to cancel in-flight queries if new filters are applied in the meantime
    this._filtersService.filters
      .switchMap(filters => {
        this.ready = false;
        this.updateDownloadSelectionStats();

        // Force Angular2 change detection to see ready = true change.
        // Not sure why it's not being picked up automatically
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
  }

  ngOnDestroy() {
    this.stopStream.next('stop');
  }

  updateDownloadSelectionStats() {
    let curFilters = this._filtersService.getFilters();
    this.numExcludedStudies = Object.keys(curFilters.studiesExcludedForDownload).length;
    this.numExcludedSamples = Object.keys(curFilters.samplesExcludedForDownload).length;
  }

  updateMatches(rawMatches: UnifiedMatch[]): void {
    this.matches = rawMatches.sort((a, b) =>
      a.study._source['STUDY']['Study Researchers Involved']
        .localeCompare(b.study._source['STUDY']['Study Researchers Involved']));

    let keys = new Set<string>();
    this.matches.forEach(studyMatch => {
      studyMatch.sampleMatches.forEach(sampleMatch => Object.keys(sampleMatch.sample._source).forEach(key => keys.add(key)));
    });
    keys.delete('Sample Name');
    this.sampleKeys = Array.from(keys).sort();

    // By default, show matching samples
    for (let studyMatch of this.matches) {
      if (!(studyMatch.studyId in this.areSamplesHidden)) {
        this.areSamplesHidden[studyMatch.studyId] = false;
      }
    }

    this.commonKeys = {};
    for (let studyMatch of this.matches) {
      let studyCommonKeys = {};
      if (studyMatch.sampleMatches.length > 0) {
        let firstSampleMatch = studyMatch.sampleMatches[0];
        for (let key in firstSampleMatch.sample._source) {
          studyCommonKeys[key] = firstSampleMatch.sample._source[key];
        }

        for (let sampleMatch of studyMatch.sampleMatches) {
          for (let commonKey in studyCommonKeys) {
            if (!(commonKey in sampleMatch.sample._source) ||
              (sampleMatch.sample._source[commonKey] !== studyCommonKeys[commonKey])) {
              delete studyCommonKeys[commonKey];
            }
          }
        }
      }

      this.commonKeys[studyMatch.studyId] = studyCommonKeys;
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

  sortSampleMatches(sampleMatches: SampleMatch[]): SampleMatch[] {
    return sampleMatches.sort((a, b) => a.sample._source['Sample Name'].localeCompare(b.sample._source['Sample Name']))
  }

  isStudySelected(studyId: string) {
    return !(studyId in this._filtersService.getFilters().studiesExcludedForDownload);
  }

  updateStudySelection(e: any, studyId: string) {
    this._filtersService.setStudySelected(studyId, e.target.checked);
  }

  isSampleSelected(sampleId: number) {
    return !(sampleId in this._filtersService.getFilters().samplesExcludedForDownload);
  }

  updateSampleSelection(e: any, sampleId: number) {
    this._filtersService.setSampleSelected(sampleId, e.target.checked);
  }
}
