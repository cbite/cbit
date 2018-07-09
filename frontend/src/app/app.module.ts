import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';

import {StudyComponent} from './pages/studies/components/study/study.component';
import {DownloadComponent} from './common/components/download.component';
import {UploadComponent, FieldMetadataFormComponent} from './common/uploader/upload.component';
import {AppRoutingModule} from './router/routing.module';
import {FilterSidebarComponent} from './pages/browser/components/filters/filter-sidebar.component';
import {MapToIterablePipe} from './common/mapToIterable.pipe';
import {SampleFiltersComponent} from './pages/browser/components/filters/sample-filters.component';
import {PubmedLinksDirective} from './pages/studies/components/study/pubmed-link.directive';
import {DOILinkDirective} from './pages/studies/components/study/doi-link.directive';

import {FileSelectDirective, FileDropDirective} from 'ng2-file-upload/ng2-file-upload';
import {CollapseDirective} from './common/collapse.directive';
import {SpinnerComponent} from './common/spinner.component';
import {SelectionIndicatorComponent} from './core/components/app-header/selection-indicator.component';
import {DropdownDirective} from './common/dropdown.directive';
import {DropdownMenuDirective} from './common/dropdown-menu.directive';
import {MetadataComponent, FieldMetadataEditorComponent} from './pages/metadata/metadata.component';
import {StudyMetadataEditorComponent, StudyManagementComponent} from './pages/studies/study-management.component';
import {ChangePasswordComponent} from './common/components/change-password.component';
import {UserManagementComponent} from './pages/user-management/user-management.component';
import {Ng2SliderComponent} from './common/slider/ng2-slider.component';
import {HorizontallySlidableDirective} from './common/slider/horizontally-slidable.directive';
import {
  AllFieldsComponent, AllFieldsForVisibilityComponent,
  AllFieldsForVisibilityCategoryComponent
} from './pages/browser/components/all-fields.component';
import {StudyRedirectComponent} from './pages/studies/study-redirect.component';
import {TooltipContainer} from './common/tooltip-container.component';
import {MyTooltipDirective} from './common/my-tooltip.directive';
import {TooltipService} from './services/tooltip.service';
import {UnitFormattingService} from './services/unit-formatting.service';
import {CollapseStateService} from './services/collapse-state.service';
import {AuthenticationService} from './core/authentication/authentication.service';
import {DownloadSelectionService} from './services/download-selection.service';
import {FiltersService} from './services/filters.service';
import {StudyService} from './services/study.service';
import {URLService} from './services/url.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {UserEditorComponent} from './pages/user-management/user-editor.component';
import {AddUserComponent} from './pages/user-management/add-user.component';
import {FilterSidebarAllULComponent} from './pages/browser/components/filters/filter-sidebar-all-ul.component';
import {FilterSidebarCategoryComponent} from './pages/browser/components/filters/filter-sidebar-category.component';
import {WelcomePage} from './pages/welcome/welcome.page';
import {AboutPage} from './pages/about/about.page';
import {FAQPage} from './pages/faq/faq.page';
import {FAQQuestionComponent} from './pages/faq/components/faq-question.component';
import {BrowserPage} from './pages/browser/browser.page';
import {AppComponent} from './app.component';
import {AppHeaderComponent} from './core/components/app-header/app-header.component';
import {AppFooterComponent} from './core/components/app-footer/app-footer.component';
import {LoginPopupComponent} from './popups/login/login-popup.component';
import {PopupService} from './services/popup.service';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {BusyIndicatorService} from './services/busy-indicator.service';
import {HttpGatewayService} from './services/http-gateway.service';
import {StudyResultsComponent} from './pages/browser/components/study-results/study-results.component';
import {StudyResultComponent} from './pages/browser/components/study-results/study-result.component';
import {StoreModule} from '@ngrx/store';
import {reducers} from './core/redux/reducers/index';
import {AppHeaderMenuComponent} from './core/components/app-header/app-header-menu.component';

@NgModule(
  {
    imports: [
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      AppRoutingModule,
      StoreModule.forRoot(reducers),
      HttpClientModule,
      CommonModule,
      NgbModule.forRoot()
    ],
    declarations: [
      AppComponent,
      AppHeaderComponent,
      AppHeaderMenuComponent,
      AppFooterComponent,
      ChangePasswordComponent,
      UserManagementComponent,
      UserEditorComponent,
      AddUserComponent,
      WelcomePage,
      AboutPage,
      FAQPage,
      FAQQuestionComponent,
      BrowserPage,
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
      LoginPopupComponent,
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
      StudyResultsComponent,
      StudyResultComponent,
      SelectionIndicatorComponent,
      DropdownDirective,
      DropdownMenuDirective,
      StudyRedirectComponent,
      Ng2SliderComponent,
      HorizontallySlidableDirective,
      TooltipContainer,
      MyTooltipDirective
    ],
    entryComponents: [
      LoginPopupComponent
    ],
    providers: [
      URLService,
      StudyService,
      FiltersService,
      DownloadSelectionService,
      BusyIndicatorService,
      HttpGatewayService,
      AuthenticationService,
      CollapseStateService,
      UnitFormattingService,
      TooltipService,
      PopupService
    ],
    bootstrap: [AppComponent]
  })
export class AppModule {
}
