import {Component, Input, OnInit} from '@angular/core';
import {Study, Sample} from '../common/study.model';
import {StudyService} from "../services/study.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import { Location } from '@angular/common';

@Component({
  selector: 'study',
  templateUrl: 'study.component.html'
})
export class StudyComponent implements OnInit {
  study: Study;
  samples: Sample[];
  sampleKeys: string[];
  commonKeys: { [studyId: number]: { [key: string]: any } };

  constructor(
    private _router: Router,
    private _studyService: StudyService,
    private _route: ActivatedRoute,
    private _location: Location
  ) {}

  ngOnInit(): void {
    this._route.params.forEach((params: Params) => {
      let id = +params['id'];
      //this._studyService.getStudy(id)
      //  .then(study => this.study = study);
      this.study = this._studyService.getStudy(id);
      this.samples = (
        this.study.sampleIds
          .map(sampleId => this._studyService.getSample(sampleId))
          .sort((a, b) => a._source['Sample Name'].localeCompare(b._source['Sample Name']))
      );

      let keys = new Set<string>();
      this.samples.forEach(sample => Object.keys(sample._source).forEach(key => keys.add(key)));
      keys.delete('Sample Name');
      this.sampleKeys = Array.from(keys);
    });

    this.commonKeys = {};
    if (this.samples.length > 0) {
      let firstSample = this.samples[0];
      for (let key in firstSample._source) {
        this.commonKeys[key] = firstSample._source[key];
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
  }

  distinctKeys(sample: Sample): string[] {
    let ignoreSampleKeys = {
      'Sample ID': true
    }
    return (
      Object.keys(sample._source)
        .filter(key => !(key in this.commonKeys))
        .filter(key => !(key in ignoreSampleKeys))
        .filter(key => sample._source[key] !== sample._source['Sample Name'])
    );
  }

  selectSample(sample: Sample): void {
    let link = ['/sample', sample.id];
    this._router.navigate(link);
  }

  isCategoryIsMultiValued(category: string): boolean {
    return Array.isArray(this.study._source[category]);
  }

  goBack(): void {
    this._location.back();
  }
}
