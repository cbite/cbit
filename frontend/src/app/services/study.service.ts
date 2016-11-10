import {Study, Sample, RawStudy} from '../common/study.model';
import {Injectable} from "@angular/core";
import {STUDIES, SAMPLES} from '../common/mock-studies';
import * as _ from 'lodash';
import {FiltersState, EMPTY_FILTERS, SampleFilter, FilterMode} from "./filters.service";
import { Client as ESClient, SearchResponse as ESSearchResponse } from "elasticsearch";
import {Observable} from "rxjs";

export const NULL_CATEGORY_NAME = '<None>';

export const STUDY_METADATA_SEARCH_FIELDS = new Set<string>([
  'Study Researchers Involved',
  'Study Publication Author List',
  'Study PubMed ID'
]);

export interface SampleMatch {
  sampleId: number,
  sample: Sample,
  isFullTextMatch?: boolean,
  passesMetadataFilters?: boolean,
  isMatch?: boolean
}

export interface UnifiedMatch {
  studyId: string,
  study: Study,
  isFullTextMatch?: boolean,
  sampleMatches: SampleMatch[],
  isMatch?: boolean
}

export interface StudyAndSamples {
  study: Study,
  samples: Sample[]
}

export interface SampleCounts {
  [valueName: string]: number
}

export interface ManySampleCounts {
  [category: string]: SampleCounts
}

@Injectable()
export class StudyService {

  // PUBLIC INTERFACE
  // ================
  getSampleMetadataFieldNamesAsync(): PromiseLike<string[]> {
    return (
      this.esClient.indices.getMapping({
        index: 'cbit',
        type: 'sample'
      }).then(mappings => Object.keys(mappings['cbit'].mappings['sample'].properties))
    );
  }

  getStudyAndRelatedSamplesAsync(studyId: string): PromiseLike<StudyAndSamples> {
    return (
      this.esClient.search({
        index: 'cbit',
        body: {
          size: 10000,   // TODO: Think about what to do with large studies
          query: {
            bool: {
              should: [
                {
                  bool: {
                    must: [
                      { match: { _type: "study" } },
                      { match: { _id: studyId } },
                    ]
                  }
                },
                {
                  bool: {
                    must: [
                      { match: { _type: "sample" } },
                      {
                        has_parent: {
                          type: "study",
                          query: { match: { _id: studyId } }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      }).then(response => {
        let hits = response.hits.hits;
        let study: Study;
        let samples: Sample[] = [];
        let i = 1;
        for (let hit of hits) {
          if (hit._type === 'study') {
            if (!study) {
              study = {
                id: hit._id,
                sampleIds: [],   // TODO: Drop this field
                _source: <RawStudy>hit._source
              }
            } else {
              console.log("More than one study returned!")
            }
          } else if (hit._type === 'sample') {
            samples.push({
              id: i,
              studyId: studyId,
              _source: hit._source
            });
            i += 1;
          }
        }

        return {
          study: study,
          samples: samples
        }
      })
    );
  }

  getManySampleCountsAsync(filters: FiltersState, categories: string[]): PromiseLike<ManySampleCounts> {
    // 1. Get list of controls needed
    let controlsPromise: PromiseLike<string[]>;
    if (filters.includeControls) {
      controlsPromise = this.esClient.search({
        index: 'cbit',
        type: 'sample',
        body: this.buildESQueryEnumerateControls(filters)
      }).then(rawResults => this.extractControlIdsFromResultOfESQueryEnumerateControls(rawResults));
    } else {
      controlsPromise = Promise.resolve([]);
    }

    return controlsPromise.then((controlIds: string[]) => {
      let q = this.buildESQueryPieces({filters: filters, controlStudyIds: controlIds});
      let aggs: any = {};

      aggs['all_filters'] = {
        filter: {
          bool: {
            should: [
              { terms: { 'Sample Name': controlIds } },  // Include controls no matter what
              {
                bool: {
                  must: Object.values(q.mustClause),
                  must_not: Object.values(q.mustNotClause)
                }
              }
            ]
          }
        },
        aggs: {}
      };

      for (let category of categories) {

        let thisAgg: any = aggs['all_filters'].aggs;

        if (category in q.mustClause || category in q.mustNotClause) {

          // Special filter for this category
          let theseMustClauses = (
            Object.keys(q.mustClause)
              .filter( key => key !== category )
              .reduce( (res, key) => (res[key] = q.mustClause[key], res), {} )
          );
          let theseMustNotClauses = (
            Object.keys(q.mustNotClause)
              .filter( key => key !== category )
              .reduce( (res, key) => (res[key] = q.mustClause[key], res), {} )
          );

          aggs['Filtered ' + category] = {
            filter: {
              bool: {
                should: [
                  { terms: { 'Sample Name': controlIds } },  // Include controls no matter what
                  {
                    bool: {
                      must: theseMustClauses,
                      must_not: theseMustNotClauses
                    }
                  }
                ]
              }
            },
            aggs: {}
          }
          thisAgg = aggs['Filtered ' + category].aggs;
        }

        thisAgg[category] = {
          terms: {
            field: category,
            missing: NULL_CATEGORY_NAME,
            size: 100,   // Return first 100 field values
            order: { _term: "asc" }
          }
        }
      }

      return this.esClient.search({
        index: 'cbit', type: 'sample', body: {
          query: {
            bool: {
              should: q.shouldClauses
            }
          },
          size: 0,  // TODO: Think about sizes
          aggs: aggs
        }
      });
    }).then(rawAggs => {
      let result: ManySampleCounts = { };

      let oneAggSet: any;
      let bucket: any;
      for (oneAggSet of Object.values(rawAggs.aggregations)) {
        for (let category of Object.keys(oneAggSet)) {
          if (category !== 'doc_count') {
            let thisResult: any = {}
            for (bucket of oneAggSet[category].buckets) {
              thisResult[bucket.key] = bucket.doc_count;
            }
            result[category] = thisResult;
          }
        }
      }

      return result;
    });

    /*return (
      new Promise<ManySampleCounts>(resolve => setTimeout(resolve, 2000)) // delay 2 seconds
        .then(() => {
          let result = {};
          for (let category of categories) {
            result[category] = this.getSampleCounts(filters, category);
          }
          return result;
        })
    )*/
  }

  getUnifiedMatchesAsync(filters: FiltersState): PromiseLike<UnifiedMatch[]> {
    let q: any;

    // Closure variable
    let returnedSamples: any;

    // 1. Get list of controls needed
    let controlsPromise: PromiseLike<string[]>;
    if (filters.includeControls) {
      controlsPromise = this.esClient.search({
        index: 'cbit',
        type: 'sample',
        body: this.buildESQueryEnumerateControls(filters)
      }).then(rawResults => this.extractControlIdsFromResultOfESQueryEnumerateControls(rawResults));
    } else {
      controlsPromise = Promise.resolve([]);
    }

    return controlsPromise.then((controlIds: string[]) => {
      q = this.buildESQueryPieces({filters: filters, controlStudyIds: controlIds});
      return this.esClient.search({
        index: 'cbit', type: 'sample', body: {
          query: {
            bool: {
              should: [
                { terms: { 'Sample Name': controlIds } },  // Include controls no matter what
                {
                  bool: {
                    should: q.shouldClauses,
                    must: Object.values(q.mustClause),
                    must_not: Object.values(q.mustNotClause)
                  }
                }
              ]
            }
          },
          size: 10000,  // TODO: Think about sizes
          aggs: {
            studies: {
              terms: {
                field: "_parent",
                size: 10000  // TODO: Think about size limits
              }
            }
          }
        }
      });
    }).then(rawReturnedSamples => {
      returnedSamples = rawReturnedSamples;
      let studyIds: string[] = returnedSamples.aggregations.studies.buckets.map((bucket: any) => bucket.key);
      return this.esClient.search({
        index: 'cbit', body: {
          query: {
            ids: {
              type: 'study',
              values: studyIds
            }
          },
          size: 10000 // TODO: Think about sizes
        }
      });
    }).then(returnedStudies => {
      let unifiedMatches = {};
      for (let study of returnedStudies.hits.hits) {
        unifiedMatches[study._id] = {
          studyId: study._id,
          study: {
            id: study._id,
            sampleIds: [],
            _source: study._source
          },
          sampleMatches: []
        }
      }

      for (let sample of returnedSamples.hits.hits) {
        unifiedMatches[sample._parent].sampleMatches.push({
          sampleId: sample._id,
          sample: {
            id: 0,
            studyId: sample._parent,
            _source: sample._source
          }
        });
      }

      return Object.values(unifiedMatches);
    });

    /*return (

      new Promise<UnifiedMatch[]>(resolve => setTimeout(resolve, 2000))  // delay 2 seconds
        .then(() => {
          return this.getUnifiedMatchesSync(filters);
        })
    )*/
  }


  // PRIVATE DETAILS
  // ===============

  // Relevant controls are listed in the results under
  // results.aggregations.controls.buckets[*].key
  private buildESQueryEnumerateControls(filters: FiltersState): any {

    let queryPieces = this.buildESQueryPieces({ filters: filters });
    let extraMustClauses = Object.values(queryPieces.mustClause);
    let extraMustNotClauses = Object.values(queryPieces.mustNotClause);

    return {
      size: 0,  // We only care about the aggregation below
      query: {
        bool: {
          should: queryPieces.shouldClauses,
          must: [ {exists: {field: "Sample Match"}} ].concat(extraMustClauses),
          must_not: extraMustNotClauses
        }
      },
      aggs: {
        controls: {
          terms: {
            field: "Sample Match",
            size: 10000   // TODO: Think harder about upper limits
          }
        }
      }
    }
  }

  private extractControlIdsFromResultOfESQueryEnumerateControls(esResult: any): string[] {
    return esResult.aggregations.controls.buckets.map((bucket: any) => bucket.key);
  }

  private buildESQueryPieces(params: {
    filters: FiltersState,
    controlStudyIds?: string[]
  }): {
    shouldClauses: any[],
    mustClause: { [category: string]: any },
    mustNotClause: { [category: string]: any }
  } {
    let shouldClauses: any[] = [];
    let mustClause: { [category: string]: any } = {};
    let mustNotClause: { [category: string]: any } = {};

    if (params.filters.searchText) {
      shouldClauses.push({ match_phrase: { _all: params.filters.searchText } });
      shouldClauses.push({
        has_parent: {
          type: 'study',
          query: { match_phrase: { _all: params.filters.searchText } }
        }
      });
    } else {
      shouldClauses.push({ match_all: {} });
    }

    if (params.controlStudyIds && params.controlStudyIds.length > 0) {
      shouldClauses.push({ terms: { 'Sample Name': params.controlStudyIds } });
    }

    _.forOwn(params.filters.sampleFilters, (sampleFilter: SampleFilter, category: string) => {
      let termsQueryBody = {};
      termsQueryBody[category] = Object.keys(sampleFilter.detail).filter(k => k != NULL_CATEGORY_NAME);
      let queryClause: any = { terms: termsQueryBody };

      if (NULL_CATEGORY_NAME in sampleFilter.detail) {
        queryClause = {
          bool: {
            should: [
              { bool: { must_not: { exists: { field: category } } } },
              queryClause
            ]
          }
        };
      }

      switch (sampleFilter.mode) {
        case FilterMode.AllButThese:
          mustNotClause[category] = queryClause;
          break;
        case FilterMode.OnlyThese:
          mustClause[category] = queryClause;
          break;
      }
    });

    return {
      shouldClauses: shouldClauses,
      mustClause: mustClause,
      mustNotClause: mustNotClause
    };
  }

  private _lastFilters: FiltersState;
  private _lastStudyMatches: Study[];
  private esClient: ESClient;

  constructor() {
    this.esClient = new ESClient({
      host: 'http://localhost:9200'
      //,log: 'trace'
    })
  }

  private getStudies(): Study[] {
    return STUDIES;
  }

  private getSamples(): Sample[] {
    return SAMPLES;
  }

  private shouldSampleBeExcluded(category: string, sampleFilter: SampleFilter, sample: Sample): boolean {

    var value: string;
    if (category in sample._source) {
      value = '' + sample._source[category];  // Force string comparison, yuck!
    } else {
      value = NULL_CATEGORY_NAME;
    }

    switch (sampleFilter.mode) {
      case FilterMode.AllButThese:
        return (value in sampleFilter.detail);
      case FilterMode.OnlyThese:
        return !(value in sampleFilter.detail);
    }
  }

  private forceIncludeInSampleFilters(filters: FiltersState, category: string) {
    if (category in filters.sampleFilters) {

      let tweakedFilters = _.cloneDeep(filters);
      delete tweakedFilters.sampleFilters[category];
      return tweakedFilters;
    } else {
      return filters;
    }
  }

  private getSampleCounts(filters: FiltersState, category: string): SampleCounts {
    // Apply all filters *except* the one being queried (so we get a count of all studies that would be included
    // if we allow a particular value for this category-subcategory pair)
    var tweakedFilters = this.forceIncludeInSampleFilters(filters, category);
    var matches = this.getUnifiedMatchesSync(tweakedFilters);

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

  private debugUnifiedMatches(label: string, matchesSoFar: UnifiedMatch[]): void {
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

  private getUnifiedMatchesSync(filters: FiltersState): UnifiedMatch[] {

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
      studyMatch.isFullTextMatch = (q === '') || (this.deepFind(studyMatch.study, q, STUDY_METADATA_SEARCH_FIELDS));
      studyMatch.sampleMatches.forEach(sampleMatch => {
        sampleMatch.isFullTextMatch = (q === '') || (this.deepFind(sampleMatch.sample, q));
      })
    });
    this.debugUnifiedMatches('After 1:', result);

    // 2. Apply sample metadata exclusion filters
    result.forEach(studyMatch => {
      studyMatch.sampleMatches.forEach(sampleMatch => {
        sampleMatch.passesMetadataFilters = true;
      });
    });
    _.forOwn(filters.sampleFilters, (sampleFilter, category) => {
      result.forEach(studyMatch => {
        studyMatch.sampleMatches.forEach(sampleMatch => {
          if (this.shouldSampleBeExcluded(category, sampleFilter, sampleMatch.sample)) {
            sampleMatch.passesMetadataFilters = false;
          }
        });
      });
    });
    this.debugUnifiedMatches('After 3:', result);

    // 3. Mark samples preliminarily as "matches" if
    // 1) the sample hasn't been excluded by a metadata filter
    // AND 2) the study has a full-text match or the sample has a full-text match
    result.forEach(studyMatch => {
      studyMatch.sampleMatches.forEach(sampleMatch => {
        sampleMatch.isMatch = (
          sampleMatch.passesMetadataFilters &&
          (studyMatch.isFullTextMatch || sampleMatch.isFullTextMatch)
        );
      })
    });
    this.debugUnifiedMatches('After 4:', result);

    // 4. Further match control samples of "matching" samples
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

  private deepFind(target: (Object|Array<any>), searchText: string, onlyForKeys?: Set<string>): boolean {
    var
      key: string,
      value: any
    ;
    for (key in target) {
      if (target.hasOwnProperty(key)) {
        value = target[key];
        switch (typeof value) {
          case 'object':
            if (this.deepFind(value, searchText, onlyForKeys)) {
              return true;
            }
            break;
          case 'string':
          case 'number':
            if ((!onlyForKeys || onlyForKeys.has(key)) && ('' + value).toLocaleLowerCase().indexOf(searchText) != -1) {
              return true;
            }
        }
      }
    }
    return false;
  }
}
