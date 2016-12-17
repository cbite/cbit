import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import * as _ from 'lodash';

export const enum FilterMode {
  AllButThese = 0,
  OnlyThese   = 1,
  Range       = 2
}

export interface SampleFilter {
  mode: FilterMode,
  detail?: {
    // If mode is AllButThese, include every value category except those listed below.
    // Otherwise, if mode is OnlyThese, only include the values below.
    [valueName: string]: boolean
  },
  rangeDetail?: {
    // If mode is Range, include every value in the range below (inclusive),
    // possibly including sample where the value is unspecified
    startValue: number;
    endValue: number;
    includeUnspecified: boolean;
  }
}

export interface SampleFilters {
  [category: string]: SampleFilter
}

export interface FiltersState {
  searchText: string,
  includeControls: boolean,
  sampleFilters: SampleFilters
}

export const EMPTY_FILTERS: FiltersState = {
  searchText: '',
  includeControls: true,
  sampleFilters: {}
}

// For inspiration, see: http://blog.angular-university.io/how-to-build-angular2-apps-using-rxjs-observable-data-services-pitfalls-to-avoid/
@Injectable()
export class FiltersService {
  private _filters: BehaviorSubject<FiltersState> = new BehaviorSubject(EMPTY_FILTERS);

  public filters: Observable<FiltersState> = this._filters.asObservable();

  constructor() {
  }

  getFilters(): FiltersState {
    return this._filters.getValue();
  }

  setFilters(newFilters: FiltersState) {
    this._filters.next(newFilters);
  }

  clearFilters(): void {
    this.setFilters(EMPTY_FILTERS);
  }

  setSearchText(newSearchText: string): void {

    // See https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    this.setFilters(Object.assign({}, this._filters.getValue(), {
      searchText: newSearchText
    }));
  }

  setIncludeControls(newIncludeControls: boolean): void {
    this.setFilters(Object.assign({}, this._filters.getValue(), {
      includeControls: newIncludeControls
    }));
  }

  setSampleFilters(newSampleFilters: SampleFilters): void {
    this.setFilters(Object.assign({}, this._filters.getValue(), {
      sampleFilters: newSampleFilters
    }))
  }

  // Force all components to reprocess filters (e.g., after logging in as an admin)
  pulse(): void {
    this.setFilters(this._filters.getValue());
  }

  setSampleFilter(category: string, valueName: string, include: boolean): void {
    // Copy out relevant filters section, if any
    let curFilters: SampleFilters = _.cloneDeep(this.getFilters().sampleFilters);
    let theseFilters = Object.assign({}, curFilters[category] || {mode: FilterMode.AllButThese, detail: {}})

    if (theseFilters.mode === FilterMode.AllButThese) {
      if (include) {
        // Filter values default to "true" if absent from filters dictionary, so remove this item
        delete theseFilters.detail[valueName];
      } else {
        theseFilters.detail[valueName] = false;
      }
    } else {
      if (include) {
        theseFilters.detail[valueName] = true;
      } else {
        // Filter values default to "false" if absent from filters dictionary, so remove this item
        delete theseFilters.detail[valueName];
      }
    }

    // If theseFilters is empty & the mode is AllButThese, stop filtering on this category
    if (theseFilters.mode === FilterMode.AllButThese && _.isEmpty(theseFilters.detail)) {
      delete curFilters[category];
    } else {
      curFilters[category] = theseFilters;
    }

    // Update filters
    this.setSampleFilters(curFilters);
  }

  setSampleFilterAll(category: string): void {
    let curFilters = _.cloneDeep(this.getFilters().sampleFilters);
    delete curFilters[category];
    this.setSampleFilters(curFilters);
  }

  setSampleFilterNone(category: string): void {
    let curFilters = _.cloneDeep(this.getFilters().sampleFilters);
    curFilters[category] = {
      mode: FilterMode.OnlyThese,
      detail: {}
    }
    this.setSampleFilters(curFilters);
  }

  setSampleRangeFilter(category: string, startValue: number, endValue: number, includeUnspecified: boolean) {
    let curFilters = _.cloneDeep(this.getFilters().sampleFilters);
    curFilters[category] = {
      mode: FilterMode.Range,
      rangeDetail: {
        startValue: startValue,
        endValue: endValue,
        includeUnspecified: includeUnspecified
      }
    }
    this.setSampleFilters(curFilters);
  }

  clearSampleRangeFilter(category: string) {
    let curFilters = _.cloneDeep(this.getFilters().sampleFilters);
    delete curFilters[category];
    this.setSampleFilters(curFilters);
  }
}
