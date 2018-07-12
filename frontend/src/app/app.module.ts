import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';

import {StudyComponent} from './pages/upload/components/study.component';
import {AppRoutingModule} from './router/routing.module';
import {BrowserSidebarComponent} from './pages/browser/components/browser-sidebar/browser-sidebar.component';
import {MapToIterablePipe} from './common/mapToIterable.pipe';
import {SampleFiltersComponent} from './pages/browser/components/filters/sample-filters.component';
import {FileSelectDirective, FileDropDirective} from 'ng2-file-upload/ng2-file-upload';
import {CollapseDirective} from './common/collapse.directive';
import {SpinnerComponent} from './common/spinner.component';
import {DropdownDirective} from './common/dropdown.directive';
import {DropdownMenuDirective} from './common/dropdown-menu.directive';
import {Ng2SliderComponent} from './common/slider/ng2-slider.component';
import {HorizontallySlidableDirective} from './common/slider/horizontally-slidable.directive';
import {StudyRedirectComponent} from './pages/study-management/study-redirect.component';
import {TooltipContainer} from './common/tooltip-container.component';
import {MyTooltipDirective} from './common/my-tooltip.directive';
import {TooltipService} from './services/tooltip.service';
import {UnitFormattingService} from './services/unit-formatting.service';
import {CollapseStateService} from './core/services/collapse-state.service';
import {AuthenticationService} from './core/authentication/authentication.service';
import {FiltersService} from './pages/browser/services/filters.service';
import {StudyService} from './core/services/study.service';
import {URLService} from './core/services/url.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {UserEditorComponent} from './pages/user-management/components/user-editor.component';
import {AddUserComponent} from './popups/add-user/add-user.component';
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
import {PopupService} from './core/services/popup.service';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {BusyIndicatorService} from './core/services/busy-indicator.service';
import {HttpGatewayService} from './core/services/http-gateway.service';
import {StudyResultsComponent} from './pages/browser/components/study-results/study-results.component';
import {StudyResultComponent} from './pages/browser/components/study-results/study-result.component';
import {StoreModule} from '@ngrx/store';
import {reducers} from './core/redux/reducers/index';
import {AppHeaderMenuComponent} from './core/components/app-header/app-header-menu.component';
import {UploadPage} from './pages/upload/upload.page';
import {FieldMetadataFormComponent} from './pages/upload/components/FieldMetadataFormComponent';
import {UserManagementPage} from './pages/user-management/user-management.page';
import {MetadataPage} from './pages/metadata/metadata.page';
import {FieldMetadataEditorComponent} from './pages/metadata/components/FieldMetadataEditorComponent';
import {StudyMetadataEditorComponent} from './pages/study-management/components/study-mentadata-editor.component';
import {FieldMetaService} from './core/services/field-meta.service';
import {ChangePasswordComponent} from './popups/change-password/change-password.component';
import {StudyManagementComponent} from './pages/study-management/study-management.component';
import {ConfirmationComponent} from './popups/confirmation/confirmation.component';
import {SplitByTwoPipe} from './shared/pipes/split-by-two-pipe';
import {WindowRef} from './shared/util/WindowRef';
import {StudyDetailsComponent} from './pages/browser/popups/study-details/study-details.component';
import {PropertiesDescriptionComponent} from './pages/browser/popups/properties-description/properties-description.component';
import {AllFieldsForVisibilityComponent} from './pages/browser/popups/properties-description/properties-visibility.component';
import {AllFieldsForVisibilityCategoryComponent} from './pages/browser/popups/properties-description/properties-visibility-category.component';
import {StudyCategoryComponent} from './pages/browser/popups/study-details/study-category.component';
import {CommonPropertiesComponent} from './pages/browser/popups/study-details/common-properties.component';
import {DistinguishingPropertiesComponent} from './pages/browser/popups/study-details/distinguishing-properties.component';
import {DateFormatPipe} from './shared/pipes/date-format-pipe';
import {ManageTendonsStudiesComponent} from './pages/tendons/manage-tendons-studies.component';
import {TendonsStudyService} from './core/services/tendons-study.service';
import {TendonsStudyComponent} from './pages/tendons/tendons-study.component';
import {TendonsStudiesComponent} from './pages/tendons/tendons-studies.component';
import {PeoplePage} from './pages/people/people.page';
import {PersonComponent} from './pages/people/components/person.component';

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
      UserManagementPage,
      UserEditorComponent,
      AddUserComponent,
      WelcomePage,
      AboutPage,
      FAQPage,
      FAQQuestionComponent,
      PropertiesDescriptionComponent,
      BrowserPage,
      SplitByTwoPipe,
      UploadPage,
      FieldMetadataFormComponent,
      MetadataPage,
      FieldMetadataEditorComponent,
      StudyManagementComponent,
      StudyMetadataEditorComponent,
      BrowserSidebarComponent,
      LoginPopupComponent,
      AllFieldsForVisibilityComponent,
      AllFieldsForVisibilityCategoryComponent,
      FilterSidebarCategoryComponent,
      FilterSidebarAllULComponent,
      SampleFiltersComponent,
      StudyComponent,
      MapToIterablePipe,
      StudyDetailsComponent,
      FileSelectDirective,
      FileDropDirective,
      CollapseDirective,
      SpinnerComponent,
      StudyResultsComponent,
      StudyResultComponent,
      PersonComponent,
      DropdownDirective,
      DropdownMenuDirective,
      StudyRedirectComponent,
      PeoplePage,
      StudyCategoryComponent,
      CommonPropertiesComponent,
      DistinguishingPropertiesComponent,
      Ng2SliderComponent,
      HorizontallySlidableDirective,
      TooltipContainer,
      DateFormatPipe,
      MyTooltipDirective,
      ConfirmationComponent,
      ManageTendonsStudiesComponent,
      TendonsStudyComponent,
      TendonsStudiesComponent
    ],
    entryComponents: [
      LoginPopupComponent,
      AddUserComponent,
      ChangePasswordComponent,
      StudyDetailsComponent,
      ConfirmationComponent,
      PropertiesDescriptionComponent
    ],
    providers: [
      URLService,
      StudyService,
      FiltersService,
      BusyIndicatorService,
      HttpGatewayService,
      AuthenticationService,
      FieldMetaService,
      CollapseStateService,
      UnitFormattingService,
      TooltipService,
      PopupService,
      WindowRef,
      TendonsStudyService
    ],
    bootstrap: [AppComponent]
  })
export class AppModule {
}
