import {Component, Input, AfterViewInit} from '@angular/core';
import * as Chart from 'chart.js';

@Component({
  styleUrls: ['./dashboard.scss'],
  template: `
    <div class="page">
      <div class="page-content">
        <div class="page-title">cBiT Dashboard</div>
        <div class="page-subtitle">BioMaterial Studies | Tendon Studies</div>
        <div>
          <cbit-gene-expression-chart></cbit-gene-expression-chart>
          <cbit-material-class-chart></cbit-material-class-chart>
        </div>
        <div style="margin-top: 30px">
          <cbit-studies-publication-chart></cbit-studies-publication-chart>
        </div>
      </div>
    </div>
  `
})
export class DashboardPage {

}
