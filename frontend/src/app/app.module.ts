import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { FormsModule }         from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { CBiTComponent }   from './cbit.component';
import {StudyComponent}   from "./study/study.component";
import {WelcomeComponent} from "./welcome.component";
import {BrowserComponent} from "./browser.component";
import {DownloadComponent} from "./download.component";
import {UploadComponent} from "./uploader/upload.component";
import {AppRoutingModule} from "./app-routing.module";
import {FilterSidebarComponent} from "./filters/filter-sidebar.component";
import {MapToIterablePipe} from "./common/mapToIterable.pipe";
import {SampleFiltersComponent} from "./filters/sample-filters.component";
import {PubmedLinksComponent} from "./study/pubmed-links.component";
import {DOILinksComponent} from "./study/doi-links.component";

import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload/ng2-file-upload';
import {NavBarComponent} from "./navbar.component";
import {CollapseDirective} from "./common/collapse.directive";


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  declarations: [
    CBiTComponent,
    NavBarComponent,
    WelcomeComponent,
    BrowserComponent,
    DownloadComponent,
    UploadComponent,
    PubmedLinksComponent,
    DOILinksComponent,
    FilterSidebarComponent,
    SampleFiltersComponent,
    StudyComponent,
    MapToIterablePipe,
    FileSelectDirective,
    FileDropDirective,
    CollapseDirective
  ],
  bootstrap: [ CBiTComponent ]
})
export class AppModule { }
