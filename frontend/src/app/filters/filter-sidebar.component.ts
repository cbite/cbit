import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {FormControl} from "@angular/forms";
import {FiltersService, FiltersState} from "../services/filters.service";
import {StudyService, ManySampleCounts} from "../services/study.service";
import {Observable, Subject} from "rxjs";

@Component({
  selector: 'filter-sidebar',
  template: `
    <ul class="nav nav-sidebar">
      <li class="searchbox">
        <label for="searchText">Search for:</label>
        <spinner *ngIf="!ready"></spinner>
        <span>
          <input id="searchText" type="text" class="searchbox" placeholder="e.g., BCP, stromal cell" name='searchText' [formControl]="searchTextInForm"/>
        </span>
      </li>
  
      <li>
        <a href="javascript:void(0)" (click)="mainFiltersShown = !mainFiltersShown">
          <span *ngIf=" mainFiltersShown" class="glyphicon glyphicon-triangle-bottom"></span>
          <span *ngIf="!mainFiltersShown" class="glyphicon glyphicon-triangle-right"></span>
          Main Filters
        </a>
  
        <ul class="nav" [collapse]="!mainFiltersShown">
          <sample-filters *ngFor="let propName of unfilteredPropNames" 
                          [category]="propName"
                          [allCounts]="unfilteredPropNamesAndValueCounts[propName]"
                          [filteredCounts]="allSampleFilterMatchCounts[propName] || {}">
          </sample-filters>
        </ul>
      </li>
  
      <li>
        <a href="javascript:void(0)" (click)="advancedFiltersShown = !advancedFiltersShown">
          <span *ngIf=" advancedFiltersShown" class="glyphicon glyphicon-triangle-bottom"></span>
          <span *ngIf="!advancedFiltersShown" class="glyphicon glyphicon-triangle-right"></span>
          Advanced Filters
        </a>
  
        <ul class="nav" [collapse]="!advancedFiltersShown">
          <li class="checkbox nav-header">
            <label>
              <input id="includeControls" type="checkbox" name="includeControls" [formControl]="includeControlsInForm"/>
              Also include associated controls
            </label>
          </li>
        </ul>
      </li>
    </ul>
  `,
  styles: [`
    .nav-sidebar {
      list-style: none;
    }
    .nav-sidebar > li {
      padding-bottom: 10px;
    }
    .nav-sidebar > li > ul {
      padding-left: 20px;
    }
    .nav-sidebar > li > a {
      padding: 10px 0;
    }
    
    .nav-sidebar .searchbox {
      position: relative;
    }
    .nav-sidebar .searchbox label {
      float: left;
    }
    .nav-sidebar .searchbox span {
      display: block;
      overflow: hidden;
    }
    .nav-sidebar .searchbox span > input[type="text"] {
      width: 70%;
      margin-left: 10px;
    }
    .nav-sidebar .searchbox spinner {
      position: absolute;
      top: 0px;
      right: 0px;
    }

    .nav-sidebar > .active > a,
    .nav-sidebar > .active > a:hover,
    .nav-sidebar > .active > a:focus {
      color: #fff;
      background-color: #428bca;
    }
    
    .nav-sidebar label.disabled {
      color: darkgrey;
    }
  `]
})
export class FilterSidebarComponent implements OnInit, OnDestroy {

  // For inspiration, see: http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html
  searchTextInForm = new FormControl();
  includeControlsInForm = new FormControl();
  allSampleFilterMatchCounts = {};

  unfilteredPropNamesAndValueCounts = {};
  unfilteredPropNames: string[] = [];
  ready = false;
  stopStream = new Subject<string>();

  mainFiltersShown = true;
  advancedFiltersShown = false;

  constructor(
    private _studyService: StudyService,
    private _filtersService: FiltersService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    //this.searchTextInForm = new FormControl(this._filtersService.getFilters().searchText);
    this.searchTextInForm.valueChanges
      .debounceTime(200)       // Don't propagate changes until this many ms have elapsed without change
      .distinctUntilChanged()  // Don't emit the same value twice
      .takeUntil(this.stopStream)
      .subscribe(newSearchText => _filtersService.setSearchText(newSearchText));
    this.includeControlsInForm.valueChanges
      .distinctUntilChanged()  // Don't emit the same value twice
      .takeUntil(this.stopStream)
      .subscribe(newIncludeControls => _filtersService.setIncludeControls(newIncludeControls))
  }

  ngOnInit(): void {
    this.makeSampleFilterLabels().then(() => this.startListening());
  }

  ngOnDestroy() {
    this.stopStream.next('stop');
  }

  withoutStar(s: string): string {
    if (s.substr(0, 1) == '*') {
      return s.substr(1);
    } else {
      return s;
    }
  }

  makeSampleFilterLabels(): PromiseLike<void> {
    // Make a list of all possible filterable properties in samples (and their counts!)
    return (
      this._studyService.getAllCountsAsync()
        .then(allCounts => {
          this.unfilteredPropNamesAndValueCounts = allCounts;
          this.unfilteredPropNames = Object.keys(allCounts).sort((a, b) => this.withoutStar(a).localeCompare(this.withoutStar(b)));
        })
    );
  }

  private startListening() {

    // Ensure that external modifications to FiltersService are reflected in sidebar UI
    this._filtersService.filters
      .takeUntil(this.stopStream)
      .subscribe(filters => this.updateFiltersUI(filters));

    // Use switchMap to cancel in-flight queries if new filters are applied in the meantime
    this._filtersService.filters
      .switchMap(filters => {
        this.ready = false;
        // Hack conversion of PromiseLike<ManySampleCounts> to Promise<ManySampleCounts>
        return Observable.fromPromise(
          this._studyService.getManySampleCountsAsync(
            filters,
            this.unfilteredPropNames
          )
        );
      })
      .takeUntil(this.stopStream)
      .subscribe(newMatchCounts => {
        this.allSampleFilterMatchCounts = newMatchCounts;
        this.ready = true;

        // Force Angular2 change detection to see ready = true change.
        // Not sure why it's not being picked up automatically
        this.changeDetectorRef.detectChanges();
      });
  }

  updateFiltersUI(filters: FiltersState): void {
    if (filters.searchText !== this.searchTextInForm.value) {
      // emitEvent: false => Avoid event loops
      this.searchTextInForm.setValue(filters.searchText, {emitEvent: false});
    }

    if (filters.includeControls !== this.includeControlsInForm.value) {
      // emitEvent: false => Avoid event loops
      this.includeControlsInForm.setValue(filters.includeControls, {emitEvent: false});
    }
  }
}
