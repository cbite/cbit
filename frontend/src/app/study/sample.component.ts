import {Component, Input, OnInit} from '@angular/core';
import {Study, Sample} from '../common/study.model';
import {StudyService} from "../services/study.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import { Location } from '@angular/common';

@Component({
  selector: 'sample',
  templateUrl: 'sample.component.html'
})
export class SampleComponent implements OnInit {
  sample: Sample;
  sampleKeys: string[];

  constructor(
    private _router: Router,
    private _studyService: StudyService,
    private _route: ActivatedRoute,
    private _location: Location
  ) {}

  selectStudy(studyId: number): void {
    let link = ['/study', studyId];
    this._router.navigate(link);
  }

  ngOnInit(): void {
    this._route.params.forEach((params: Params) => {
      let id = +params['id'];
      //this._studyService.getStudy(id)
      //  .then(study => this.study = study);
      this.sample = this._studyService.getSample(id);
    });
  }

  goBack(): void {
    this._location.back();
  }
}
