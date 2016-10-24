import { Component } from '@angular/core';
import {StudyService} from "./services/study.service";
import {Study} from "./common/study.model";

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  providers: [StudyService]
})
export class AppComponent {
  selectedStudy: Study;

  selectStudy(study: Study): void {
    this.selectedStudy = study;
  }
}
