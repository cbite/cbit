export interface RawStudyInfo {
  // Only describing the metadata we actually use in the front-end
  'Study Title': string;
  'Study Researchers Involved': string;
  [propName: string]: any;    // Allow anything else as well
}

export interface RawStudyPublication {
  // Only describing the metadata we actually use in the front-end
  'Study Publication Author List'?: string;
  'Study Publication DOI'?: string;
  'Study PubMed ID'?: string;
  [propName: string]: any;    // Allow anything else as well
}

export interface RawStudy {
  // Only describing the metadata we actually use in the front-end
  'STUDY':                      RawStudyInfo;                // 1 study per investigation
  'STUDY PUBLICATIONS':         Array<RawStudyPublication>;  // TODO: Enforce array in back-end
  [propName: string]: any;    // Allow anything else as well
}

export interface RawSample {
  [propName: string]: any;    // Allow anything
}

export interface Study {
  _id: string;
  _source: RawStudy;
}

export interface Sample {
  _id: string;
  _source: RawSample;
}
