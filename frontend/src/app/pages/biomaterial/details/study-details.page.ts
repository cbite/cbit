import {Component, OnInit, OnDestroy} from '@angular/core';
import {getCategoriesToDisplay, StudyCategory} from '../../../core/util/study-display-category-helper';
import {Sample, Study} from '../../../core/types/study.model';
import {StudyService} from '../../../core/services/study.service';
import {WindowRef} from '../../../shared/util/WindowRef';
import {getCommonKeys} from '../../../core/util/samples-helper';
import {
  getArrayExpressId, getAuthors, getDoisIds, getPubmedIds, getSupplementaryFiles,
  getTitle
} from '../../../core/util/study-helper';
import {ActivatedRoute, Router} from '@angular/router';
import {AppUrls} from '../../../router/app-urls';

@Component({
  styleUrls: ['./study-details.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <div style="margin-bottom: 15px">
            <div class="back-button" (click)="onBackClicked()"><span style="margin-right: 5px;">
              <i class="far fa-angle-left"></i></span>Back to list</div>
        </div>
        <h4>{{title}}</h4>
        <div class="authors">by {{authors}}</div>

        <div style="margin: 20px 0">
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
  private nativeWindow: any;

  constructor(private studyService: StudyService,
              private winRef: WindowRef,
              private route: ActivatedRoute,
              private router: Router) {
    this.nativeWindow = winRef.getNativeWindow();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const studyId = params ['studyId'];
      this.studyService.getStudy(studyId).then((study: Study) => {
        this.setStudy(study);
      });
    });
  }

  public setStudy(study: Study) {
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
    if (source === 'DOI') {
      this.nativeWindow.open(`https://dx.doi.org/${id}`);
    } else if (source === 'PubMed') {
      this.nativeWindow.open(`https://www.ncbi.nlm.nih.gov/pubmed/${id}`);
    } else if (source === 'ArrayExpress') {
      this.nativeWindow.open(`https://www.ebi.ac.uk/arrayexpress/experiments/${id}`);
    }
  }

  public onBackClicked() {
    this.router.navigateByUrl(AppUrls.browseBioMaterialStudiesUrl);
  }
}
