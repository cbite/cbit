import {Study, Sample, RawStudy} from '../common/study.model';
import {Injectable} from "@angular/core";
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
                _source: <RawStudy>hit._source
              }
            } else {
              console.log("More than one study returned!")
            }
          } else if (hit._type === 'sample') {
            samples.push({
              id: i,
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

    // Need to be careful when building up counts of values for each category: for each category, we
    // apply all filters *except* the one being queried (so we get a count of all studies that would be included
    // if we allow a particular value for this category-subcategory pair)

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
                    must_not: Object.values(q.mustNotClause),
                    minimum_should_match: 1
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
          must_not: extraMustNotClauses,
          minimum_should_match: 1
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
}
