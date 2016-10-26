import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { StudyService } from "../services/study.service";
import { Study } from "../common/study.model";
import {FiltersService, FiltersState} from "../services/filters.service";

@Component({
  selector: 'studies',
  template: `
  <ul>
    <li *ngFor='let study of studies'>
      <a (click)="onClick(study)">{{study.id}}.</a> <b>{{ study._source['STUDY']['Study Title'] }}</b>
      <i>by {{ study._source['STUDY PUBLICATIONS'][0]['Study Publication Author List'] }}</i>
    </li>
  </ul>
  `
})
export class StudiesComponent implements OnInit {
  studies: Study[];
  @Output() selectedStudyEmitter: EventEmitter<Study> = new EventEmitter<Study>()

  constructor(
    private _studyService: StudyService,
    private _filtersService: FiltersService
  ) { }

  ngOnInit(): void {
    //this._studyService.getStudies().then(studies => this.studies = studies);
    this._filtersService.filters.subscribe(filters => this.updateStudies(filters));
  }

  onClick(study: Study): void {
    this.selectedStudyEmitter.emit(study);
  }

  updateStudies(filters: FiltersState): void {
    this.studies = this._studyService.getStudies();
    let rawSamples = this._studyService.getStudiesMatching(filters);
    this.studies = rawSamples.sort((a, b) => a._source['STUDY PUBLICATIONS'][0]['Study Publication Author List'].localeCompare(b._source['STUDY PUBLICATIONS'][0]['Study Publication Author List']));
  }
}
