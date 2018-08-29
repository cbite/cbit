import {Study} from '../types/study.model';
import * as uniqBy from 'lodash.uniqby';

export function getCategoriesToDisplay(study: Study): StudyCategory[] {
  const categoryMap = Object.assign({}, study._source);
  delete categoryMap['*Archive URL'];
  delete categoryMap['*Study Type'];
  delete categoryMap['*Array Express Id'];
  delete categoryMap['*Supplementary Files'];
  delete categoryMap['*ePIC PID'];
  delete categoryMap['*Protocol File'];
  delete categoryMap['*Visible'];

  const result = [];
  for (const key in categoryMap) {
    if (categoryMap.hasOwnProperty(key)) {
      result.push(new StudyCategory(key, categoryMap[key]));
    }
  }

  return result;
}

export class StudyCategory {
  constructor(public label: string, public value: any) {
  }

  isIsMultiValued(): boolean {
    return Array.isArray(this.value);
  }

  getUniqueValue(): any {
    if (this.isIsMultiValued()) {
      return uniqBy(this.value, x => JSON.stringify(x));
    } else {
      return this.value;
    }
  }
}
