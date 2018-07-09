import {FieldMeta} from '../../../common/field-meta.model';
import {FieldAnalysisResults} from './FieldAnalysisResults';

export interface UploadsResponse {
  upload_uuid: string;
  status: string;
  location: string;
  fieldNames: string[];
  knownFields: { [fieldName: string]: FieldMeta };
  unknownFields: string[];
  fieldAnalyses: FieldAnalysisResults[];
}
