import {
  Component, Input, OnInit, ChangeDetectorRef, OnChanges, DoCheck, ViewChild, ElementRef,
  AfterViewChecked
} from "@angular/core";
import {FiltersService, FilterMode} from "../services/filters.service";
import {NULL_CATEGORY_NAME, StudyService} from "../services/study.service";
import * as $ from 'jquery';
import {DimensionsRegister} from "../common/unit-conversions";

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
    <li class="top-level-li" *ngIf="!isTrivial()">
      <div class="fullLabel">
        <a href="#" (click)="$event.preventDefault(); isVisible = !isVisible"
           [class.disabled]="!anyEnabled()"
        >
          <span *ngIf=" isVisible" class="glyphicon glyphicon-triangle-bottom"></span>
          <span *ngIf="!isVisible" class="glyphicon glyphicon-triangle-right"></span>
        </a>
        <div class="my-label checkbox-inline">
          <label>
            <input class="globalCheckbox" type="checkbox" [name]="category" value=""
                   [disabled]="!anyEnabled()"
                   (click)="clickGlobalCheckbox($event)">
            <a href="#" (click)="$event.preventDefault(); isVisible = !isVisible"
               [class.disabled]="!anyEnabled()"
               [tooltipHtml]="description" tooltipPlacement="right" [tooltipAppendToBody]="true">
              {{ categoryRealName }}
            </a>
          </label>
        </div>
      </div>
      <div class="units" *ngIf="dimensions != 'none'">
        Units: (<select id="unitChooser" [(ngModel)]="chosenUnit">
                  <option *ngFor="let unit of units()" [value]="unit">{{unit}}</option>
                </select>)
      </div>
  
      <div [collapse]="!isVisible">
        <ul>
          <li *ngFor="let kv of allCountSorted" class="checkbox">
            <label [class.disabled]="!isEnabled(kv.key)">
              <input type="checkbox"
                     [name]="category"
                     [value]="kv.key"
                     [disabled]="!isEnabled(kv.key)"
                     [checked]="isValIncluded(kv.key)"
                     (change)="updateFilters($event, kv.key)">
              {{ formatValueName(kv.key) }}
            </label>
            <div class="count"
                 [class.disabled]="!isEnabled(kv.key)"
            >
              {{filteredCounts[kv.key] || 0}}
            </div>
          </li>
        </ul>
      </div>
    </li>
  `,
  styles: [`
    .top-level-li {
      padding-top: 5px;
      padding-bottom: 5px;
    }
    .fullLabel {
      margin-bottom: -10px;
    } 
    .fullLabel > a {
      position: static;
      display: inline;
      padding: 0px;
    }
    .my-label {
      width: auto;
    }
    .my-label a {
      padding: 10px 0;
      text-decoration: none;
      font-weight: normal;
    }
    .my-label a:hover {
      text-decoration: none;
    }
    .units {
      font-size: 90%;
      font-style: oblique;
      padding-left: 38px;
      padding-top: 5px;
    }
    
    ul {
      padding-left: 30px;
    }
    
    ul li {
      position: relative;
      margin-right: 10px;
      width: 100%;
    }
    
    ul li label {
      margin-right: 40px;
    }
    
    .count {
      display: block;
      position: absolute;
      top: 0px;
      right: 0px;
      width: 40px;
      font-style: italic;
      font-size: 80%;
      padding-top: 2px;
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
  allCountSorted: Array<{ key: string, val: any }> = [];
  @Input() filteredCounts: {
    [value: string]: number   // Free-form mapping of values to counts
  } = {}
  categoryRealName: string;

  description: string = "Fetching description...";
  dimensions: string = "none";
  chosenUnit: string = "none";
  dataType: string = "string";
  units(): string[] {
    let unitConverter = DimensionsRegister[this.dimensions];
    return (unitConverter ? unitConverter.getPossibleUnits() : []);
  }

  constructor(
    private _filtersService: FiltersService,
    private _studyService: StudyService,
    private _elemRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef
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

    let fieldMetaPromise = this._studyService.getFieldMeta(this.category);
    fieldMetaPromise.then(fieldMeta => {
      this.description = fieldMeta.description || "No description available";
      this.dimensions = fieldMeta.dimensions;
      this.chosenUnit = fieldMeta.preferredUnit;
      this.dataType = fieldMeta.dataType;
      this.updateAllCountsSorted();

      this._changeDetectorRef.detectChanges();
    });

    this.updateAllCountsSorted();
  }

  updateAllCountsSorted(): void {

    // allCountsSorted is like allCounts | mapToIterable, but the sort order is different for
    // numeric quantities
    let hasNullCategory = NULL_CATEGORY_NAME in this.allCounts;
    let saveNullCount = this.allCounts[NULL_CATEGORY_NAME];

    var a: Array<{ key: string, val: any }> = [];
    for (var key in this.allCounts) {
      if (this.allCounts.hasOwnProperty(key) && key !== NULL_CATEGORY_NAME) {
        a.push({key: key, val: this.allCounts[key]});
      }
    }

    let partialResult: Array<{ key: string, val: any }>;
    switch (this.dataType) {
      case "double":
        partialResult = a.sort((x, y) => (+x.key) - (+y.key));  // Convert to numbers before sorting
        break;

      case "string":
      default:
        partialResult = a.sort((x, y) => x.key.trim().localeCompare(y.key.trim()));  // Prevent leading spaces from jumbling up items
        break;
    }

    // Add <None> at the top if needed
    this.allCountSorted = (hasNullCategory ? [{key: NULL_CATEGORY_NAME, val: saveNullCount}] : []).concat(partialResult);
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

  anyEnabled(): boolean {
    // Enabled if any valueName is present in counts and its value is not zero
    for (let valueName in this.filteredCounts) {
      if (this.filteredCounts) {
        return true;
      }
    }
    return false;
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
    // Don't reformat or convert units of "<None>"
    if (s === NULL_CATEGORY_NAME) {
      return s;
    }

    let unitConverter = DimensionsRegister[this.dimensions];
    let convert = (
      (this.dimensions == 'none' || !unitConverter)
        ? (x: any) => x
        : (x: any) => unitConverter.fromCanonicalUnits(+x, this.chosenUnit)
    );

    switch (this.category) {
      case 'Phase composition':
        return this.decodePhaseCompositionLike(s, (component, percentage) => `${convert(percentage)} ${component}`);
      case 'Elements composition':
        return this.decodePhaseCompositionLike(s, (element, percentage) => `${convert(percentage)} ${element}`);
      case 'Wettability':
        return this.decodePhaseCompositionLike(s, (liquid, contactAngle) => `${convert(contactAngle)} with ${liquid}`);
      default:
        return convert(s);
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
