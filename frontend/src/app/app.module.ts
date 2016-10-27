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
import {FilterSidebarComponent} from "./filters/filter-sidebar.component";
import {MapToIterablePipe} from "./common/mapToIterable.pipe";
import {StudyFiltersComponent} from "./filters/study-filters.component";
import {SampleFiltersComponent} from "./filters/sample-filters.component";
import {SampleComponent} from "./study/sample.component";


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
    FilterSidebarComponent,
    StudyFiltersComponent,
    SampleFiltersComponent,
    StudiesComponent,
    SamplesComponent,
    StudyComponent,
    SampleComponent,
    MapToIterablePipe
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
