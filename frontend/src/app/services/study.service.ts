// TODO: This code needs URGENT re-factoring to make it less convoluted and more robust.
// But for now, it works :-D

// TODO: Stop hardcoding URLs for REST endpoints

import {Study, Sample} from '../common/study.model';
import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import {FiltersState} from './filters.service';
import * as $ from 'jquery';
import {CacheableBulkRequester} from '../common/cacheable-bulk-request';
import {FieldMeta} from '../common/field-meta.model';
import {AuthenticationService} from '../core/authentication/authentication.service';
import {URLService} from './url.service';
import {UnitFormattingService} from './unit-formatting.service';
import {HttpGatewayService} from './http-gateway.service';

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
  study: Study;
  sampleMatches: Sample[];
}

export interface StudyAndSamples {
  study: Study;
  samples: Sample[];
}

export interface SampleCounts {
  [valueName: string]: number;
}

export interface ManySampleCounts {
  [category: string]: SampleCounts;
}

export interface ClassifiedPropertiesForGivenVisibility {
  [category: string]: string[];   // field names
}

export interface ClassifiedProperties {
  [visibility: string]: ClassifiedPropertiesForGivenVisibility;
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
    this.fieldMetaRequester.flushCache();
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
    const self = this;
    return new Promise(resolve => {
      this.httpGatewayService.get(self._url.metadataFieldsResource()).subscribe(data => {
        resolve(data);
      });
    });
  }

  getAllStudyIds(): Promise<string[]> {
    const self = this;

    return new Promise(resolve => {
      this.httpGatewayService.get(self._url.studiesResource()).subscribe(data => {
        resolve(data);
      });
    });
  }

  getAllFieldMetas(explicitFieldNames: string[] = null): Promise<{ [fieldName: string]: FieldMeta }> {
    const self = this;

    let fieldNamesPromise: Promise<string[]>;
    if (explicitFieldNames) {
      fieldNamesPromise = Promise.resolve(explicitFieldNames);
    } else {
      fieldNamesPromise = this.getAllFieldNames();
    }
    return fieldNamesPromise
      .then(fieldNames => {
        const allPromises = fieldNames.map(fieldName => {
          return self.getFieldMeta(fieldName).then(fieldMeta => {
            return {[fieldName]: fieldMeta};
          });
        });

        return Promise.all(allPromises).then(allFieldMetaObjects => {
          const result: { [fieldName: string]: FieldMeta } = _.merge.apply(null, [{}].concat(allFieldMetaObjects));
          return result;
        });
      });
  }

  getAllCountsAsync(): Promise<ManySampleCounts> {
    const self = this;
    return new Promise(resolve => {
      this.httpGatewayService.get(self._url.metadataAllCountsResource()).subscribe(data => {
        resolve(data);
        // TODO: Add error handling!
      });
    });
  }

  getManySampleCountsAsync(filters: FiltersState, categories: string[]): Promise<ManySampleCounts> {
    const self = this;
    return new Promise(resolve => {
      this.httpGatewayService.post(self._url.metadataFilteredCountsResource(), JSON.stringify({
        filters: filters,
        categories: categories
      })).subscribe(data => {
        resolve(data);
        // TODO: Add error handling!
      });
    });
  }

  getUnifiedMatchesAsync(filters: FiltersState): Promise<UnifiedMatch[]> {
    // TODO: Refactor usages of this method to not require full study and sample metadata as a result
    // (i.e., postpone calls to getStudy() and getSample() as long as possible)
    const self = this;
    return new Promise(resolve => {
      this.httpGatewayService.post(self._url.metadataSearchResource(), JSON.stringify({
        filters: filters
      })).subscribe(data => {
        const studyIds = Object.keys(data);
        const sampleIds = _.flatten(Object.values(data));

        const studiesPromise = Promise.all(studyIds.map(id => self.getStudy(id)));
        const samplesPromise = Promise.all(sampleIds.map(id => self.getSample(id)));

        Promise.all([studiesPromise, samplesPromise]).then(results => {
          const studies = results[0];
          const samples = results[1];

          const studiesById = _.zipObject(studyIds, studies);
          const samplesById = _.zipObject(sampleIds, samples);

          const unifiedMatches: any[] = Object.keys(data).map(studyId => {
            return {
              study: studiesById[studyId],
              sampleMatches: data[studyId].map(sampleId => samplesById[sampleId])
            };
          });

          resolve(unifiedMatches);
          // TODO: Add error handling!
        });
      });
    });
  }

  // result looks something like this:
  // {
  //   "main": {          <-- visibility from metadata
  //     "Technical > General": [   <-- category from metadata
  //        "NameOfMainTechnicalGeneralField1",
  //        "NameOfMainTechnicalGeneralField2",
  //        ...
  //      ],
  //      "Biological": [
  //        ...
  //      ],
  //      ...
  //   },
  //   "additional": {
  //     ...
  //   },
  //   ...
  // }
  classifyProperties(fieldMetas: { [fieldName: string]: FieldMeta }): ClassifiedProperties {
    const self = this;

    // See lodash docs for "_.mergeWith"
    const customizer = function (objValue: any, srcValue: any) {
      if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    };

    let result: ClassifiedProperties = {};
    for (const fieldName in fieldMetas) {
      const fieldMeta = fieldMetas[fieldName];
      result = _.mergeWith(result, {
        [fieldMeta.visibility || 'additional']: {
          [fieldMeta.category || 'Technical > General']: [
            fieldName
          ]
        }
      }, customizer);
    }

    for (const visibility in result) {
      for (const category in result[visibility]) {
        result[visibility][category] = result[visibility][category].sort(
          (a: string, b: string) => this.withoutStar(a).localeCompare(this.withoutStar(b))
        );
      }
    }

    return result;
  }

  findCommonFieldValues(samples: Sample[]): { [fieldName: string]: any } {
    const commonFieldValues: { [fieldName: string]: any } = {};

    if (samples.length > 0) {
      const firstSample = samples[0];
      for (const fieldName in firstSample._source) {
        commonFieldValues[fieldName] = firstSample._source[fieldName];
      }

      for (const sample of samples) {
        for (const commonFieldName in commonFieldValues) {
          if (!(commonFieldName in sample._source) ||
            (sample._source[commonFieldName] !== commonFieldValues[commonFieldName])) {
            delete commonFieldValues[commonFieldName];
          }
        }
      }
    }

    return commonFieldValues;
  }

  calcValueRanges(samples: Sample[], fieldMetas: { [fieldName: string]: FieldMeta }): { [fieldName: string]: number } {

    const result = {};
    const minValues = {};
    const maxValues = {};

    // Go through the data twice to gather ranges for the broken-down fields like "Wettability" and "Phase composition"
    for (const sample of samples) {
      for (const fieldName in sample._source) {
        const parentFieldName = (
          fieldName.substr(0, 1) == '*' && fieldName.indexOf(' - ') != -1
            ? fieldName.substring(1, fieldName.indexOf(' - '))   // "*Wettability - ethanol" -> "Wettability"
            : fieldName
        );

        const fieldMeta = fieldMetas[parentFieldName];
        if (fieldMeta && fieldMeta.dataType === 'double' && fieldName !== 'Wettability' && fieldName !== 'Phase composition' && fieldName !== 'Elements composition') {
          const value = sample._source[fieldName];
          minValues[parentFieldName] = (parentFieldName in minValues ? Math.min(value, minValues[parentFieldName]) : value);
          maxValues[parentFieldName] = (parentFieldName in maxValues ? Math.max(value, maxValues[parentFieldName]) : value);
        }
      }
    }

    for (const fieldName in minValues) {
      const minValue = minValues[fieldName];
      const maxValue = maxValues[fieldName];

      if (minValue === maxValue) {
        result[fieldName] = Math.abs(maxValue);
      } else {
        result[fieldName] = maxValue - minValue;
      }
    }

    return result;
  }

  genSampleSummary(commonFieldValues: { [fieldName: string]: any },
                   sample: Sample,
                   fieldMetas: { [fieldName: string]: FieldMeta },
                   valueRanges: { [fieldName: string]: number },
                   isMiniSummary: boolean): Object {

    const fieldMetaFilter: (fieldMeta: FieldMeta) => boolean = (
      isMiniSummary
        ? (fieldMeta) => fieldMeta.nameInSampleMiniSummary !== ''
        : (fieldMeta) => fieldMeta.visibility !== 'hidden'
    );
    const fieldNameGen: (fieldMeta: FieldMeta) => string = (
      isMiniSummary
        ? (fieldMeta) => fieldMeta.nameInSampleMiniSummary
        : (fieldMeta) => (fieldMeta.fieldName.substr(0, 1) === '*' ? fieldMeta.fieldName.substr(1) : fieldMeta.fieldName)
    );

    const result = {};
    for (const fieldName of Object.keys(sample._source)) {
      if (((fieldName in fieldMetas) && fieldMetaFilter(fieldMetas[fieldName]) &&
          !(fieldName in commonFieldValues) &&
          (sample._source[fieldName] !== sample._source['Sample Name']))) {

        const fieldMeta = fieldMetas[fieldName];
        const value = sample._source[fieldName];
        const formattedValue = this._unitFormattingService.formatValue(value, fieldMeta, valueRanges);

        result[fieldNameGen(fieldMeta)] = formattedValue;
      }
    }
    return result;
  }


  // PRIVATE DETAILS
  // ===============

  private studyRequester: CacheableBulkRequester<Study>;
  private sampleRequester: CacheableBulkRequester<Sample>;
  private sampleIdsRequester: CacheableBulkRequester<string[]>;
  private fieldMetaRequester: CacheableBulkRequester<FieldMeta>;

  constructor(private _url: URLService,
              private httpGatewayService: HttpGatewayService,
              private _auth: AuthenticationService,
              private _unitFormattingService: UnitFormattingService) {
    this.studyRequester = new CacheableBulkRequester<Study>(
      'study',
      this._url.studiesResource(),
      this.httpGatewayService,
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );

    this.sampleRequester = new CacheableBulkRequester<Sample>(
      'sample',
      this._url.samplesResource(),
      this.httpGatewayService,
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );

    this.sampleIdsRequester = new CacheableBulkRequester<string[]>(
      'idsOfSamplesInStudy',
      this._url.metadataSamplesInStudiesResource(),
      this.httpGatewayService,
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );

    this.fieldMetaRequester = new CacheableBulkRequester<FieldMeta>(
      'fieldMeta',
      this._url.metadataFieldsResource(),
      this.httpGatewayService,
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );
  }

  withoutStar(s: string): string {
    if (s.substr(0, 1) == '*') {
      return s.substr(1);
    } else {
      return s;
    }
  }
}
