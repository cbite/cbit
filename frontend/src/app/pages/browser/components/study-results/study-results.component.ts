import {Component, EventEmitter, Input, OnChanges, SimpleChanges, Output} from '@angular/core';
import {UnifiedMatch} from '../../../../core/services/study.service';

@Component({
  selector: 'cbit-study-results',
  styleUrls: ['./study-results.scss'],
  template: `
    <div class="title-panel">
      <h3>Results</h3>
      {{ numMatchingStudies }} studies, {{ numMatchingSamples }} samples
    </div>

    <div class="container-fluid">
      <ng-container *ngFor="let row of (matches | splitByTwoPipe)">
        <div class="row" style="margin-top: 20px">
          <div class="col-6" *ngFor="let match of row">
            <cbit-study-result [match]="match"
              (showDetails)="onShowDetails(match)">
            </cbit-study-result>
          </div>
        </div>
      </ng-container>
    </div>

    <!--<div *ngIf="fieldMetasReady" class="row">-->

    <!--&lt;!&ndash; Have to expand *ngFor manually here to insert clearfix every 3 items &ndash;&gt;-->
    <!--<ng-template ngFor let-studyMatch [ngForOf]="matches" let-i="index">-->
    <!--<div class="col-md-4">-->

    <!--<div class="panel"-->
    <!--[class.panel-default]="studySelectedState(studyMatch) === 'no'"-->
    <!--[class.panel-success]="studySelectedState(studyMatch) === 'yes'"-->
    <!--[class.panel-warning]="studySelectedState(studyMatch) === 'partial'"-->
    <!--&gt;-->
    <!--<div class="panel-heading">-->

    <!--<a (click)="$event.preventDefault(); detailModal.show()" href="#">-->
    <!--<h3 class="panel-title" style="float:left;width:80%">{{ studyMatch.study._source['STUDY']['Study Title'] }}</h3>-->
    <!--</a>-->
    <!--<div *ngIf="!studyMatch.study._source['*Visible']" class="embargo">[Invisible to public!]</div>-->

    <!--<div [ngSwitch]="studySelectedState(studyMatch)" class="panel-heading-plus-minus-buttons">-->

    <!--<a *ngSwitchCase="'no'" href="#" class="btn btn-success btn-xs" role="button"-->
    <!--(click)="$event.preventDefault(); selectStudy(studyMatch)">-->
    <!--<span class="glyphicon glyphicon-plus"></span>-->
    <!--</a>-->

    <!--<a *ngSwitchCase="'partial'" href="#" class="btn btn-success btn-xs" role="button"-->
    <!--(click)="$event.preventDefault(); selectStudy(studyMatch)">-->
    <!--<span class="glyphicon glyphicon-plus"></span>-->
    <!--</a>-->
    <!--<a *ngSwitchCase="'partial'" href="#" class="btn btn-danger btn-xs" role="button"-->
    <!--(click)="$event.preventDefault(); deselectStudy(studyMatch)">-->
    <!--<span class="glyphicon glyphicon-minus"></span>-->
    <!--</a>-->

    <!--<a *ngSwitchCase="'yes'" href="#" class="btn btn-danger btn-xs" role="button"-->
    <!--(click)="$event.preventDefault(); deselectStudy(studyMatch)">-->
    <!--<span class="glyphicon glyphicon-minus"></span>-->
    <!--</a>-->

    <!--</div>-->
    <!--<div class="clearfix"></div>-->
    <!--</div>-->
    <!--<div class="panel-body">-->
    <!--<p>by {{ studyMatch.study._source['STUDY']['Study Researchers Involved'] }}</p>-->

    <!--<a (click)="setSamplesShown(studyMatch.study._id, !areSamplesShown(studyMatch.study._id))" href="javascript:void(0)">-->
    <!--<span *ngIf="!areSamplesShown(studyMatch.study._id)" class="glyphicon glyphicon-triangle-right"></span>-->
    <!--<span *ngIf=" areSamplesShown(studyMatch.study._id)" class="glyphicon glyphicon-triangle-bottom"></span>-->
    <!--{{ studyMatch.sampleMatches.length }} matching samples-->
    <!--({{ countMatchingSamplesInSelection(studyMatch) }} selected)-->
    <!--</a>-->

    <!--<div *ngIf="areSamplesShown(studyMatch.study._id)">-->
    <!--<ul style="list-style: none">-->
    <!--<li *ngFor="let sampleMatch of sortSampleMatches(studyMatch.sampleMatches)">-->
    <!--<ng-template #tooltipTemplate>-->
    <!--<div [innerHtml]="tooltipHtmlFor(studyMatch.study._id, sampleMatch)"></div>-->
    <!--</ng-template>-->
    <!--<div [my-tooltip]="tooltipTemplate" [placement]="tooltipPlacementForIndex(i)">-->

    <!--<a *ngIf="!isSampleSelected(studyMatch.study._id, sampleMatch._id)" href="#"-->
    <!--class="btn btn-success btn-xs" role="button"-->
    <!--(click)="$event.preventDefault(); selectSample(studyMatch.study._id, sampleMatch._id)">-->
    <!--<span class="glyphicon glyphicon-plus"></span>-->
    <!--</a>-->

    <!--<a *ngIf="isSampleSelected(studyMatch.study._id, sampleMatch._id)" href="#"-->
    <!--class="btn btn-danger btn-xs" role="button"-->
    <!--(click)="$event.preventDefault(); deselectSample(studyMatch.study._id, sampleMatch._id)">-->
    <!--<span class="glyphicon glyphicon-minus"></span>-->
    <!--</a>-->

    <!--<b>{{ sampleMatch._source['Sample Name'] }}</b>-->
    <!--<span *ngFor="let kv of genSampleMiniSummary(studyMatch.study._id, sampleMatch) | mapToIterable; let isLast = last">-->
    <!--<i>{{ kv.key }}</i>: {{ kv.val }}<span *ngIf="!isLast">, </span>-->
    <!--</span>-->
    <!--</div>-->
    <!--</li>-->
    <!--</ul>-->
    <!--</div>-->
    <!--</div>-->

    <!--<a *ngIf="isAdmin()"-->
    <!--[href]="studyMatch.study._source['*Archive URL']"-->
    <!--class="btn btn-default" role="button">-->
    <!--<span class="glyphicon glyphicon-download-alt"></span>-->
    <!--Download-->
    <!--</a>-->
    <!--</div>-->
    <!--<div class="clearfix"></div>-->
    <!--</div>-->
    <!--</div>-->

    <!--</div>-->

    <!--&lt;!&ndash;<div bsModal #detailModal="bs-modal" class="modal fade" role="dialog">&ndash;&gt;-->
    <!--&lt;!&ndash;<div class="modal-dialog">&ndash;&gt;-->

    <!--&lt;!&ndash;<div class="modal-content">&ndash;&gt;-->
    <!--&lt;!&ndash;<div class="modal-header">&ndash;&gt;-->
    <!--&lt;!&ndash;<button type="button" class="close" (click)="detailModal.hide()">&times;</button>&ndash;&gt;-->
    <!--&lt;!&ndash;<h4 class="modal-title">{{ studyMatch.study._source['STUDY']['Study Title'] }}</h4>&ndash;&gt;-->
    <!--&lt;!&ndash;</div>&ndash;&gt;-->
    <!--&lt;!&ndash;<div class="modal-body">&ndash;&gt;-->
    <!--&lt;!&ndash;<study [studyId]="studyMatch.study._id"></study>&ndash;&gt;-->
    <!--&lt;!&ndash;</div>&ndash;&gt;-->
    <!--&lt;!&ndash;<div class="modal-footer">&ndash;&gt;-->
    <!--&lt;!&ndash;<button type="button" class="btn btn-default" (click)="detailModal.hide()">Close</button>&ndash;&gt;-->
    <!--&lt;!&ndash;</div>&ndash;&gt;-->
    <!--&lt;!&ndash;</div>&ndash;&gt;-->

    <!--&lt;!&ndash;</div>&ndash;&gt;-->
    <!--&lt;!&ndash;</div>&ndash;&gt;-->


    <!--<div *ngIf="((i + 1) % 3) === 0" class="clearfix"></div>-->
    <!--</ng-template>-->
    <!--</div>-->

    <!--</div>-->

    <!--<div class="col-xs-3 footer-fixed-bottom nav">-->
    <!--<li>-->
    <!--<a href="javascript:void(0)" (click)="clearFilters()">-->
    <!--<span class="glyphicon glyphicon-ban-circle"></span> Clear Filters-->
    <!--</a>-->
    <!--</li>-->
    <!--</div>-->


    <!--<div bsModal #allFieldsModal="bs-modal" class="modal fade" role="dialog" (onShow)="allFields.refresh()">-->
    <!--<div class="modal-dialog">-->

    <!--<div class="modal-content">-->
    <!--<div class="modal-header">-->
    <!--<button type="button" class="close" (click)="allFieldsModal.hide()">&times;</button>-->
    <!--<h4 class="modal-title">Full list of fields</h4>-->
    <!--</div>-->
    <!--<div class="modal-body">-->
    <!--<all-fields #allFields="allFields"></all-fields>-->
    <!--</div>-->
    <!--<div class="modal-footer">-->
    <!--<button type="button" class="btn btn-default" (click)="allFieldsModal.hide()">Close</button>-->
    <!--</div>-->
    <!--</div>-->

    <!--</div>-->
    <!--</div>-->
  `
})
export class StudyResultsComponent implements OnChanges {

  @Input()
  public matches: UnifiedMatch[] = [];

  @Output()
  public showDetails = new EventEmitter<UnifiedMatch>();

  public numMatchingStudies = 0;
  public numMatchingSamples = 0;

  public ngOnChanges(changes: SimpleChanges): void {
    this.numMatchingStudies = this.matches.length;
    this.numMatchingSamples = this.matches.reduce((soFar, studyMatch) => soFar + studyMatch.sampleMatches.length, 0);
  }

  public onShowDetails(match: UnifiedMatch) {
    this.showDetails.emit(match);
  }
}
