import {Study} from '../types/study.model';

export function getDisplayFields(study: Study): StudyField[] {
  const categoryMap = Object.assign({}, study._source);
  delete categoryMap['*Archive URL'];
  delete categoryMap['*Publication Date'];
  delete categoryMap['*Study Type'];
  delete categoryMap['*Visible'];

  const result = [];
  for (const key in categoryMap) {
    if (categoryMap.hasOwnProperty(key)) {
      result.push(new StudyField(key, categoryMap[key]));
    }
  }

  return result;
}

export class StudyField {
  constructor (public label: string, public value: any) {}

  isIsMultiValued(): boolean {
    return Array.isArray(this.value);
  }
}
