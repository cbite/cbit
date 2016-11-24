import {Component, Input, OnInit, ChangeDetectorRef} from "@angular/core";
import {FiltersService, FilterMode} from "../services/filters.service";
import {NULL_CATEGORY_NAME} from "../services/study.service";

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
  selector: 'sample-filters',
  template: `
    <li class="nav-header" *ngIf="!isTrivial() && showSampleFilter()">
      <div class="fullLabel">
        <a href="javascript:void(0)" (click)="isVisible = !isVisible">
          <span *ngIf=" isVisible" class="glyphicon glyphicon-triangle-bottom"></span>
          <span *ngIf="!isVisible" class="glyphicon glyphicon-triangle-right"></span>
        </a>
        <div class="my-label checkbox-inline">
          <label>
            <input type="checkbox" [name]="category" value=""
                   [checked]="globalIsChecked()"
                   (change)="globalChange($event)">
            <a href="javascript:void(0)" (click)="isVisible = !isVisible">
              {{ categoryRealName }}
            </a>
          </label>
        </div>
      </div>
  
      <div [collapse]="!isVisible">
        <ul class="nav">
          <li *ngFor="let possibleValue of counts | mapToIterable" class="checkbox">
            <label>
              <input type="checkbox"
                     [name]="category"
                     [value]="possibleValue.key"
                     [checked]="isValIncluded(possibleValue.key)"
                     (change)="updateFilters($event, possibleValue.key)">
              {{ formatValueName(possibleValue.key) }}
              <div class="count">{{possibleValue.val}}</div>
            </label>
          </li>
        </ul>
      </div>
    </li>
  `,
  styles: [`
    li.nav-header {
      padding-bottom: 10px;
    }
    .fullLabel {
      margin-bottom: -10px;
    } 
    li.nav-header > div.fullLabel > a {
      position: static;
      display: inline;
      padding: 0px;
      font-weight: bold;
    }
    li.nav-header > div.fullLabel > div.my-label {
      width: auto;
    }
    li.nav-header > div.fullLabel > div.my-label > label > a {
      padding: 10px 0;
      font-weight: bold;
      text-decoration: none;
    }
    li.nav-header > div.fullLabel > div.my-label > label > a:hover {
      text-decoration: none;
    }
    
    li.nav-header > div > ul {
      padding-left: 40px;
    }
    
    .count {
      display: block;
      position: absolute;
      top: 0px;
      right: 20px;
      font-style: italic;
      font-size: 80%;
      padding-top: 2px;
      width: 100%;
      text-align: right;
    }
  `]
})
export class SampleFiltersComponent implements OnInit {
  @Input() category: string;
  @Input() counts: {
    [value: string]: number   // Free-form mapping of values to counts
  } = {}
  categoryRealName: string;

  get isVisible(): boolean {
    return this._filtersService.isFilterVisible(this.category);
  }
  set isVisible(value: boolean) {
    this._filtersService.setFilterVisibility(this.category, value);
  }

  showSampleFilter(): boolean {
    return !(this.category in HIDDEN_SAMPLE_FILTER_LABELS);
  }

  isTrivial(): boolean {
    return (Object.keys(this.counts).length <= 1);
  }

  constructor(
    private _filtersService: FiltersService
  ) { }

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

  globalIsChecked(): boolean {
    return true;
  }
  globalChange(e: any): void {
  }
}
