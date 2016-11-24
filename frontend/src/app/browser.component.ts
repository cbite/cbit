import {Component, ChangeDetectorRef, OnInit, OnDestroy} from '@angular/core';
import {StudyService, UnifiedMatch} from "./services/study.service";
import {Study, Sample, RawStudyPublication} from "./common/study.model";
import {Router} from "@angular/router";
import {FiltersService} from "./services/filters.service";
import {HIDDEN_SAMPLE_FILTER_LABELS} from "./filters/sample-filters.component";
import {Observable, Subject} from "rxjs";
import {DownloadSelectionService} from "./services/download-selection.service";

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
  styleUrls: ['./browser.component.css'],
  providers: [StudyService]
})
export class BrowserComponent implements OnInit, OnDestroy {

  matches: UnifiedMatch[] = [];
  sampleKeys: string[];
  commonKeys: { [studyId: string]: { [key: string]: any } };
  areSamplesShown: { [studyId: string]: boolean } = {};
  numMatchingStudies: number = 0;
  numMatchingSamples: number = 0;
  numStudiesInCart: number = 0;
  numSamplesInCart: number = 0;
  numExcludedStudies: number = 0;
  numExcludedSamples: number = 0;
  ready = false;
  stopStream = new Subject<string>();

  constructor(
    private _router: Router,
    private _studyService: StudyService,
    private _filtersService: FiltersService,
    private _downloadSelectionService: DownloadSelectionService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  selectStudy(study: Study): void {
    let link = ['/study', study._id];
    this._router.navigate(link);
  }

  ngOnInit(): void {
    // Use switchMap to cancel in-flight queries if new filters are applied in the meantime
    this._filtersService.filters
      .switchMap(filters => {
        this.ready = false;
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

    this.numExcludedStudies = Object.keys(curSelection.studiesExcludedFromAddToCart).length;
    this.numExcludedSamples = Object.keys(curSelection.samplesExcludedFromAddToCart).length;
  }

  updateMatches(rawMatches: UnifiedMatch[]): void {
    this.matches = rawMatches.sort((a, b) =>
      a.study._source['STUDY']['Study Researchers Involved']
        .localeCompare(b.study._source['STUDY']['Study Researchers Involved']));

    let keys = new Set<string>();
    this.matches.forEach(studyMatch => {
      studyMatch.sampleMatches.forEach(sampleMatch => Object.keys(sampleMatch._source).forEach(key => keys.add(key)));
    });
    keys.delete('Sample Name');
    this.sampleKeys = Array.from(keys).sort();

    // By default, hide matching samples
    for (let studyMatch of this.matches) {
      if (!(studyMatch.study._id in this.areSamplesShown)) {
        this.areSamplesShown[studyMatch.study._id] = false;
      }
    }

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

  isStudySelected(studyId: string) {
    return !(studyId in this._downloadSelectionService.getSelection().studiesExcludedFromAddToCart);
  }

  updateStudySelection(e: any, studyId: string) {
    this._downloadSelectionService.setStudySelected(studyId, e.target.checked);
  }

  isSampleSelected(sampleId: string) {
    return !(sampleId in this._downloadSelectionService.getSelection().samplesExcludedFromAddToCart);
  }

  //updateSampleSelection(e: any, sampleId: string) {
  //  this._downloadSelectionService.setSampleSelected(sampleId, e.target.checked);
  //}

  toggleSampleSelection(sampleId: string) {
    this._downloadSelectionService.setSampleSelected(sampleId, !this.isSampleSelected(sampleId));
  }

  clearExclusions() {
    this._downloadSelectionService.clearExclusions();
  }

  clearCart() {
    this._downloadSelectionService.clearCart();
  }

  addCurrentSelectionToCart() {
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
    this._downloadSelectionService.addToCart(allToAdd);
  }

  addStudyToCart(match: UnifiedMatch): void {
    let toAdd = { [match.study._id]: {} };
    for (let sampleMatch of match.sampleMatches) {
      toAdd[match.study._id][sampleMatch._id] = true;
    }
    this._downloadSelectionService.addToCart(toAdd);
  }

  removeStudyFromCart(match: UnifiedMatch): void {
    let toRemove = { [match.study._id]: {} };
    for (let sampleMatch of match.sampleMatches) {
      toRemove[match.study._id][sampleMatch._id] = true;
    }
    this._downloadSelectionService.removeFromCart(toRemove);
  }

  countMatchingSamplesInCart(match: UnifiedMatch): number {
    let studyId = match.study._id;
    let cart = this._downloadSelectionService.getSelection().inCart;

    let numSamplesInCart = 0;
    if (studyId in cart) {
      for (let sampleMatch of match.sampleMatches) {
        if (sampleMatch._id in cart[studyId]) {
          numSamplesInCart++;
        }
      }
    }
    return numSamplesInCart
  }

  // Returns either 'yes', 'no', or 'partial'
  studyMatchInCartState(match: UnifiedMatch): string {
    let numSampleMatches = match.sampleMatches.length;
    let numSamplesInCart = this.countMatchingSamplesInCart(match);

    if (numSamplesInCart === 0) {
      return 'no';
    } else if (numSamplesInCart === numSampleMatches) {
      return 'yes';
    } else {
      return 'partial';
    }
  }

  isSampleInCart(studyId: string, sampleId: string): boolean {
    let cart = this._downloadSelectionService.getSelection().inCart;
    return (studyId in cart) && (sampleId in cart[studyId]);
  }

  addSampleToCart(studyId: string, sampleId: string): void {
    this._downloadSelectionService.addToCart({
      [studyId]: {
        [sampleId]: true
      }
    });
  }

  removeSampleFromCart(studyId: string, sampleId: string): void {
    this._downloadSelectionService.removeFromCart({
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
