import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {URLService} from '../../../core/services/url.service';
import {HttpGatewayService} from '../../../core/services/http-gateway.service';
import {FieldMeta} from '../../../core/types/field-meta';
import {FieldMetaService} from '../../../core/services/field-meta.service';
import {AppUrls} from '../../../router/app-urls';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

@Component({
  styleUrls: ['./biomaterial-metadata.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <div class="page-header">
          <div class="page-title">Edit Field Metadata</div>
          <div class="back-link" (click)="onBackClicked()"><i class="far fa-angle-left"></i> Back</div>
        </div>

        <div *ngIf="!ready">
          Loading...
          <spinner></spinner>
        </div>
        <div *ngIf="ready" class="container">
          <cbit-field-metadata-editor [fieldMetas]="fieldMetas"
                                      (form)="updateForm($event)"></cbit-field-metadata-editor>
          <div class="row">

            <div class="col-xs-2">
              <button type="submit" class="save button-standard" (click)="saveChanges()"
                      [attr.disabled]="savingChanges || null">
                <span *ngIf="!savingChanges">Save Changes</span>
                <span *ngIf=" savingChanges">Saving Changes...</span>
              </button>
            </div>

            <div class="col-xs-10" *ngIf="!savingChanges && saveDone">
              <div *ngIf=" !saveError" class="alert alert-success" role="alert">Changes saved!</div>
              <div *ngIf="!!saveError" class="alert alert-danger" role="alert">Save failed: {{ saveError }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BioMaterialMetadataPage implements OnInit {
  ready = false;
  fieldMetas: { [fieldName: string]: FieldMeta } = {};
  form: FormGroup;
  savingChanges = false;
  saveDone = false;
  saveError = '';

  constructor(private _url: URLService,
              private router: Router,
              private fieldMetaService: FieldMetaService,
              private httpGatewayService: HttpGatewayService,
              private _changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    const self = this;
    this.fieldMetaService.getAllFieldMetas().then(fieldMetas => {
      this.fieldMetas = fieldMetas;
      this.ready = true;
    });
  }


  public onBackClicked(): void {
    this.router.navigateByUrl(AppUrls.manageBioMaterialStudiesUrl);
  }

  updateForm(form: FormGroup) {
    this.form = form;
  }

  saveChanges() {
    const self = this;

    this.savingChanges = true;
    this.saveDone = false;
    this.saveError = '';

    const onError = (err, caught) => {
      self.savingChanges = false;
      self.saveDone = true;
      self.saveError = `Error: ${err.statusText}`;
      self._changeDetectorRef.detectChanges();
      return Observable.throw(err);
    };

    this.httpGatewayService.post(this._url.metadataFieldsMultiResource(), JSON.stringify(Object.values(this.form.value)), onError)
      .subscribe(() => {
        self.savingChanges = false;
        self.saveDone = true;
        self._changeDetectorRef.detectChanges();
        self.fieldMetaService.flushCaches();
      });
  }
}
