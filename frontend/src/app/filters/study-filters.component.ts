import {Component, Input, OnInit} from "@angular/core";
import {FiltersState, FiltersService} from "../services/filters.service";
import {StudyService} from "../services/study.service";
import * as _ from 'lodash';

@Component({
  selector: 'study-filters',
  template: `
  <h4>{{ category }}: {{ subcategory }}</h4>
  <ul>
    <div *ngFor="let possibleValue of counts | mapToIterable">
      <input type="checkbox" [name]="category + ': ' + subcategory" [value]="possibleValue.key"
        [checked]="isValIncluded(possibleValue.key)"
        (change)="updateFilters($event, possibleValue.key)">
        {{possibleValue.key}} ({{possibleValue.val}})
    </div>
  </ul>
  `
})
export class StudyFiltersComponent implements OnInit {
  @Input() category: string;
  @Input() subcategory: string;
  counts: {
    [value: string]: number   // Free-form mapping of values to counts
  } = {}

  constructor(
    private _studyService: StudyService,
    private _filtersService: FiltersService
  ) {}

  ngOnInit(): void {
    this._filtersService.filters.subscribe(filters => this.update(filters))
  }

  update(filters: FiltersState): void {
    console.log(`Updating ${this.category}: ${this.subcategory}`)
    this.counts = this._studyService.getStudyCounts(filters, this.category, this.subcategory);
  }

  isValIncluded(valueName: string): boolean {
    console.log(`Checking ${valueName} for inclusion`);
    let curFilters = this._filtersService.getFilters().studyFilters;
    if ((this.category in curFilters) && (this.subcategory in curFilters[this.category])) {
      // Checked if true or absent, unchecked if false
      return (curFilters[this.category][this.subcategory][valueName] !== false);
    } else {
      return true;   // If no filters specified, default to all values
    }
  }

  updateFilters(e: any, valueName: string): void {
    console.log(`Setting ${this.category}: ${this.subcategory}: ${valueName} to ${e.target.checked}`);
    this._filtersService.setStudyFilter(this.category, this.subcategory, valueName, e.target.checked);
  }
}
