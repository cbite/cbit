import {Component, OnInit, ChangeDetectorRef, OnDestroy, Input, OnChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {FiltersService, FiltersState} from '../../services/filters.service';
import {
  StudyService,
  ManySampleCounts,
  ClassifiedProperties,
  ClassifiedPropertiesForGivenVisibility
} from '../../../../core/services/study.service';
import {Observable, Subject} from 'rxjs';
import * as _ from 'lodash';
// import {ModalDirective} from "ngx-bootstrap";
import {CollapseStateService} from '../../../../core/services/collapse-state.service';

@Component({
  selector: 'cbit-filter-sidebar-all-ul',
  styleUrls: ['./filter-sidebar-all-ul.scss'],
  template: `
    <div>
      <div class="filter-category-title" (click)="materialPropertiesCollapsed = !materialPropertiesCollapsed">
        <span *ngIf="!materialPropertiesCollapsed" style="margin-right: 5px"><i class="fas fa-caret-down"></i></span>
        <span *ngIf=" materialPropertiesCollapsed" style="margin-right: 5px"><i class="fas fa-caret-right"></i></span>
        Material Properties
      </div>
      <div class="filter-category-content" *ngIf="!materialPropertiesCollapsed">
        <ul>
          <li>
            <cbit-filter-sidebar-category [prefix]="name + '-material-'"
                                          categoryName="General"
                                          [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                          [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                          [propNames]="classifiedProperties['Material > General'] || []"
                                          [initCollapsed]="initCollapsed"
            ></cbit-filter-sidebar-category>
          </li>
          <li>
            <cbit-filter-sidebar-category [prefix]="name + '-material-'"
                                          categoryName="Chemical"
                                          [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                          [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                          [propNames]="classifiedProperties['Material > Chemical'] || []"
                                          [initCollapsed]="initCollapsed"
            ></cbit-filter-sidebar-category>
          </li>

          <li>
            <cbit-filter-sidebar-category [prefix]="name + '-material-'"
                                          categoryName="Physical"
                                          [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                          [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                          [propNames]="classifiedProperties['Material > Physical'] || []"
                                          [initCollapsed]="initCollapsed"
            ></cbit-filter-sidebar-category>
          </li>

          <li>
            <cbit-filter-sidebar-category [prefix]="name + '-material-'"
                                          categoryName="Mechanical"
                                          [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                          [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                          [propNames]="classifiedProperties['Material > Mechanical'] || []"
                                          [initCollapsed]="initCollapsed"
            ></cbit-filter-sidebar-category>
          </li>
        </ul>
      </div>
      <div class="filter-category-title" (click)="biologicalPropertiesCollapsed = !biologicalPropertiesCollapsed">
          <span *ngIf="!biologicalPropertiesCollapsed" style="margin-right: 5px"><i
            class="fas fa-caret-down"></i></span>
        <span *ngIf=" biologicalPropertiesCollapsed" style="margin-right: 5px"><i
          class="fas fa-caret-right"></i></span>
        Biological Properties
      </div>
      <div class="filter-category-content" *ngIf="!biologicalPropertiesCollapsed">
        <cbit-filter-sidebar-category [prefix]="name + '-biological-'"
                                      [oneLevel]="true"
                                      categoryName="Biological Properties"
                                      [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                      [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                      [propNames]="classifiedProperties['Biological'] || []"
                                      [initCollapsed]="initCollapsed"
        ></cbit-filter-sidebar-category>
      </div>
      <div class="filter-category-title" (click)="technicalPropertiesCollapsed = !technicalPropertiesCollapsed">
        <span *ngIf="!technicalPropertiesCollapsed" style="margin-right: 5px"><i class="fas fa-caret-down"></i></span>
        <span *ngIf=" technicalPropertiesCollapsed" style="margin-right: 5px"><i class="fas fa-caret-right"></i></span>
        Technical Properties
      </div>
      <div class="filter-category-content" *ngIf="!technicalPropertiesCollapsed">
        <ul>
          <li>
            <cbit-filter-sidebar-category [prefix]="name + '-technical-'"
                                          categoryName="General"
                                          [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                          [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                          [propNames]="classifiedProperties['Technical > General'] || []"
                                          [initCollapsed]="initCollapsed"
            ></cbit-filter-sidebar-category>
          </li>

          <li>
            <cbit-filter-sidebar-category [prefix]="name + '-technical-'"
                                          categoryName="Microarray"
                                          [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                          [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                          [propNames]="classifiedProperties['Technical > Microarray'] || []"
                                          [initCollapsed]="initCollapsed"
            ></cbit-filter-sidebar-category>
          </li>

          <li>
            <cbit-filter-sidebar-category [prefix]="name + '-technical-'"
                                          categoryName="RNA sequencing"
                                          [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                          [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                          [propNames]="classifiedProperties['Technical > RNA sequencing'] || []"
                                          [initCollapsed]="initCollapsed"
            ></cbit-filter-sidebar-category>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class FilterSidebarAllULComponent {
  @Input() name: string;
  @Input() unfilteredPropNamesAndValueCounts: any = {};
  @Input() allSampleFilterMatchCounts: any = {};
  @Input() classifiedProperties: ClassifiedPropertiesForGivenVisibility = {};
  @Input() initCollapsed: boolean;

  constructor(private _collapsedStateService: CollapseStateService) {
  }

  get materialPropertiesCollapsed() {
    return this._collapsedStateService.isCollapsed(`fsall-material-${this.name}`, true);
  }

  set materialPropertiesCollapsed(value: boolean) {
    this._collapsedStateService.setCollapsed(`fsall-material-${this.name}`, value);
  }

  get technicalPropertiesCollapsed() {
    return this._collapsedStateService.isCollapsed(`fsall-technical-${this.name}`, true);
  }

  set technicalPropertiesCollapsed(value: boolean) {
    this._collapsedStateService.setCollapsed(`fsall-technical-${this.name}`, value);
  }

  get biologicalPropertiesCollapsed() {
    return this._collapsedStateService.isCollapsed(`fsall-biological-${this.name}`, true);
  }

  set biologicalPropertiesCollapsed(value: boolean) {
    this._collapsedStateService.setCollapsed(`fsall-biological-${this.name}`, value);
  }
}
