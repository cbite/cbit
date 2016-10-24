import {Component, Input, OnInit} from '@angular/core';
import { Study } from '../common/study.model';
import {StudyService} from "../services/study.service";
import {ActivatedRoute, Params} from "@angular/router";
import { Location } from '@angular/common';

@Component({
  selector: 'study',
  template: `
  <div *ngIf="study">
    <h1>Study ID {{ study.id }}</h1>
    <h2>Name: {{ study.name }}</h2>
    <h3>Author: {{ study.author }}</h3>
    <button (click)="goBack()">Back</button>
  </div>
  `
})
export class StudyComponent implements OnInit {
  study: Study;

  constructor(
    private _studyService: StudyService,
    private _route: ActivatedRoute,
    private _location: Location
  ) {}

  ngOnInit(): void {
    this._route.params.forEach((params: Params) => {
      let id = +params['id'];
      this._studyService.getStudy(id)
        .then(study => this.study = study);
    });
  }

  goBack(): void {
    this._location.back();
  }
}
