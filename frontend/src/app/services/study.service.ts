import {Study, Sample} from '../common/study.model';
import {Injectable} from "@angular/core";
import {STUDIES, SAMPLES} from '../common/mock-studies';
import * as _ from 'lodash';
import {FiltersState, EMPTY_FILTERS} from "./filters.service";
import {isUndefined} from "util";

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

  private _lastFilters: FiltersState;
  private _lastStudyMatches: Study[];

  getStudies(): Study[] {
    return STUDIES;
  }

  getStudy(id: number): Study {
    return this.getStudies().find(study => study.id === id);
  }

  getStudiesMatching(filters: FiltersState): Study[] {
    if (!isUndefined(this._lastFilters) && _.isEqual(this._lastFilters, filters)) {
      return this._lastStudyMatches;
    }

    this._lastFilters = _.cloneDeep(filters);

    let result = STUDIES;
    if (filters.searchText) {
      result = result.filter(study => this.deepFind(study, filters.searchText.toLocaleLowerCase()));
    }

    _.forOwn(filters.studyFilters, (d, category) => {
      _.forOwn(d, (dd, subcategory) => {
        _.forOwn(dd, (included, valueName) => {
          let excluded = !included;
          if (excluded) {
            result = result.filter(study =>
              isUndefined(study._source[category]) || isUndefined(study._source[category][subcategory]) || (study._source[category][subcategory] !== valueName)
            );
          }
        });
      });
    });

    this._lastStudyMatches = result;

    return result;
  }

  forceIncludeInStudyFilters(filters: FiltersState, category: string, subcategory: string) {
    if (isUndefined(filters.studyFilters[category]) ||
        isUndefined(filters.studyFilters[category][subcategory])) {

      return filters;
    } else {
      let tweakedFilters = _.cloneDeep(filters);
      delete tweakedFilters.studyFilters[category][subcategory];
      return tweakedFilters;
    }
  }

  getStudyCounts(filters: FiltersState, category: string, subcategory: string) {
    // Apply all filters *except* the one being queried (so we get a count of all studies that would be included
    // if we allow a particular value for this category-subcategory pair)
    var tweakedFilters = this.forceIncludeInStudyFilters(filters, category, subcategory);
    var matchingStudies = this.getStudiesMatching(tweakedFilters);

    // Simulate ElasticSearch-like aggregation
    let result = {};
    for (let study of matchingStudies) {
      if (!isUndefined(study._source[category])) {
        let toSearch = study._source[category];
        if (!Array.isArray(toSearch)) {
          toSearch = [toSearch];   // Avoid duplicating code below
        }

        // Avoid double counting studies where multiple entries have the same value
        let matches = new Set<string>();
        for (let entry of toSearch) {
          if (!isUndefined(entry[subcategory])) {
            matches.add(entry[subcategory]);
          }
        }
        matches.forEach(match => {
          result[match] = (result[match] || 0) + 1;
        })
      }
    }

    return result;
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
