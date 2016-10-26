import {Component, Input, OnInit} from '@angular/core';
import {Study, Sample} from '../common/study.model';
import {StudyService} from "../services/study.service";
import {ActivatedRoute, Params} from "@angular/router";
import { Location } from '@angular/common';

@Component({
  selector: 'study',
  templateUrl: 'study.component.html'
})
export class StudyComponent implements OnInit {
  study: Study;
  samples: Sample[];
  sampleKeys: string[];

  constructor(
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
  }

  goBack(): void {
    this._location.back();
  }
}
