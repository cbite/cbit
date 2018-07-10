import {Component, OnInit, ChangeDetectorRef, OnDestroy, Input, OnChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {FiltersService, FiltersState} from '../../services/filters.service';
import {StudyService, ManySampleCounts, ClassifiedProperties, ClassifiedPropertiesForGivenVisibility} from '../../../../core/services/study.service';
import {Observable, Subject} from 'rxjs';
import * as _ from 'lodash';
// import {ModalDirective} from "ngx-bootstrap";
import {CollapseStateService} from '../../../../core/services/collapse-state.service';

@Component({
  selector: 'cbit-filter-sidebar-all-ul',
  styleUrls: ['./filter-sidebar-all-ul.scss'],
  template: `
    <ul>
      <li>
        <a href="#" (click)="$event.preventDefault(); materialPropertiesCollapsed = !materialPropertiesCollapsed">
          <span *ngIf="!materialPropertiesCollapsed"><i class="fas fa-caret-down"></i></span>
          <span *ngIf=" materialPropertiesCollapsed"><i class="fas fa-caret-right"></i></span>
          Material Properties
        </a>

        <ul *ngIf="!materialPropertiesCollapsed">
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
      </li>

      <li>
        <cbit-filter-sidebar-category [prefix]="name + '-biological-'"
                                 categoryName="Biological Properties"
                                 [unfilteredPropNamesAndValueCounts]="unfilteredPropNamesAndValueCounts"
                                 [allSampleFilterMatchCounts]="allSampleFilterMatchCounts"
                                 [propNames]="classifiedProperties['Biological'] || []"
                                 [initCollapsed]="initCollapsed"
        ></cbit-filter-sidebar-category>
      </li>

      <li>
        <a href="#" (click)="$event.preventDefault(); technicalPropertiesCollapsed = !technicalPropertiesCollapsed">
          <span *ngIf="!technicalPropertiesCollapsed"><i class="fas fa-caret-down"></i></span>
          <span *ngIf=" technicalPropertiesCollapsed"><i class="fas fa-caret-right"></i></span>
          Technical Properties
        </a>

        <ul *ngIf="!technicalPropertiesCollapsed">
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
      </li>
    </ul>
  `
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
