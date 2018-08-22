import {Component, Input, AfterViewInit, OnInit} from '@angular/core';
import * as Chart from 'chart.js';
import {Router} from '@angular/router';
import {AppUrls} from '../../router/app-urls';
import {DashboardService} from './services/dashboard.service';

@Component({
  styleUrls: ['./dashboard.scss'],
  template: `
    <div class="page">
        <div class="header">
          <span class="link" (click)="goToDashboard()"><i class="fas fa-chart-bar"></i> Dashboard</span>
        </div>
      <div class="page-content">
        <div class="page-title">cBiT Dashboard</div>
        <div class="page-subtitle">
          <span class="link" (click)="onBioMaterialClicked()">BioMaterial Studies</span> |
          <span class="link" (click)="onTendonClicked()">Tendon Studies</span>
        </div>
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
export class DashboardPage implements OnInit {

  constructor(private router: Router, private dashboardService: DashboardService) {}

  public ngOnInit(): void {
    this.dashboardService.getDashboardSamples().subscribe((samples) => {
      console.log(samples);
    });
  }

  public onBioMaterialClicked() {
    this.router.navigateByUrl(AppUrls.browseBioMaterialStudiesUrl);
  }

  public onTendonClicked() {
    this.router.navigateByUrl(AppUrls.browseTendonStudiesUrl);
  }
}
