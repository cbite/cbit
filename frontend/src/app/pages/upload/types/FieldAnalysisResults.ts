export interface FieldAnalysisResults {
  fieldName: string;
  isUnitful: boolean;
  looksNumeric: boolean;
  possibleDimensions: string[];
}
