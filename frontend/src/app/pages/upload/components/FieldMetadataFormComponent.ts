import {Component, OnInit, Input, Output, OnChanges, EventEmitter} from '@angular/core';
import {FieldMeta, DimensionsType} from '../../../common/field-meta.model';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import {DimensionsRegister} from '../../../common/unit-conversions';
import {KNOWN_METADATA_FIELDS, isTranscriptomicsAssayDetail, TRANSCRIPTOMIC_ASSY_DETAIL_DEFAULT_METADATA} from '../types/metadata-fields';
import {FieldAnalysisResults} from '../types/FieldAnalysisResults';

@Component({
  selector: 'cbit-field-metadata-form',
  template: `
    <div [formGroup]="_form">

      <div *ngFor="let fieldName of fieldNames" [formGroupName]="fieldName" class="panel panel-primary">
        <div class="panel-heading">
          <h4>{{ fieldName }}</h4>
        </div>

        <div class="panel-body">
          <div class="form-horizontal">
            <div class="form-group">
              <label [attr.for]="'description-' + fieldName" class="col-sm-2 control-label">
                Description
              </label>
              <div class="col-sm-10">
                <textarea formControlName="description"
                          [id]="'description-' + fieldName"
                          class="form-control"
                          rows="3">
                </textarea>
              </div>
            </div>

            <div class="form-group">
              <label [attr.for]="dataType + fieldName" class="col-sm-2 control-label">
                Data Type
              </label>
              <div class="col-sm-4">
                <select [id]="dataType + fieldName"
                        formControlName="dataType"
                        class="form-control"
                >
                  <option value="string">String (text)</option>
                  <option value="double">Number</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label [attr.for]="'visibility-' + fieldName" class="col-sm-2 control-label">
                Visibility
              </label>
              <div class="col-sm-4">
                <select [id]="'visibility-' + fieldName"
                        formControlName="visibility"
                        class="form-control">
                  <option value="main">Main Filters</option>
                  <option value="additional">Additional Filters</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label [attr.for]="'category-' + fieldName" class="col-sm-2 control-label">
                Category
              </label>
              <div class="col-sm-4">
                <select [id]="'category-' + fieldName"
                        formControlName="category"
                        class="form-control">
                  <option value="Material > General">Material Properties - General</option>
                  <option value="Material > Chemical">Material Properties - Chemical</option>
                  <option value="Material > Physical">Material Properties - Physical</option>
                  <option value="Material > Mechanical">Material Properties - Mechanical</option>
                  <option value="Biological">Biological Properties</option>
                  <option value="Technical > General">Technical Properties - General</option>
                  <option value="Technical > Microarray">Technical Properties - Microarray</option>
                  <option value="Technical > RNA sequencing">Technical Properties - RNA sequencing</option>
                </select>
              </div>
            </div>

            <div *ngIf="fieldConfigs[fieldName].possibleDimensions.length > 0">
              <div class="form-group">
                <label [attr.for]="'dimensions-' + fieldName" class="col-sm-2 control-label">
                  Dimensions
                </label>
                <div class="col-sm-4">
                  <select *ngIf="fieldConfigs[fieldName].possibleDimensions.length !== 1"
                          [id]="'dimensions-' + fieldName"
                          formControlName="dimensions"
                          class="form-control">
                    <option *ngFor="let dimension of fieldConfigs[fieldName].possibleDimensions"
                            [value]="dimension"
                    >{{ dimension }}
                    </option>
                  </select>
                  <p *ngIf="fieldConfigs[fieldName].possibleDimensions.length === 1" class="form-control-static">
                    {{ fieldConfigs[fieldName].possibleDimensions[0] }}
                  </p>
                </div>
              </div>

              <div class="form-group">
                <label [attr.for]="'preferredUnit-' + fieldName" class="col-sm-2 control-label">
                  Preferred Unit
                </label>
                <div class="col-sm-4">
                  <select *ngIf="possibleUnits(fieldName).length !== 1"
                          [id]="'preferredUnit-' + fieldName"
                          formControlName="preferredUnit"
                          class="form-control">
                    <option *ngFor="let unitName of possibleUnits(fieldName)"
                            [value]="unitName"
                    >{{ uiUnitName(fieldName, unitName) }}
                    </option>
                  </select>
                  <p *ngIf="possibleUnits(fieldName).length === 1" class="form-control-static">
                    {{ uiUnitName(fieldName, possibleUnits(fieldName)[0]) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label [attr.for]="'isSupplementaryFileName-' + fieldName" class="col-sm-2 control-label vcenter">
                Is Supplementary File Name?
              </label>
              <div class="col-sm-4 vcenter">
                <input type="checkbox"
                       formControlName="isSupplementaryFileName"
                       [id]="'isSupplementaryFileName-' + fieldName">
              </div>
            </div>

            <div class="form-group">
              <label [attr.for]="'nameInSampleMiniSummary-' + fieldName" class="col-sm-2 control-label">
                Name in Sample Mini-Summary
              </label>
              <div class="col-sm-4">
                <input type="text"
                       placeholder="Leave blank to omit field from sample mini-summary"
                       formControlName="nameInSampleMiniSummary"
                       [id]="'nameInSampleMiniSummary-' + fieldName"
                       class="form-control">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vcenter {
      display: inline-block;
      vertical-align: middle;
      float: none;
    }
  `]
})
export class FieldMetadataFormComponent implements OnInit, OnChanges {
  @Input() fieldNames: string[] = [];
  @Input() fieldAnalyses: { [fieldName: string]: FieldAnalysisResults } = {};
  @Output() form = new EventEmitter<FormGroup>();
  _form: FormGroup;

  fieldConfigs: { [fieldName: string]: any } = {};

  ngOnInit() {
    this._form = this.makeFormGroup();
    this.form.emit(this._form);
  }

  ngOnChanges() {
    this._form = this.makeFormGroup();
    this.form.emit(this._form);
  }

  possibleUnits(fieldName: string): string[] {
    if (this.fieldAnalyses[fieldName]) {
      const dimensions = (<FormGroup>this._form.controls[fieldName]).controls['dimensions'].value;
      return DimensionsRegister[dimensions].getPossibleUnits();
    } else {
      return [];
    }
  }

  uiUnitName(fieldName: string, unitName: string): string {
    if (this.fieldAnalyses[fieldName]) {
      const dimensions = (<FormGroup>this._form.controls[fieldName]).controls['dimensions'].value;
      return DimensionsRegister[dimensions].getUnitUIName(unitName);
    } else {
      return unitName;
    }
  }

  makeFormGroup(): FormGroup {
    const group: any = {};

    this.fieldConfigs = {};
    for (const fieldName of this.fieldNames) {
      const defaults = this.fetchDefaults(fieldName);

      group[fieldName] = new FormGroup({
        fieldName: new FormControl(fieldName),
        description: new FormControl(defaults.description, Validators.required),
        category: new FormControl(defaults.category),
        visibility: new FormControl(defaults.visibility),
        dataType: new FormControl(defaults.dataType),
        dimensions: new FormControl(defaults.dimensions),
        preferredUnit: new FormControl(defaults.preferredUnit),
        isSupplementaryFileName: new FormControl(defaults.isSupplementaryFileName),
        nameInSampleMiniSummary: new FormControl(defaults.nameInSampleMiniSummary),
      });

      const fieldAnalysis = this.fieldAnalyses[fieldName];

      const fieldConfig: any = this.fieldConfigs[fieldName] = {
        possibleDimensions: (fieldAnalysis && fieldAnalysis.possibleDimensions) || []
      };
    }
    return new FormGroup(group);
  }

  fetchDefaults(fieldName: string): FieldMeta {

    let result: FieldMeta = {
      description: '',
      dataType: 'string',
      visibility: 'additional',
      category: 'Technical > General',
      dimensions: 'none',
      preferredUnit: 'none',
      isSupplementaryFileName: false,
      nameInSampleMiniSummary: '',
    };

    const fieldAnalysis = this.fieldAnalyses[fieldName];
    if (fieldAnalysis) {
      result.dataType = fieldAnalysis.looksNumeric ? 'double' : 'string';
      if (fieldAnalysis.isUnitful && fieldAnalysis.possibleDimensions) {
        result.dimensions = <DimensionsType> fieldAnalysis.possibleDimensions[0];
        result.preferredUnit = DimensionsRegister[result.dimensions].canonicalUnit;
      }
    }

    if (fieldName in KNOWN_METADATA_FIELDS) {
      result = _.merge(result, KNOWN_METADATA_FIELDS[fieldName]);
    } else if (isTranscriptomicsAssayDetail(fieldName)) {
      result = _.merge(result, TRANSCRIPTOMIC_ASSY_DETAIL_DEFAULT_METADATA);
    }

    return result;
  }
}
