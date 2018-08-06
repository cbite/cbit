import {RawStudyPublication, Study} from '../types/study.model';

export function getId(study: Study): string {
  return study._id;
}

export function getTitle(study: Study): string {
  return study._source.STUDY['Study Title'];
}

export function getPublicationDate(study: Study): string {
  return study._source['*Publication Date'];
}

export function getSupplementaryFiles(study: Study): string[] {
  return study._source['*Supplementary Files'].split(',').filter(x => x !== '');
}

export function getProtocolFile(study: Study): string {
  return study._source['*Protocol File'];
}

export function getAuthors(study: Study): string {
  return study._source['STUDY']['Study Researchers Involved'];
}

export function getArrayExpressId(study: Study): string {
  return study._source['*Array Express Id'];
}

export function getPubmedIds(study: Study): string[] {
  return (((study && study._source && study._source['STUDY PUBLICATIONS']) || [])
      .filter((p: RawStudyPublication) => p['Study PubMed ID'])
      .map((p: RawStudyPublication) => p['Study PubMed ID'])
  );
}

export function getDoisIds(study: Study): string[] {
  return (((study && study._source && study._source['STUDY PUBLICATIONS']) || [])
      .filter((p: RawStudyPublication) => p['Study Publication DOI'])
      .map((p: RawStudyPublication) => p['Study Publication DOI'])
  );
}
