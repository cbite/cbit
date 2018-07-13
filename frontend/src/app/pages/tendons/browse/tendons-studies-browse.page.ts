import {Component, OnInit} from '@angular/core';
import {TendonsStudy} from '../../../core/types/Tendons-study';
import {TendonsStudyService} from '../../../core/services/tendons-study.service';
import {WindowRef} from '../../../shared/util/WindowRef';

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
          <cbit-tendons-study-panel *ngFor="let study of filteredStudies" [study]="study"></cbit-tendons-study-panel>
        </div>
      </div>
    </div>
  `
})
export class TendonsStudiesBrowsePage implements OnInit {

  public studies: TendonsStudy[] = [];
  public filteredStudies: TendonsStudy[] = [];
  private nativeWindow: any;
  public sortFields = ['Name', 'Year', 'Platform'];
  public sortField = 'Name';

  constructor(private tendonsStudyService: TendonsStudyService, private winRef: WindowRef) {
    this.nativeWindow = winRef.getNativeWindow();
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

  public onOpenExternal(source: string, id: string) {
    if (source === 'ArrayExpress') {
      this.nativeWindow.open(`https://www.ebi.ac.uk/arrayexpress/experiments/${id}`);
    } else if (source === 'PubMed') {
      this.nativeWindow.open(`https://www.ncbi.nlm.nih.gov/pubmed/${id}`);
    }
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
