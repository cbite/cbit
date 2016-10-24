import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { RouterModule }   from '@angular/router';

import { AppComponent } from './app.component';
import {StudiesComponent} from "./study/studies.component";
import {StudyComponent} from "./study/study.component";
import {WelcomeComponent} from "./welcome.component";
import {BrowserComponent} from "./browser.component";
import {AppRoutingModule} from "./app-routing.module";


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    WelcomeComponent,
    BrowserComponent,
    StudyComponent,
    StudiesComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
