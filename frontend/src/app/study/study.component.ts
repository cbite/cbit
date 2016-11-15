import {Component, Input, OnInit, ChangeDetectorRef} from '@angular/core';
import {Study, Sample, RawStudy} from '../common/study.model';
import {StudyService, StudyAndSamples} from "../services/study.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import { Location } from '@angular/common';

@Component({
  selector: 'study',
  templateUrl: 'study.component.html'
})
export class StudyComponent implements OnInit {
  study: Study;
  studyCategoryMap: RawStudy;
  samples: Sample[];
  sampleKeys: string[];
  commonKeys: { [key: string]: any };
  ready = false

  constructor(
    private _router: Router,
    private _studyService: StudyService,
    private _route: ActivatedRoute,
    private _location: Location,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._route.params.forEach((params: Params) => {
      let id: string = params['id'];
      //this._studyService.getStudy(id)
      //  .then(study => this.study = study);
      this._studyService.getStudyAndRelatedSamplesAsync(id).then(result => {
        this.processStudyAndSamples(result);

        // Force Angular2 change detection to see ready = true change.
        // Not sure why it's not being picked up automatically
        this.changeDetectorRef.detectChanges();
      });
    });
  }

  processStudyAndSamples(studyAndSamples: StudyAndSamples): void {
    this.study = studyAndSamples.study;
    this.studyCategoryMap = Object.assign({}, this.study._source);
    delete this.studyCategoryMap['*Archive URL'];
    this.samples = studyAndSamples.samples.sort((a, b) => a._source['Sample Name'].localeCompare(b._source['Sample Name']));

    let keys = new Set<string>();
    this.samples.forEach(sample => Object.keys(sample._source).forEach(key => keys.add(key)));
    keys.delete('Sample Name');
    this.sampleKeys = Array.from(keys);

    this.commonKeys = {};
    if (this.samples.length > 0) {
      let firstSample = this.samples[0];
      for (let key in firstSample._source) {
        if (key.substr(0, 1) !== '*') {
          this.commonKeys[key] = firstSample._source[key];
        }
      }

      for (let sample of this.samples) {
        for (let commonKey in this.commonKeys) {
          if (!(commonKey in sample._source) ||
            (sample._source[commonKey] !== this.commonKeys[commonKey])) {
            delete this.commonKeys[commonKey];
          }
        }
      }
    }

    this.ready = true;
  }

  distinctKeys(sample: Sample): string[] {
    let ignoreSampleKeys = {
      'Sample ID': true
    }
    return (
      Object.keys(sample._source)
        .filter(key => key.substr(0,1) !== '*')
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
