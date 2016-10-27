import {Study, Sample} from '../common/study.model';
import {Injectable} from "@angular/core";
import {STUDIES, SAMPLES} from '../common/mock-studies';
import * as _ from 'lodash';
import {FiltersState, EMPTY_FILTERS} from "./filters.service";
import {isUndefined} from "util";

export const NULL_CATEGORY_NAME = '<None>';

export interface SampleMatch {
  sampleId: number,
  sample: Sample,
  isFullTextMatch?: boolean,
  passesMetadataFilters?: boolean,
  isMatch?: boolean
}

export interface UnifiedMatch {
  studyId: number,
  study: Study,
  isFullTextMatch?: boolean,
  passesMetadataFilters?: boolean,
  sampleMatches: SampleMatch[],
  isMatch?: boolean
}

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

  shouldStudyBeExcluded(category: string, subcategory: string, excludeValuesMap: {[valueName: string]: boolean},
    study: Study): boolean {

    // Have to be careful: study._source[category] may be a list!
    var values: Array<string> = [];
    if (!(category in study._source)) {
      values.push(NULL_CATEGORY_NAME);
    } else {
      var underCategory = study._source[category];
      if (!Array.isArray(underCategory)) {
        underCategory = [underCategory];  // Avoid duplicating code below
      }

      if (underCategory.length === 0) {
        values.push(NULL_CATEGORY_NAME);
      } else {
        for (let item of underCategory) {
          if (subcategory in item) {
            values.push('' + item[subcategory]);  // Force string comparison, yuck!
          } else {
            values.push(NULL_CATEGORY_NAME);
          }
        }
      }
    }

    // values now contains a list of all values of `category`->`subcategory`, including NULL_CATEGORY_NAME
    // if the entry is ever missing anywhere

    // Exclude an item only if *all* its values are excluded
    return values.every(value => (value in excludeValuesMap));
  };

  getStudiesMatching(filters: FiltersState): Study[] {
    return this.getUnifiedMatches(filters).map(studyMatch => studyMatch.study);
  }

  forceIncludeInStudyFilters(filters: FiltersState, category: string, subcategory: string) {
    if ((category in filters.studyFilters) &&
        (subcategory in filters.studyFilters[category])) {

      let tweakedFilters = _.cloneDeep(filters);
      delete tweakedFilters.studyFilters[category][subcategory];
      return tweakedFilters;
    } else {
      return filters;
    }
  }

  getStudyCounts(filters: FiltersState, category: string, subcategory: string) {
    // Apply all filters *except* the one being queried (so we get a count of all studies that would be included
    // if we allow a particular value for this category-subcategory pair)
    var tweakedFilters = this.forceIncludeInStudyFilters(filters, category, subcategory);
    var matches = this.getUnifiedMatches(tweakedFilters);

    // Simulate ElasticSearch-like aggregation
    let result = {};
    for (let studyMatch of matches) {
      let study = studyMatch.study;
      if (category in study._source) {
        let toSearch = study._source[category];
        if (!Array.isArray(toSearch)) {
          toSearch = [toSearch];   // Avoid duplicating code below
        }

        // Avoid double counting studies where multiple entries have the same value
        let matches = new Set<string>();
        for (let entry of toSearch) {
          if (subcategory in entry) {
            matches.add(entry[subcategory]);
          } else {
            matches.add(NULL_CATEGORY_NAME);
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

  shouldSampleBeExcluded(category: string, excludeValuesMap: {[valueName: string]: boolean}, sample: Sample): boolean {

    // Have to be careful: study._source[category] may be a list!
    var value: string;
    if (category in sample._source) {
      value = '' + sample._source[category];  // Force string comparison, yuck!
    } else {
      value = NULL_CATEGORY_NAME;
    }

    return value in excludeValuesMap;
  }

  getSamplesMatching(filters: FiltersState): Sample[] {
    // See http://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript
    var flatten = function(nestedLists: any[][]): any[] {
      return Array.prototype.concat.apply([], nestedLists);
    }
    return flatten(this.getUnifiedMatches(filters).map(studyMatch =>
      studyMatch.sampleMatches.map(sampleMatch => sampleMatch.sample)
    ));
  }

  getSample(id: number): Sample {
    return this.getSamples().find(sample => sample.id === id);
  }

  forceIncludeInSampleFilters(filters: FiltersState, category: string) {
    if (category in filters.sampleFilters) {

      let tweakedFilters = _.cloneDeep(filters);
      delete tweakedFilters.sampleFilters[category];
      return tweakedFilters;
    } else {
      return filters;
    }
  }

  getSampleCounts(filters: FiltersState, category: string) {
    // Apply all filters *except* the one being queried (so we get a count of all studies that would be included
    // if we allow a particular value for this category-subcategory pair)
    var tweakedFilters = this.forceIncludeInSampleFilters(filters, category);
    var matches = this.getUnifiedMatches(tweakedFilters);

    // Simulate ElasticSearch-like aggregation
    let result = {};
    for (let studyMatch of matches) {
      for (let sampleMatch of studyMatch.sampleMatches) {
        let sample = sampleMatch.sample;
        var value = '' + (sample._source[category] || NULL_CATEGORY_NAME);
        result[value] = (result[value] || 0) + 1;
      }
    }

    return result;
  }

  debugUnifiedMatches(label: string, matchesSoFar: UnifiedMatch[]): void {
    /*
    console.log(label);
    console.log(JSON.stringify(matchesSoFar.map(studyMatch => {
      var x = _.clone(studyMatch);
      delete x.study;
      x.sampleMatches = x.sampleMatches.map(sampleMatch => {
        var y = _.clone(sampleMatch);
        delete y.sample;
        return y;
      });
      return x;
    })));
    */
  }

  getUnifiedMatches(filters: FiltersState): UnifiedMatch[] {

    // 0. Start by including everything
    let result: UnifiedMatch[] = this.getStudies().map(study => <UnifiedMatch>{
      studyId: study.id,
      study: study,
      sampleMatches: (
        this.getSamples()
          .filter(sample => sample.studyId == study.id)
          .map(sample => <SampleMatch>{
            sampleId: sample.id,
            sample: sample
          })
      )
    });
    this.debugUnifiedMatches('After 0:', result);

    // 1. Annotate samples and studies according to whether their metadata matches the search text.
    let q = filters.searchText.toLocaleLowerCase();
    result.forEach(studyMatch => {
      studyMatch.isFullTextMatch = (q === '') || (this.deepFind(studyMatch.study, q));
      studyMatch.sampleMatches.forEach(sampleMatch => {
        sampleMatch.isFullTextMatch = (q === '') || (this.deepFind(sampleMatch.sample, q));
      })
    });
    this.debugUnifiedMatches('After 1:', result);

    // 2. Apply study metadata exclusion filters
    result.forEach(studyMatch => {
      studyMatch.passesMetadataFilters = true;
    });

    _.forOwn(filters.studyFilters, (d, category) => {
      _.forOwn(d, (dd, subcategory) => {
        result.forEach(studyMatch => {
          if (this.shouldStudyBeExcluded(category, subcategory, dd, studyMatch.study)) {
            studyMatch.passesMetadataFilters = false;
          }
        });
      });
    });
    this.debugUnifiedMatches('After 2:', result);

    // 3. Apply sample metadata exclusion filters
    result.forEach(studyMatch => {
      studyMatch.sampleMatches.forEach(sampleMatch => {
        sampleMatch.passesMetadataFilters = true;
      });
    });
    _.forOwn(filters.sampleFilters, (d, category) => {
      result.forEach(studyMatch => {
        studyMatch.sampleMatches.forEach(sampleMatch => {
          if (this.shouldSampleBeExcluded(category, d, sampleMatch.sample)) {
            sampleMatch.passesMetadataFilters = false;
          }
        });
      });
    });
    this.debugUnifiedMatches('After 3:', result);

    // 4. Mark samples preliminarily as "matches" if
    // 1) the study hasn't been excluded by a metadata filter
    // 2) the sample hasn't been excluded by a metadata filter
    // AND 2) the study has a full-text match or the sample has a full-text match
    result.forEach(studyMatch => {
      studyMatch.sampleMatches.forEach(sampleMatch => {
        sampleMatch.isMatch = (
          studyMatch.passesMetadataFilters &&
          sampleMatch.passesMetadataFilters &&
          (studyMatch.isFullTextMatch || sampleMatch.isFullTextMatch)
        );
      })
    });
    this.debugUnifiedMatches('After 4:', result);

    // 5. Further match control samples of "matching" samples
    if (filters.includeControls) {
      result.forEach(studyMatch => {
        var extraControlSampleNames = new Set<string>();
        studyMatch.sampleMatches.forEach(sampleMatch => {
          if (sampleMatch.isMatch && ('Sample Match' in sampleMatch.sample._source)) {
            extraControlSampleNames.add(sampleMatch.sample._source['Sample Match']);
          }
        });

        studyMatch.sampleMatches.forEach(sampleMatch => {
          if (extraControlSampleNames.has(sampleMatch.sample._source['Sample Name'])) {
            sampleMatch.isMatch = true;
          }
        });
      });
      this.debugUnifiedMatches('After 5:', result);
    }

    // 6. Mark studies as matches if they pass study metadata filters and either have a full-text search match
    // or have a matching sample
    result.forEach(studyMatch => {
      studyMatch.isMatch = (
        studyMatch.passesMetadataFilters &&
        (studyMatch.isFullTextMatch || studyMatch.sampleMatches.some(sampleMatch => sampleMatch.isMatch))
      );
    });
    this.debugUnifiedMatches('After 6:', result);

    // 7. Filter out all non-matching studies & samples
    result.forEach(studyMatch => {
      studyMatch.sampleMatches = studyMatch.sampleMatches.filter(sampleMatch => sampleMatch.isMatch);
    });
    result = result.filter(studyMatch => studyMatch.isMatch && studyMatch.sampleMatches.length > 0);
    this.debugUnifiedMatches('After 7:', result);

    // Summary:
    // - First include everything that matches full-text queries
    // - Further include control samples of matching samples
    // - Then impose study and sample metadata exclusions

    return result;
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
