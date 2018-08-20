import {Component, OnInit} from '@angular/core';
import {TendonsStudy} from '../../../core/types/Tendons-study';
import {TendonsStudyService} from '../../../core/services/tendons-study.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppUrls} from '../../../router/app-urls';
import {Observable} from 'rxjs/Observable';

@Component({
  styleUrls: ['./tendons-study-editor.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <div class="page-title">Tendons Study</div>
          <div class="back-link" (click)="onBackClicked()"><i class="far fa-angle-left"></i> Back</div>
        </div>
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
        <form *ngIf="loaded" [formGroup]="registerForm" (ngSubmit)="onSave()">
          <div class="form-group">
            <label>Name</label>
            <input type="text" formControlName="name" class="form-control" [(ngModel)]="study.name"
                   [ngClass]="{ 'is-invalid': submitted && f.name.errors }"/>
            <div *ngIf="submitted && f.name.errors" class="invalid-feedback">
              <div *ngIf="f.name.errors.required">Name is required</div>
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" formControlName="description" class="form-control" [(ngModel)]="study.description"
                   [ngClass]="{ 'is-invalid': submitted && f.description.errors }"/>
            <div *ngIf="submitted && f.description.errors" class="invalid-feedback">
              <div *ngIf="f.description.errors.required">Description is required</div>
            </div>
          </div>
          <div class="form-group">
            <label>Array Exress Id</label>
            <input type="text" formControlName="arrayExpressId" class="form-control" [(ngModel)]="study.arrayExpressId"
                   [ngClass]="{ 'is-invalid': submitted && f.arrayExpressId.errors }"/>
            <div *ngIf="submitted && f.arrayExpressId.errors" class="invalid-feedback">
              <div *ngIf="f.arrayExpressId.errors.required">Array Express Id is required</div>
            </div>
          </div>
          <div class="form-group">
            <label>PubMed Id</label>
            <input type="text" formControlName="pubMedId" class="form-control" [(ngModel)]="study.pubMedId"
                   [ngClass]="{ 'is-invalid': submitted && f.pubMedId.errors }"/>
            <div *ngIf="submitted && f.pubMedId.errors" class="invalid-feedback">
              <div *ngIf="f.pubMedId.errors.required">PubMed Id is required</div>
            </div>
          </div>
          <div class="form-group">
            <label>Gene Expression Type</label>
            <select formControlName="geneExpressionType"
                    class="form-control"
                    [(ngModel)]="study.geneExpressionType"
                    [ngClass]="{ 'is-invalid': submitted && f.geneExpressionType.errors }">
              <option value="Microarray">Microarray</option>
              <option value="RNASequencing">RNA Sequencing</option>
            </select>
            <div *ngIf="submitted && f.geneExpressionType.errors" class="invalid-feedback">
              <div *ngIf="f.geneExpressionType.errors.required">Gene Expression Type is required</div>
            </div>
          </div>
          <div class="form-group">
            <label>Platform</label>
            <input type="text" formControlName="platform" class="form-control" [(ngModel)]="study.platform"
                   [ngClass]="{ 'is-invalid': submitted && f.platform.errors }"/>
            <div *ngIf="submitted && f.platform.errors" class="invalid-feedback">
              <div *ngIf="f.platform.errors.required">Platform is required</div>
            </div>
          </div>
          <div class="form-group">
            <label>Organism</label>
            <input type="text" formControlName="organism" class="form-control" [(ngModel)]="study.organism"
                   [ngClass]="{ 'is-invalid': submitted && f.organism.errors }"/>
            <div *ngIf="submitted && f.organism.errors" class="invalid-feedback">
              <div *ngIf="f.organism.errors.required">Organism is required</div>
            </div>
          </div>
          <div class="form-group">
            <label>Cell Origin</label>
            <input type="text" formControlName="cellOrigin" class="form-control" [(ngModel)]="study.cellOrigin"
                   [ngClass]="{ 'is-invalid': submitted && f.cellOrigin.errors }"/>
            <div *ngIf="submitted && f.cellOrigin.errors" class="invalid-feedback">
              <div *ngIf="f.cellOrigin.errors.required">Cell Origin is required</div>
            </div>
          </div>
          <div class="form-group">
            <label>Year</label>
            <input type="number" formControlName="year" class="form-control" [(ngModel)]="study.year"
                   [ngClass]="{ 'is-invalid': submitted && f.year.errors }"/>
            <div *ngIf="submitted && f.year.errors" class="invalid-feedback">
              <div *ngIf="f.year.errors.required">Year is required</div>
            </div>
          </div>
          <div class="form-group">
            <label>Sample Size</label>
            <input type="number" formControlName="sampleSize" class="form-control" [(ngModel)]="study.sampleSize"
                   [ngClass]="{ 'is-invalid': submitted && f.sampleSize.errors }"/>
            <div *ngIf="submitted && f.sampleSize.errors" class="invalid-feedback">
              <div *ngIf="f.sampleSize.errors.required">Sample Size is required</div>
            </div>
          </div>
          <div class="form-group">
            <label>Visible</label>
            <input type="checkbox" formControlName="visible" class="form-control" [(ngModel)]="study.visible"/>
          </div>
          <div class="form-group">
            <button class="button-standard">Save</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TendonsStudyEditorPage implements OnInit {
  study: TendonsStudy;
  registerForm: FormGroup;
  submitted = false;
  loaded = false;
  errorMessage = '';

  constructor(private formBuilder: FormBuilder, private tendonsStudyService: TendonsStudyService, private route: ActivatedRoute, private router: Router) {
    this.study = TendonsStudy.createNew();
  }

  ngOnInit(): void {
    const studyId = this.route.snapshot.params['id'];
    if (studyId) {
      this.tendonsStudyService.getStudy(studyId).subscribe(study => {
        this.study = study;
        this.buildForm();
      });
    } else {
      this.buildForm();
    }
  }

  buildForm() {
    this.registerForm = this.formBuilder.group({
      name: [this.study.name, Validators.required],
      description: [this.study.description, Validators.required],
      arrayExpressId: [this.study.arrayExpressId, Validators.required],
      pubMedId: [this.study.pubMedId, Validators.required],
      geneExpressionType: [this.study.geneExpressionType, Validators.required],
      platform: [this.study.platform, Validators.required],
      organism: [this.study.organism, Validators.required],
      cellOrigin: [this.study.cellOrigin, Validators.required],
      year: [this.study.year, Validators.required],
      sampleSize: [this.study.sampleSize, Validators.required],
      visible: [this.study.visible],
    });
    this.loaded = true;
  }

  public onBackClicked(): void {
    this.router.navigateByUrl(AppUrls.manageTendonsStudiesUrl);
  }

  get f() {
    return this.registerForm.controls;
  }

  onSave() {
    this.submitted = true;
    this.errorMessage = '';

    const onError = (err, caught) => {
      this.errorMessage = `Error: ${err.statusText}`;
      return Observable.throw(err);
    };

    if (this.registerForm.invalid) {
      return;
    } else {
      if (this.study.uuid) {
        // Existing study => update
        this.tendonsStudyService.updateStudy(this.study, onError).subscribe(result => {
          this.router.navigateByUrl(AppUrls.manageTendonsStudiesUrl);
        });
      } else {
        // New study => create
        this.tendonsStudyService.createStudy(this.study, onError).subscribe(result => {
          this.study.uuid = result.study_uuid;
          this.router.navigateByUrl(AppUrls.manageTendonsStudiesUrl);
        });
      }
    }
  }
}
