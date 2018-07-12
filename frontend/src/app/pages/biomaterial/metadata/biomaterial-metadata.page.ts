import {Component, OnInit, OnChanges, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {StudyService} from '../../../core/services/study.service';
import {FormGroup, FormControl, Validators, Form} from '@angular/forms';
import {URLService} from '../../../core/services/url.service';
import {HttpGatewayService} from '../../../core/services/http-gateway.service';
import {FieldMeta} from '../../../core/types/field-meta';
import {FieldMetaService} from '../../../core/services/field-meta.service';

@Component({
  styleUrls: ['./biomaterial-metadata.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <h3>Edit Field Metadata</h3>

        <div *ngIf="!ready">
          Loading...
          <spinner></spinner>
        </div>
        <div *ngIf="ready" class="container">
          <cbit-field-metadata-editor [fieldMetas]="fieldMetas" (form)="updateForm($event)"></cbit-field-metadata-editor>
          <div class="row">

            <div class="col-xs-2">
              <button type="submit" class="btn btn-primary" (click)="saveChanges()"
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
          <div class="row">
            <div class="col-xs-12">
              <!-- Footer whitespace -->
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
              private fieldMetaService: FieldMetaService,
              private httpGatewayService: HttpGatewayService,
              private _changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    const self = this;
    this.fieldMetaService.getAllFieldMetas().then(fieldMetas => {
      this.fieldMetas = fieldMetas;
      this.ready = true;
    });
  }

  updateForm(form: FormGroup) {
    this.form = form;
  }

  saveChanges() {
    const self = this;

    this.savingChanges = true;
    this.saveDone = false;
    this.saveError = '';

    this.httpGatewayService.post(this._url.metadataFieldsMultiResource(), JSON.stringify(Object.values(this.form.value)))
      .subscribe(() => {
        self.savingChanges = false;
        self.saveDone = true;
        self._changeDetectorRef.detectChanges();
        self.fieldMetaService.flushCaches();
        // TODO@Sam check what happens on error
      });

    /*    $.ajax({
          type: 'POST',
          url: this._url.metadataFieldsMultiResource(),
          headers: this._auth.headers(),
          data: JSON.stringify(Object.values(this.form.value)),
          dataType: 'json',
          success: function(response) {
            self.savingChanges = false;
            self.saveDone = true;
            self._changeDetectorRef.detectChanges();
          },
          error: function(jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) {
            self.savingChanges = false;
            self.saveDone = true;
            self.saveError = `Error: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}`;
            self._changeDetectorRef.detectChanges();
          },
          complete: function() {
            // Whatever happened, caches are stale now
            self._studyService.flushCaches();
          }
        })*/
  }
}
