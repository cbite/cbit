import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';

// TODO@Sam Fix this!
let BASE_URL: string;
// if (process.env.ENV === 'production') {
//   BASE_URL = "/api";                     // Production
// } else {
  BASE_URL = 'http://localhost:23456';   // Development
// }

/*
  Central location for URLs to access back-end API
 */
@Injectable()
export class URLService {
  usersResource(): string {
    return `users`;
  }

  userResource(username: string): string {
    return `users/${username}`;
  }

  metadataAllCountsResource(): string {
    return `metadata/all_counts`;
  }

  metadataFilteredCountsResource(): string {
    return `metadata/filtered_counts`;
  }

  metadataFieldsResource(): string {
    return `metadata/fields`;
  }

  metadataFieldsMultiResource(): string {
    return `metadata/fields/_multi`;
  }

  metadataSearchResource(): string {
    return `metadata/search`;
  }

  metadataStudiesResource(): string {
    return `metadata/studies`;
  }

  metadataSamplesInStudiesResource(): string {
    return `metadata/samples_in_studies`;
  }

  studiesResource(): string {
    return `studies`;
  }

  studyResource(studyId: string): string {
    return `studies/${studyId}`;
  }

  samplesResource(): string {
    return `samples`;
  }

  downloadsResource(): string {
    return `downloads`;
  }

  uploadsResource(): string {
    return environment.api_url + 'uploads';
  }

  uploadsIRODSResource(iRODSStudyName: string): string {
    return `uploads/_irods/${iRODSStudyName}`;
  }

  iRODSListResource(): string {
    return `irods/list`;
  }
}
