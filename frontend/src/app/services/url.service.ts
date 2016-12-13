import {Injectable} from "@angular/core";

//const BASE_URL = "http://localhost:23456";   // Development
const BASE_URL = "http://localhost:80/api";  // Pre-production
//const BASE_URL = "/api";                     // Production

/*
  Central location for URLs to access back-end API
 */
@Injectable()
export class URLService {
  usersResource(): string {
    return `${BASE_URL}/users`;
  }

  userResource(username: string): string {
    return `${BASE_URL}/users/${username}`;
  }

  downloadResource(): string {
    return `${BASE_URL}/downloads`;
  }

  metadataAllCountsResource(): string {
    return `${BASE_URL}/metadata/all_counts`;
  }

  metadataFilteredCountsResource(): string {
    return `${BASE_URL}/metadata/filtered_counts`;
  }

  metadataFieldsResource(): string {
    return `${BASE_URL}/metadata/fields`;
  }

  metadataFieldsMultiResource(): string {
    return `${BASE_URL}/metadata/fields/_multi`;
  }

  metadataSearchResource(): string {
    return `${BASE_URL}/metadata/search`;
  }

  metadataStudiesResource(): string {
    return `${BASE_URL}/metadata/studies`;
  }

  metadataStudyResource(studyId: string): string {
    return `${BASE_URL}/metadata/studies/${studyId}`;
  }

  metadataSamplesInStudiesResource(): string {
    return `${BASE_URL}/metadata/samples_in_studies`;
  }

  studiesResource(): string {
    return `${BASE_URL}/studies`;
  }

  studyResource(studyId: string): string {
    return `${BASE_URL}/studies/${studyId}`;
  }

  samplesResource(): string {
    return `${BASE_URL}/samples`;
  }

  sampleResource(sampleId: string): string {
    return `${BASE_URL}/samples/${sampleId}`;
  }

  downloadsResource(): string {
    return `${BASE_URL}/downloads`;
  }

  uploadsResource(): string {
    return `${BASE_URL}/uploads`;
  }
}
