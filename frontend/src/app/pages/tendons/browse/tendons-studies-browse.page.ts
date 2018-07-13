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
                <ng-container *ngIf="studies">
                  {{ filteredStudies.length }} studies sorted by
                  <span class="sorting">Title <i class="far fa-angle-down"></i></span>
                </ng-container>
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

  public onUpdateFiltered(filteredStudies: TendonsStudy[]) {
    this.filteredStudies = filteredStudies;
  }
}
