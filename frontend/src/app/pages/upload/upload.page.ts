import {Component, OnInit, ChangeDetectorRef, Input, Output, OnChanges, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {
  FileUploader, FileSelectDirective, FileDropDirective,
  ParsedResponseHeaders, FileUploaderOptions, Headers
} from 'ng2-file-upload/ng2-file-upload';

import {FieldMeta, DimensionsType} from '../../common/field-meta.model';
import {FormGroup, FormControl, Validators, RequiredValidator} from '@angular/forms';
import {DimensionsRegister, INVALID_DIMENSIONS} from '../../common/unit-conversions';
import {AuthenticationService} from '../../core/authentication/authentication.service';
import {URLService} from '../../services/url.service';
import {HttpGatewayService} from '../../services/http-gateway.service';
import {HttpHeaders} from '@angular/common/http';
import {FieldAnalysisResults} from './types/FieldAnalysisResults';
import {UploadsResponse} from './types/UploadsResponse';
import {Observable} from 'rxjs/Observable';

@Component({
  styleUrls: ['./upload.scss'],
  template: `
    <div class="container">
      <h1>Upload New Study</h1>

      <div [class.hidden]="step !== 1">
        <h2>Step 1a: Upload a .zip archive in ISAtab format from RIT (iRODS)</h2>
        <p>Click on an iRODS folder name to start upload:</p>
        <div class="row">
          <div class="col-md-8 col-md-offset-2 well irods-list">
            <div *ngIf="!iRODSListReady">
              Fetching study list from iRODS...
              <spinner></spinner>
            </div>
            <div *ngIf="iRODSListReady">
              <ul>
                <li *ngFor="let iRODSStudyName of iRODSStudyNames">
                  <a href="#" (click)="$event.preventDefault(); kickOffIRODSUpload(iRODSStudyName)">
                    {{ iRODSStudyName }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-8 col-md-offset-2">
            <span class="status" *ngIf="iRODSStatus">Status: {{ iRODSStatus }}</span>
          </div>
        </div>

        <h1>OR...</h1>

        <h2>Step 1b: Upload a .zip archive in ISAtab format from this computer</h2>
        <div [class.disabled]="uploadFileChooserDisabled">
          <div ng2FileDrop
               [ngClass]="{'nv-file-over': hasBaseDropZoneOver}"
               (fileOver)="fileOverBase($event)"
               [uploader]="uploader"
               class="well my-drop-zone"
               style="display: inline-block">
            Drag a file here
          </div>
          or select a file here: <input type="file" ng2FileSelect [uploader]="uploader"
                                        [disabled]="uploadFileChooserDisabled"/>
        </div>
        <p>
          <b>File to upload: </b>{{ uploadFileName }}
        </p>
        <div>
          Then click here:
          <button type="button" (click)="doUpload()" [disabled]="!uploader.getNotUploadedItems().length">Upload</button>
          <div>
            Progress:
            <div class="w3-progress-container">
              <div class="w3-progressbar" role="progressbar" [ngStyle]="{ 'width': progress + '%' }"></div>
            </div>
            <span class="status" *ngIf="status">Status: {{ status }}</span>
          </div>
        </div>
      </div>

      <div [class.hidden]="step !== 2">
        <h2>Step 2: Enter metadata</h2>

        <h3>Study Metadata</h3>
        <div class="form-inline">
          <div class="row">
            <div class="form-group col-sm-5 col-sm-offset-1">
              <label for="studyPublicationDate">Publication Date</label>
              <input type="text" id="studyPublicationDate" [(ngModel)]="studyPublicationDate" class="form-control">
            </div>
          </div>

          <div class="row">
            <div class="checkbox col-sm-5 col-sm-offset-1">
              <label for="studyInitiallyVisible">
                <input type="checkbox" id="studyInitiallyVisible" [(ngModel)]="studyInitiallyVisible">
                Visible
              </label>
            </div>
          </div>
        </div>

        <h3>New Fields</h3>

        <div *ngIf="!unknownFields">
          No new fields in this study
        </div>

        <div *ngIf="unknownFields">
          <cbit-field-metadata-form [fieldNames]="unknownFields" [fieldAnalyses]="fieldAnalyses"
                                    (form)="fieldMetadataForm = $event"></cbit-field-metadata-form>
        </div>

        <button type="button" [disabled]='uploadConfirmationSent' (click)="doConfirmMetadata()">
          {{ confirmMetadataButtonName }}
        </button>
      </div>

      <div *ngIf="step === 3">
        <h2>Upload succeeded!</h2>
        <study [studyId]="upload_uuid" [showTitle]="true"></study>
      </div>

      <div *ngIf="step === 4">
        <h2>Upload failed!</h2>
        <div class="alert alert-danger">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
})
export class UploadPage implements OnInit {

  public uploader: MyFileUploader;
  public hasBaseDropZoneOver = false;
  uploadFileName = '<None>';
  status = '';
  progress = 0;
  uploadFileChooserDisabled = false;
  step = 1;
  upload_uuid = '';
  confirm_upload_url = '';
  confirmMetadataButtonName = 'Confirm Upload';
  uploadConfirmationSent = false;
  fieldNames: string[] = [];
  knownFields: { [fieldName: string]: FieldMeta } = {};
  unknownFields: string[] = [];
  fieldAnalyses: { [fieldName: string]: FieldAnalysisResults } = {};
  fieldMetadataForm: FormGroup;
  errorMessage = '';

  iRODSListReady = false;
  iRODSStudyNames: string[] = [];
  iRODSStatus = '';

  studyPublicationDate: string = (new Date()).toISOString().substring(0, 10);  // YYYY-MM-DD
  studyInitiallyVisible = true;

  constructor(private _url: URLService,
              private _router: Router,
              private _auth: AuthenticationService,
              private httpGatewayService: HttpGatewayService,
              private changeDetectorRef: ChangeDetectorRef) {
    this.uploader = new MyFileUploader(this, {
      url: this._url.uploadsResource(),
      method: 'POST',
      queueLimit: 1,
      disableMultipart: true,  // Send the file body directly as request body, don't wrap it in any way
      authToken: this._auth.getAuthorizationHeader()
    });
  }

  ngOnInit() {
    const onError = (err, caught) => {
      this.iRODSStatus = `Failed to get list of studies from iRODS: ${err}!`;
      this.iRODSListReady = true;
      this.changeDetectorRef.detectChanges();
      return Observable.of(null);
    };

    this.httpGatewayService.get(this._url.iRODSListResource(), onError).subscribe((iRODSList: string[]) => {
      this.iRODSStudyNames = iRODSList;
      this.iRODSListReady = true;
      this.changeDetectorRef.detectChanges();
    });

    /* $.ajax({
       type: 'GET',
       url: this._url.iRODSListResource(),
       headers: this._auth.headers(),
       dataType: 'json',
       success: (iRODSList: string[]) => {
         this.iRODSStudyNames = iRODSList;
       },
       error: (jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) => {
         this.iRODSStatus = `Failed to get list of studies from iRODS: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}!`;
       },
       complete: () => {
         this.iRODSListReady = true;
         this.changeDetectorRef.detectChanges();
       }
     });*/
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  onFileAdded(filename: string): void {
    this.uploadFileName = filename;
    this.changeDetectorRef.detectChanges();
  }

  doUpload(): void {
    this.uploadFileChooserDisabled = true;
    this.uploader.uploadAll();
  }

  onUploadProgress(progress: any): void {
    this.progress = progress;
    if (progress < 100) {
      this.status = 'Uploading...';
    } else {
      this.status = 'Validating file contents...';
    }
    this.changeDetectorRef.detectChanges();
  }

  withoutStar(s: string): string {
    if (s.substr(0, 1) === '*') {
      return s.substr(1);
    } else {
      return s;
    }
  }

  kickOffIRODSUpload(iRODSStudyName: string) {
    this.iRODSStatus = 'Working on it (this can take quite a while!)...';

    const onError = (err, caught) => {
      this.step = 4;
      this.errorMessage = `iRODS upload failed: ${err}!`;
      this.iRODSListReady = true;
      this.changeDetectorRef.detectChanges();
      return Observable.of(null);
    };

    this.httpGatewayService.post(this._url.uploadsIRODSResource(iRODSStudyName), {}, onError).subscribe((uploadsResponse: UploadsResponse) => {
      this.proceedToUploadsStep2(uploadsResponse);
      this.iRODSListReady = true;
      this.changeDetectorRef.detectChanges();
    });

    /* $.ajax({
       type: 'POST',
       url: this._url.uploadsIRODSResource(iRODSStudyName),
       headers: this._auth.headers(),
       dataType: 'json',
       success: (uploadsResponse: UploadsResponse) => {
         this.proceedToUploadsStep2(uploadsResponse);
       },
       error: (jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) => {
         this.step = 4;
         this.errorMessage = `iRODS upload failed: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}!`;
       },
       complete: () => {
         this.iRODSListReady = true;
         this.changeDetectorRef.detectChanges();
       }
     });*/
  }

  onUploadSuccess(response: string, status: number, headers: ParsedResponseHeaders): void {
    const jResponse: UploadsResponse = JSON.parse(response);
    this.proceedToUploadsStep2(jResponse);
  }

  proceedToUploadsStep2(jResponse: UploadsResponse) {
    this.upload_uuid = jResponse.upload_uuid;
    this.confirm_upload_url = jResponse.location;
    this.fieldNames = jResponse.fieldNames;
    this.knownFields = jResponse.knownFields;
    this.unknownFields = jResponse.unknownFields.sort(
      (a: string, b: string) => this.withoutStar(a).localeCompare(this.withoutStar(b))
    ); // .filter((a: string) => a.substr(0, 1) !== '*');
    this.fieldAnalyses = {};
    for (const fieldAnalysis of jResponse.fieldAnalyses) {
      this.fieldAnalyses[fieldAnalysis.fieldName] = fieldAnalysis;
    }

    // Reject archives with invalid units
    const fieldsWithUnrecognizedUnits: string[] = [];
    for (const fieldName in this.fieldAnalyses) {
      const fieldAnalysis = this.fieldAnalyses[fieldName];
      if (fieldAnalysis.possibleDimensions.length === 1 && fieldAnalysis.possibleDimensions[0] === INVALID_DIMENSIONS) {
        fieldsWithUnrecognizedUnits.push(fieldName);
      }
    }
    if (fieldsWithUnrecognizedUnits.length > 0) {
      this.step = 4;
      this.errorMessage = `The following fields have unrecognized units: ${JSON.stringify(fieldsWithUnrecognizedUnits)}`;
      return;
    }

    // Otherwise, move onto next step
    this.step = 2;
  }

  onUploadFailure(response: string, status: number, headers: ParsedResponseHeaders): void {
    this.step = 4;
    this.errorMessage = `[Technical details: status=${status}, response='${response}'`;
  }

  doConfirmMetadata() {
    const that = this;
    const newFieldMetadata = Object.values(this.fieldMetadataForm.value);
    let metadataInsertionPromise: Promise<any>;
    if (!newFieldMetadata || newFieldMetadata.length === 0) {
      metadataInsertionPromise = Promise.resolve([]);
    } else {
      metadataInsertionPromise = new Promise((resolve, reject) => {
        const onError = (err, caught) => {
          that.errorMessage = `Failed to create new fields: ${err}!`;
          that.step = 4;
          that.changeDetectorRef.detectChanges();
          reject();
          return Observable.of(null);
        };

        this.httpGatewayService.put(that._url.metadataFieldsMultiResource(), JSON.stringify(newFieldMetadata), onError).subscribe(() => {
          resolve();
        });

        /* $.ajax({
           type: 'PUT',
           url: that._url.metadataFieldsMultiResource(),
           headers: that._auth.headers(),
           data: JSON.stringify(newFieldMetadata),
           dataType: 'json',
           success: function (response) {
             resolve();
           },
           error: function (jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) {
             that.errorMessage = `Failed to create new fields: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}!`;
             that.step = 4;
             that.changeDetectorRef.detectChanges();
             reject();
           }
         });*/
      });
    }

    metadataInsertionPromise.then(() => {
      const authHeaderContent = this._auth.getAuthorizationHeader();
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': authHeaderContent
      });

      const onError = (err, caught) => {
        that.errorMessage = `Details ${err}`;
        that.step = 4;
        that.changeDetectorRef.detectChanges();
        return Observable.of(null);
      };

      this.httpGatewayService.put(this.confirm_upload_url, JSON.stringify({
        publicationDate: that.studyPublicationDate,
        visible: that.studyInitiallyVisible
      }), onError, headers).subscribe(() => {
        that.step = 3;
        that.changeDetectorRef.detectChanges();
      });

      /* $.ajax({
         type: 'PUT',
         url: this.confirm_upload_url,
         headers: this._auth.headers(),
         data: JSON.stringify({
           publicationDate: that.studyPublicationDate,
           visible: that.studyInitiallyVisible
         }),
         dataType: 'json',
         contentType: 'text/plain',  // TODO: Use JSON when sending metadata confirmations
         success: function (data: any, textStatus: string, jqXHR: XMLHttpRequest) {
           that.step = 3;
           that.changeDetectorRef.detectChanges();
         },
         error: function (jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) {
           that.errorMessage = `Details ${JSON.stringify({textStatus, errorThrown})}`;
           that.step = 4;
           that.changeDetectorRef.detectChanges();
         },
       });*/
    });

    this.confirmMetadataButtonName = 'Confirming Upload...';
    this.uploadConfirmationSent = true;
  }
}

class MyFileUploader extends FileUploader {
  constructor(private component: UploadPage, options: FileUploaderOptions) {
    super(options);
  }

  onAfterAddingFile(fileItem: any /*FileItem*/): any {
    // Pass credentials even through cross-site requests
    fileItem.withCredentials = true;
    this.component.onFileAdded(fileItem.file.name);
  }

  onProgressAll(progress: any) {
    this.component.onUploadProgress(progress);
  }

  onSuccessItem(item: any /*FileItem*/, response: string, status: number, headers: ParsedResponseHeaders): any {
    this.component.onUploadSuccess(response, status, headers);
  }

  onErrorItem(item: any /*FileItem*/, response: string, status: number, headers: ParsedResponseHeaders): any {
    this.component.onUploadFailure(response, status, headers);
  }

  onCancelItem(item: any /*FileItem*/, response: string, status: number, headers: ParsedResponseHeaders): any {
    this.component.onUploadFailure(response, status, headers);
  }
}
