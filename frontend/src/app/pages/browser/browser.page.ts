import {Component, ChangeDetectorRef, OnInit, OnDestroy} from '@angular/core';
import {StudyService, UnifiedMatch} from '../../services/study.service';
import {Router} from '@angular/router';
import {FiltersService} from '../../services/filters.service';
import {DownloadSelectionService} from '../../services/download-selection.service';
import {CollapseStateService} from '../../services/collapse-state.service';
import {AuthenticationService} from '../../core/authentication/authentication.service';
import {FieldMetaService} from '../../core/services/field-meta.service';

@Component({
  styleUrls: ['./browser.scss'],
  template: `
    <div class="container-fluid">
      <div class="row no-gutters">
        <div class="col-3 sidebar">
          <cbit-filter-sidebar></cbit-filter-sidebar>
        </div>

        <div class="col-9 main">
          <cbit-study-results [results]="matches"></cbit-study-results>
        </div>
      </div>
    </div>
  `
})
export class BrowserPage implements OnInit {

  public matches: UnifiedMatch[] = [];

  // sampleKeys: string[];
  // commonKeys: { [studyId: string]: { [key: string]: any } };
  // valueRanges: { [studyId: string]: { [fieldName: string]: number } };
  // ready = false;
  // stopStream = new Subject<string>();
  // fieldMetas: { [fieldName: string]: FieldMeta } = {};

  constructor(private fieldMetaService: FieldMetaService,
              private _router: Router,
              private _studyService: StudyService,
              private _filtersService: FiltersService,
              private _downloadSelectionService: DownloadSelectionService,
              private changeDetectorRef: ChangeDetectorRef,
              private _collapseStateService: CollapseStateService,
              private _auth: AuthenticationService) {
  }

  ngOnInit(): void {

    this.fieldMetaService.getAllFieldMetas().then(fieldMetas => {
      console.log(fieldMetas);
      // this.fieldMetas = fieldMetas;

      // Use switchMap to cancel in-flight queries if new filters are applied in the meantime
      // this._filtersService.filters
      //   .switchMap(filters => {
      //     this.ready = false;
      //     this.changeDetectorRef.detectChanges();
      //     return Observable.fromPromise(<Promise<UnifiedMatch[]>> this._studyService.getUnifiedMatchesAsync(filters));
      //   })
      //   .takeUntil(this.stopStream)
      //   .subscribe(rawMatches => {
      //     this.updateMatches(rawMatches);
      //     this.ready = true;
      //
      //     // Force Angular2 change detection to see ready = true change.
      //     // Not sure why it's not being picked up automatically
      //     this.changeDetectorRef.detectChanges();
      //   });
      //
      // this._downloadSelectionService.selection
      //   .takeUntil(this.stopStream)
      //   .subscribe(selection => {
      //     this.updateDownloadSelectionStats();
      //
      //     // Force Angular2 change detection to see ready = true change.
      //     // Not sure why it's not being picked up automatically
      //     this.changeDetectorRef.detectChanges();
      //   });
    });
  }

  // ngOnDestroy() {
  //   this.stopStream.next('stop');
  // }

  // areSamplesShown(studyId: string) {
  //   return !this._collapseStateService.isCollapsed(`samples-for-study-${studyId}`, true);
  // }
  //
  // setSamplesShown(studyId: string, value: boolean) {
  //   this._collapseStateService.setCollapsed(`samples-for-study-${studyId}`, !value);
  // }

  // updateDownloadSelectionStats() {
  //   const curSelection = this._downloadSelectionService.getSelection();
  // }
  //
  // updateMatches(rawMatches: UnifiedMatch[]): void {
  //   this.matches = rawMatches.sort((a, b) =>
  //     (
  //       // Descending by Publication Date
  //       -(a.study._source['*Publication Date']
  //         .localeCompare(b.study._source['*Publication Date']))
  //
  //       ||
  //
  //       // ...then ascending by study title
  //       (a.study._source['STUDY']['Study Title']
  //         .localeCompare(b.study._source['STUDY']['Study Title']))
  //     )
  //   );
  //
  //   const keys = new Set<string>();
  //   this.matches.forEach(studyMatch => {
  //     studyMatch.sampleMatches.forEach(sampleMatch => Object.keys(sampleMatch._source).forEach(key => keys.add(key)));
  //   });
  //   keys.delete('Sample Name');
  //   this.sampleKeys = Array.from(keys).sort();
  //
  //   this.commonKeys = {};
  //   for (const studyMatch of this.matches) {
  //     this.commonKeys[studyMatch.study._id] = this._studyService.findCommonFieldValues(studyMatch.sampleMatches);
  //   }
  //
  //   this.valueRanges = {};
  //   for (const studyMatch of this.matches) {
  //     this.valueRanges[studyMatch.study._id] = this._studyService.calcValueRanges(studyMatch.sampleMatches, this.fieldMetas);
  //   }
  // }
  //
  // genSampleSummary(studyId: string, sample: Sample): Object {
  //   return this._studyService.genSampleSummary(this.commonKeys[studyId], sample, this.fieldMetas, this.valueRanges[studyId], false);
  // }
  //
  // genSampleMiniSummary(studyId: string, sample: Sample): Object {
  //   return this._studyService.genSampleSummary(this.commonKeys[studyId], sample, this.fieldMetas, this.valueRanges[studyId], true);
  // }
  //
  // sortSampleMatches(sampleMatches: Sample[]): Sample[] {
  //   // YUCK! Despite what the mappings in ElasticSearch say, 'Sample Name' in the JSON results can be an integer!
  //   return sampleMatches.sort((a, b) => (a._source['Sample Name'] + '').localeCompare((b._source['Sample Name'] + '')));
  // }
  //
  // addAllResultsToSelection() {
  //   // Reduce matches to study & sample ids (probably should be working with that as our primitive data anyway)
  //   const allToAdd: { [studyId: string]: { [sampleId: string]: boolean } } = {};
  //
  //   for (const studyMatch of this.matches) {
  //     const studyToAdd = allToAdd[studyMatch.study._id] = {};
  //     for (const sample of studyMatch.sampleMatches) {
  //       studyToAdd[sample._id] = true;
  //     }
  //   }
  //
  //   console.log(JSON.stringify(allToAdd));
  //
  //   // Filtering for excluded studies / samples is done in DownloadSelectionService
  //   this._downloadSelectionService.addToSelection(allToAdd);
  // }
  //
  // selectStudy(match: UnifiedMatch): void {
  //   const toAdd = {[match.study._id]: {}};
  //   for (const sampleMatch of match.sampleMatches) {
  //     toAdd[match.study._id][sampleMatch._id] = true;
  //   }
  //   this._downloadSelectionService.addToSelection(toAdd);
  // }
  //
  // deselectStudy(match: UnifiedMatch): void {
  //   const toRemove = {[match.study._id]: {}};
  //   for (const sampleMatch of match.sampleMatches) {
  //     toRemove[match.study._id][sampleMatch._id] = true;
  //   }
  //   this._downloadSelectionService.removeFromSelection(toRemove);
  // }
  //
  // countMatchingSamplesInSelection(match: UnifiedMatch): number {
  //   const studyId = match.study._id;
  //   const selection = this._downloadSelectionService.getSelection().selection;
  //
  //   let numSelectedSamples = 0;
  //   if (studyId in selection) {
  //     for (const sampleMatch of match.sampleMatches) {
  //       if (sampleMatch._id in selection[studyId]) {
  //         numSelectedSamples++;
  //       }
  //     }
  //   }
  //   return numSelectedSamples;
  // }
  //
  // // Returns either 'yes', 'no', or 'partial'
  // studySelectedState(match: UnifiedMatch): string {
  //   const numSampleMatches = match.sampleMatches.length;
  //   const numSelectedSamples = this.countMatchingSamplesInSelection(match);
  //
  //   if (numSelectedSamples === 0) {
  //     return 'no';
  //   } else if (numSelectedSamples === numSampleMatches) {
  //     return 'yes';
  //   } else {
  //     return 'partial';
  //   }
  // }
  //
  // isSampleSelected(studyId: string, sampleId: string): boolean {
  //   const selection = this._downloadSelectionService.getSelection().selection;
  //   return (studyId in selection) && (sampleId in selection[studyId]);
  // }
  //
  // selectSample(studyId: string, sampleId: string): void {
  //   this._downloadSelectionService.addToSelection({
  //     [studyId]: {
  //       [sampleId]: true
  //     }
  //   });
  // }
  //
  // deselectSample(studyId: string, sampleId: string): void {
  //   this._downloadSelectionService.removeFromSelection({
  //     [studyId]: {
  //       [sampleId]: true
  //     }
  //   });
  // }
  //
  // proceedToDownload() {
  //   this._router.navigate(['/download']);
  // }
  //
  // clearFilters(): void {
  //   this._filtersService.clearFilters();
  // }
  //
  // pubmedIdsOf(study: Study): string[] {
  //   return (((study && study._source && study._source['STUDY PUBLICATIONS']) || [])
  //       .filter((p: RawStudyPublication) => p['Study PubMed ID'])
  //       .map((p: RawStudyPublication) => p['Study PubMed ID'])
  //   );
  // }
  //
  // doisOf(study: Study): string[] {
  //   return (((study && study._source && study._source['STUDY PUBLICATIONS']) || [])
  //       .filter((p: RawStudyPublication) => p['Study Publication DOI'])
  //       .map((p: RawStudyPublication) => p['Study Publication DOI'])
  //   );
  // }
  //
  // isAdmin() {
  //   // return !this._auth.isGuest;
  //   return true;
  // }
}
