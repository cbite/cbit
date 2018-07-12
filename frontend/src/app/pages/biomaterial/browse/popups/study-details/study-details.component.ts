import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Sample, Study} from '../../../../../core/types/study.model';
import {getAuthors, getDoisIds, getPubmedIds, getTitle, getArrayExpressId} from '../../../../../core/util/study-helper';
import {StudyAndSamples, StudyService} from '../../../../../core/services/study.service';
import {getCategoriesToDisplay, StudyCategory} from '../../../../../core/util/study-display-category-helper';
import {getCommonKeys} from '../../../../../core/util/samples-helper';
import {WindowRef} from '../../../../../shared/util/WindowRef';

@Component({
    styleUrls: ['./study-details.scss'],
    template: `
      <div class="modal-panel noselect">
        <div class="modal-header">
          <div class="title">{{title}}
          </div>
          <span class="close" (click)="onCloseClick()"><i class="fal fa-times"></i></span>
        </div>
        <div class="modal-body">
          <div class="content">
            <div class="authors">by {{authors}}</div>

            <div class="information">
              <h6><b>Information</b></h6>
              <ng-container *ngFor="let category of studyCategories">
                <cbit-study-category [category]="category"></cbit-study-category>
              </ng-container>
            </div>

            <div class="samples">
              <h6><b>Samples</b></h6>
              <cbit-common-properties
                [commonKeys]="commonKeys"></cbit-common-properties>
              <cbit-distinguishing-properties
                [commonKeys]="commonKeys"
                [samples]="samples"></cbit-distinguishing-properties>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="link" (click)="onOpenExternal('ArrayExpress', arrayExpressId)">
            <i class="far fa-link"></i> Array Express
          </div>
          <div class="link" *ngFor="let pubmedId of pubmedIds" (click)="onOpenExternal('PubMed', pubmedId)">
            <i class="far fa-link"></i> PubMed
          </div>
          <div class="link" *ngFor="let doi of doiIds" (click)="onOpenExternal('DOI', doi)">
            <i class="far fa-link"></i> DOI
          </div>
        </div>
      </div>
    `
  }
)
export class StudyDetailsComponent {

  public title: string;
  public authors: string;
  public studyCategories: StudyCategory[] = [];
  public samples: Sample[];
  public commonKeys: any;
  public arrayExpressId: string;
  public pubmedIds = [];
  public doiIds = [];
  private nativeWindow: any;

  constructor(public activeModal: NgbActiveModal, private studyService: StudyService, private winRef: WindowRef) {
    this.nativeWindow = winRef.getNativeWindow();
  }

  public setStudy(study: Study) {
    const getCommonKeysFunction = getCommonKeys;
    this.title = getTitle(study);
    this.authors = getAuthors(study);
    this.arrayExpressId = getArrayExpressId(study);
    this.pubmedIds = getPubmedIds(study);
    this.doiIds = getDoisIds(study);
    this.studyCategories = getCategoriesToDisplay(study);
    this.studyService.getIdsOfSamplesInStudy(study._id).then(sampleIds => {
      Promise.all(sampleIds.map(sampleId => this.studyService.getSample(sampleId))).then(results => {
        this.samples = this.sortSamples(results);
        this.commonKeys = getCommonKeysFunction(this.samples);
      });
    });
  }

  private sortSamples(samples: Sample[]) {
    return samples.sort((a, b) => (a._source['Sample Name'] + '')
      .localeCompare((b._source['Sample Name'] + '')));
  }

  public onCloseClick() {
    this.activeModal.close();
  }

  public onOpenExternal(source: string, id: string) {
    if (source === 'DOI') {
      this.nativeWindow.open(`https://dx.doi.org/${id}`);
    } else if (source === 'PubMed') {
      this.nativeWindow.open(`https://www.ncbi.nlm.nih.gov/pubmed/${id}`);
    } else if (source === 'ArrayExpress') {
      this.nativeWindow.open(`https://www.ebi.ac.uk/arrayexpress/experiments/${id}`);
    }
  }
}
