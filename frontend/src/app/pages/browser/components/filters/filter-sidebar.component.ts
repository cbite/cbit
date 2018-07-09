import {Component, OnInit, ChangeDetectorRef, OnDestroy, Input, OnChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {FiltersService, FiltersState} from '../../../../services/filters.service';
import {StudyService, ManySampleCounts, ClassifiedProperties, ClassifiedPropertiesForGivenVisibility} from '../../../../services/study.service';
import {Observable, Subject} from 'rxjs';
import * as _ from 'lodash';
// import {ModalDirective} from "ngx-bootstrap";
import {CollapseStateService} from '../../../../services/collapse-state.service';
import {FieldMeta} from '../../../../core/types/field-meta';
import {FieldMetaService} from '../../../../core/services/field-meta.service';

@Component({
  styleUrls: ['./filter-sidebar.scss'],
  selector: 'cbit-filter-sidebar',
  template: `
    <div class="sidebar">
      <div class="searchbox">
        <label for="searchText">Search for:</label>
        <!--<spinner *ngIf="!ready"></spinner>-->
        <span>
          <input id="searchText"
                 type="text"
                 placeholder="e.g., BCP, stromal cell"
                 name='searchText'
                 [formControl]="searchTextInForm"/>
        </span>
      </div>

      <!--<div class="nopadding">-->
        <!--<a class="nopadding" href="#" (click)="$event.preventDefault(); allFieldsModal && allFieldsModal.show()">-->
          <!--Full list of properties-->
        <!--</a>-->
      <!--</div>-->

      <!--<div class="checkbox nav-header nopadding">-->
        <!--<label>-->
          <!--<input id="includeControls" type="checkbox" name="includeControls" [formControl]="includeControlsInForm"/>-->
          <!--Include associated controls-->
        <!--</label>-->
      <!--</div>-->

      <div class="filter-panel">
        <div class="filter-heading">MAIN FILTERS</div>
        <cbit-filter-sidebar-all-ul name="main"
                               [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                               [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                               [classifiedProperties]="classifiedProperties.main || {}"
                               [initCollapsed]="true"
        ></cbit-filter-sidebar-all-ul>
      </div>

      <div class="filter-panel">
        <div class="filter-heading">ADDITIONAL FILTERS</div>
        <cbit-filter-sidebar-all-ul name="additional"
                               [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                               [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                               [classifiedProperties]="classifiedProperties.additional || {}"
                               [initCollapsed]="true"
        ></cbit-filter-sidebar-all-ul>
      </div>
    </div>
  `
})
export class FilterSidebarComponent implements OnInit, OnDestroy {

  // For inspiration, see: http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html
  searchTextInForm = new FormControl();
  includeControlsInForm = new FormControl();
  allSampleFilterMatchCounts = {};

  unfilteredPropNamesAndValueCounts = {};
  allFieldMetas: {[fieldName: string]: FieldMeta} = {};
  visiblePropNames: string[] = [];

  //TODO@Sam Fix it!
  //@Input() allFieldsModal: ModalDirective = null;

  // See comment in StudyService.classifyProperties
  classifiedProperties: ClassifiedProperties = {};

  ready = false;
  stopStream = new Subject<string>();

  constructor(
    private fieldMetaService: FieldMetaService,
    private _studyService: StudyService,
    private _filtersService: FiltersService,
    private changeDetectorRef: ChangeDetectorRef
  ) {

    //TODO@Sam Fix it!
    // this.searchTextInForm.valueChanges
    //   .debounceTime(200)       // Don't propagate changes until this many ms have elapsed without change
    //   .distinctUntilChanged()  // Don't emit the same value twice
    //   .takeUntil(this.stopStream)
    //   .subscribe(newSearchText => _filtersService.setSearchText(newSearchText));

    // this.includeControlsInForm.valueChanges
    //   .distinctUntilChanged()  // Don't emit the same value twice
    //   .takeUntil(this.stopStream)
    //   .subscribe(newIncludeControls => _filtersService.setIncludeControls(newIncludeControls));

  }

  ngOnInit(): void {
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

  calcVisiblePropNames(fieldMetas: {[fieldName: string]: FieldMeta}): string[] {
    return Object.keys(fieldMetas).filter(fieldName => {
      const visibility = fieldMetas[fieldName].visibility;
      return (visibility === 'main' || visibility === 'additional');
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
