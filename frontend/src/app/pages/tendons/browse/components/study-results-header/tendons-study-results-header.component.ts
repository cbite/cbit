import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TendonsStudy} from '../../../../../core/types/Tendons-study';

@Component({
  selector: 'cbit-tendons-study-results-header',
  styleUrls: ['./tendons-study-results-header.scss'],
  template: `
    <ng-container *ngIf="studies">
      {{ studies.length }} studies sorted by
      <div class="sorting"
           (mouseleave)="onMouseLeaveSorting()"
           (mouseenter)="onMouseEnterSorting()">
        {{sortField}} <i class="far fa-angle-down"></i>
        <div class="sorting-options" *ngIf="isSortingOpen">
          <div class="sorting-option"
               *ngFor="let field of sortFields" (click)="onSortFieldClicked(field)">{{field}}</div>
        </div>
      </div>
    </ng-container>
  `
})
export class TendonsStudyResultsHeaderComponent {

  @Input()
  public studies: TendonsStudy[];

  @Input()
  public sortField: string;

  @Input()
  public sortFields: string[];

  @Output()
  public sortingChange = new EventEmitter<string>();

  public isSortingOpen = false;

  constructor() {
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
