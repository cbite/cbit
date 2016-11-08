export interface RawInvestigation {
  "Investigation Identifier"?: string,
  "Investigation Title"?: string,
  [propName: string]: any    // Allow anything else as well
}

export interface RawOntologySourceReference {
  "Term Source Description"?: string,
  "Term Source File"?: string,
  "Term Source Name"?: string,
  "Term Source Version"?: string,
  [propName: string]: any    // Allow anything else as well
}

export interface RawStudyInfo {
  "Study Identifier": string,
  "Study Title": string,
  "Study Description": string,
  "Study File Name": string,
  "Study Submission Date"?: string,
  "Study Public Release Date"?: string,
  [propName: string]: any    // Allow anything else as well
}

export interface RawStudyAssay {
  "Study Assay File Name": string,
  "Study Assay Measurement Type": string,
  "Study Assay Technology Platform": string,
  "Study Assay Technology Type": string,
  [propName: string]: any    // Allow anything else as well
}

export interface RawStudyContact {
  "Study Person First Name": string,
  "Study Person Last Name": string,
  "Study Person Affiliation"?: string,
  [propName: string]: any    // Allow anything else as well
}

export interface RawStudyDesignDescriptor {
  "Study Design Type"?: string,
  [propName: string]: any    // Allow anything else as well
}

export interface RawStudyFactor {
  "Study Factor Name": string,
  "Study Factor Type": string,
  [propName: string]: any    // Allow anything else as well
}

export interface RawStudyProtocol {
  "Study Protocol Name": string,
  "Study Protocol Type": string,
  "Study Protocol Description": string,
  [propName: string]: any    // Allow anything else as well
}

export interface RawStudyPublication {
  "Study Publication Title": string,
  "Study Publication Author List": string,
  "Study Publication DOI"?: string,
  "Study PubMed ID"?: string,
  "Study Publication Status"?: string,
  "Study Publication Status Term Accession Number"?: string,
  "Study Publication Status Term Source REF"?: string,
  [propName: string]: any    // Allow anything else as well
}

export interface RawStudy {
  "INVESTIGATION"?:             RawInvestigation,
  "ONTOLOGY SOURCE REFERENCE"?: RawOntologySourceReference,
  "STUDY":                      RawStudyInfo,          // 1 study per investigation
  "STUDY ASSAYS":               RawStudyAssay,  // 1 assay per investigation
  "STUDY CONTACTS":             Array<RawStudyContact>,
  "STUDY DESIGN DESCRIPTORS"?:  RawStudyDesignDescriptor,
  "STUDY FACTORS":              Array<RawStudyFactor>,
  "STUDY PROTOCOLS":            Array<RawStudyProtocol>,
  "STUDY PUBLICATIONS":         Array<RawStudyPublication>,  // TODO: Enforce array in back-end
  [propName: string]: any    // Allow anything else as well
}

export interface Study {
  id: string,
  sampleIds: Array<number>,
  _source: RawStudy
}

export interface Sample {
  id: number,
  studyId: string,
  _source: Object
}
