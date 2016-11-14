import {Component, OnInit} from '@angular/core';
import {
  FileUploader, FileSelectDirective, FileDropDirective,
  ParsedResponseHeaders
} from 'ng2-file-upload/ng2-file-upload';
//import { FileItem } from 'ng2-file-upload/components/file-upload/file-item.class'

// Heavily adapted from here:
// http://valor-software.com/ng2-file-upload/

const URL = 'http://localhost:23456/api';

@Component({
  template: `
  <h1>Upload New Study</h1>
  
  <h2>Step 1: Upload a .zip archive in ISAtab format</h2>
  <div ng2FileDrop
       [ngClass]="{'nv-file-over': hasBaseDropZoneOver}"
       (fileOver)="fileOverBase($event)"
       [uploader]="uploader"
       class="well my-drop-zone">
       Drag a file here
  </div>
  or select a file here: <input type="file" ng2FileSelect [uploader]="uploader"/>
  <br/>
  Then click here: <button type="button" (click)="uploader.uploadAll()" [disabled]="!uploader.getNotUploadedItems().length">Upload</button>
  <div>
    Progress:
    <div class="w3-progress-container">
      <div class="w3-progressbar" role="progressbar" [ngStyle]="{ 'width': uploader.progress + '%' }"></div>
    </div>
    Status: {{ status }}
  </div>
  `,

  // Adapted from W3.css for prototype (http://www.w3schools.com/w3css/default.asp)
  // ...and from Bootstrap
  // ...and from the ng2-file-uploader example
  styles: [`
    .well{min-height:20px;padding:19px;margin-bottom:20px;background-color:#f5f5f5;border:1px solid #e3e3e3;border-radius:4px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.05);box-shadow:inset 0 1px 1px rgba(0,0,0,.05)}
    .my-drop-zone { border: dotted 3px lightgray; }
    .nv-file-over { border: dotted 3px red; } /* Default class applied to drop zones on over */
    .w3-progress-container{width:100%;height:1.5em;position:relative;background-color:#f1f1f1}
    .w3-progressbar{background-color:#757575;height:100%;position:absolute;line-height:inherit}
  `]
  //,
  //directives: [FileSelectDirective, FileDropDirective]
})
export class UploadComponent implements OnInit {
  public uploader: FileUploader = new FileUploader({url: URL});
  public hasBaseDropZoneOver: boolean = false;
  status = 'Waiting for upload...';

  ngOnInit() {
    this.uploader.onSuccessItem = function(item:any /*FileItem*/, response:string, status:number, headers:ParsedResponseHeaders):any {
      this.status = `Success: ${item.file.name}`;
    }

    this.uploader.onErrorItem = function(item:any /*FileItem*/, response:string, status:number, headers:ParsedResponseHeaders):any {
      this.status = `Error: ${item.file.name}`;
    }

    this.uploader.onCancelItem = function(item:any /*FileItem*/, response:string, status:number, headers:ParsedResponseHeaders):any {
      this.status = `Cancel: ${item.file.name}`;
    }

    this.uploader.
  }

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }
}
