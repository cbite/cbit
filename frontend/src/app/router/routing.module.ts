import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DownloadComponent} from '../common/components/download.component';
import {MetadataComponent} from '../pages/metadata/metadata.component';
import {StudyManagementComponent} from '../pages/studies/study-management.component';
import {StudyRedirectComponent} from '../pages/studies/study-redirect.component';
import {AppUrls} from './app-urls';
import {WelcomePage} from '../pages/welcome/welcome.page';
import {AboutPage} from '../pages/about/about.page';
import {FAQPage} from '../pages/faq/faq.page';
import {BrowserPage} from '../pages/browser/browser.page';
import {UploadPage} from '../pages/upload/upload.page';
import {UserManagementPage} from '../pages/user-management/user-management.page';

const routes: Routes = [
  { path: '',           redirectTo: '/welcome', pathMatch: 'full' },
  { path: AppUrls.welcomeUrl, component: WelcomePage },
  { path: AppUrls.aboutUrl, component: AboutPage },
  { path: AppUrls.faqUrl, component: FAQPage },
  { path: AppUrls.browseUrl, component: BrowserPage },
  { path: AppUrls.downloadUrl, component: DownloadComponent },
  { path: AppUrls.uploadUrl, component: UploadPage },
  { path: AppUrls.metadataUrl, component: MetadataComponent },
  { path: AppUrls.studiesUrl, component: StudyManagementComponent },
  { path: AppUrls.usersUrl, component: UserManagementPage },
  { path: AppUrls.studyUrl, component: StudyRedirectComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
