import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {FiltersService, FiltersState} from "../services/filters.service";
import {StudyService} from "../services/study.service";
import * as _ from 'lodash';

export const HIDDEN_SAMPLE_FILTER_LABELS = {
  'Barcode': true,
  'Biological Replicate': true,
  'Sample ID': true,
  'Sample Name': true,
  'Source Name': true,
  'Study ID': true,
  'Group ID': true,
  'Protocols': true,
  'Sample Match': true,

  // Fields that have been merged in backend
  'Material Name': true,
  'Material abbreviation': true,
  'Strain full name': true,
  'Strain abbreviation': true,
  'Compound': true,
  'Compound abbreviation': true
};

@Component({
  selector: 'filter-sidebar',
  template: `
  <h1>Filters <button (click)="clearFilters()">Clear</button></h1>
  
  <form type="inline">
    <label for="searchText">Search for:</label>
    <input id="searchText" type="text" name='searchText' [formControl]="searchTextInForm"/>
    <br/>
    <input id="includeControls" type="checkbox" name="includeControls" [formControl]="includeControlsInForm"/>
    Include controls
  </form>
  
  <div *ngFor="let category of allSampleFilterLabels">
    <sample-filters *ngIf='showSampleFilter(category)' [category]="category"></sample-filters>
  </div>
  
  <h1>Applied Filters (DEBUG)</h1>
  <pre>{{ _filtersService.getFilters() | json }}</pre>
  `
})
export class FilterSidebarComponent implements OnInit {

  // For inspiration, see: http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html
  searchTextInForm = new FormControl();
  includeControlsInForm = new FormControl();
  allSampleFilterLabels = {};

  showSampleFilter(category: string): boolean {
    return !(category in HIDDEN_SAMPLE_FILTER_LABELS);
  }

  constructor(
    private _studyService: StudyService,
    private _filtersService: FiltersService
  ) {
    //this.searchTextInForm = new FormControl(this._filtersService.getFilters().searchText);
    this.searchTextInForm.valueChanges
      .debounceTime(200)       // Don't propagate changes until this many ms have elapsed without change
      .distinctUntilChanged()  // Don't emit the same value twice
      .subscribe(newSearchText => _filtersService.setSearchText(newSearchText));
    this.includeControlsInForm.valueChanges
      .distinctUntilChanged()  // Don't emit the same value twice
      .subscribe(newIncludeControls => _filtersService.setIncludeControls(newIncludeControls))

    this._filtersService.filters.subscribe(filters => this.updateFilters(filters));
  }

  updateFilters(filters: FiltersState): void {
    if (filters.searchText !== this.searchTextInForm.value) {
      // emitEvent: false => Avoid event loops
      this.searchTextInForm.setValue(filters.searchText, {emitEvent: false});
    }

    if (filters.includeControls !== this.includeControlsInForm.value) {
      // emitEvent: false => Avoid event loops
      this.includeControlsInForm.setValue(filters.includeControls, {emitEvent: false});
    }
  }

  makeSampleFilterLabels(): any {
    // Make a list of all possible filterable properties in samples

    var withoutStar = function(s: string): string {
      if (s.substr(0, 1) == '*') {
        return s.substr(1);
      } else {
        return s;
      }
    }
    return this._studyService.getSampleMetadataFieldNames().sort((a,b) => withoutStar(a).localeCompare(withoutStar(b)));
  }

  ngOnInit(): void {
    this.allSampleFilterLabels = this.makeSampleFilterLabels();
  }

  clearFilters(): void {
    this._filtersService.clearFilters();
  }
}
