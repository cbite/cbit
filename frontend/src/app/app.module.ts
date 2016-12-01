import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { FormsModule }         from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { CBiTComponent }   from './cbit.component';
import {StudyComponent}   from "./study/study.component";
import {WelcomeComponent} from "./welcome.component";
import {BrowserComponent} from "./browser.component";
import {DownloadComponent} from "./download.component";
import {UploadComponent, FieldMetadataFormComponent} from "./uploader/upload.component";
import {AppRoutingModule} from "./app-routing.module";
import {
  FilterSidebarComponent, FilterSidebarCategoryComponent,
  FilterSidebarAllULComponent
} from "./filters/filter-sidebar.component";
import {MapToIterablePipe} from "./common/mapToIterable.pipe";
import {SampleFiltersComponent} from "./filters/sample-filters.component";
import {PubmedLinksDirective} from "./study/pubmed-link.directive";
import {DOILinkDirective} from "./study/doi-link.directive";

import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload/ng2-file-upload';
import {NavBarComponent} from "./navbar.component";
import {CollapseDirective} from "./common/collapse.directive";
import {SpinnerComponent} from "./common/spinner.component";
import {SelectionIndicatorComponent} from "./selection-indicator.component";
import {DropdownDirective} from "./common/dropdown.directive";
import {DropdownMenuDirective} from "./common/dropdown-menu.directive";
import {DropdownToggleDirective} from "./common/dropdown-toggle.directive";
import {ModalModule, TooltipDirective, TooltipModule} from "ng2-bootstrap";


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ModalModule,
    TooltipModule
  ],
  declarations: [
    CBiTComponent,
    NavBarComponent,
    WelcomeComponent,
    BrowserComponent,
    DownloadComponent,
    UploadComponent,
    FieldMetadataFormComponent,
    PubmedLinksDirective,
    DOILinkDirective,
    FilterSidebarComponent,
    FilterSidebarCategoryComponent,
    FilterSidebarAllULComponent,
    SampleFiltersComponent,
    StudyComponent,
    MapToIterablePipe,
    FileSelectDirective,
    FileDropDirective,
    CollapseDirective,
    SpinnerComponent,
    SelectionIndicatorComponent,
    DropdownDirective,
    DropdownMenuDirective,
    DropdownToggleDirective
  ],
  bootstrap: [ CBiTComponent ]
})
export class AppModule { }
