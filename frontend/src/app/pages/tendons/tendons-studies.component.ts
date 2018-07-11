import {Component, OnInit} from '@angular/core';
import {TendonsStudy} from '../../core/types/Tendons-study';
import {TendonsStudyService} from '../../core/services/tendons-study.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {WindowRef} from '../../shared/util/WindowRef';

@Component({
  styleUrls: ['./tendons-studies.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <h3>Tendons Studies</h3>
        <div class="study" *ngFor="let study of studies">
          <div class="row">
            <div class="col title">Title: {{study.name}}</div>
            <div class="col year">Year: {{study.year}}</div>
          </div>
          <div class="row">
            <div class="col description">Description: {{study.description}}</div>
          </div>
          <div class="row">
            <div class="col platform">Platform: {{study.platform}}</div>
            <div class="col organism">Organism: {{study.organism}}</div>
            <div class="col cellOrigin">Cell Origin: {{study.cellOrigin}}</div>
            <div class="col sampleSize">Sample Size: {{study.sampleSize}}</div>
          </div>
          <div class="row">
            <div class="col">
              <div class="link" (click)="onOpenExternal('ArrayExpress', study.arrayExpressId)">
                <i class="far fa-link"></i> Array Express
              </div>
              <div class="link" (click)="onOpenExternal('PubMed', study.pubMedId)">
                <i class="far fa-link"></i> PubMed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TendonsStudiesComponent implements OnInit {

  public studies: TendonsStudy[];
  private nativeWindow: any;

  constructor(private tendonsStudyService: TendonsStudyService, private winRef: WindowRef) {
    this.nativeWindow = winRef.getNativeWindow();
  }

  ngOnInit(): void {
    this.loadStudies();
  }

  private loadStudies() {
    this.tendonsStudyService.getStudies().subscribe(studies => this.studies = studies);
  }

  public onOpenExternal(source: string, id: string) {
    if (source === 'ArrayExpress') {
      this.nativeWindow.open(`https://dx.doi.org/${id}`); // TODO@MT
    } else if (source === 'PubMed') {
      this.nativeWindow.open(`https://www.ncbi.nlm.nih.gov/pubmed/${id}`);
    }
  }
}
