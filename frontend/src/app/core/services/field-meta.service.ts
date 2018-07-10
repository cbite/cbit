import {Injectable} from '@angular/core';
import {FieldMeta} from '../types/field-meta';
import {URLService} from './url.service';
import {HttpGatewayService} from './http-gateway.service';
import {CacheableBulkRequester} from '../../common/cacheable-bulk-request';
import * as _ from 'lodash';
import {ClassifiedProperties} from './study.service';

const CACHE_LIFETIME_MS = 60 * 1000;  // Cache study and sample metadata for this long
const REQUEST_BUFFER_MS = 100;        // After a first request for study/sample info, delay this long and buffer other requests
                                      // before actually sending a request to the backend (grouping several study/sample metadata queries)

@Injectable()
export class FieldMetaService {

  private fieldMetaRequester: CacheableBulkRequester<FieldMeta>;

  constructor(private urlService: URLService,
              private httpGatewayService: HttpGatewayService) {

    this.fieldMetaRequester = new CacheableBulkRequester<FieldMeta>(
      'fieldMeta',
      urlService.metadataFieldsResource(),
      httpGatewayService,
      CACHE_LIFETIME_MS,
      REQUEST_BUFFER_MS
    );
  }

  public getAllFieldMetas(explicitFieldNames: string[] = null): Promise<{ [fieldName: string]: FieldMeta }> {
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

  public getAllFieldNames(): Promise<string[]> {
    const self = this;
    return new Promise(resolve => {
      this.httpGatewayService.get(self.urlService.metadataFieldsResource()).subscribe(data => {
        resolve(data);
      });
    });
  }

  getFieldMeta(fieldName: string): Promise<FieldMeta> {
    return this.fieldMetaRequester.get(fieldName);
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

  withoutStar(s: string): string {
    if (s.substr(0, 1) == '*') {
      return s.substr(1);
    } else {
      return s;
    }
  }

  flushCaches() {
    this.fieldMetaRequester.flushCache();
  }
}
