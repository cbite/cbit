import {Component, Input, OnInit} from "@angular/core";
import {FiltersService, FilterMode} from "../services/filters.service";
import {NULL_CATEGORY_NAME} from "../services/study.service";

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
  @Input() counts: {
    [value: string]: number   // Free-form mapping of values to counts
  } = {}
  categoryRealName: string;
  isHidden = false;

  isTrivial(): boolean {
    return (Object.keys(this.counts).length <= 1);
  }

  constructor(
    private _filtersService: FiltersService
  ) {}

  ngOnInit(): void {
    this.categoryRealName = (this.category.substr(0, 1) == '*' ? this.category.substr(1) : this.category);
  }

  isValIncluded(valueName: string): boolean {
    let curFilters = this._filtersService.getFilters().sampleFilters;
    if (this.category in curFilters) {
      let categoryFilter = curFilters[this.category];
      switch (categoryFilter.mode) {
        case FilterMode.AllButThese:
          // Checked if true or absent, unchecked if false
          return !(categoryFilter.detail[valueName] === false);
        case FilterMode.OnlyThese:
          // Checked if true, unchecked if false or absent
          return  (categoryFilter.detail[valueName] === true);
      }
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
    this._filtersService.setSampleFilterNone(this.category);
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
