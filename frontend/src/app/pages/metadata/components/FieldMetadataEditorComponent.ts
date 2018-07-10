import {Component, OnInit, OnChanges, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {StudyService} from '../../../core/services/study.service';
import {FormGroup, FormControl, Validators, Form} from '@angular/forms';
import {DimensionsRegister} from '../../../common/unit-conversions';
import {AuthenticationService} from '../../../core/authentication/authentication.service';
import {URLService} from '../../../core/services/url.service';
import {HttpGatewayService} from '../../../core/services/http-gateway.service';
import {Observable} from 'rxjs/Observable';
import {FieldMeta} from '../../../core/types/field-meta';
import {FieldMetaService} from '../../../core/services/field-meta.service';


// TODO: Refactor this component and the uploader's field-metadata-form into a single metadata editor
@Component({
  selector: 'cbit-field-metadata-editor',
  template: `
    <div [formGroup]="_form">

      <div *ngFor="let kv of fieldMetas | mapToIterable" [formGroupName]="kv.key" class="panel panel-primary">
        <div class="panel-heading">
          <h4>{{ kv.key }}</h4>
        </div>

        <div class="panel-body">
          <div class="form-horizontal">
            <div class="form-group">
              <label [attr.for]="'description-' + kv.key" class="col-sm-2 control-label">
                Description
              </label>
              <div class="col-sm-10">
                <textarea formControlName="description"
                          [id]="'description-' + kv.key"
                          class="form-control"
                          rows="3">
                </textarea>
              </div>
            </div>

            <div class="form-group">
              <label [attr.for]="dataType + kv.key" class="col-sm-2 control-label">
                Data Type
              </label>
              <div class="col-sm-4">
                <p class="form-control-static" [ngSwitch]="fieldMetas[kv.key].dataType">
                  <span *ngSwitchCase="'string'">String (text)</span>
                  <span *ngSwitchCase="'double'">Number</span>
                </p>
              </div>
            </div>

            <div class="form-group">
              <label [attr.for]="'visibility-' + kv.key" class="col-sm-2 control-label">
                Visibility
              </label>
              <div class="col-sm-4">
                <select [id]="'visibility-' + kv.key"
                        formControlName="visibility"
                        class="form-control">
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label [attr.for]="'category-' + kv.key" class="col-sm-2 control-label">
                Category
              </label>
              <div class="col-sm-4">
                <select [id]="'category-' + kv.key"
                        formControlName="category"
                        class="form-control">
                  <option value="Material > General">Material Properties - General</option>
                  <option value="Material > Chemical">Material Properties - Chemical</option>
                  <option value="Material > Physical">Material Properties - Physical</option>
                  <option value="Material > Mechanical">Material Properties - Mechanical</option>
                  <option value="Biological">Biological Properties</option>
                  <option value="Technical > General">Technical Properties - General</option>
                  <option value="Technical > Microarray">Technical Properties - Microarrays</option>
                  <option value="Technical > RNA sequencing">Technical Properties - RNA sequencing</option>
                </select>
              </div>
            </div>

            <div *ngIf="fieldMetas[kv.key].dimensions != 'none'">
              <div class="form-group">
                <label [attr.for]="'dimensions-' + kv.key" class="col-sm-2 control-label">
                  Dimensions
                </label>
                <div class="col-sm-4">
                  <p class="form-control-static">{{ fieldMetas[kv.key].dimensions }}</p>
                </div>
              </div>

              <div class="form-group">
                <label [attr.for]="'preferredUnit-' + kv.key" class="col-sm-2 control-label">
                  Preferred Unit
                </label>
                <div class="col-sm-4">
                  <select *ngIf="possibleUnits(kv.key).length !== 1"
                          [id]="'preferredUnit-' + kv.key"
                          formControlName="preferredUnit"
                          class="form-control col-sm-10">
                    <option *ngFor="let unitName of possibleUnits(kv.key)"
                            [value]="unitName"
                    >{{ uiUnitName(kv.key, unitName) }}
                    </option>
                  </select>
                  <p *ngIf="possibleUnits(kv.key).length === 1" class="form-control-static">
                    {{ uiUnitName(kv.key, possibleUnits(kv.key)[0]) }}
                  </p>
                </div>
              </div>
            </div>


            <div class="form-group">
              <label [attr.for]="'isSupplementaryFileName-' + kv.key" class="col-sm-2 control-label vcenter">
                Is Supplementary File Name?
              </label>
              <div class="col-sm-4 vcenter">
                <input type="checkbox"
                       formControlName="isSupplementaryFileName"
                       [id]="'isSupplementaryFileName-' + kv.key">
              </div>
            </div>

            <div class="form-group">
              <label [attr.for]="'nameInSampleMiniSummary-' + kv.key" class="col-sm-2 control-label">
                Name in Sample Mini-Summary
              </label>
              <div class="col-sm-4">
                <input type="text"
                       placeholder="Leave blank to omit field from sample mini-summary"
                       formControlName="nameInSampleMiniSummary"
                       [id]="'nameInSampleMiniSummary-' + kv.key"
                       class="form-control">
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class FieldMetadataEditorComponent implements OnInit, OnChanges {
  @Input() fieldMetas: { [fieldName: string]: FieldMeta } = {};
  @Output() form = new EventEmitter<FormGroup>();
  _form: FormGroup;

  ngOnInit() {
    this._form = this.makeFormGroup();
    this.form.emit(this._form);
  }

  ngOnChanges() {
    this._form = this.makeFormGroup();
    this.form.emit(this._form);
  }

  possibleUnits(fieldName: string): string[] {
    const unitConverter = DimensionsRegister[this.fieldMetas[fieldName].dimensions];
    return (unitConverter ? unitConverter.getPossibleUnits() : []);
  }

  uiUnitName(fieldName: string, unitName: string): string {
    const unitConverter = DimensionsRegister[this.fieldMetas[fieldName].dimensions];
    return (unitConverter ? unitConverter.getUnitUIName(unitName) : unitName);
  }

  makeFormGroup(): FormGroup {
    const group: any = {};

    for (const fieldName in this.fieldMetas) {
      const fieldMeta = this.fieldMetas[fieldName];
      group[fieldName] = new FormGroup({
        fieldName: new FormControl(fieldName),
        description: new FormControl(fieldMeta.description, Validators.required),
        category: new FormControl(fieldMeta.category),
        visibility: new FormControl(fieldMeta.visibility),
        dataType: new FormControl(fieldMeta.dataType),
        dimensions: new FormControl(fieldMeta.dimensions),
        preferredUnit: new FormControl(fieldMeta.preferredUnit),
        isSupplementaryFileName: new FormControl(fieldMeta.isSupplementaryFileName),
        nameInSampleMiniSummary: new FormControl(fieldMeta.nameInSampleMiniSummary),
      });
    }
    return new FormGroup(group);
  }
}


@Component({
  template: `
    <h2>Edit Field Metadata</h2>

    <div *ngIf="!ready">
      Loading...
      <spinner></spinner>
    </div>
    <div *ngIf="ready" class="container">
      <field-metadata-editor [fieldMetas]="fieldMetas" (form)="updateForm($event)"></field-metadata-editor>
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
  `
})
export class MetadataComponent implements OnInit {
  ready = false;
  fieldMetas: { [fieldName: string]: FieldMeta } = {};
  form: FormGroup;
  savingChanges = false;
  saveDone = false;
  saveError = '';

  constructor(private _url: URLService,
              private fieldMetaService: FieldMetaService,
              private _studyService: StudyService,
              private httpGatewayService: HttpGatewayService,
              private _changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    let self = this;
    this.fieldMetaService.getAllFieldMetas().then(fieldMetas => {
      this.fieldMetas = fieldMetas;
      this.ready = true;
    });
  }

  updateForm(form: FormGroup) {
    this.form = form;
  }

  saveChanges() {
    let self = this;

    this.savingChanges = true;
    this.saveDone = false;
    this.saveError = '';

    const onError = (err, caught) => {
      self.savingChanges = false;
      self.saveDone = true;
      self.saveError = `Error: ${err.statusText}`;
      self._changeDetectorRef.detectChanges();
      self._studyService.flushCaches();
      return Observable.throw(err);
    };

    this.httpGatewayService.post(this._url.metadataFieldsMultiResource(), JSON.stringify(Object.values(this.form.value)), onError)
      .subscribe(() => {
        self.savingChanges = false;
        self.saveDone = true;
        self._changeDetectorRef.detectChanges();
        self._studyService.flushCaches();
      });
  }
}
