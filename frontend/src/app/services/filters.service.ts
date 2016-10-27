import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

interface StudyFilters {
  [category: string]: {
    [subcategory: string]: {
      [includeValueName: string]: boolean
      // assume true if absent
    }
  }
}

interface SampleFilters {
  [category: string]: {
    [includeValueName: string]: boolean
    // assume true if absent
  }
}

export interface FiltersState {
  searchText: string,
  studyFilters: StudyFilters,
  sampleFilters: SampleFilters
}

export const EMPTY_FILTERS: FiltersState = {
  searchText: '',
  studyFilters: {},
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

  setStudyFilters(newStudyFilters: StudyFilters): void {
    this._filters.next(Object.assign({}, this._filters.getValue(), {
      studyFilters: newStudyFilters
    }))
  }

  setStudyFilter(category: string, subcategory: string, valueName: string, include: boolean): void {
    // Copy out relevant filters section, if any
    let curFilters = _.cloneDeep(this.getFilters().studyFilters);
    let theseFilters = Object.assign({}, (curFilters[category] || {})[subcategory] || {})

    if(include) {
      // Filter values default to "true" if absent from filters dictionary, so remove this item
      delete theseFilters[valueName];
    } else {
      theseFilters[valueName] = false;
    }

    // If theseFilters is empty, stop filtering on this subcategory / category
    if (_.isEmpty(theseFilters)) {
      if (category in curFilters) {
        delete curFilters[category][subcategory];

        // And delete the category if necessary
        if (_.isEmpty(curFilters[category])) {
          delete curFilters[category];
        }
      }
    } else {
      if (!(category in curFilters)) {
        curFilters[category] = {};
      }
      curFilters[category][subcategory] = theseFilters;
    }

    // Update filters
    this.setStudyFilters(curFilters);
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
}
