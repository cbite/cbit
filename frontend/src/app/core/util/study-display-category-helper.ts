import {Study} from '../types/study.model';

export function getCategoriesToDisplay(study: Study): StudyCategory[] {
  const categoryMap = Object.assign({}, study._source);
  delete categoryMap['*Archive URL'];
  delete categoryMap['*Publication Date'];
  delete categoryMap['*Study Type'];
  delete categoryMap['*Array Express Id'];
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
  constructor (public label: string, public value: any) {}

  isIsMultiValued(): boolean {
    return Array.isArray(this.value);
  }
}
