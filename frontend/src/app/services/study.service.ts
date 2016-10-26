import {Study, Sample} from '../common/study.model';
import {Injectable} from "@angular/core";
import {STUDIES, SAMPLES} from '../common/mock-studies';

@Injectable()
export class StudyService {
  /*getStudies(): Promise<Study[]> {
    //return Promise.resolve(STUDIES);
    return new Promise<Study[]>(resolve =>
      setTimeout(resolve, 2000)) // delay 2 seconds
      .then(() => Promise.resolve(STUDIES));
  }

  getStudy(id: number): Promise<Study> {
    return this.getStudies()
      .then(studies => studies.find(study => study.id === id));
  }*/

  getStudies(): Study[] {
    return STUDIES;
  }

  getStudy(id: number): Study {
    return this.getStudies().find(study => study.id === id);
  }

  getStudiesMatching(searchText: string): Study[] {
    return STUDIES.filter(study => this.deepFind(study, searchText.toLocaleLowerCase()));
  }

  getSamples(): Sample[] {
    return SAMPLES;
  }

  getSamplesMatching(searchText: string): Sample[] {

    // Return all samples that have 'searchText' somewhere in their metadata,
    // as well as all associated control samples (referenced via the field 'Sample Name')

    interface Match {
      studyId: number,
      name: string
    }

    var
      resultIds = new Set<number>(),
      sampleMatches: Array<Match> = [],
      sample: Sample
      ;

    // First, raw results (make note of control names...)
    for (sample of SAMPLES.filter(sample => this.deepFind(sample, searchText.toLocaleLowerCase()))) {
      resultIds.add(sample.id);
      if (sample._source['Sample Match']) {
        sampleMatches.push({
          studyId: sample.studyId,
          name: sample._source['Sample Match']
        })
      }
    }

    // Next, controls (horrible O(N^2) crap here, but this will all be replaced by ElasticSearch later
    (SAMPLES
      .filter(sample => sampleMatches.some(maybeMatch => sample.studyId == maybeMatch.studyId && sample._source['Sample Name'] == maybeMatch.name))
      .forEach(sample => {
        console.log(`Adding control `)
        resultIds.add(sample.id)
      })
    )

    // Now fetch all the relevant samples from list of matching ids
    return SAMPLES.filter(sample => resultIds.has(sample.id));
  }

  getSample(id: number): Sample {
    return this.getSamples().find(sample => sample.id === id);
  }

  deepFind(target: (Object|Array<any>), searchText: string): boolean {
    var
      key: string,
      value: any
    ;
    for (key in target) {
      if (target.hasOwnProperty(key)) {
        value = target[key];
        switch (typeof value) {
          case 'object':
            if (this.deepFind(value, searchText)) {
              return true;
            }
            break;
          case 'string':
          case 'number':
            if (('' + value).toLocaleLowerCase().indexOf(searchText) != -1) {
              return true;
            }
        }
      }
    }
    return false;
  }
}
