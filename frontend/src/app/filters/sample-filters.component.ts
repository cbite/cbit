import {
  Component, Input, OnInit, ChangeDetectorRef, OnChanges, DoCheck, ViewChild, ElementRef,
  AfterViewChecked
} from "@angular/core";
import {FiltersService, FilterMode} from "../services/filters.service";
import {NULL_CATEGORY_NAME} from "../services/study.service";
import * as $ from 'jquery';

// TODO: Move all usages of this to backend
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

enum GlobalCheckboxState {
  All,
  None,
  Indeterminate
}

@Component({
  selector: 'sample-filters',
  template: `
    <li class="nav-header" *ngIf="!isTrivial()">
      <div class="fullLabel">
        <a href="javascript:void(0)" (click)="isVisible = !isVisible">
          <span *ngIf=" isVisible" class="glyphicon glyphicon-triangle-bottom"></span>
          <span *ngIf="!isVisible" class="glyphicon glyphicon-triangle-right"></span>
        </a>
        <div class="my-label checkbox-inline">
          <label>
            <input class="globalCheckbox" type="checkbox" [name]="category" value=""
                   (click)="clickGlobalCheckbox($event)">
            <a href="javascript:void(0)" (click)="isVisible = !isVisible">
              {{ categoryRealName }}
            </a>
          </label>
        </div>
      </div>
  
      <div [collapse]="!isVisible">
        <ul class="nav">
          <li *ngFor="let kv of allCounts | mapToIterable" class="checkbox">
            <label [class.disabled]="!isEnabled(kv.key)">
              <input type="checkbox"
                     [name]="category"
                     [value]="kv.key"
                     [disabled]="!isEnabled(kv.key)"
                     [checked]="isValIncluded(kv.key)"
                     (change)="updateFilters($event, kv.key)">
              {{ formatValueName(kv.key) }}
              <div class="count">{{filteredCounts[kv.key] || 0}}</div>
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
    .disabled {
      color: #c0c0c0;
    }
  `]
})
export class SampleFiltersComponent implements OnInit, AfterViewChecked {
  @Input() category: string;
  @Input() allCounts: {
    [value: string]: number   // Free-form mapping of values to counts
  } = {}
  @Input() filteredCounts: {
    [value: string]: number   // Free-form mapping of values to counts
  } = {}
  categoryRealName: string;

  constructor(
    private _filtersService: FiltersService,
    private _elemRef: ElementRef
  ) { }

  get isVisible(): boolean {
    return this._filtersService.isFilterVisible(this.category);
  }
  set isVisible(value: boolean) {
    this._filtersService.setFilterVisibility(this.category, value);
  }

  isTrivial(): boolean {
    return (Object.keys(this.allCounts).length <= 1);
  }

  private jqElem: JQuery;
  ngOnInit(): void {
    this.categoryRealName = (this.category.substr(0, 1) == '*' ? this.category.substr(1) : this.category);
    this.jqElem = $(this._elemRef.nativeElement);
  }

  getGlobalCheckboxState(): GlobalCheckboxState {
    let curFilters = this._filtersService.getFilters().sampleFilters;
    let numPossibleValues = Object.keys(this.allCounts).length;

    if (this.category in curFilters) {
      let categoryFilter = curFilters[this.category];
      switch (categoryFilter.mode) {

        case FilterMode.AllButThese:
          let numExclusions = Object.keys(categoryFilter.detail).length;
          if (numExclusions === 0) {
            return GlobalCheckboxState.All;
          } else if (numExclusions === numPossibleValues) {
            return GlobalCheckboxState.None;
          } else {
            return GlobalCheckboxState.Indeterminate;
          }

        case FilterMode.OnlyThese:
          let numInclusions = Object.keys(categoryFilter.detail).length;
          if (numInclusions === 0) {
            return GlobalCheckboxState.None;
          } else if (numExclusions === numPossibleValues) {
            return GlobalCheckboxState.All;
          } else {
            return GlobalCheckboxState.Indeterminate;
          }
      }
    } else {
      return GlobalCheckboxState.All;   // If no filters specified, default to all values
    }
  }

  ngAfterViewChecked(): void {

    let state = this.getGlobalCheckboxState();
    let globalCheckbox = this.jqElem.find(".globalCheckbox");

    switch (state) {
      case GlobalCheckboxState.All:
        globalCheckbox.prop({indeterminate: false, checked: true});
        break;
      case GlobalCheckboxState.None:
        globalCheckbox.prop({indeterminate: false, checked: false});
        break;
      case GlobalCheckboxState.Indeterminate:
        globalCheckbox.prop({indeterminate: true});
        break;
    }

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

  isEnabled(valueName: string): boolean {
    // Enabled if valueName is present in counts and its value is not zero
    return !!(this.filteredCounts[valueName]);
  }

  updateFilters(e: any, valueName: string): void {
    this._filtersService.setSampleFilter(this.category, valueName, e.target.checked);
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

  selectAll(): void {
    this._filtersService.setSampleFilterAll(this.category);
  }

  selectNone(): void {
    this._filtersService.setSampleFilterNone(this.category);
  }

  clickGlobalCheckbox(e: any): void {
    e.preventDefault();

    let state = this.getGlobalCheckboxState();
    switch (state) {
      case GlobalCheckboxState.All:
      case GlobalCheckboxState.Indeterminate:
        this.selectNone();
        break;
      case GlobalCheckboxState.None:
        this.selectAll();
        break;
    }
  }
}
