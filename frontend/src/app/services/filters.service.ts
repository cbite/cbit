import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

export const enum FilterMode {
  AllButThese,
  OnlyThese
}

export interface SampleFilter {
  mode: FilterMode,
  detail: {
    // If mode is AllButThese, include every value category except those listed below.
    // Otherwise, if mode is OnlyThese, only include the values below.
    [valueName: string]: boolean
  }
}

export interface SampleFilters {
  [category: string]: SampleFilter
}

export interface StudiesExcludedForDownload {
  [studyId: string]: boolean
}

export interface SamplesExcludedForDownload {
  [sampleId: string]: boolean
}

export interface FiltersState {
  searchText: string,
  includeControls: boolean,
  sampleFilters: SampleFilters,
  studiesExcludedForDownload: StudiesExcludedForDownload,
  samplesExcludedForDownload: SamplesExcludedForDownload
}

export const EMPTY_FILTERS: FiltersState = {
  searchText: '',
  includeControls: true,
  sampleFilters: {},
  studiesExcludedForDownload: {},
  samplesExcludedForDownload: {}
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

  setStudiesExcludedForDownload(newStudiesExcludedForDownload: StudiesExcludedForDownload): void {
    this._filters.next(Object.assign({}, this._filters.getValue(), {
      studiesExcludedForDownload: newStudiesExcludedForDownload
    }))
  }

  setStudySelected(studyId: string, include: boolean): void {
    let curStudies = _.cloneDeep(this.getFilters().studiesExcludedForDownload);
    if (!include) {
      curStudies[studyId] = true;
    } else {
      delete curStudies[studyId];
    }
    this.setStudiesExcludedForDownload(curStudies);
  }

  setSamplesExcludedForDownload(newSamplesExcludedForDownload: SamplesExcludedForDownload): void {
    this._filters.next(Object.assign({}, this._filters.getValue(), {
      samplesExcludedForDownload: newSamplesExcludedForDownload
    }))
  }

  setSampleSelected(sampleId: string, include: boolean): void {
    let curSamples: SamplesExcludedForDownload = _.cloneDeep(this.getFilters().samplesExcludedForDownload);
    if (!include) {
      curSamples[sampleId] = true;
    } else {
      delete curSamples[sampleId];
    }
    this.setSamplesExcludedForDownload(curSamples);
  }
}
