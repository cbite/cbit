import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DownloadComponent} from '../common/components/download.component';
import {UploadComponent} from '../uploader/upload.component';
import {MetadataComponent} from '../pages/metadata/metadata.component';
import {StudyManagementComponent} from '../pages/studies/study-management.component';
import {UserManagementComponent} from '../user-management/user-management.component';
import {StudyRedirectComponent} from '../pages/studies/study-redirect.component';
import {AppUrls} from './app-urls';
import {WelcomePage} from '../pages/welcome/welcome.page';
import {AboutPage} from '../pages/about/about.page';
import {FAQPage} from '../pages/faq/faq.page';
import {BrowserPage} from '../pages/browser/browser.page';

const routes: Routes = [
  { path: '',           redirectTo: '/welcome', pathMatch: 'full' },
  { path: AppUrls.welcomeUrl, component: WelcomePage },
  { path: AppUrls.aboutUrl, component: AboutPage },
  { path: AppUrls.faqUrl, component: FAQPage },
  { path: AppUrls.browseUrl, component: BrowserPage },
  { path: AppUrls.downloadUrl, component: DownloadComponent },
  { path: AppUrls.uploadUrl, component: UploadComponent },
  { path: AppUrls.metadataUrl, component: MetadataComponent },
  { path: AppUrls.studiesUrl, component: StudyManagementComponent },
  { path: AppUrls.usersUrl, component: UserManagementComponent },
  { path: AppUrls.studyUrl, component: StudyRedirectComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
