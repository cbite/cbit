import {Component, EventEmitter, Input, OnChanges, SimpleChanges, Output} from '@angular/core';
import {UnifiedMatch} from '../../../../../core/services/study.service';
import {Study} from '../../../../../core/types/study.model';
import {FiltersState} from '../../services/filters.service';

@Component({
  selector: 'cbit-study-results',
  styleUrls: ['./study-results.scss'],
  template: `
    <div class="title-panel">
      <div class="title">Results
        <a class="instructions button-standard" href="/assets/pdfs/cBiT user manual.pdf" target="_blank">cBiT user
          manual</a>
      </div>
      <div class="match-count">{{ numMatchingStudies }} studies ({{ numMatchingSamples }} samples) sorted by</div>
      <div class="sorting"
           (mouseleave)="onMouseLeaveSorting()"
           (mouseenter)="onMouseEnterSorting()">
        {{sortField}} <i class="far fa-angle-down"></i>
        <div class="sorting-options" *ngIf="isSortingOpen">
          <div class="sorting-option"
               *ngFor="let field of sortFields" (click)="onSortFieldClicked(field)">{{field}}
          </div>
        </div>
      </div>
      <div class="filters" *ngIf="activeFilters && activeFilters.length>0">
        <div class="filter-header">Active filters:</div>
        <div class="filter" *ngFor="let activeFilter of activeFilters">
          <div class="filter-item" (click)="onFilterClick(activeFilter)">
            <span>{{activeFilter.caption}}</span>
            <span class="remove"><i class="fal fa-times"></i></span>
          </div>
        </div>
      </div>
    </div>

    <div class="results container-fluid">
      <ng-container *ngFor="let row of (matches | splitByTwoPipe)">
        <div class="row">
          <div class="col-6" *ngFor="let match of row">
            <cbit-study-result [match]="match"
                               (showDetails)="onShowDetails(match)"
                               (download)="onDownload($event)">
            </cbit-study-result>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class StudyResultsComponent implements OnChanges {

  @Input()
  public matches: UnifiedMatch[] = [];

  @Input()
  public filters: FiltersState;

  @Input()
  public sortField: string;

  @Input()
  public sortFields: string[];

  @Output()
  public showDetails = new EventEmitter<UnifiedMatch>();

  @Output()
  public download = new EventEmitter<Study>();

  @Output()
  public removeFilter = new EventEmitter<string>();

  @Output()
  public sortingChange = new EventEmitter<string>();

  public isSortingOpen = false;

  public activeFilters: Filter[];
  public numMatchingStudies = 0;
  public numMatchingSamples = 0;

  public ngOnChanges(changes: SimpleChanges): void {
    this.numMatchingStudies = this.matches.length;
    this.numMatchingSamples = this.matches.reduce((soFar, studyMatch) => soFar + studyMatch.sampleMatches.length, 0);

    if (changes.filters && changes.filters.currentValue) {
      this.activeFilters = Object.getOwnPropertyNames(this.filters.sampleFilters).map(filter => {
        const caption = filter.startsWith('*') ? filter.substr(1) : filter;
        return new Filter(filter, caption);
      });
    }
  }

  public onShowDetails(match: UnifiedMatch) {
    this.showDetails.emit(match);
  }

  public onDownload(study: Study) {
    this.download.emit(study);
  }

  public onFilterClick(filter: Filter) {
    this.removeFilter.emit(filter.category);
  }

  public onSortFieldClicked(sortField: string) {
    this.isSortingOpen = false;
    this.sortingChange.emit(sortField);
  }

  public onMouseLeaveSorting() {
    this.isSortingOpen = false;
  }

  public onMouseEnterSorting() {
    this.isSortingOpen = true;
  }
}

export class Filter {
  constructor(public category: string, public caption: string) {
  }
}
