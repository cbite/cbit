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

  // For inspiration, see: http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html
  searchTextInForm: FormControl;

  constructor(
    private _router: Router,
    private _filtersService: FiltersService
  ) {
    this.searchTextInForm = new FormControl(this._filtersService.getFilters().searchText);
    this.searchTextInForm.valueChanges
      .debounceTime(200)       // Don't propagate changes until this many ms have elapsed without change
      .distinctUntilChanged()  // Don't emit the same value twice
      .subscribe(newSearchText => _filtersService.setSearchText(newSearchText));
  }

  selectStudy(study: Study): void {
    let link = ['/study', study.id];
    this._router.navigate(link);
  }
}
