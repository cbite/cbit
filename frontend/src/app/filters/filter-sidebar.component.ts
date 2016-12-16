import {Component, OnInit, ChangeDetectorRef, OnDestroy, Input, OnChanges} from '@angular/core';
import {FormControl} from "@angular/forms";
import {FiltersService, FiltersState} from "../services/filters.service";
import {StudyService, ManySampleCounts, ClassifiedProperties, ClassifiedPropertiesForGivenVisibility} from "../services/study.service";
import {Observable, Subject} from "rxjs";
import {FieldVisibility, FieldCategory, FieldMeta} from "../common/field-meta.model";
import * as _ from 'lodash';
import {ModalDirective} from "ng2-bootstrap";
import {CollapseStateService} from "../services/collapse-state.service";

@Component({
  selector: 'filter-sidebar-category',
  template: `
  <a href="#" (click)="$event.preventDefault(); collapsed = !collapsed">
    <span *ngIf="!collapsed" class="glyphicon glyphicon-triangle-bottom"></span>
    <span *ngIf=" collapsed" class="glyphicon glyphicon-triangle-right"></span>
    {{ categoryName }}
  </a>

  <ul *ngIf="!collapsed">
    <div *ngFor="let propName of propNames">
      <sample-filters *ngIf="isNormalProp(propName)" 
                      [category]="propName"
                      [allCounts]="unfilteredPropNamesAndValueCounts[propName] || {}"
                      [filteredCounts]="allSampleFilterMatchCounts[propName] || {}">
      </sample-filters>
      
      <div *ngIf="isSpecialPropsHeader(propName)" class="detailed-breakdown">
        <a href="#" (click)="$event.preventDefault(); setSpecialDetailExpanded(propName, !isSpecialDetailExpanded(propName))">
          <span *ngIf=" isSpecialDetailExpanded(propName)" class="glyphicon glyphicon-triangle-bottom"></span>
          <span *ngIf="!isSpecialDetailExpanded(propName)" class="glyphicon glyphicon-triangle-right"></span>
          Detailed breakdown
        </a>
        
        <ul *ngIf="isSpecialDetailExpanded(propName)">
          <div *ngFor="let detailedPropName of propNames">
            <sample-filters *ngIf="isSpecialPropSubfield(detailedPropName, propName)" 
                            [category]="detailedPropName"
                            [allCounts]="unfilteredPropNamesAndValueCounts[detailedPropName] || {}"
                            [filteredCounts]="allSampleFilterMatchCounts[detailedPropName] || {}">
            </sample-filters>
          </div>
        </ul>
      </div>
    </div>
  </ul>
  `,
  styles: [`
    ul {
      padding-left: 10px;
      list-style: none;
    }
    sample-filters {
      padding-top: 5px;
    }
    
    .detailed-breakdown {
      padding-left: 18px;
      padding-top: 5px;
      padding-bottom: 7px;
    }
  `]
})
export class FilterSidebarCategoryComponent {
  @Input() categoryName: string;
  @Input() unfilteredPropNamesAndValueCounts: any;
  @Input() allSampleFilterMatchCounts: any;
  @Input() propNames: string[] = [];
  @Input() prefix: string;

  @Input() initCollapsed: boolean;
  get collapsed(): boolean { return this._collapsedStateService.isCollapsed(`fscat-${this.prefix}-${this.categoryName}`, this.initCollapsed); }
  set collapsed(value: boolean) { this._collapsedStateService.setCollapsed(`fscat-${this.prefix}-${this.categoryName}`, value); }

  constructor(
    private _collapsedStateService: CollapseStateService
  ) { }

  specialPropNames = ['Elements composition', 'Phase composition', 'Wettability'];
  isSpecialDetailExpanded(propName: string) { return this._collapsedStateService.isCollapsed(`fscat-special-${this.prefix}-${this.categoryName}-${propName}`, false); }
  setSpecialDetailExpanded(propName: string, value: boolean) { return this._collapsedStateService.setCollapsed(`fscat-special-${this.prefix}-${this.categoryName}-${propName}`, value); }

  isNormalProp(propName: string) {
    for (let specialPropName of this.specialPropNames) {
      if (propName !== specialPropName && propName.startsWith('*' + specialPropName)) {

        // Mark the broken down fields like "Elements composition - Ca" as special, but not the header fields like "Elements composition"
        return false;
      }
    }
    return true;
  }

  isSpecialPropsHeader(propName: string) {
    for (let specialPropName of this.specialPropNames) {
      if (propName === specialPropName) {
        return true;
      }
    }
    return false;
  }

  isSpecialPropSubfield(detailedPropName: string, parentPropName: string): boolean {
    return detailedPropName.startsWith('*' + parentPropName);
  }
}

@Component({
  selector: 'filter-sidebar-all-ul',
  template: `
    <ul>
      <li>
        <a href="#" (click)="$event.preventDefault(); materialPropertiesCollapsed = !materialPropertiesCollapsed">
          <span *ngIf="!materialPropertiesCollapsed" class="glyphicon glyphicon-triangle-bottom"></span>
          <span *ngIf=" materialPropertiesCollapsed" class="glyphicon glyphicon-triangle-right"></span>
          Material Properties
        </a>
        
        <ul *ngIf="!materialPropertiesCollapsed">
          <li>
            <filter-sidebar-category [prefix]="name + '-material-'"
                                     categoryName="General"
                                     [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                     [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                     [propNames]="classifiedProperties['Material > General'] || []"
                                     [initCollapsed]="initCollapsed"
            ></filter-sidebar-category>
          </li>

          <li>
            <filter-sidebar-category [prefix]="name + '-material-'"
                                     categoryName="Chemical"
                                     [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                     [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                     [propNames]="classifiedProperties['Material > Chemical'] || []"
                                     [initCollapsed]="initCollapsed"
            ></filter-sidebar-category>
          </li>

          <li>
            <filter-sidebar-category [prefix]="name + '-material-'"
                                     categoryName="Physical"
                                     [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                     [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                     [propNames]="classifiedProperties['Material > Physical'] || []"
                                     [initCollapsed]="initCollapsed"
            ></filter-sidebar-category>
          </li>

          <li>
            <filter-sidebar-category [prefix]="name + '-material-'"
                                     categoryName="Mechanical"
                                     [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                     [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                     [propNames]="classifiedProperties['Material > Mechanical'] || []"
                                     [initCollapsed]="initCollapsed"
            ></filter-sidebar-category>
          </li>

        </ul>
      </li>

      <li>
        <filter-sidebar-category [prefix]="name + '-biological-'"
                                 categoryName="Biological Properties"
                                 [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                 [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                 [propNames]="classifiedProperties['Biological'] || []"
                                 [initCollapsed]="initCollapsed"
        ></filter-sidebar-category>
      </li>
      
      <li>
        <a href="#" (click)="$event.preventDefault(); technicalPropertiesCollapsed = !technicalPropertiesCollapsed">
          <span *ngIf="!technicalPropertiesCollapsed" class="glyphicon glyphicon-triangle-bottom"></span>
          <span *ngIf=" technicalPropertiesCollapsed" class="glyphicon glyphicon-triangle-right"></span>
          Technical Properties
        </a>
        
        <ul *ngIf="!technicalPropertiesCollapsed">
          <li>
            <filter-sidebar-category [prefix]="name + '-technical-'"
                                     categoryName="General"
                                     [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                     [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                     [propNames]="classifiedProperties['Technical > General'] || []"
                                     [initCollapsed]="initCollapsed"
            ></filter-sidebar-category>
          </li>
          
          <li>
            <filter-sidebar-category [prefix]="name + '-technical-'"
                                     categoryName="Microarray"
                                     [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                     [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                     [propNames]="classifiedProperties['Technical > Microarray'] || []"
                                     [initCollapsed]="initCollapsed"
            ></filter-sidebar-category>
          </li>
          
          <li>
            <filter-sidebar-category [prefix]="name + '-technical-'"
                                     categoryName="RNA sequencing"
                                     [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                     [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                     [propNames]="classifiedProperties['Technical > RNA sequencing'] || []"
                                     [initCollapsed]="initCollapsed"
            ></filter-sidebar-category>
          </li>
        </ul>
      </li>
    </ul>
  `,
  styles: [`
    ul {
      padding-left: 10px;
      list-style: none;
    }
    li {
      padding-top: 5px;
    }
  `]
})
export class FilterSidebarAllULComponent {
  @Input() name: string;
  @Input() unfilteredPropNamesAndValueCounts: any = {};
  @Input() allSampleFilterMatchCounts: any = {};
  @Input() classifiedProperties: ClassifiedPropertiesForGivenVisibility = {};
  @Input() initCollapsed: boolean;

  constructor(
    private _collapsedStateService: CollapseStateService
  ) { }

  get materialPropertiesCollapsed() { return this._collapsedStateService.isCollapsed(`fsall-material-${this.name}`, false); }
  set materialPropertiesCollapsed(value: boolean) { this._collapsedStateService.setCollapsed(`fsall-material-${this.name}`, value); }

  get technicalPropertiesCollapsed() { return this._collapsedStateService.isCollapsed(`fsall-technical-${this.name}`, false); }
  set technicalPropertiesCollapsed(value: boolean) { this._collapsedStateService.setCollapsed(`fsall-technical-${this.name}`, value); }
}

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
  
      <li class="nopadding">
        <a href="#" (click)="$event.preventDefault(); allFieldsModal && allFieldsModal.show()">Full list of fields</a>
      </li>
  
      <li class="checkbox nav-header nopadding">
        <label>
          <input id="includeControls" type="checkbox" name="includeControls" [formControl]="includeControlsInForm"/>
          Include associated controls
        </label>
      </li>
        
      <li>
        <span class="filter-heading">
          MAIN FILTERS
        </span>
        <filter-sidebar-all-ul name="main"
                               [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                               [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                               [classifiedProperties]="classifiedProperties.main || {}"
                               [initCollapsed]="true"
        ></filter-sidebar-all-ul>
      </li>
      
      <li>
        <span class="filter-heading">
          ADDITIONAL FILTERS
        </span>
        
        <filter-sidebar-all-ul name="additional"
                               [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                               [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                               [classifiedProperties]="classifiedProperties.additional || {}"
                               [initCollapsed]="true"
        ></filter-sidebar-all-ul>
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
    .nav-sidebar > li > ul{
      padding-left: 10px;
      list-style: none;
    }
    
    .searchbox {
      position: relative;
    }
    .searchbox label {
      float: left;
    }
    .searchbox span {
      display: block;
      overflow: hidden;
    }
    .searchbox span > input[type="text"] {
      width: 70%;
      margin-left: 10px;
    }
    .searchbox spinner {
      position: absolute;
      top: 0px;
      right: 0px;
    }
    .filter-heading {
      color: #999;
      font-weight: bold;
      font-size: 90%;
    }
    .nopadding {
      padding: 0;
    }
  `]
})
export class FilterSidebarComponent implements OnInit, OnDestroy {

  // For inspiration, see: http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html
  searchTextInForm = new FormControl();
  includeControlsInForm = new FormControl();
  allSampleFilterMatchCounts = {};

  unfilteredPropNamesAndValueCounts = {};
  allFieldMetas: {[fieldName: string]: FieldMeta} = {};
  visiblePropNames: string[] = []

  @Input() allFieldsModal: ModalDirective = null;

  // See comment in StudyService.classifyProperties
  classifiedProperties: ClassifiedProperties = {};

  ready = false;
  stopStream = new Subject<string>();

  constructor(
    private _studyService: StudyService,
    private _filtersService: FiltersService,
    private changeDetectorRef: ChangeDetectorRef
  ) {

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
    this._studyService
      .getAllCountsAsync()
      .then(unfilteredCounts => {
        this.unfilteredPropNamesAndValueCounts = unfilteredCounts;
        return this._studyService.getAllFieldMetas(Object.keys(unfilteredCounts));
      })
      .then(allFieldMetas => {
        this.allFieldMetas = allFieldMetas;
        this.visiblePropNames = this.calcVisiblePropNames(allFieldMetas);

        this.classifiedProperties = this._studyService.classifyProperties(allFieldMetas);

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
      let visibility = fieldMetas[fieldName].visibility;
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
