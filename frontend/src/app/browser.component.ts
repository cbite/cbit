import {Component, Input} from '@angular/core';
import {StudyService, UnifiedMatch, SampleMatch} from "./services/study.service";
import {Study, Sample} from "./common/study.model";
import {Router} from "@angular/router";
import {FiltersService, FiltersState} from "./services/filters.service";
import {FormControl, Form} from "@angular/forms";

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
export class BrowserComponent {

  matches: UnifiedMatch[];
  sampleKeys: string[];
  commonKeys: { [studyId: number]: { [key: string]: any } };
  areSamplesHidden: { [studyId: number]: boolean } = {};
  numMatchingStudies: number = 0;
  numMatchingSamples: number = 0;

  constructor(
    private _router: Router,
    private _studyService: StudyService,
    private _filtersService: FiltersService
  ) { }

  selectStudy(study: Study): void {
    let link = ['/study', study.id];
    this._router.navigate(link);
  }

  selectSample(sample: Sample): void {
    let link = ['/sample', sample.id];
    this._router.navigate(link);
  }

  ngOnInit(): void {
    //this._studyService.getStudies().then(studies => this.studies = studies);
    this._filtersService.filters.subscribe(filters => this.updateStudies(filters));
  }

  updateStudies(filters: FiltersState): void {
    let rawMatches = this._studyService.getUnifiedMatches(filters);
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

  distinctKeys(studyId: number, sample: Sample): string[] {
    let ignoreSampleKeys = {
      '_assay': true,
      'Sample ID': true
    }
    return (
      Object.keys(sample._source)
        .filter(key => !(key in this.commonKeys[studyId]))
        .filter(key => !(key in ignoreSampleKeys))
        .filter(key => sample._source[key] !== sample._source['Sample Name'])
    );
  }

  sortSampleMatches(sampleMatches: SampleMatch[]): SampleMatch[] {
    return sampleMatches.sort((a, b) => a.sample._source['Sample Name'].localeCompare(b.sample._source['Sample Name']))
  }
}
