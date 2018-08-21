import {Component, OnInit, OnDestroy} from '@angular/core';
import {getCategoriesToDisplay, StudyCategory} from '../../../core/util/study-display-category-helper';
import {Sample, Study} from '../../../core/types/study.model';
import {StudyService} from '../../../core/services/study.service';
import {WindowRef} from '../../../shared/util/WindowRef';
import {getCommonKeys} from '../../../core/util/samples-helper';
import {
  getArrayExpressId, getAuthors, getDoisIds, getProtocolFile, getPubmedIds, getSupplementaryFiles,
  getTitle
} from '../../../core/util/study-helper';
import {ActivatedRoute, Router} from '@angular/router';
import {AppUrls} from '../../../router/app-urls';
import {ExternalLinkService} from '../../../services/external-link.service';

@Component({
  styleUrls: ['./study-details.scss'],
  template: `
    <div class="page">
      <div *ngIf="study" class="page-content">
        <div class="page-header">
          <div *ngIf="afterUpload" class="page-title">Upload succeeded!</div>
          <div class="back-link" (click)="onBackClicked()"><i class="far fa-angle-left"></i> Back to list</div>
        </div>
        <h4>{{title}}</h4>
        <div class="authors">by {{authors}}</div>

        <div style="margin: 20px 0 0 0">
          <div class="links">
            <!--<div style="display: inline-block; width: 120px"><h6><b>Links</b></h6></div>-->
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

        <div style="margin: 10px 0 20px 0">
          <div class="downloads">
            <!--<div style="display: inline-block; width: 120px"><h6><b>Downloads</b></h6></div>-->
            <div class="link" (click)="onDownloadStudy()">
              <i class="far fa-download"></i> Study
            </div>
            <div class="link" (click)="onDownloadProtocol()">
              <i class="far fa-download"></i> Protocol
            </div>
            <spinner class="spinner" *ngIf="downloadInProgress"></spinner>
          </div>
        </div>

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

        <div *ngIf="supplementaryFiles.length>0" class="files">
          <h6><b>Supplementary Files</b></h6>
          <div class="file" *ngFor="let supplementaryFile of supplementaryFiles">
            {{supplementaryFile}}
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudyDetailsPage implements OnInit {

  public title: string;
  public authors: string;
  public studyCategories: StudyCategory[] = [];
  public samples: Sample[];
  public supplementaryFiles: string[];
  public commonKeys: any;
  public arrayExpressId: string;
  public pubmedIds = [];
  public doiIds = [];
  public study: Study;
  public afterUpload = false;
  public downloadInProgress = false;

  constructor(private studyService: StudyService,
              private route: ActivatedRoute,
              private router: Router,
              private externalLinkService: ExternalLinkService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const studyId = params ['studyId'];
      this.studyService.getStudy(studyId).then((study: Study) => {
        this.setStudy(study);
      });
    });

    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['upload'] === 'true') {
        this.afterUpload = true;
      }
    });
  }

  public setStudy(study: Study) {
    this.study = study;
    const getCommonKeysFunction = getCommonKeys;
    this.title = getTitle(study);
    this.authors = getAuthors(study);
    this.arrayExpressId = getArrayExpressId(study);
    this.pubmedIds = getPubmedIds(study);
    this.doiIds = getDoisIds(study);
    this.supplementaryFiles = getSupplementaryFiles(study);
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

  public onOpenExternal(source: string, id: string) {
    this.externalLinkService.navigateTo(source, id, this.study._id);
  }

  public onBackClicked() {
    const url = this.afterUpload ? AppUrls.manageBioMaterialStudiesUrl : AppUrls.browseBioMaterialStudiesUrl;
    this.router.navigateByUrl(url);
  }

  public onDownloadStudy() {
    this.studyService.downloadStudy(this.study);
  }

  public onDownloadProtocol() {
    this.downloadInProgress = true;
    this.studyService.downloadProtocols(this.study, getProtocolFile(this.study), () => {
      this.downloadInProgress = false;
    });
  }
}
