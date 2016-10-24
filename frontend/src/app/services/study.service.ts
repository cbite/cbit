import { Study } from '../common/study.model';
import {Injectable} from "@angular/core";
import { STUDIES } from '../common/mock-studies';

@Injectable()
export class StudyService {
  getStudies(): Promise<Study[]> {
    //return Promise.resolve(STUDIES);
    return new Promise<Study[]>(resolve =>
      setTimeout(resolve, 2000)) // delay 2 seconds
      .then(() => Promise.resolve(STUDIES));
  }

  getStudy(id: number): Promise<Study> {
    return this.getStudies()
      .then(studies => studies.find(study => study.id === id));
  }
}
