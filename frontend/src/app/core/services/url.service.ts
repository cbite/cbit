import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

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

  iRODSListResource(): string {
    return `irods/list`;
  }

  metadataAllCountsResource(): string {
    return `biomaterials/metadata/all_counts`;
  }

  metadataFilteredCountsResource(): string {
    return `biomaterials/metadata/filtered_counts`;
  }

  metadataFieldsResource(): string {
    return `biomaterials/metadata/fields`;
  }

  metadataFieldsMultiResource(): string {
    return `biomaterials/metadata/fields/_multi`;
  }

  metadataSearchResource(): string {
    return `biomaterials/metadata/search`;
  }

  metadataStudiesResource(): string {
    return `biomaterials/metadata/studies`;
  }

  metadataSamplesInStudiesResource(): string {
    return `biomaterials/metadata/samples_in_studies`;
  }

  studiesResource(): string {
    return `biomaterials/studies`;
  }

  studyResource(studyId: string): string {
    return `biomaterials/studies/${studyId}`;
  }

  studyArchiveResource(studyId: string): string {
    return `biomaterials/studies/${studyId}/archive`;
  }

  studyProtocolsResource(studyId: string): string {
    return `biomaterials/studies/${studyId}/protocols`;
  }

  samplesResource(): string {
    return `biomaterials/samples`;
  }

  downloadsResource(): string {
    return `biomaterials/downloads`;
  }

  uploadsResource(): string {
    return environment.api_url + 'biomaterials/uploads';
  }

  uploadsIRODSResource(iRODSStudyName: string): string {
    return `biomaterials/uploads/_irods/${iRODSStudyName}`;
  }
}
