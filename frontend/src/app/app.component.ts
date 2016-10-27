import { Component } from '@angular/core';
import {StudyService} from "./services/study.service";
import {Study} from "./common/study.model";
import {FiltersService} from "./services/filters.service";

import '../../public/css/styles.css';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  providers: [StudyService, FiltersService]
})
export class AppComponent {
  selectedStudy: Study;

  selectStudy(study: Study): void {
    this.selectedStudy = study;
  }
}