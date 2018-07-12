import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {BioMaterialStudyManagementPage} from '../pages/biomaterial/management/biomaterial-study-management.page';
import {StudyRedirectComponent} from '../pages/biomaterial/management/study-redirect.component';
import {AppUrls} from './app-urls';
import {WelcomePage} from '../pages/welcome/welcome.page';
import {AboutPage} from '../pages/about/about.page';
import {FAQPage} from '../pages/faq/faq.page';
import {UserManagementPage} from '../pages/user-management/user-management.page';
import {ManageTendonsStudiesComponent} from '../pages/tendons/manage-tendons-studies.component';
import {TendonsStudyComponent} from '../pages/tendons/tendons-study.component';
import {TendonsStudiesComponent} from '../pages/tendons/tendons-studies.component';
import {PeoplePage} from '../pages/people/people.page';
import {BioMaterialStudyBrowsePage} from '../pages/biomaterial/browse/biomaterial-study-browse.page';
import {BioMaterialStudyUploadPage} from '../pages/biomaterial/upload/biomaterial-study-upload.page';
import {BioMaterialMetadataPage} from '../pages/biomaterial/metadata/biomaterial-metadata.page';

const routes: Routes = [
  { path: '',           redirectTo: '/welcome', pathMatch: 'full' },
  { path: AppUrls.welcomeUrl, component: WelcomePage },
  { path: AppUrls.aboutUrl, component: AboutPage },
  { path: AppUrls.faqUrl, component: FAQPage },
  { path: AppUrls.bioMaterialMetadataUrl, component: BioMaterialMetadataPage },
  { path: AppUrls.usersUrl, component: UserManagementPage },
  { path: AppUrls.studyUrl, component: StudyRedirectComponent },
  { path: AppUrls.manageBioMaterialStudiesUrl, component: BioMaterialStudyManagementPage },
  { path: AppUrls.manageTendonsStudiesUrl, component: ManageTendonsStudiesComponent },
  { path: AppUrls.browseTendonStudiesUrl, component: TendonsStudiesComponent },
  { path: AppUrls.browseBioMaterialStudiesUrl, component: BioMaterialStudyBrowsePage },
  { path: AppUrls.newTendonsStudyUrl, component: TendonsStudyComponent },
  { path: AppUrls.newBioMaterialStudyUrl, component: BioMaterialStudyUploadPage },
  { path: AppUrls.tendonsStudyUrl, component: TendonsStudyComponent },
  { path: AppUrls.peopleUrl, component: PeoplePage }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
