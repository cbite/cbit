import {Component, Input, OnInit} from '@angular/core';
import {TendonsStudy} from '../../../../../core/types/Tendons-study';

@Component({
  selector: 'cbit-tendons-study-panel',
  styleUrls: ['./tendons-study-panel.scss'],
  template: `
    <div class="study-panel">
      <div class="header">{{study.name}}</div>
      <div class="body">
        <div class="description">{{study.description}}</div>
        <div class="detail-row">
          <div class="detail-column"><span class="field-label">Year</span> {{study.year}}</div>
          <div class="detail-column"><span class="field-label">Platform</span> {{study.platform}}</div>
        </div>
        <div class="detail-row">
          <div class="detail-column"><span class="field-label">Organism</span> {{study.organism}}</div>
          <div class="detail-column"><span class="field-label">Cell Origin</span> {{study.cellOrigin}}</div>
        </div>
        <div class="detail-row">
          <div class="detail-column"><span class="field-label">Sample Size</span> {{study.sampleSize}}</div>
        </div>
      </div>
      <div class="footer">
        <div class="link" (click)="onOpenExternal('ArrayExpress', study.arrayExpressId)">
          <i class="far fa-link"></i> Array Express
        </div>
        <div class="link" (click)="onOpenExternal('PubMed', study.pubMedId)">
          <i class="far fa-link"></i> PubMed
        </div>
      </div>
    </div>
  `
})
export class TendonsStudyPanelComponent {

  @Input()
  public study: TendonsStudy;

  constructor() {
  }

  onOpenExternal(url: string, id: string) {
  }
}
