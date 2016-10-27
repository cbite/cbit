import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {FiltersService, FiltersState} from "../services/filters.service";
import {StudyService} from "../services/study.service";
import * as _ from 'lodash';

const HIDDEN_STUDY_FILTER_LABELS = {
  'INVESTIGATION: Investigation Identifier': true,
  'STUDY: Study Description': true,
  'STUDY: Study Identifier': true,
  'STUDY: Study Title': true,
  'STUDY PROTOCOLS: Study Protocol Description': true,
  'STUDY PUBLICATIONS: Study Publication Author List': true,
  'STUDY PUBLICATIONS: Study Publication DOI': true,
  'STUDY PUBLICATIONS: Study PubMed ID': true,
  'STUDY PUBLICATIONS: Study Publication Title': true
};

const HIDDEN_SAMPLE_FILTER_LABELS = {
  'Barcode': true,
  'Sample ID': true,
  'Sample Name': true,
  'Source Name': true,
  'Study ID': true
};

@Component({
  selector: 'filter-sidebar',
  template: `
  <h1>Filters <button (click)="clearFilters()">Clear</button></h1>
  
  <form type="inline">
    <label for="searchText">Search for:</label>
    <input id="searchText" type="text" name='searchText' [formControl]="searchTextInForm"/>
  </form>
  
  <h2>Study Filters <button (click)="toggleStudyFilters();">Show/Hide</button></h2>
  <div [class.hidden]="studyFiltersHidden" *ngFor="let categoryKV of allStudyFilterLabels | mapToIterable">
    <div *ngFor="let subcategory of categoryKV.val">
      <study-filters *ngIf='showStudyFilter(categoryKV.key, subcategory)' [category]="categoryKV.key" [subcategory]="subcategory"></study-filters>
    </div>
  </div>
  
  <h2>Sample Filters <button (click)="toggleSampleFilters();">Show/Hide</button></h2>
  <div [class.hidden]="sampleFiltersHidden" *ngFor="let category of allSampleFilterLabels">
    <sample-filters *ngIf='showSampleFilter(category)' [category]="category"></sample-filters>
  </div>
  
  <h1>Applied Filters (DEBUG)</h1>
  <pre>{{ _filtersService.getFilters() | json }}</pre>
  `
})
export class FilterSidebarComponent implements OnInit {

  // For inspiration, see: http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html
  searchTextInForm = new FormControl();
  studyFiltersHidden: boolean = false;
  sampleFiltersHidden: boolean = false;

  allStudyFilterLabels = {};
  allSampleFilterLabels = {};

  showStudyFilter(category: string, subcategory: string): boolean {
    return !(`${category}: ${subcategory}` in HIDDEN_STUDY_FILTER_LABELS);
  }

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
    this._filtersService.filters.subscribe(filters => this.updateFilters(filters));
  }

  updateFilters(filters: FiltersState): void {
    if (filters.searchText !== this.searchTextInForm.value) {
      // emitEvent: false => Avoid event loops
      this.searchTextInForm.setValue(filters.searchText, {emitEvent: false});
    }
  }

  makeStudyFilterLabels(): any {
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

    return allStudyFilterLabels;
  }

  makeSampleFilterLabels(): any {
    // Make a list of all possible filterable properties in samples
    // TODO: have the back-end maintain this list
    var
      allSampleFilterLabels = {}
      ;
    for (let sample of this._studyService.getSamples()) {
      for (let category in sample._source) {
        allSampleFilterLabels[category] = true;
      }
    }

    return Object.keys(allSampleFilterLabels).sort();
  }

  ngOnInit(): void {
    this.allStudyFilterLabels = this.makeStudyFilterLabels();
    this.allSampleFilterLabels = this.makeSampleFilterLabels();
  }

  clearFilters(): void {
    this._filtersService.clearFilters();
  }

  toggleStudyFilters(): void {
    this.studyFiltersHidden = !this.studyFiltersHidden;
  }

  toggleSampleFilters(): void {
    this.sampleFiltersHidden = !this.sampleFiltersHidden;
  }
}
