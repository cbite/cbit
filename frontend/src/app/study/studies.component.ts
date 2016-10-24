import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { StudyService } from "../services/study.service";
import { Study } from "../common/study.model";

@Component({
  selector: 'studies',
  template: `
  <ul>
    <li *ngFor='let study of studies'>
      <a (click)="onClick(study)">{{study.id}}.</a> <b>{{ study.name }}</b> <i>by {{ study.author }}</i>
    </li>
  </ul>
  `
})
export class StudiesComponent implements OnInit {
  studies: Study[];
  @Output() selectedStudyEmitter: EventEmitter<Study> = new EventEmitter<Study>()

  constructor(private _studyService: StudyService) { }

  ngOnInit(): void {
    this._studyService.getStudies().then(studies => this.studies = studies);
  }

  onClick(study: Study): void {
    this.selectedStudyEmitter.emit(study);
  }
}
