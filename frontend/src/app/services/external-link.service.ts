import {Injectable} from '@angular/core';
import {WindowRef} from '../shared/util/WindowRef';
import {GoogleAnalyticsService} from './google-analytics.service';

@Injectable()
export class ExternalLinkService {

  private nativeWindow: any;

  constructor(private winRef: WindowRef, private googleAnalyticsService: GoogleAnalyticsService) {
    this.nativeWindow = winRef.getNativeWindow();
  }

  public navigateTo(source: string, id: string, studyId: string) {
    this.googleAnalyticsService.emitExternalLinkEvent(source, studyId);

    if (source === 'DOI') {
      this.nativeWindow.open(`https://dx.doi.org/${id}`);
    } else if (source === 'PubMed') {
      this.nativeWindow.open(`https://www.ncbi.nlm.nih.gov/pubmed/${id}`);
    } else if (source === 'ArrayExpress') {
      this.nativeWindow.open(`https://www.ebi.ac.uk/arrayexpress/experiments/${id}`);
    }
  }
}
