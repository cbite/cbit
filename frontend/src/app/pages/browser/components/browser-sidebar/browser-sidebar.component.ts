import {Component, OnInit, ChangeDetectorRef, OnDestroy, EventEmitter, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {FiltersService, FiltersState} from '../../services/filters.service';
import {StudyService, ClassifiedProperties} from '../../../../core/services/study.service';
import * as _ from 'lodash';
import {FieldMeta} from '../../../../core/types/field-meta';
import {FieldMetaService} from '../../../../core/services/field-meta.service';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Component({
  styleUrls: ['./browser-sidebar.scss'],
  selector: 'cbit-browser-sidebar',
  template: `
    <div class="sidebar noselect">
      <div class="sidebar-header">
        <div class="searchbox">
          <div class="search-title">SEARCH
            <div class="shortcut" (click)="onFullPropertiesListClicked()">All Properties</div>
          </div>
          <div class="search-content">
            <input id="searchText"
                   class="searchText"
                   type="text"
                   placeholder="e.g., BCP, stromal cell"
                   name='searchText'
                   [formControl]="searchTextInForm"/>
          </div>
        </div>
      </div>

      <div class="filter-panel">
        <div class="filter-heading">FILTERS
          <div class="shortcut" (click)="onClearFiltersClicked()">Clear all</div>
        </div>
        <div class="filter-content">
          <cbit-filter-sidebar-all-ul name="main"
                                      [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                      [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                      [classifiedProperties]="classifiedProperties.visible || {}"
                                      [initCollapsed]="true">
          </cbit-filter-sidebar-all-ul>
        </div>
      </div>
    </div>
  `
})
export class BrowserSidebarComponent implements OnInit, OnDestroy {

  // For inspiration, see: http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html
  searchTextInForm = new FormControl();
  includeControlsInForm = new FormControl();
  allSampleFilterMatchCounts = {};

  unfilteredPropNamesAndValueCounts = {};
  allFieldMetas: { [fieldName: string]: FieldMeta } = {};
  visiblePropNames: string[] = [];

  // See comment in StudyService.classifyProperties
  classifiedProperties: ClassifiedProperties = {};

  ready = false;
  stopStream = new Subject<string>();

  @Output()
  public fullPropertiesListClick = new EventEmitter();

  constructor(private fieldMetaService: FieldMetaService,
              private _studyService: StudyService,
              private _filtersService: FiltersService,
              private changeDetectorRef: ChangeDetectorRef) {

    this.searchTextInForm.valueChanges
      .debounceTime(200)       // Don't propagate changes until this many ms have elapsed without change
      .distinctUntilChanged()  // Don't emit the same value twice
      .takeUntil(this.stopStream)
      .subscribe(newSearchText => _filtersService.setSearchText(newSearchText));

    this.includeControlsInForm.valueChanges
      .distinctUntilChanged()  // Don't emit the same value twice
      .takeUntil(this.stopStream)
      .subscribe(newIncludeControls => _filtersService.setIncludeControls(newIncludeControls));

  }

  public ngOnInit(): void {
    this._studyService
      .getAllCountsAsync()
      .then(unfilteredCounts => {
        this.unfilteredPropNamesAndValueCounts = unfilteredCounts;
        return this.fieldMetaService.getAllFieldMetas(Object.keys(unfilteredCounts));
      })
      .then(allFieldMetas => {
        this.allFieldMetas = allFieldMetas;
        this.visiblePropNames = this.calcVisiblePropNames(allFieldMetas);

        this.classifiedProperties = this.fieldMetaService.classifyProperties(allFieldMetas);

        this.changeDetectorRef.detectChanges();
        this.startListening();
      });
  }

  public onFullPropertiesListClicked() {
    this.fullPropertiesListClick.emit();
  }

  public ngOnDestroy() {
    this.stopStream.next('stop');
  }

  public onClearFiltersClicked(): void {
    this._filtersService.clearFilters();
  }

  public calcVisiblePropNames(fieldMetas: { [fieldName: string]: FieldMeta }): string[] {
    return Object.keys(fieldMetas).filter(fieldName => {
      const visibility = fieldMetas[fieldName].visibility;
      return (visibility === 'visible');
    });
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
        return Observable.fromPromise(
          this._studyService.getManySampleCountsAsync(filters, this.visiblePropNames)
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
