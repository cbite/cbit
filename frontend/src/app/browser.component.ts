import {Component, Input} from '@angular/core';
import {StudyService} from "./services/study.service";
import {Study} from "./common/study.model";
import {Router} from "@angular/router";

@Component({
  selector: 'browser',
  templateUrl: './browser.component.html',
  providers: [StudyService]
})
export class BrowserComponent {
  searchText: string;

  constructor(
    private _router: Router
  ) {}

  selectStudy(study: Study): void {
    let link = ['/study', study.id];
    this._router.navigate(link);
  }
}
