import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {WelcomeComponent} from "./welcome.component";
import {BrowserComponent} from "./browser.component";
import {StudyComponent} from "./study/study.component";
import {DownloadComponent} from "./download.component";
import {UploadComponent} from "./uploader/upload.component";
import {MetadataComponent} from "./metadata.component";
import {StudyManagementComponent} from "./study-management.component";
import {UserManagementComponent} from "./user-management.component";
import {AboutComponent} from "./about.component";

const routes: Routes = [
  { path: '',           redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome',    component: WelcomeComponent },
  { path: 'about',      component: AboutComponent },
  { path: 'browse',     component: BrowserComponent },
  { path: 'download',   component: DownloadComponent },
  { path: 'upload',     component: UploadComponent },
  { path: 'metadata',   component: MetadataComponent },
  { path: 'studies',    component: StudyManagementComponent },
  { path: 'users',      component: UserManagementComponent },
  { path: 'study/:id',  component: StudyComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
