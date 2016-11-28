// TODO: This code needs URGENT re-factoring to make it less convoluted and more robust.
// But for now, it works :-D

import {Study, Sample, RawStudy} from '../common/study.model';
import {Injectable} from "@angular/core";
import * as _ from 'lodash';
import {FiltersState, EMPTY_FILTERS, SampleFilter, FilterMode} from "./filters.service";
import { Client as ESClient, SearchResponse as ESSearchResponse } from "elasticsearch";
import {Observable} from "rxjs";
import * as $ from 'jquery';
import {CacheableBulkRequester} from "../common/cacheable-bulk-request";

export const NULL_CATEGORY_NAME = '<None>';

export const STUDY_METADATA_SEARCH_FIELDS = new Set<string>([
  'Study Researchers Involved',
  'Study Publication Author List',
  'Study PubMed ID'
]);

export interface UnifiedMatch {
  study: Study,
  sampleMatches: Sample[],
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

const CACHE_LIFETIME_MS = 60 * 1000;  // Cache study and sample metadata for this long
const REQUEST_BUFFER_MS = 100;        // After a first request for study/sample info, delay this long and buffer other requests
                                      // before actually sending a request to the backend (grouping several study/sample metadata queries)

@Injectable()
export class StudyService {

  // PUBLIC INTERFACE
  // ================
  flushCaches(): void {
    this.studyRequester.flushCache();
    this.sampleRequester.flushCache();
    this.sampleIdsRequester.flushCache();
  }

  getStudy(studyId: string): Promise<Study> {
    return this.studyRequester.get(studyId);
  }

  getIdsOfSamplesInStudy(studyId: string): Promise<Array<string>> {
    return this.sampleIdsRequester.get(studyId);
  }

  getSample(sampleId: string): Promise<Sample> {
    return this.sampleRequester.get(sampleId);
  }

  getAllCountsAsync(): Promise<ManySampleCounts> {
    // TODO: Starting to move all contact with ES to the backend.  Eventually, should refactor
    // contact with backend to not hardcode URLs, etc.
    const URL = 'http://localhost:23456/metadata/all_counts';
    return new Promise(function (resolve) {
      $.ajax({
        type: 'GET',
        url: URL,
        success: function(data: ManySampleCounts) { resolve(data); }
        // TODO: Add error handling!
      });
    });
  }

  getManySampleCountsAsync(filters: FiltersState, categories: string[]): Promise<ManySampleCounts> {

    const URL = 'http://localhost:23456/metadata/filtered_counts';
    return new Promise(resolve => {
      $.ajax({
        type: 'POST',
        url: URL,
        contentType: 'application/json',
        data: JSON.stringify({
          filters: filters,
          categories: categories
        }),
        success: function(data: ManySampleCounts, textStatus:string, jqXHR: XMLHttpRequest) {
          console.log(JSON.stringify(data));
          resolve(data);
        }
        // TODO: Add error handling!
      });
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
      let unifiedMatches: {[studyId: string]: UnifiedMatch} = {};
      let study: any;
      for (study of returnedStudies.hits.hits) {
        unifiedMatches[study._id] = {
          study: study,
          sampleMatches: []
        }
      }

      let sample: any;
      for (sample of returnedSamples.hits.hits) {
        unifiedMatches[sample._parent].sampleMatches.push(sample);
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

  private studyRequester: CacheableBulkRequester<Study>;
  private sampleRequester: CacheableBulkRequester<Sample>;
  private sampleIdsRequester: CacheableBulkRequester<Array<string>>;

  constructor() {
    this.esClient = new ESClient({
      host: 'http://localhost:9200'
      //,log: 'trace'  // Uncomment to see every query to ES & its response
    });

    this.studyRequester = new CacheableBulkRequester<Study>(
      'http://localhost:23456/studies',
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );

    this.sampleRequester = new CacheableBulkRequester<Sample>(
      'http://localhost:23456/samples',
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );

    this.sampleIdsRequester = new CacheableBulkRequester<Array<string>>(
      'http://localhost:23456/metadata/samples_in_studies',
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );
  }
}
