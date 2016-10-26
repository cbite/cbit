import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { FormsModule }         from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent }   from './app.component';
import {StudiesComponent} from "./study/studies.component";
import {StudyComponent}   from "./study/study.component";
import {WelcomeComponent} from "./welcome.component";
import {BrowserComponent} from "./browser.component";
import {AppRoutingModule} from "./app-routing.module";
import {SamplesComponent} from "./study/samples.component";


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    WelcomeComponent,
    BrowserComponent,
    SamplesComponent,
    StudyComponent,
    StudiesComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
