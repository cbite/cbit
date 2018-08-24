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
        <div class="container">
          <div class="row header">
            <div class="col-6 field">Name</div>
            <div class="col-2 field">Created On</div>
            <div class="col-1 field">Visible</div>
            <div class="col-3 field"></div>
          </div>
          <div class="row study" *ngFor="let study of studies">
            <div class="col-6 field">{{study.name}}</div>
            <div class="col-2 field">{{study.createdOn | date:'dd-MM-yyyy HH:mm'}}</div>
            <div class="col-1 field">
              <input type="checkbox" [(ngModel)]="study.visible" disabled="disabled">
            </div>
            <div class="col-3 field" style="text-align: right">
              <button class="button-standard small" (click)="onEdit(study)">Edit</button>
              <button class="button-standard small delete" (click)="onDelete(study)">Delete</button>
            </div>
          </div>
          <div class="row" style="margin-top: 30px;">
            <div class="col-12" style="text-align: right;">
              <button class="button-standard" (click)="onAddNewStudy()">New Study</button>
            </div>
          </div>
        </div>
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
