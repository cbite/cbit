import {Component, OnInit} from '@angular/core';
import {TendonsStudy} from '../../../core/types/Tendons-study';
import {TendonsStudyService} from '../../../core/services/tendons-study.service';
import {WindowRef} from '../../../shared/util/WindowRef';
import {ExternalLinkService} from '../../../services/external-link.service';
import {GoogleAnalyticsService} from '../../../services/google-analytics.service';

@Component({
  styleUrls: ['./tendons-studies-browse.scss'],
  template: `
    <div class="container-fluid no-gutters">
      <div class="row no-gutters">
        <div class="col-3 sidebar">
          <cbit-tendons-browser-sidebar [studies]="studies" (updateFiltered)="onUpdateFiltered($event)">
          </cbit-tendons-browser-sidebar>
        </div>
        <div class="col-9 main">
          <div class="title-panel">
            <h3>Results</h3>
            <cbit-tendons-study-results-header
              [studies]="filteredStudies"
              [sortField]="sortField"
              [sortFields]="sortFields"
              (sortingChange)="onSortingChanged($event)">
            </cbit-tendons-study-results-header>
          </div>
          <cbit-tendons-study-panel *ngFor="let study of filteredStudies"
                                    [study]="study"
                                    (openExternal)="onOpenExternal($event)"></cbit-tendons-study-panel>
        </div>
      </div>
    </div>
  `
})
export class TendonsStudiesBrowsePage implements OnInit {

  public studies: TendonsStudy[] = [];
  public filteredStudies: TendonsStudy[] = [];

  public sortFields = ['Name', 'Year', 'Platform'];
  public sortField = 'Name';

  constructor(private tendonsStudyService: TendonsStudyService, private externalLinkService: ExternalLinkService) {
  }

  ngOnInit(): void {
    this.loadStudies();
  }

  private loadStudies() {
    this.tendonsStudyService.getStudies().subscribe(studies => {
      this.studies = studies;
      this.filteredStudies = studies;
    });
  }

  public onOpenExternal(info) {
    this.externalLinkService.navigateTo(info.source, info.id, info.studyId);
  }

  public onUpdateFiltered(newStudies: TendonsStudy[]) {
    const field = this.sortField.toLowerCase();

    if (newStudies && newStudies.length > 0) {
      this.filteredStudies = newStudies.sort((a, b) =>
        (-('' + a[field]).localeCompare('' + b[field])));
    } else {
      this.filteredStudies = [];
    }
  }

  public onSortingChanged(sortField: string) {
    this.sortField = sortField;
    this.onUpdateFiltered(this.filteredStudies);
  }
}
