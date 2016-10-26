import {Component, Input} from '@angular/core';
import {StudyService} from "./services/study.service";
import {Study} from "./common/study.model";
import {Router} from "@angular/router";
import {FiltersService} from "./services/filters.service";
import {FormControl, Form} from "@angular/forms";

@Component({
  selector: 'browser',
  templateUrl: './browser.component.html',
  providers: [StudyService]
})
export class BrowserComponent {

  constructor(
    private _router: Router,
    private _filtersService: FiltersService
  ) { }

  selectStudy(study: Study): void {
    let link = ['/study', study.id];
    this._router.navigate(link);
  }
}
