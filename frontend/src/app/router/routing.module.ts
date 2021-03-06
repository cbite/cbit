import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {BioMaterialStudyManagementPage} from '../pages/biomaterial/management/biomaterial-study-management.page';
import {AppUrls} from './app-urls';
import {WelcomePage} from '../pages/welcome/welcome.page';
import {AboutPage} from '../pages/about/about.page';
import {FAQPage} from '../pages/faq/faq.page';
import {UserManagementPage} from '../pages/user-management/user-management.page';
import {TendonsStudiesManagementPage} from '../pages/tendons/management/tendons-studies-management.page';
import {TendonsStudyEditorPage} from '../pages/tendons/editor/tendons-study-editor.page';
import {TendonsStudiesBrowsePage} from '../pages/tendons/browse/tendons-studies-browse.page';
import {PeoplePage} from '../pages/people/people.page';
import {BioMaterialStudiesBrowsePage} from '../pages/biomaterial/browse/biomaterial-studies-browse.page';
import {BioMaterialStudyUploadPage} from '../pages/biomaterial/upload/biomaterial-study-upload.page';
import {BioMaterialMetadataPage} from '../pages/biomaterial/metadata/biomaterial-metadata.page';
import {StudyDetailsPage} from '../pages/biomaterial/details/study-details.page';
import {DashboardPage} from '../pages/dashboard/dashboard.page';

const routes: Routes = [
  { path: '',           redirectTo: '/welcome', pathMatch: 'full' },
  { path: AppUrls.welcomeUrl, component: WelcomePage },
  { path: AppUrls.aboutUrl, component: AboutPage },
  { path: AppUrls.faqUrl, component: FAQPage },
  { path: AppUrls.bioMaterialMetadataUrl, component: BioMaterialMetadataPage },
  { path: AppUrls.usersUrl, component: UserManagementPage },
  { path: AppUrls.studyUrl, component: StudyDetailsPage },
  { path: AppUrls.studyPidUrl, component: StudyDetailsPage },
  { path: AppUrls.manageBioMaterialStudiesUrl, component: BioMaterialStudyManagementPage },
  { path: AppUrls.manageTendonsStudiesUrl, component: TendonsStudiesManagementPage },
  { path: AppUrls.oldBrowseUrl, redirectTo: AppUrls.browseBioMaterialStudiesUrl, pathMatch: 'full'}, // To keep supporting web links made in the past
  { path: AppUrls.browseTendonStudiesUrl, component: TendonsStudiesBrowsePage },
  { path: AppUrls.browseBioMaterialStudiesUrl, component: BioMaterialStudiesBrowsePage },
  { path: AppUrls.newTendonsStudyUrl, component: TendonsStudyEditorPage },
  { path: AppUrls.dashboardUrl, component: DashboardPage },
  { path: AppUrls.newBioMaterialStudyUrl, component: BioMaterialStudyUploadPage },
  { path: AppUrls.tendonsStudyUrl, component: TendonsStudyEditorPage },
  { path: AppUrls.peopleUrl, component: PeoplePage }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
