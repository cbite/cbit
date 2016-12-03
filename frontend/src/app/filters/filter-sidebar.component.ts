import {Component, OnInit, ChangeDetectorRef, OnDestroy, Input, OnChanges} from '@angular/core';
import {FormControl} from "@angular/forms";
import {FiltersService, FiltersState} from "../services/filters.service";
import {StudyService, ManySampleCounts} from "../services/study.service";
import {Observable, Subject} from "rxjs";
import {FieldVisibility, FieldCategory, FieldMeta} from "../common/field-meta.model";
import * as _ from 'lodash';

interface ClassifiedPropertiesForGivenVisibility {
  [category: string]: string[]   // field names
}

interface ClassifiedProperties {
  [visibility: string]: ClassifiedPropertiesForGivenVisibility
}

@Component({
  selector: 'filter-sidebar-category',
  template: `
  <a href="#" (click)="$event.preventDefault(); collapsed = !collapsed">
    <span *ngIf="!collapsed" class="glyphicon glyphicon-triangle-bottom"></span>
    <span *ngIf=" collapsed" class="glyphicon glyphicon-triangle-right"></span>
    {{ categoryName }}
  </a>

  <ul [collapse]="collapsed">
    <sample-filters *ngFor="let propName of propNames" 
                    [category]="propName"
                    [allCounts]="unfilteredPropNamesAndValueCounts[propName] || {}"
                    [filteredCounts]="allSampleFilterMatchCounts[propName] || {}">
    </sample-filters>
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
  `]
})
export class FilterSidebarCategoryComponent implements OnInit {
  @Input() categoryName: string;
  @Input() unfilteredPropNamesAndValueCounts: any;
  @Input() allSampleFilterMatchCounts: any;
  @Input() propNames: string[] = [];

  @Input() initCollapsed: boolean;
  collapsed = false;

  ngOnInit() {
    this.collapsed = this.initCollapsed;
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
        
        <ul [collapse]="materialPropertiesCollapsed">
          <li>
            <filter-sidebar-category categoryName="General"
                                     [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                     [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                     [propNames]="classifiedProperties['Material > General'] || []"
                                     [initCollapsed]="initCollapsed"
            ></filter-sidebar-category>
          </li>

          <li>
            <filter-sidebar-category categoryName="Chemical"
                                     [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                     [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                     [propNames]="classifiedProperties['Material > Chemical'] || []"
                                     [initCollapsed]="initCollapsed"
            ></filter-sidebar-category>
          </li>

          <li>
            <filter-sidebar-category categoryName="Physical"
                                     [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                     [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                     [propNames]="classifiedProperties['Material > Physical'] || []"
                                     [initCollapsed]="initCollapsed"
            ></filter-sidebar-category>
          </li>

          <li>
            <filter-sidebar-category categoryName="Mechanical"
                                     [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                     [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                     [propNames]="classifiedProperties['Material > Mechanical'] || []"
                                     [initCollapsed]="initCollapsed"
            ></filter-sidebar-category>
          </li>

        </ul>
      </li>

      <li>
        <filter-sidebar-category categoryName="Biological Properties"
                                 [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                 [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                 [propNames]="classifiedProperties['Biological'] || []"
                                 [initCollapsed]="initCollapsed"
        ></filter-sidebar-category>
      </li>
      
      <li>
        <filter-sidebar-category categoryName="Technical Properties"
                                 [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                 [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                 [propNames]="classifiedProperties['Technical'] || []"
                                 [initCollapsed]="initCollapsed"
        ></filter-sidebar-category>
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
  @Input() unfilteredPropNamesAndValueCounts: any = {};
  @Input() allSampleFilterMatchCounts: any = {};
  @Input() classifiedProperties: ClassifiedPropertiesForGivenVisibility = {};
  @Input() initCollapsed: boolean;
  materialPropertiesCollapsed = false;
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
  
      <li>
        <span class="filter-heading">
          MAIN FILTERS
        </span>
        <filter-sidebar-all-ul [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                               [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                               [classifiedProperties]="classifiedProperties.main || {}"
                               [initCollapsed]="false"
        ></filter-sidebar-all-ul>
      </li>
      
      <li>
        <span class="filter-heading">
          ADDITIONAL FILTERS
        </span>
        
        <ul>
          <li class="checkbox nav-header">
            <label>
              <input id="includeControls" type="checkbox" name="includeControls" [formControl]="includeControlsInForm"/>
              Also include associated controls
            </label>
          </li>
        </ul>
        
        <filter-sidebar-all-ul [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
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

  // classifiedProperties looks something like this:
  // {
  //   "main": {          <-- visibility from metadata
  //     "Technical": [   <-- category from metadata
  //        "NameOfMainTechnicalField1",
  //        "NameOfMainTechnicalField2",
  //        ...
  //      ],
  //      "Biological": [
  //        ...
  //      ],
  //      ...
  //   },
  //   "additional": {
  //     ...
  //   },
  //   ...
  // }
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
        console.log(`unfilteredCounts = ${JSON.stringify(unfilteredCounts)}`);
        this.unfilteredPropNamesAndValueCounts = unfilteredCounts;
        return this._studyService.getAllFieldMetas(Object.keys(unfilteredCounts));
      })
      .then(allFieldMetas => {
        console.log(`allFieldMetas = ${JSON.stringify(allFieldMetas)}`);
        this.allFieldMetas = allFieldMetas;
        this.visiblePropNames = this.calcVisiblePropNames(allFieldMetas);

        this.classifiedProperties = this.classifyProperties(allFieldMetas);
        console.log(`classifiedProperties = ${JSON.stringify(this.classifiedProperties)}`);

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

  classifyProperties(fieldMetas: {[fieldName: string]: FieldMeta}): ClassifiedProperties {
    let self = this;

    // See lodash docs for "_.mergeWith"
    let customizer = function(objValue: any, srcValue: any) {
      if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    }

    let result: ClassifiedProperties = {};
    for (let fieldName in fieldMetas) {
      let fieldMeta = fieldMetas[fieldName];
      result = _.mergeWith(result, {
        [fieldMeta.visibility || "additional"]: {
          [fieldMeta.category || "Technical"]: [
            fieldName
          ]
        }
      }, customizer);
    }

    for (let visibility in result) {
      for (let category in result[visibility]) {
        result[visibility][category] = result[visibility][category].sort(
          (a: string, b: string) => this.withoutStar(a).localeCompare(this.withoutStar(b))
        );
      }
    }

    return result;
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
