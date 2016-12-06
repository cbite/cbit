import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

import * as _ from 'lodash';

export interface StudyAndSampleIds {
  [studyId: string]: {
    [sampleId: string]: boolean
  }
}

export interface DownloadSelection {
  selection: StudyAndSampleIds;
}

export const EMPTY_DOWNLOAD_SELECTION: DownloadSelection = {
  selection: {}
}

// For inspiration, see: http://blog.angular-university.io/how-to-build-angular2-apps-using-rxjs-observable-data-services-pitfalls-to-avoid/
@Injectable()
export class DownloadSelectionService {
  private _selection: BehaviorSubject<DownloadSelection> = new BehaviorSubject(EMPTY_DOWNLOAD_SELECTION);

  public selection: Observable<DownloadSelection> = this._selection.asObservable();

  constructor() {
  }

  getSelection(): DownloadSelection {
    return this._selection.getValue();
  }

  clearAll(): void {
    this._selection.next(EMPTY_DOWNLOAD_SELECTION);
  }

  clearSelection(): void {
    this.setSelection({});
  }

  setSelection(newSelection: StudyAndSampleIds): void {
    this._selection.next(Object.assign({}, this._selection.getValue(), {
      selection: newSelection
    }))
  }

  addToSelection(studiesAndSampleIds: StudyAndSampleIds): void {
    let newSelection = _.cloneDeep(this.getSelection().selection);
    for (let studyId in studiesAndSampleIds) {
      let newSelectionStudy = (newSelection[studyId] || {});
      for (let sampleId in studiesAndSampleIds[studyId]) {
        newSelectionStudy[sampleId] = true;
      }
      newSelection[studyId] = newSelectionStudy;
    }

    this.setSelection(newSelection);
  }

  removeFromSelection(studiesAndSampleIds: StudyAndSampleIds): void {
    let newSelection = _.cloneDeep(this.getSelection().selection);
    for (let studyIdToRemove in studiesAndSampleIds) {
      if (studyIdToRemove in newSelection) {
        for (let sampleIdToRemove in studiesAndSampleIds[studyIdToRemove]) {
          if (sampleIdToRemove in newSelection[studyIdToRemove]) {
            delete newSelection[studyIdToRemove][sampleIdToRemove];
          }
        }

        if (Object.keys(newSelection[studyIdToRemove]).length === 0) {
          delete newSelection[studyIdToRemove];
        }
      }
    }
    this.setSelection(newSelection);
  }
}
