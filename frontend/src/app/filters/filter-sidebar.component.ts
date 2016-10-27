import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {FiltersService, FiltersState} from "../services/filters.service";
import {StudyService} from "../services/study.service";
import * as _ from 'lodash';

@Component({
  selector: 'filter-sidebar',
  template: `
  <h1>Filters:</h1>
  <form type="inline">
    <label for="searchText">Search for:</label>
    <input id="searchText" type="text" name='searchText' [formControl]="searchTextInForm"/>
  </form>
  
  <h2>Study Filters</h2>
  <div *ngFor="let categoryKV of allStudyFilterLabels | mapToIterable">
    <h3>{{categoryKV.key}}</h3>
    <div *ngFor="let subcategory of categoryKV.val">
      <study-filters [category]="categoryKV.key" [subcategory]="subcategory"></study-filters>
    </div>
  </div>
  `
})
export class FilterSidebarComponent implements OnInit {

  // For inspiration, see: http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html
  searchTextInForm: FormControl;

  allStudyFilterLabels = {};

  constructor(
    private _studyService: StudyService,
    private _filtersService: FiltersService
  ) {
    this.searchTextInForm = new FormControl(this._filtersService.getFilters().searchText);
    this.searchTextInForm.valueChanges
      .debounceTime(200)       // Don't propagate changes until this many ms have elapsed without change
      .distinctUntilChanged()  // Don't emit the same value twice
      .subscribe(newSearchText => _filtersService.setSearchText(newSearchText));
  }

  ngOnInit(): void {
    // Make a list of all possible filterable properties in studies
    // TODO: have the back-end maintain this list
    var
      allStudyFilterLabels = {}
    ;
    for (let study of this._studyService.getStudies()) {
      for (let category in study._source) {
        let underLabel = study._source[category];

        if (!(category in allStudyFilterLabels)) {
          allStudyFilterLabels[category] = []
        }

        if (!Array.isArray(underLabel)) {
          underLabel = [underLabel];   // Wrap non-arrays under single-item array to not duplicate code below
        }

        let subcategories = {}
        for (let d of underLabel) {
          for (let subcategory in d) {
            subcategories[subcategory] = true;
          }
        }

        allStudyFilterLabels[category] = Object.keys(subcategories).sort();
      }
    }

    this.allStudyFilterLabels = allStudyFilterLabels;
  }
}
