import {Component, Output, EventEmitter, OnInit, Input, OnChanges} from '@angular/core';
import { StudyService } from "../services/study.service";
import { Study } from "../common/study.model";

@Component({
  selector: 'studies',
  template: `
  <ul>
    <li *ngFor='let study of studies'>
      <a (click)="onClick(study)">{{study.id}}.</a> <b>{{ study._source['STUDY']['Study Title'] }}</b>
      <i>by {{ study._source['STUDY PUBLICATIONS']['Study Publication Author List'] }}</i>
    </li>
  </ul>
  `
})
export class StudiesComponent implements OnInit, OnChanges {
  @Input() searchText: string;
  studies: Study[];
  @Output() selectedStudyEmitter: EventEmitter<Study> = new EventEmitter<Study>()

  constructor(private _studyService: StudyService) { }

  ngOnInit(): void {
    //this._studyService.getStudies().then(studies => this.studies = studies);
    this.updateStudies();
  }

  onClick(study: Study): void {
    this.selectedStudyEmitter.emit(study);
  }

  ngOnChanges(): void {
    this.updateStudies();
  }

  updateStudies(): void {
    this.studies = this._studyService.getStudies();
    let rawSamples = !this.searchText ? this._studyService.getStudies() : this._studyService.getStudiesMatching(this.searchText);
    this.studies = rawSamples.sort((a, b) => a._source['STUDY PUBLICATIONS']['Study Publication Author List'].localeCompare(b._source['STUDY PUBLICATIONS']['Study Publication Author List']));
  }
}
