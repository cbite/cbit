import {RawStudyPublication, Study} from '../types/study.model';

export function getTitle(study: Study): string {
  return study._source.STUDY['Study Title'];
}

export function getAuthors(study: Study): string {
   return study._source['STUDY']['Study Researchers Involved'];
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
