import {Component, Input, OnInit, ChangeDetectorRef} from '@angular/core';
import {Study, Sample, RawStudy} from '../../../../core/types/study.model';
import {StudyService, StudyAndSamples} from '../../../../core/services/study.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Location} from '@angular/common';
import {getSupplementaryFiles} from '../../../../core/util/study-helper';

@Component({
  selector: 'study',
  template: `
    <div *ngIf="!ready">
      <span style="color: red;font-style: italic">Fetching study data...</span>
    </div>

    <div *ngIf="ready && study">
      <h3 *ngIf="showTitle">{{ study._source['STUDY']['Study Title'] }}</h3>
      <h4>{{ study._source['STUDY']['Study Researchers Involved'] }}</h4>

      <h5>Extra Info</h5>
      <ul>
        <li *ngFor="let categoryKV of studyCategoryMap | mapToIterable">
          <b>{{ categoryKV.key }}:</b>

          <div *ngIf="isCategoryIsMultiValued(categoryKV.key)">
            <ol>
              <li *ngFor="let item of study._source[categoryKV.key]">
                <ul>
                  <li *ngFor="let subcategoryKV of item | mapToIterable">
                    <i>{{ subcategoryKV.key }}</i>: {{ subcategoryKV.val }}
                  </li>
                </ul>
              </li>
            </ol>
          </div>

          <div *ngIf="!isCategoryIsMultiValued(categoryKV.key)">
            <ul>
              <li *ngFor="let subcategoryKV of study._source[categoryKV.key] | mapToIterable">
                <i>{{ subcategoryKV.key }}</i>: {{ subcategoryKV.val }}
              </li>
            </ul>
          </div>
        </li>
      </ul>

      <h5>Samples</h5>
      <h6>Common Properties:</h6>
      <ul>
        <li *ngFor="let kv of commonKeys | mapToIterable">
          <i>{{ kv.key }}</i>: {{ kv.val }}
        </li>
      </ul>
      <h6>Distinguishing properties:</h6>
      <ol>
        <li *ngFor="let sample of samples">
          <b>{{ sample._source['Sample Name'] }}</b>:
          <span *ngFor="let propName of distinctKeys(sample); let isLast = last">
            <span *ngIf="sample._source[propName]">
              <i>{{ propName }}</i>: {{ sample._source[propName] }}<span *ngIf="!isLast">, </span>
            </span>
          </span>
        </li>
      </ol>

      <h5>Supplementary Files</h5>
      <ul>
        <li *ngFor="let supplementaryFile of supplementaryFiles">
          {{supplementaryFile}}
        </li>
      </ul>
      <!--<button (click)="goBack()">Back</button>-->
    </div>
  `
})
export class StudyComponent implements OnInit {
  @Input() studyId: string;
  @Input() showTitle = false;
  study: Study;
  studyCategoryMap: RawStudy;
  samples: Sample[];
  supplementaryFiles: string[];
  commonKeys: { [key: string]: any };
  ready = false;

  constructor(private _router: Router,
              private _studyService: StudyService,
              private _route: ActivatedRoute,
              private _location: Location,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    //this._route.params.forEach((params: Params) => {
    //let id: string = params['id'];
    const id = this.studyId;
    //this._studyService.getStudy(id)
    //  .then(study => this.study = study);

    const studyPromise = this._studyService.getStudy(id);
    const samplesPromise = this._studyService.getIdsOfSamplesInStudy(id).then(sampleIds => {
      return Promise.all(sampleIds.map(sampleId => this._studyService.getSample(sampleId)));
    });

    Promise.all([studyPromise, samplesPromise]).then(results => {
      const study = results[0];
      const samples = results[1];

      const result: StudyAndSamples = {
        study: study,
        samples: samples
      };

      this.processStudyAndSamples(result);

      // Force Angular2 change detection to see ready = true change.
      // Not sure why it's not being picked up automatically
      this.changeDetectorRef.detectChanges();
    });
    //});
  }

  processStudyAndSamples(studyAndSamples: StudyAndSamples): void {
    this.study = studyAndSamples.study;
    this.studyCategoryMap = Object.assign({}, this.study._source);

    // TODO: Really need to refactor this
    delete this.studyCategoryMap['*Archive URL'];
    delete this.studyCategoryMap['*Publication Date'];
    delete this.studyCategoryMap['*Study Type'];
    delete this.studyCategoryMap['*Array Express Id'];
    delete this.studyCategoryMap['*Supplementary Files'];
    delete this.studyCategoryMap['*Protocol File'];
    delete this.studyCategoryMap['*Visible'];

    // YUCK! Despite what the mappings in ElasticSearch say, 'Sample Name' in the JSON results can be an integer!
    this.samples = studyAndSamples.samples.sort((a, b) => (a._source['Sample Name'] + '').localeCompare((b._source['Sample Name'] + '')));

    // todo@Sam - are you sure this can be commented?
    // const keys = new Set<string>();
    // this.samples.forEach(sample => Object.keys(sample._source).forEach(key => keys.add(key)));
    // keys.delete('Sample Name');
    // this.sampleKeys = Array.from(keys);

    this.commonKeys = {};
    if (this.samples.length > 0) {
      const firstSample = this.samples[0];
      for (const key in firstSample._source) {
        if (key.substr(0, 1) !== '*') {
          this.commonKeys[key] = firstSample._source[key];
        }
      }

      for (const sample of this.samples) {
        for (const commonKey in this.commonKeys) {
          if (!(commonKey in sample._source) ||
            (sample._source[commonKey] !== this.commonKeys[commonKey])) {
            delete this.commonKeys[commonKey];
          }
        }
      }
    }

    this.supplementaryFiles = getSupplementaryFiles(this.study);

    this.ready = true;
  }

  distinctKeys(sample: Sample): string[] {
    const ignoreSampleKeys = {
      'Sample ID': true
    };
    return (
      Object.keys(sample._source)
        .filter(key => key.substr(0, 1) !== '*')
        .filter(key => !(key in this.commonKeys))
        .filter(key => !(key in ignoreSampleKeys))
        .filter(key => sample._source[key] !== sample._source['Sample Name'])
    );
  }

  isCategoryIsMultiValued(category: string): boolean {
    return Array.isArray(this.study._source[category]);
  }

  goBack(): void {
    this._location.back();
  }
}
