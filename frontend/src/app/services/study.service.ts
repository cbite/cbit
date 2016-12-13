// TODO: This code needs URGENT re-factoring to make it less convoluted and more robust.
// But for now, it works :-D

// TODO: Stop hardcoding URLs for REST endpoints

import {Study, Sample} from '../common/study.model';
import {Injectable} from "@angular/core";
import * as _ from 'lodash';
import {FiltersState} from "./filters.service";
import * as $ from 'jquery';
import {CacheableBulkRequester} from "../common/cacheable-bulk-request";
import {FieldMeta} from "../common/field-meta.model";
import {AuthenticationService} from "./authentication.service";
import {URLService} from "./url.service";

// Should be a parseable number to play nicely with numeric fields
// and it should survive a round-trip conversion in ES from string to double to string
// (hence the '.0')
export const NULL_CATEGORY_NAME = '-123456.0';

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

  getFieldMeta(fieldName: string): Promise<FieldMeta> {
    return this.fieldMetaRequester.get(fieldName);
  }

  getAllFieldNames(): Promise<string[]> {
    let self = this;
    return new Promise(resolve => {
      $.ajax({
        type: 'GET',
        url: self._url.metadataFieldsResource(),
        headers: self._auth.headers(),
        contentType: 'application/json',
        success: function(data: string[]) {
          resolve(data);
        }
      })
    });
  }

  getAllStudyIds(): Promise<string[]> {
    let self = this;
    return new Promise(resolve => {
      $.ajax({
        type: 'GET',
        url: self._url.studiesResource(),
        headers: self._auth.headers(),
        contentType: 'application/json',
        success: function(data: string[]) {
          resolve(data);
        }
      })
    });
  }

  getAllFieldMetas(fieldNames: string[]): Promise<{[fieldName: string]: FieldMeta}> {
    let self = this;

    let allPromises = fieldNames.map(fieldName => {
      return self.getFieldMeta(fieldName).then(fieldMeta => {
        return { [fieldName]: fieldMeta };
      });
    });

    return Promise.all(allPromises).then(allFieldMetaObjects => _.merge.apply(null, [{}].concat(allFieldMetaObjects)));
  }

  getAllCountsAsync(): Promise<ManySampleCounts> {
    let self = this;
    const URL = this._url.metadataAllCountsResource();
    return new Promise(function (resolve) {
      $.ajax({
        type: 'GET',
        url: URL,
        headers: self._auth.headers(),
        success: function(data: ManySampleCounts) { resolve(data); }
        // TODO: Add error handling!
      });
    });
  }

  getManySampleCountsAsync(filters: FiltersState, categories: string[]): Promise<ManySampleCounts> {
    let self = this;
    const URL = this._url.metadataFilteredCountsResource();
    return new Promise(resolve => {
      $.ajax({
        type: 'POST',
        url: URL,
        headers: self._auth.headers(),
        contentType: 'application/json',
        data: JSON.stringify({
          filters: filters,
          categories: categories
        }),
        success: function(data: ManySampleCounts, textStatus:string, jqXHR: XMLHttpRequest) {
          resolve(data);
        }
        // TODO: Add error handling!
      });
    });
  }

  getUnifiedMatchesAsync(filters: FiltersState): Promise<UnifiedMatch[]> {
    // TODO: Refactor usages of this method to not require full study and sample metadata as a result
    // (i.e., postpone calls to getStudy() and getSample() as long as possible)
    let self = this;
    const URL = this._url.metadataSearchResource();
    return new Promise(resolve => {
      $.ajax({
        type: 'POST',
        url: URL,
        headers: self._auth.headers(),
        contentType: 'application/json',
        data: JSON.stringify({
          filters: filters
        }),
        success: function(data: { [studyId: string]: string[] }) {
          let studyIds = Object.keys(data);
          let sampleIds = _.flatten(Object.values(data));

          let studiesPromise = Promise.all(studyIds.map(id => self.getStudy(id)));
          let samplesPromise = Promise.all(sampleIds.map(id => self.getSample(id)));

          Promise.all([studiesPromise, samplesPromise]).then(results => {
            let studies = results[0];
            let samples = results[1];

            let studiesById = _.zipObject(studyIds, studies);
            let samplesById = _.zipObject(sampleIds, samples);

            let unifiedMatches: UnifiedMatch[] = Object.keys(data).map(studyId => {
              return {
                study: studiesById[studyId],
                sampleMatches: data[studyId].map(sampleId => samplesById[sampleId])
              };
            });

            resolve(unifiedMatches);
          });
        }
        // TODO: Add error handling!
      });
    });
  }


  // PRIVATE DETAILS
  // ===============

  private studyRequester: CacheableBulkRequester<Study>;
  private sampleRequester: CacheableBulkRequester<Sample>;
  private sampleIdsRequester: CacheableBulkRequester<string[]>;
  private fieldMetaRequester: CacheableBulkRequester<FieldMeta>;

  constructor(
    private _url: URLService,
    private _auth: AuthenticationService
  ) {
    this.studyRequester = new CacheableBulkRequester<Study>(
      "study",
      this._url.studiesResource(),
      this._auth,
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );

    this.sampleRequester = new CacheableBulkRequester<Sample>(
      "sample",
      this._url.samplesResource(),
      this._auth,
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );

    this.sampleIdsRequester = new CacheableBulkRequester<string[]>(
      "idsOfSamplesInStudy",
      this._url.metadataSamplesInStudiesResource(),
      this._auth,
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );

    this.fieldMetaRequester = new CacheableBulkRequester<FieldMeta>(
      "fieldMeta",
      this._url.metadataFieldsResource(),
      this._auth,
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );
  }
}
