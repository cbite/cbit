import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

export interface StudiesExcludedFromAddToCart {
  [studyId: string]: boolean
}

export interface SamplesExcludedFromAddToCart {
  [sampleId: string]: boolean
}

export interface StudyAndSampleIds {
  [studyId: string]: {
    [sampleId: string]: boolean
  }
}

export interface DownloadSelection {
  inCart: StudyAndSampleIds;
  studiesExcludedFromAddToCart: StudiesExcludedFromAddToCart,
  samplesExcludedFromAddToCart: SamplesExcludedFromAddToCart
}

export const EMPTY_DOWNLOAD_SELECTION: DownloadSelection = {
  inCart: {},
  studiesExcludedFromAddToCart: {},
  samplesExcludedFromAddToCart: {}
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

  clearCart(): void {
    this.setInCart({});
  }

  setInCart(newInCart: StudyAndSampleIds): void {
    this._selection.next(Object.assign({}, this._selection.getValue(), {
      inCart: newInCart
    }))
  }

  clearExclusions(): void {
    this._selection.next(Object.assign({}, this._selection.getValue(), {
      studiesExcludedFromAddToCart: {},
      samplesExcludedFromAddToCart: {}
    }))
  }

  setStudiesExcludedFromAddToCart(newStudiesExcludedFromAddToCart: StudiesExcludedFromAddToCart): void {
    this._selection.next(Object.assign({}, this._selection.getValue(), {
      studiesExcludedFromAddToCart: newStudiesExcludedFromAddToCart
    }))
  }

  setStudySelected(studyId: string, include: boolean): void {
    let curStudies: StudiesExcludedFromAddToCart = _.cloneDeep(this.getSelection().studiesExcludedFromAddToCart);
    if (!include) {
      curStudies[studyId] = true;
    } else {
      delete curStudies[studyId];
    }
    this.setStudiesExcludedFromAddToCart(curStudies);
  }

  setSamplesExcludedFromAddToCart(newSamplesExcludedFromAddToCart: SamplesExcludedFromAddToCart): void {
    this._selection.next(Object.assign({}, this._selection.getValue(), {
      samplesExcludedFromAddToCart: newSamplesExcludedFromAddToCart
    }))
  }

  setSampleSelected(sampleId: string, include: boolean): void {
    let curSamples: SamplesExcludedFromAddToCart = _.cloneDeep(this.getSelection().samplesExcludedFromAddToCart);
    if (!include) {
      curSamples[sampleId] = true;
    } else {
      delete curSamples[sampleId];
    }
    this.setSamplesExcludedFromAddToCart(curSamples);
  }

  addToCart(studiesAndSampleIds: StudyAndSampleIds): void {
    let excludedStudies = this.getSelection().studiesExcludedFromAddToCart;
    let excludedSamples = this.getSelection().samplesExcludedFromAddToCart;
    let newCart = _.cloneDeep(this.getSelection().inCart);
    for (let studyId in studiesAndSampleIds) {
      if (!(studyId in excludedStudies)) {
        let newCartStudy = (newCart[studyId] || {});
        for (let sampleId in studiesAndSampleIds[studyId]) {
          if (!(sampleId in excludedSamples)) {
            newCartStudy[sampleId] = true;
          }
        }
        newCart[studyId] = newCartStudy;
      }
    }

    this.setInCart(newCart);
  }
}
