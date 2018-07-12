import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {StudyManagementComponent} from '../pages/study-management/study-management.component';
import {StudyRedirectComponent} from '../pages/study-management/study-redirect.component';
import {AppUrls} from './app-urls';
import {WelcomePage} from '../pages/welcome/welcome.page';
import {AboutPage} from '../pages/about/about.page';
import {FAQPage} from '../pages/faq/faq.page';
import {BrowserPage} from '../pages/browser/browser.page';
import {UploadPage} from '../pages/upload/upload.page';
import {UserManagementPage} from '../pages/user-management/user-management.page';
import {MetadataPage} from '../pages/metadata/metadata.page';
import {ManageTendonsStudiesComponent} from '../pages/tendons/manage-tendons-studies.component';
import {TendonsStudyComponent} from '../pages/tendons/tendons-study.component';
import {TendonsStudiesComponent} from '../pages/tendons/tendons-studies.component';

const routes: Routes = [
  { path: '',           redirectTo: '/welcome', pathMatch: 'full' },
  { path: AppUrls.welcomeUrl, component: WelcomePage },
  { path: AppUrls.aboutUrl, component: AboutPage },
  { path: AppUrls.faqUrl, component: FAQPage },
  { path: AppUrls.browseUrl, component: BrowserPage },
  { path: AppUrls.uploadUrl, component: UploadPage },
  { path: AppUrls.metadataUrl, component: MetadataPage },
  { path: AppUrls.studiesUrl, component: StudyManagementComponent },
  { path: AppUrls.manageTendonsStudiesUrl, component: ManageTendonsStudiesComponent },
  { path: AppUrls.usersUrl, component: UserManagementPage },
  { path: AppUrls.studyUrl, component: StudyRedirectComponent },
  { path: AppUrls.tendonsStudiesUrl, component: TendonsStudiesComponent },
  { path: AppUrls.newTendonsStudyUrl, component: TendonsStudyComponent },
  { path: AppUrls.tendonsStudyUrl, component: TendonsStudyComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
