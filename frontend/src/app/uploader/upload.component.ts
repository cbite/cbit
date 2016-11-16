import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Router} from "@angular/router";
import {
  FileUploader, FileSelectDirective, FileDropDirective,
  ParsedResponseHeaders, FileUploaderOptions
} from 'ng2-file-upload/ng2-file-upload';
//import { FileItem } from 'ng2-file-upload/components/file-upload/file-item.class'
import * as $ from 'jquery';

// Heavily adapted from here:
// http://valor-software.com/ng2-file-upload/

const URL = 'http://localhost:23456/uploads';

interface UploadsResponse {
  upload_uuid: string,
  status: string,
  location: string
}

@Component({
  template: `
  <h1>Upload New Study</h1>
  
  <div [class.hidden]="step !== 1">
    <h2>Step 1: Upload a .zip archive in ISAtab format</h2>
    <div [class.disabled]="uploadFileChooserDisabled">
      <div ng2FileDrop
           [ngClass]="{'nv-file-over': hasBaseDropZoneOver}"
           (fileOver)="fileOverBase($event)"
           [uploader]="uploader"
           class="well my-drop-zone"
           style="display: inline-block">
           Drag a file here
      </div>
      or select a file here: <input type="file" ng2FileSelect [uploader]="uploader" [disabled]="uploadFileChooserDisabled"/>
    </div>
    <p>
      <b>File to upload: </b>{{ uploadFileName }}
    </p>
    <div>
      Then click here: <button type="button" (click)="doUpload()" [disabled]="!uploader.getNotUploadedItems().length">Upload</button>
      <div>
        Progress:
        <div class="w3-progress-container">
          <div class="w3-progressbar" role="progressbar" [ngStyle]="{ 'width': progress + '%' }"></div>
        </div>
        <span *ngIf="status">Status: {{ status }}</span>
      </div>
    </div>
  </div>
  
  <div [class.hidden]="step !== 2">
    <h2>Step 2: Confirm metadata typings</h2>
    <p>Upload UUID: <code>{{ upload_uuid }}</code></p>
    <p><i>TODO!  For now, all data is encoded as strings</i></p>
    <button type="button" [disabled]='uploadConfirmationSent' (click)="doConfirmMetadata()">{{ confirmMetadataButtonName }}</button>
  </div>
  `,

  // Adapted from W3.css for prototype (http://www.w3schools.com/w3css/default.asp)
  // ...and from Bootstrap
  // ...and from the ng2-file-uploader example
  styles: [`
    .well{min-height:20px;padding:19px;margin-bottom:20px;background-color:#f5f5f5;border:1px solid #e3e3e3;border-radius:4px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.05);box-shadow:inset 0 1px 1px rgba(0,0,0,.05)}
    .my-drop-zone { border: dotted 3px lightgray; }
    .nv-file-over { border: dotted 3px red; } /* Default class applied to drop zones on over */
    .w3-progress-container{width:200px;height:1.5em;position:relative;background-color:#f1f1f1;display:inline-block}
    .w3-progressbar{background-color:#757575;height:100%;position:absolute;line-height:inherit}
    .disabled { color: rgb(128, 128, 128) }
    .disabled .well { background-color:#fcfcfc }
    .hidden { display: none }
  `]
})
export class UploadComponent {

  public uploader: MyFileUploader = new MyFileUploader(this, {
    url: URL,
    method: 'POST',
    queueLimit: 1,
    disableMultipart: true  // Send the file body directly as request body, don't wrap it in any way
  });
  public hasBaseDropZoneOver: boolean = false;
  uploadFileName: string = "<None>"
  status = '';
  progress = 0;
  uploadFileChooserDisabled = false;
  step = 1;
  upload_uuid = '';
  confirm_upload_url = '';
  confirmMetadataButtonName = 'Confirm Upload';
  uploadConfirmationSent = false;

  constructor(
    private _router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  fileOverBase(e:any):void {
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
    this.changeDetectorRef.detectChanges();
  }

  onUploadSuccess(response: string, status: number, headers: ParsedResponseHeaders): void {
    let jResponse: UploadsResponse = JSON.parse(response);
    this.upload_uuid = jResponse.upload_uuid;
    this.confirm_upload_url = jResponse.location;
    this.step = 2;
  }

  onUploadFailure(response: string, status: number, headers: ParsedResponseHeaders): void {
    this.status = `Upload failed!  [Technical details: status=${status}, response='${response}'`;
  }

  doConfirmMetadata() {
    let that = this;
    $.ajax({
      type: 'PUT',
      url: this.confirm_upload_url,
      contentType: 'text/plain',  // TODO: Use JSON when sending metadata confirmations
      error: function(jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) {
        that.status = `Confirmation Error!  Details ${JSON.stringify({textStatus, errorThrown})}`;
        that.changeDetectorRef.detectChanges();
      },
      success: function(data:any, textStatus:string, jqXHR: XMLHttpRequest) {
        that._router.navigate(['/study', that.upload_uuid]);
      }
    });

    this.confirmMetadataButtonName = "Confirming Upload...";
    this.uploadConfirmationSent = true;
  }
}

class MyFileUploader extends FileUploader {
  constructor(private component: UploadComponent, options: FileUploaderOptions) {
    super(options);
  }

  onAfterAddingFile(fileItem:any /*FileItem*/): any {
    this.component.onFileAdded(fileItem.file.name);
  }

  onProgressAll(progress:any) {
    this.component.onUploadProgress(progress);
  }

  onSuccessItem(item:any /*FileItem*/, response:string, status:number, headers:ParsedResponseHeaders):any {
    this.component.onUploadSuccess(response, status, headers);
  }

  onErrorItem(item:any /*FileItem*/, response:string, status:number, headers:ParsedResponseHeaders):any {
    this.component.onUploadFailure(response, status, headers);
  }

  onCancelItem(item:any /*FileItem*/, response:string, status:number, headers:ParsedResponseHeaders):any {
    this.component.onUploadFailure(response, status, headers);
  }
}
