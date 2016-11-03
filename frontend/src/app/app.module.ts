import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { FormsModule }         from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent }   from './app.component';
import {StudyComponent}   from "./study/study.component";
import {WelcomeComponent} from "./welcome.component";
import {BrowserComponent} from "./browser.component";
import {AppRoutingModule} from "./app-routing.module";
import {FilterSidebarComponent} from "./filters/filter-sidebar.component";
import {MapToIterablePipe} from "./common/mapToIterable.pipe";
import {SampleFiltersComponent} from "./filters/sample-filters.component";
import {PubmedLinksComponent} from "./study/pubmed-links.component";
import {DOILinksComponent} from "./study/doi-links.component";


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
    PubmedLinksComponent,
    DOILinksComponent,
    FilterSidebarComponent,
    SampleFiltersComponent,
    StudyComponent,
    MapToIterablePipe
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
