import {Component, Input, OnInit} from "@angular/core";
import {FiltersState, FiltersService, EMPTY_FILTERS} from "../services/filters.service";
import {StudyService, NULL_CATEGORY_NAME} from "../services/study.service";
import * as _ from 'lodash';

@Component({
  selector: 'sample-filters',
  template: `
  <div [class.hidden]="isTrivial()">
    <h3>{{ categoryRealName }} <button (click)="isHidden = !isHidden;">Show/Hide</button></h3>
    [Select <a href="javascript:void(0)" (click)="selectAll()">All</a> | <a href="javascript:void(0)" (click)="selectNone()">None</a>]
    <ul [class.hidden]="isHidden">
      <div *ngFor="let possibleValue of counts | mapToIterable">
        <input type="checkbox" [name]="category" [value]="possibleValue.key"
          [checked]="isValIncluded(possibleValue.key)"
          (change)="updateFilters($event, possibleValue.key)">
          {{ formatValueName(possibleValue.key) }} ({{possibleValue.val}})
      </div>
    </ul>
  </div>
  `
})
export class SampleFiltersComponent implements OnInit {
  @Input() category: string;
  categoryRealName: string;
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
    this.categoryRealName = (this.category.substr(0, 1) == '*' ? this.category.substr(1) : this.category);
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

  decodePhaseCompositionLike(s: string, entryFormatter: (component: string, value: number) => string): string {
    if (s === NULL_CATEGORY_NAME) {
      return s;
    }

    try {
      var results: Array<string> = [];
      for (let entry of s.split(';')) {
        var
          fields = entry.split('='),
          component = fields[0],
          percentage = parseFloat(fields[1]);
        results.push(entryFormatter(component, percentage));
      }
      return results.join(', ');
    } catch(e) {
      return s;
    }
  }

  formatValueName(s: string): string {
    switch (this.category) {
      case 'Phase composition':
        return this.decodePhaseCompositionLike(s, (component, percentage) => `${percentage}% ${component}`);
      case 'Elements composition':
        return this.decodePhaseCompositionLike(s, (element, percentage) => `${percentage}% ${element}`);
      case 'Wettability':
        return this.decodePhaseCompositionLike(s, (liquid, contactAngle) => `${contactAngle}° with ${liquid}`);
      default:
        return s;
    }
  }
}
