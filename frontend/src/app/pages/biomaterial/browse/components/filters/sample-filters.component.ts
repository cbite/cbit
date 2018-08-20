import {
  Component, Input, OnInit, ChangeDetectorRef, OnChanges, DoCheck, ViewChild, ElementRef,
  AfterViewChecked, OnDestroy
} from '@angular/core';
import {FiltersService, FilterMode, FiltersState} from '../../services/filters.service';
import {NULL_CATEGORY_NAME, StudyService} from '../../../../../core/services/study.service';
import * as $ from 'jquery';
import {DimensionsRegister} from '../../../../../common/unit-conversions';
import {Ng2SliderComponent} from '../../../../../common/slider/ng2-slider.component';
import {Subject} from 'rxjs';
import {CollapseStateService} from '../../../../../core/services/collapse-state.service';
import {UnitFormattingService} from '../../../../../services/unit-formatting.service';
import {FieldMeta} from '../../../../../core/types/field-meta';
import {FieldMetaService} from '../../../../../core/services/field-meta.service';

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
        <a href="#" (click)="$event.preventDefault(); toggleVisible()"
           [class.disabled]="!anyEnabled()"
        ><!--
          --><span *ngIf=" isVisible" class="glyphicon glyphicon-triangle-bottom"></span><!--
          --><span *ngIf="!isVisible" class="glyphicon glyphicon-triangle-right"></span><!--
        --></a>
        <div class="my-label checkbox-inline">
          <label>
            <input class="globalCheckbox" type="checkbox" [name]="category" value=""
                   [disabled]="!anyEnabled()"
                   (click)="clickGlobalCheckbox($event)">
            <ng-template #tooltipTemplate>
              <div [innerHtml]="description"></div>
            </ng-template>
            <a href="#" (click)="$event.preventDefault(); toggleVisible()"
               [class.disabled]="!anyEnabled()"
               [my-tooltip]="tooltipTemplate" placement="right">
              {{ categoryRealName }}
            </a>
          </label>
        </div>
      </div>

      <div *ngIf="isVisible">

        <div class="units" *ngIf="dimensions !== 'none'">
          Units: <select *ngIf="units().length > 1" id="unitChooser" [(ngModel)]="chosenUnit">
                    <option *ngFor="let unit of units()" [value]="unit">{{ uiUnitName(dimensions, unit) }}</option>
                  </select>
                  <span *ngIf="units().length === 1">{{ uiUnitName(dimensions, units()[0]) }}</span>
        </div>

        <ul *ngIf="!shouldUseSlider">
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

        <div class="slider-box" *ngIf="shouldUseSlider">
          <div class="actualRange">
            From {{ formatValueName(displayStartValue + '') }} to {{ formatValueName(displayEndValue + '') }}
          </div>
          <ng2-slider
                #slider
                [min]="minValue"
                [max]="maxValue"
                [stepValue]="stepValue"
                (onRangeChanged)="rangeValueChanged($event)"
                (onRangeChanging)="rangeValueChanging($event)">
          </ng2-slider>
          <div class="minValue">{{ formatValueName(minValue + '') }}</div>
          <div class="maxValue">{{ formatValueName(maxValue + '') }}</div>
          <div *ngIf="hasNullValues()" class="checkbox">
            <label [class.disabled]="!isEnabled(nullCategoryName)">
              <input type="checkbox"
                     [name]="category"
                     [value]="nullCategoryName"
                     [disabled]="!isEnabled(nullCategoryName)"
                     [checked]="rangeIncludeUnspecified"
                     (change)="toggleRangeFilterUnspecifieds($event)">
              ...or unspecified
            </label>
            <div class="count"
                 [class.disabled]="!isEnabled(nullCategoryName)"
            >
              {{filteredCounts[nullCategoryName] || 0}}
            </div>
          </div>
        </div>
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
      max-width: 80%;
      vertical-align: top;
    }
    .my-label a {
      padding: 10px 0;
      text-decoration: none;
      font-weight: normal;
    }
    .my-label a:hover {
      text-decoration: underline;
    }
    .units {
      font-size: 90%;
      font-style: oblique;
      padding-left: 38px;
      padding-top: 7px;
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

    .slider-box {
      position: relative;
      margin-left: 30px;
      padding-top: 20px;
    }

    .slider-box > .actualRange {
      position: absolute;
      top: 7px;
      left: 0;
      width: 100%;
      overflow: visible;
      text-align: center;
    }

    .slider-box > .minValue {
      position: absolute;
      left: 0px;
      top: 50px;
    }

    .slider-box > .maxValue {
      position: absolute;
      right: 0px;
      top: 50px;
    }

    .slider-box > ng2-slider {
      display: block;
      margin-left: 10px;
      margin-right: 10px;
    }

    .slider-box > .checkbox {
      margin-top: 25px;
    }
  `]
})
export class SampleFiltersComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() category: string;
  @Input() allCounts: {
    [value: string]: number   // Free-form mapping of values to counts
  } = {};
  allCountSorted: Array<{ key: string, val: any }> = [];
  @Input() filteredCounts: {
    [value: string]: number   // Free-form mapping of values to counts
  } = {};
  categoryRealName: string;
  @ViewChild(Ng2SliderComponent) slider: Ng2SliderComponent;

  fieldMeta: FieldMeta = {};
  description = 'Fetching description...';
  dimensions = 'none';
  chosenUnit = 'none';
  dataType = 'string';
  isNumerical = false;
  shouldUseSlider = false;
  minValue = 0;
  maxValue = 100;
  get stepValue(): number { return (this.maxValue - this.minValue) / 200; }  // TODO: Improve
  displayStartValue = 0;
  displayEndValue = 100;
  startValue = 0;
  endValue = 0;
  rangeIncludeUnspecified = true;
  tickSize = 1;
  units(): string[] {
    const unitConverter = DimensionsRegister[this.dimensions];
    return (unitConverter ? unitConverter.getPossibleUnits() : []);
  }

  uiUnitName(dimensions: string, unitName: string): string {
    return DimensionsRegister[dimensions].getUnitUIName(unitName);
  }

  stopStream = new Subject<string>();

  constructor(
    private _filtersService: FiltersService,
    private fieldMetaService: FieldMetaService,
    private _elemRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _collapsedStateService: CollapseStateService,
    private _unitFormattingService: UnitFormattingService
  ) { }

  get isVisible(): boolean {
    return !this._collapsedStateService.isCollapsed(`sample-filters-${this.category}`, true);
  }
  set isVisible(value: boolean) {
    this._collapsedStateService.setCollapsed(`sample-filters-${this.category}`, !value);
  }

  toggleVisible() {
    this.isVisible = !this.isVisible;
    setTimeout(() => {
      // Needs to happen *after* visibility changes take effect for
      // slider dimensions to be correctly calculated
      if (this.slider) {
        this.slider.refreshUI();
      }
    }, 4);
  }

  isTrivial(): boolean {
    return (Object.keys(this.allCounts).length <= 1);
  }

  // For use inside the component's template, where NULL_CATEGORY_NAME is undefined
  nullCategoryName = NULL_CATEGORY_NAME;
  hasNullValues(): boolean {
    return NULL_CATEGORY_NAME in this.allCounts;
  }

  private jqElem: JQuery;
  ngOnInit(): void {
    this.categoryRealName =
      (this.category.substr(0, 1) == '*'
       ? (this.category.indexOf(' - ') != -1 ? this.category.substr(this.category.indexOf(' - ') + 3) : this.category.substr(1))
        : this.category);
    this.jqElem = $(this._elemRef.nativeElement);

    const fieldMetaPromise = this.fieldMetaService.getFieldMeta(this.category);
    fieldMetaPromise.then(fieldMeta => {
      this.fieldMeta = fieldMeta;
      this.description = fieldMeta.description || 'No description available';
      this.dimensions = fieldMeta.dimensions;
      this.chosenUnit = fieldMeta.preferredUnit;
      this.dataType = fieldMeta.dataType;

      this.isNumerical = (
        this.dataType === 'double' &&
        this.category !== 'Phase composition' &&
        this.category !== 'Elements composition' &&
        this.category !== 'Wettability'
      );
      this.shouldUseSlider = this.isNumerical;

      this.updateAllCountsSorted();

      this._changeDetectorRef.detectChanges();
    });

    this.updateAllCountsSorted();

    // Ensure that external modifications to FiltersService are reflected in filters
    this._filtersService.filters
      .takeUntil(this.stopStream)
      .subscribe(filters => this.updateUI(filters));
  }

  ngOnDestroy() {
    this.stopStream.next('stop');
  }

  updateAllCountsSorted(): void {

    // allCountsSorted is like allCounts | mapToIterable, but the sort order is different for
    // numeric quantities
    const hasNullCategory = NULL_CATEGORY_NAME in this.allCounts;
    const saveNullCount = this.allCounts[NULL_CATEGORY_NAME];

    const a: Array<{ key: string, val: any }> = [];
    for (const key in this.allCounts) {
      if (this.allCounts.hasOwnProperty(key) && key !== NULL_CATEGORY_NAME) {
        a.push({key: key, val: this.allCounts[key]});
      }
    }

    let partialResult: Array<{ key: string, val: any }>;
    if (this.isNumerical) {
      partialResult = a.sort((x, y) => (+x.key) - (+y.key));  // Convert to numbers before sorting
    } else {
      partialResult = a.sort((x, y) => x.key.trim().localeCompare(y.key.trim()));  // Prevent leading spaces from jumbling up items
    }

    // Take advantage that partialResult guaranteed non-empty and is sorted to determine numerical ranges and precision
    if (this.isNumerical) {
      this.minValue = +(partialResult[0].key);
      this.maxValue = +(partialResult[partialResult.length - 1].key);

      let range: number;
      if (this.minValue == this.maxValue) {
        range = Math.abs(this.maxValue);
      } else {
        range = this.maxValue - this.minValue;
      }

      // Ensure enough precision in numbers to distinguish 1/100th of range
      this.tickSize = range / 100;

      this.startValue = this.displayStartValue = this.minValue;
      this.endValue = this.displayEndValue = this.maxValue;

      if (this.slider) {
        this.slider.setStartValue(this.displayStartValue);
        this.slider.setEndValue(this.displayEndValue);
      }
    }

    // Add <None> at the top if needed
    this.allCountSorted = (hasNullCategory ? [{key: NULL_CATEGORY_NAME, val: saveNullCount}] : []).concat(partialResult);
  }

  getGlobalCheckboxState(): GlobalCheckboxState {
    const curFilters = this._filtersService.getFilters().sampleFilters;
    const numPossibleValues = Object.keys(this.allCounts).length;

    if (this.category in curFilters) {
      const categoryFilter = curFilters[this.category];
      switch (categoryFilter.mode) {

        case FilterMode.AllButThese:
          const numExclusions = Object.keys(categoryFilter.detail).length;
          if (numExclusions === 0) {
            return GlobalCheckboxState.All;
          } else if (numExclusions === numPossibleValues) {
            return GlobalCheckboxState.None;
          } else {
            return GlobalCheckboxState.Indeterminate;
          }

        case FilterMode.OnlyThese:
          const numInclusions = Object.keys(categoryFilter.detail).length;
          if (numInclusions === 0) {
            return GlobalCheckboxState.None;
          } else if (numExclusions === numPossibleValues) {
            return GlobalCheckboxState.All;
          } else {
            return GlobalCheckboxState.Indeterminate;
          }

        case FilterMode.Range:
          const rangeDetail = categoryFilter.rangeDetail;
          if (rangeDetail.startValue === rangeDetail.endValue && !rangeDetail.includeUnspecified) {
            return GlobalCheckboxState.None;
          } else if (rangeDetail.startValue <= this.minValue && rangeDetail.endValue >= this.maxValue && rangeDetail.includeUnspecified) {
            return GlobalCheckboxState.All;
          } else {
            return GlobalCheckboxState.Indeterminate;
          }
      }
    } else {
      return GlobalCheckboxState.All;   // If no filters specified, default to all values
    }
  }

  updateUI(filters: FiltersState) {
    // We only really need to update sliders if need be
    if (this.shouldUseSlider) {
      if (this.category in filters.sampleFilters) {
        const rangeDetail = filters.sampleFilters[this.category].rangeDetail;
        this.startValue = this.displayStartValue = rangeDetail.startValue;
        this.endValue = this.displayEndValue = rangeDetail.endValue;
        this.rangeIncludeUnspecified = rangeDetail.includeUnspecified;
      } else {
        this.startValue = this.displayStartValue = this.minValue;
        this.endValue = this.displayEndValue = this.maxValue;
        this.rangeIncludeUnspecified = true;
      }

      if (this.slider) {
        this.slider.setStartValue(this.displayStartValue);
        this.slider.setEndValue(this.displayEndValue);
      }
    }
  }

  ngAfterViewChecked(): void {

    const state = this.getGlobalCheckboxState();
    const globalCheckbox = this.jqElem.find('.globalCheckbox');

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
    const curFilters = this._filtersService.getFilters().sampleFilters;
    if (this.category in curFilters) {
      const categoryFilter = curFilters[this.category];
      switch (categoryFilter.mode) {
        case FilterMode.AllButThese:
          // Checked if true or absent, unchecked if false
          return !(categoryFilter.detail[valueName] === false);
        case FilterMode.OnlyThese:
          // Checked if true, unchecked if false or absent
          return  (categoryFilter.detail[valueName] === true);
        case FilterMode.Range:
          // Checked if unspecified & including unspecifieds or if within range
          if (valueName === NULL_CATEGORY_NAME) {
            return categoryFilter.rangeDetail.includeUnspecified;
          } else {
            return +valueName >= categoryFilter.rangeDetail.startValue && +valueName <= categoryFilter.rangeDetail.endValue;
          }
      }
    } else {
      return true;   // If no filters specified, default to all values
    }
  }

  isEnabled(valueName: string): boolean {
    // Enabled if valueName is present in counts and its value is not zero
    return !!(this.filteredCounts[valueName]);
  }

  rangeValueChanging(newRange: number[]) {
    if (this.displayStartValue !== newRange[0] || this.displayEndValue !== newRange[1]) {
      [this.displayStartValue, this.displayEndValue] = newRange;
      this._changeDetectorRef.detectChanges();
    }
  }

  rangeValueChanged(newRange: number[]) {
    if (this.startValue !== newRange[0] || this.endValue !== newRange[1]) {
      console.log(`Changed: ${JSON.stringify(newRange)}`);
      [this.startValue, this.endValue] = newRange;
      this._changeDetectorRef.detectChanges();

      this.setSampleRangeFilter(this.startValue, this.endValue, this.rangeIncludeUnspecified);
    }
  }

  anyEnabled(): boolean {
    // Enabled if any valueName is present in counts and its value is not zero
    for (const valueName in this.filteredCounts) {
      if (this.filteredCounts) {
        return true;
      }
    }
    return false;
  }

  updateFilters(e: any, valueName: string): void {
    this._filtersService.setSampleFilter(this.category, valueName, e.target.checked);
  }

  toggleRangeFilterUnspecifieds(e: any): void {
    this.setSampleRangeFilter(this.startValue, this.endValue, e.target.checked);
  }

  formatValueName(s: (string | number)): string {
    // Don't reformat or convert units of missing data, but do show it in the UI as "<None>"
    if (s === NULL_CATEGORY_NAME) {
      return '<None>';
    } else {
      const valueRanges = {[this.fieldMeta.fieldName]: this.tickSize * 100};
      return this._unitFormattingService.formatValue(s, this.fieldMeta, valueRanges, this.chosenUnit);
    }
  }

  selectAll(): void {
    if (!this.shouldUseSlider) {
      this._filtersService.setSampleFilterAll(this.category);
    } else {
      this._filtersService.clearSampleRangeFilter(this.category);
    }
  }

  selectNone(): void {
    if (!this.shouldUseSlider) {
      this._filtersService.setSampleFilterNone(this.category);
    } else {
      const midValue = (this.minValue + this.maxValue) / 2;
      this.setSampleRangeFilter(midValue, midValue, false);
    }
  }

  setSampleRangeFilter(newStartValue: number, newEndValue: number, newIncludeUnspecified: boolean) {
    // Avoid rounding errors near end of slider
    if (this.minValue == this.maxValue) {
      newStartValue = this.minValue;
      newEndValue = this.maxValue;
    } else {
      const range = this.maxValue - this.minValue;
      if (Math.abs(newStartValue - this.minValue) < 0.005 * range) {
        newStartValue = this.minValue;
      }
      if (Math.abs(newEndValue - this.maxValue) < 0.005 * range) {
        newEndValue = this.maxValue;
      }
    }

    if (newStartValue == this.minValue && newEndValue == this.maxValue && newIncludeUnspecified) {
      this._filtersService.clearSampleRangeFilter(this.category);
    } else {
      this._filtersService.setSampleRangeFilter(this.category, newStartValue, newEndValue, newIncludeUnspecified);
    }
  }

  clickGlobalCheckbox(e: any): void {
    e.preventDefault();

    const state = this.getGlobalCheckboxState();
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
