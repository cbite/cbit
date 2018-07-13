import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';

import {StudyComponent} from './pages/biomaterial/upload/components/study.component';
import {AppRoutingModule} from './router/routing.module';
import {BrowserSidebarComponent} from './pages/biomaterial/browse/components/browser-sidebar/browser-sidebar.component';
import {MapToIterablePipe} from './common/mapToIterable.pipe';
import {SampleFiltersComponent} from './pages/biomaterial/browse/components/filters/sample-filters.component';
import {FileSelectDirective, FileDropDirective} from 'ng2-file-upload/ng2-file-upload';
import {CollapseDirective} from './common/collapse.directive';
import {SpinnerComponent} from './common/spinner.component';
import {DropdownDirective} from './common/dropdown.directive';
import {DropdownMenuDirective} from './common/dropdown-menu.directive';
import {Ng2SliderComponent} from './common/slider/ng2-slider.component';
import {HorizontallySlidableDirective} from './common/slider/horizontally-slidable.directive';
import {StudyRedirectComponent} from './pages/biomaterial/management/study-redirect.component';
import {TooltipContainer} from './common/tooltip-container.component';
import {MyTooltipDirective} from './common/my-tooltip.directive';
import {TooltipService} from './services/tooltip.service';
import {UnitFormattingService} from './services/unit-formatting.service';
import {CollapseStateService} from './core/services/collapse-state.service';
import {AuthenticationService} from './core/authentication/authentication.service';
import {FiltersService} from './pages/biomaterial/browse/services/filters.service';
import {StudyService} from './core/services/study.service';
import {URLService} from './core/services/url.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {UserEditorComponent} from './pages/user-management/components/user-editor.component';
import {AddUserComponent} from './popups/add-user/add-user.component';
import {FilterSidebarAllULComponent} from './pages/biomaterial/browse/components/filters/filter-sidebar-all-ul.component';
import {FilterSidebarCategoryComponent} from './pages/biomaterial/browse/components/filters/filter-sidebar-category.component';
import {WelcomePage} from './pages/welcome/welcome.page';
import {AboutPage} from './pages/about/about.page';
import {FAQPage} from './pages/faq/faq.page';
import {FAQQuestionComponent} from './pages/faq/components/faq-question.component';
import {AppComponent} from './app.component';
import {AppHeaderComponent} from './core/components/app-header/app-header.component';
import {AppFooterComponent} from './core/components/app-footer/app-footer.component';
import {LoginPopupComponent} from './popups/login/login-popup.component';
import {PopupService} from './core/services/popup.service';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {BusyIndicatorService} from './core/services/busy-indicator.service';
import {HttpGatewayService} from './core/services/http-gateway.service';
import {StudyResultsComponent} from './pages/biomaterial/browse/components/study-results/study-results.component';
import {StudyResultComponent} from './pages/biomaterial/browse/components/study-results/study-result.component';
import {StoreModule} from '@ngrx/store';
import {reducers} from './core/redux/reducers/index';
import {AppHeaderMenuComponent} from './core/components/app-header/app-header-menu.component';
import {FieldMetadataFormComponent} from './pages/biomaterial/upload/components/FieldMetadataFormComponent';
import {UserManagementPage} from './pages/user-management/user-management.page';
import {StudyMetadataEditorComponent} from './pages/biomaterial/management/components/study-mentadata-editor.component';
import {FieldMetaService} from './core/services/field-meta.service';
import {ChangePasswordComponent} from './popups/change-password/change-password.component';
import {ConfirmationComponent} from './popups/confirmation/confirmation.component';
import {SplitByTwoPipe} from './shared/pipes/split-by-two-pipe';
import {WindowRef} from './shared/util/WindowRef';
import {StudyDetailsComponent} from './pages/biomaterial/browse/popups/study-details/study-details.component';
import {PropertiesDescriptionComponent} from './pages/biomaterial/browse/popups/properties-description/properties-description.component';
import {AllFieldsForVisibilityComponent} from './pages/biomaterial/browse/popups/properties-description/properties-visibility.component';
import {AllFieldsForVisibilityCategoryComponent} from './pages/biomaterial/browse/popups/properties-description/properties-visibility-category.component';
import {StudyCategoryComponent} from './pages/biomaterial/browse/popups/study-details/study-category.component';
import {CommonPropertiesComponent} from './pages/biomaterial/browse/popups/study-details/common-properties.component';
import {DistinguishingPropertiesComponent} from './pages/biomaterial/browse/popups/study-details/distinguishing-properties.component';
import {DateFormatPipe} from './shared/pipes/date-format-pipe';
import {TendonsStudiesManagementPage} from './pages/tendons/management/tendons-studies-management.page';
import {TendonsStudyService} from './core/services/tendons-study.service';
import {TendonsStudyEditorPage} from './pages/tendons/editor/tendons-study-editor.page';
import {TendonsStudiesBrowsePage} from './pages/tendons/browse/tendons-studies-browse.page';
import {PeoplePage} from './pages/people/people.page';
import {PersonComponent} from './pages/people/components/person.component';
import {BioMaterialStudyManagementPage} from './pages/biomaterial/management/biomaterial-study-management.page';
import {BioMaterialStudiesBrowsePage} from './pages/biomaterial/browse/biomaterial-studies-browse.page';
import {BioMaterialStudyUploadPage} from './pages/biomaterial/upload/biomaterial-study-upload.page';
import {BioMaterialMetadataPage} from './pages/biomaterial/metadata/biomaterial-metadata.page';
import {TendonsStudyPanelComponent} from './pages/tendons/browse/components/study-panel/tendons-study-panel.component';
import {TendonsBrowserSidebarComponent} from './pages/tendons/browse/components/browser-sidebar/tendons-browser-sidebar.component';
import {TendonsStudyResultsHeaderComponent} from './pages/tendons/browse/components/study-results-header/tendons-study-results-header.component';
import {FieldMetadataEditorComponent} from './pages/biomaterial/metadata/components/metadata-editor-form.component';

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
      TendonsBrowserSidebarComponent,
      UserManagementPage,
      UserEditorComponent,
      AddUserComponent,
      WelcomePage,
      AboutPage,
      FAQPage,
      FAQQuestionComponent,
      PropertiesDescriptionComponent,
      BioMaterialStudiesBrowsePage,
      SplitByTwoPipe,
      BioMaterialStudyUploadPage,
      FieldMetadataFormComponent,
      BioMaterialMetadataPage,
      FieldMetadataEditorComponent,
      BioMaterialStudyManagementPage,
      TendonsStudyResultsHeaderComponent,
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
      TendonsStudyPanelComponent,
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
      TendonsStudiesManagementPage,
      TendonsStudyEditorPage,
      TendonsStudiesBrowsePage
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
