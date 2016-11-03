import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

interface SampleFilters {
  [category: string]: {
    [includeValueName: string]: boolean
    // assume true if absent
  }
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

  clearFilters(): void {
    this._filters.next(EMPTY_FILTERS);
  }

  setSearchText(newSearchText: string): void {

    // See https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    this._filters.next(Object.assign({}, this._filters.getValue(), {
      searchText: newSearchText
    }));
  }

  setIncludeControls(newIncludeControls: boolean): void {
    this._filters.next(Object.assign({}, this._filters.getValue(), {
      includeControls: newIncludeControls
    }));
  }

  setSampleFilters(newSampleFilters: SampleFilters): void {
    this._filters.next(Object.assign({}, this._filters.getValue(), {
      sampleFilters: newSampleFilters
    }))
  }

  setSampleFilter(category: string, valueName: string, include: boolean): void {
    // Copy out relevant filters section, if any
    let curFilters = _.cloneDeep(this.getFilters().sampleFilters);
    let theseFilters = Object.assign({}, curFilters[category] || {})

    if(include) {
      // Filter values default to "true" if absent from filters dictionary, so remove this item
      delete theseFilters[valueName];
    } else {
      theseFilters[valueName] = false;
    }

    // If theseFilters is empty, stop filtering on this category
    if (_.isEmpty(theseFilters)) {
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

  setSampleFilterNone(category: string, excludedValues: Array<string>): void {
    let curFilters = _.cloneDeep(this.getFilters().sampleFilters);
    let thisFilter = {}
    for (let v of excludedValues) {
      thisFilter[v] = false;
    }
    curFilters[category] = thisFilter;
    this.setSampleFilters(curFilters);
  }

}
