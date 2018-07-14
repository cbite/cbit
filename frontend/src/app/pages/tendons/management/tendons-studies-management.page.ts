import {Component, OnInit} from '@angular/core';
import {TendonsStudy} from '../../../core/types/Tendons-study';
import {TendonsStudyService} from '../../../core/services/tendons-study.service';
import {PopupService} from '../../../core/services/popup.service';
import {Router} from '@angular/router';
import {AppUrls} from '../../../router/app-urls';

@Component({
  styleUrls: ['./tendons-studies-management.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <div class="page-title">
          Tendons Studies
        </div>
        <div class="row header">
          <div class="col-4">Study Title</div>
          <div class="col-4">Gene Expression Type</div>
          <div class="col-2">Visible</div>
          <div class="col-2"></div>
        </div>
        <div class="row study" *ngFor="let study of studies">
          <div class="col-4">{{study.name}}</div>
          <div class="col-4">{{study.geneExpressionType}}</div>
          <div class="col-2">{{study.visible}}</div>
          <div class="col-2">
            <div class="action" (click)="onEdit(study)">Edit</div>
            <div class="action" (click)="onDelete(study)">Delete</div>
          </div>
        </div>
        <button  class="button-standard" (click)="onAddNewStudy()">
          New Study
        </button>
      </div>
    </div>
  `
})
export class TendonsStudiesManagementPage implements OnInit {

  public studies: TendonsStudy[];

  constructor(private tendonsStudyService: TendonsStudyService, private popupService: PopupService, private router: Router) {
  }

  ngOnInit(): void {
    this.loadStudies();
  }

  onDelete(study: TendonsStudy) {
    this.popupService.showConfirmationPoupup(`Are you sure you want to delete study ${study.name}?`, () => {
      this.tendonsStudyService.deleteStudy(study.uuid).subscribe(result => {
        this.loadStudies();
      });
    });
  }

  onAddNewStudy() {
    this.router.navigateByUrl(AppUrls.newTendonsStudyUrl);
  }

  onEdit(study: TendonsStudy) {
    this.router.navigateByUrl(AppUrls.tendonsStudyUrl.replace(':id', study.uuid));
  }

  private loadStudies() {
    this.tendonsStudyService.getStudies().subscribe(studies => this.studies = studies);
  }
}
