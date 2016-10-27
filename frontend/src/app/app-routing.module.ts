import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {WelcomeComponent} from "./welcome.component";
import {BrowserComponent} from "./browser.component";
import {StudyComponent} from "./study/study.component";
import {SampleComponent} from "./study/sample.component";

const routes: Routes = [
  { path: '',           redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome',    component: WelcomeComponent },
  { path: 'browse',     component: BrowserComponent },
  { path: 'study/:id',  component: StudyComponent },
  { path: 'sample/:id', component: SampleComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}