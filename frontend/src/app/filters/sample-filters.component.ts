import {Component, Input, OnInit} from "@angular/core";
import {FiltersState, FiltersService, EMPTY_FILTERS} from "../services/filters.service";
import {StudyService} from "../services/study.service";
import * as _ from 'lodash';

@Component({
  selector: 'sample-filters',
  template: `
  <div [class.hidden]="isTrivial()">
    <h3>{{ category }} <button (click)="isHidden = !isHidden;">Show/Hide</button></h3>
    [Select <a href="javascript:void(0)" (click)="selectAll()">All</a> | <a href="javascript:void(0)" (click)="selectNone()">None</a>]
    <ul [class.hidden]="isHidden">
      <div *ngFor="let possibleValue of counts | mapToIterable">
        <input type="checkbox" [name]="category" [value]="possibleValue.key"
          [checked]="isValIncluded(possibleValue.key)"
          (change)="updateFilters($event, possibleValue.key)">
          {{possibleValue.key}} ({{possibleValue.val}})
      </div>
    </ul>
  </div>
  `
})
export class SampleFiltersComponent implements OnInit {
  @Input() category: string;
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
    this.counts = this._studyService.getSampleCounts(filters, this.category);
  }

  isValIncluded(valueName: string): boolean {
    let curFilters = this._filtersService.getFilters().sampleFilters;
    if (this.category in curFilters) {
      // Checked if true or absent, unchecked if false
      return (curFilters[this.category][valueName] !== false);
    } else {
      return true;   // If no filters specified, default to all values
    }
  }

  updateFilters(e: any, valueName: string): void {
    this._filtersService.setSampleFilter(this.category, valueName, e.target.checked);
  }

  selectAll(): void {
    this._filtersService.setSampleFilterAll(this.category);
  }

  selectNone(): void {
    var excludedValues = Object.keys(this._studyService.getSampleCounts(EMPTY_FILTERS, this.category));
    this._filtersService.setSampleFilterNone(this.category, excludedValues);
  }
}
