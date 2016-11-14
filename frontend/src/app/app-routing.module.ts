import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {WelcomeComponent} from "./welcome.component";
import {BrowserComponent} from "./browser.component";
import {StudyComponent} from "./study/study.component";
import {DownloadComponent} from "./download.component";

const routes: Routes = [
  { path: '',           redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome',    component: WelcomeComponent },
  { path: 'browse',     component: BrowserComponent },
  { path: 'download',   component: DownloadComponent },
  { path: 'study/:id',  component: StudyComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
