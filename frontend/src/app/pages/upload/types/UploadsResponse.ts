import {FieldAnalysisResults} from './FieldAnalysisResults';
import {FieldMeta} from '../../../core/types/field-meta';

export interface UploadsResponse {
  upload_uuid: string;
  status: string;
  location: string;
  fieldNames: string[];
  knownFields: { [fieldName: string]: FieldMeta };
  unknownFields: string[];
  fieldAnalyses: FieldAnalysisResults[];
}
