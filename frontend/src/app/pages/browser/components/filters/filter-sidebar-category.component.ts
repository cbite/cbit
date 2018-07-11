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
  selector: 'cbit-filter-sidebar-category',
  styleUrls: ['./filter-sidebar-category.scss'],
  template: `
    <ng-container *ngIf="!oneLevel">
      <a href="#" (click)="$event.preventDefault(); collapsed = !collapsed">
        <span *ngIf="!collapsed"><i class="fas fa-caret-down"></i></span>
        <span *ngIf=" collapsed"><i class="fas fa-caret-right"></i></span>
        {{ categoryName }}
      </a>
    </ng-container>

    <ul *ngIf="!collapsed || oneLevel">
      <div *ngFor="let propName of propNames">
        <sample-filters *ngIf="isNormalProp(propName)"
                        [category]="propName"
                        [allCounts]="unfilteredPropNamesAndValueCounts[propName] || {}"
                        [filteredCounts]="allSampleFilterMatchCounts[propName] || {}">
        </sample-filters>

        <div *ngIf="isSpecialPropsHeader(propName)" class="detailed-breakdown">
          <a href="#"
             (click)="$event.preventDefault(); setSpecialDetailExpanded(propName, !isSpecialDetailExpanded(propName))">
            <span *ngIf=" isSpecialDetailExpanded(propName)"><i class="fas fa-caret-down"></i></span>
            <span *ngIf="!isSpecialDetailExpanded(propName)"><i class="fas fa-caret-right"></i></span>
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
  `
})
export class FilterSidebarCategoryComponent {

  @Input() categoryName: string;
  @Input() unfilteredPropNamesAndValueCounts: any;
  @Input() allSampleFilterMatchCounts: any;
  @Input() propNames: string[] = [];
  @Input() prefix: string;
  @Input() oneLevel = false;
  @Input() initCollapsed: boolean;

  get collapsed(): boolean {
    return this._collapsedStateService.isCollapsed(`fscat-${this.prefix}-${this.categoryName}`, this.initCollapsed);
  }

  set collapsed(value: boolean) {
    this._collapsedStateService.setCollapsed(`fscat-${this.prefix}-${this.categoryName}`, value);
  }

  constructor(private _collapsedStateService: CollapseStateService) {
  }

  specialPropNames = ['Elements composition', 'Phase composition', 'Wettability'];

  isSpecialDetailExpanded(propName: string) {
    return this._collapsedStateService.isCollapsed(`fscat-special-${this.prefix}-${this.categoryName}-${propName}`, false);
  }

  setSpecialDetailExpanded(propName: string, value: boolean) {
    return this._collapsedStateService.setCollapsed(`fscat-special-${this.prefix}-${this.categoryName}-${propName}`, value);
  }

  isNormalProp(propName: string) {
    for (const specialPropName of this.specialPropNames) {
      if (propName !== specialPropName && propName.startsWith('*' + specialPropName)) {

        // Mark the broken down fields like "Elements composition - Ca" as special, but not the header fields like "Elements composition"
        return false;
      }
    }
    return true;
  }

  isSpecialPropsHeader(propName: string) {
    for (const specialPropName of this.specialPropNames) {
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
