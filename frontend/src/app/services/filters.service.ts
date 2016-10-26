import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {isUndefined} from "util";

interface StudyFilters {
  [category: string]: {
    [subcategory: string]: {
      [includeValueName: string]: boolean
      // assume true if absent
    }
  }
}

export interface FiltersState {
  searchText: string,
  studyFilters: StudyFilters
}

export const EMPTY_FILTERS: FiltersState = {
  searchText: '',
  studyFilters: {}
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
    console.log(`Filters before: ${JSON.stringify(this.getFilters())}`);

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
      if (!isUndefined(curFilters[category])) {
        delete curFilters[category][subcategory];

        // And delete the category if necessary
        if (!curFilters[category]) {
          delete curFilters[category];
        }
      }
    } else {
      if (isUndefined(curFilters[category])) {
        curFilters[category] = {};
      }
      curFilters[category][subcategory] = theseFilters;
    }

    // Update filters
    console.log(`Filters after: ${JSON.stringify(curFilters)}`);
    this.setStudyFilters(curFilters);
  }
}
