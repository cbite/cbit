import {Component, Input, OnInit} from "@angular/core";
import {FiltersState, FiltersService} from "../services/filters.service";
import {StudyService} from "../services/study.service";
import * as _ from 'lodash';

@Component({
  selector: 'study-filters',
  template: `
  <div [class.hidden]="isTrivial()">
    <h3>{{ category }}: {{ subcategory }} <button (click)="isHidden = !isHidden;">Show/Hide</button></h3>
    <ul [class.hidden]="isHidden">
      <div *ngFor="let possibleValue of counts | mapToIterable">
        <input type="checkbox" [name]="category + ': ' + subcategory" [value]="possibleValue.key"
          [checked]="isValIncluded(possibleValue.key)"
          (change)="updateFilters($event, possibleValue.key)">
          {{possibleValue.key}} ({{possibleValue.val}})
      </div>
    </ul>
  </div>
  `
})
export class StudyFiltersComponent implements OnInit {
  @Input() category: string;
  @Input() subcategory: string;
  isHidden = false;
  counts: {
    [value: string]: number   // Free-form mapping of values to counts
  } = {}

  isTrivial(): boolean {
    return (Object.keys(this.counts).length <= 1);
  }

  constructor(
    private _studyService: StudyService,
    private _filtersService: FiltersService
  ) {}

  ngOnInit(): void {
    this._filtersService.filters.subscribe(filters => this.update(filters))
  }

  update(filters: FiltersState): void {
    this.counts = this._studyService.getStudyCounts(filters, this.category, this.subcategory);
  }

  isValIncluded(valueName: string): boolean {
    let curFilters = this._filtersService.getFilters().studyFilters;
    if ((this.category in curFilters) && (this.subcategory in curFilters[this.category])) {
      // Checked if true or absent, unchecked if false
      return (curFilters[this.category][this.subcategory][valueName] !== false);
    } else {
      return true;   // If no filters specified, default to all values
    }
  }

  updateFilters(e: any, valueName: string): void {
    this._filtersService.setStudyFilter(this.category, this.subcategory, valueName, e.target.checked);
  }
}
