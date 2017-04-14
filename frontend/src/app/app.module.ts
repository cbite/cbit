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
import {ModalModule} from "ngx-bootstrap";
import {MetadataComponent, FieldMetadataEditorComponent} from "./metadata.component";
import {StudyMetadataEditorComponent, StudyManagementComponent} from "./study-management.component";
import {LoginComponent} from "./login.component";
import {ChangePasswordComponent} from "./change-password.component";
import {UserManagementComponent, UserEditorComponent, AddUserComponent} from "./user-management.component";
import {Ng2SliderComponent} from "./slider/ng2-slider.component";
import {HorizontallySlidableDirective} from "./slider/horizontally-slidable.directive";
import {AboutComponent, FAQQuestionComponent} from "./about.component";
import {
  AllFieldsComponent, AllFieldsForVisibilityComponent,
  AllFieldsForVisibilityCategoryComponent
} from "./all-fields.component";
import {StudyRedirectComponent} from "./study-redirect.component";
import {TooltipContainer} from "./common/tooltip-container.component";
import {MyTooltipDirective} from "./common/my-tooltip.directive";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ModalModule.forRoot()
  ],
  declarations: [
    CBiTComponent,
    NavBarComponent,
    LoginComponent,
    ChangePasswordComponent,
    UserManagementComponent,
    UserEditorComponent,
    AddUserComponent,
    WelcomeComponent,
    AboutComponent,
    FAQQuestionComponent,
    BrowserComponent,
    DownloadComponent,
    UploadComponent,
    FieldMetadataFormComponent,
    MetadataComponent,
    FieldMetadataEditorComponent,
    StudyManagementComponent,
    StudyMetadataEditorComponent,
    PubmedLinksDirective,
    DOILinkDirective,
    FilterSidebarComponent,
    AllFieldsComponent,
    AllFieldsForVisibilityComponent,
    AllFieldsForVisibilityCategoryComponent,
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
    DropdownToggleDirective,
    StudyRedirectComponent,

    Ng2SliderComponent,
    HorizontallySlidableDirective,

    TooltipContainer,
    MyTooltipDirective
  ],
  bootstrap: [ CBiTComponent ]
})
export class AppModule { }
