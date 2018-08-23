import {Component, Input, AfterViewInit, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AppUrls} from '../../router/app-urls';
import {DashboardService} from './services/dashboard.service';
import {PieChartData} from './components/pie-chart/pie-chart.data';
import {preparePieChartData} from './components/pie-chart/pie-chart-helper';
import {BarChartData} from './components/bar-chart/bar-chart.data';
import {prepareBarChartData} from './components/bar-chart/bar-chart-helper';

@Component({
  styleUrls: ['./dashboard.scss'],
  template: `
    <div class="page">
        <div class="header">
          <span class="link"><i class="fas fa-chart-bar"></i> Dashboard</span>
        </div>
      <div class="page-content">
        <div class="page-title">cBiT Dashboard</div>
        <div class="page-subtitle">
          <span class="link" (click)="onBioMaterialClicked()">BioMaterial Studies</span> |
          <span class="link" (click)="onTendonClicked()">Tendon Studies</span>
        </div>
        <div>
          <cbit-bar-chart [title]="'Studies by Gene Expression Type'"
                          [chartId]="'geneExpressionChart'"
                          [chartData]="geneExpressionData"></cbit-bar-chart>
          <cbit-bar-chart [title]="'Studies by PublicationYear'"
                          [chartId]="'publicationYearChart'"
                          [stacked]="true"
                          [chartData]="publicationYearData" style="margin-left: 30px;"></cbit-bar-chart>
        </div>
        <div style="margin-top: 30px">
          <cbit-pie-chart [chartId]="'materialClassChart'"
                          [title]="'Biomaterial Studies by Material Class'"
                          [chartData]="materialClassData"></cbit-pie-chart>
          <cbit-pie-chart [chartId]="'materialChart'"
                          [title]="'Biomaterial Studies by Material'"
                          [chartData]="materialData" style="margin-left: 30px;"></cbit-pie-chart>
        </div>
        <div style="margin-top: 30px; margin-bottom: 70px">
          <cbit-pie-chart [chartId]="'organismChart'"
                          [title]="'Biomaterial Studies by Organism'"
                          [chartData]="organismData"></cbit-pie-chart>
          <cbit-pie-chart [chartId]="'cellStrainChart'"
                          [title]="'Biomaterial Studies by Cellstrain'"
                          [chartData]="cellStrainData" style="margin-left: 30px;"></cbit-pie-chart>
        </div>
      </div>
    </div>
  `
})
export class DashboardPage implements OnInit {

  public geneExpressionData: BarChartData;
  public publicationYearData: BarChartData;

  public materialClassData: PieChartData;
  public organismData: PieChartData;
  public cellStrainData: PieChartData;
  public materialData: PieChartData;

  constructor(private router: Router,
              private dashboardService: DashboardService) {}

  public ngOnInit(): void {
    this.dashboardService.getDashboardSamplesData().subscribe((data) => {
      this.materialClassData = preparePieChartData(data, 'materialClass');
      this.organismData = preparePieChartData(data, 'organism');
      this.cellStrainData = preparePieChartData(data, 'cellStrainAbbreviation');
      this.materialData = preparePieChartData(data, 'materialName');
    });

    this.dashboardService.getDashboardStudiesData().subscribe((data) => {
      this.geneExpressionData = prepareBarChartData(data, 'geneExpressionType');
      this.publicationYearData = prepareBarChartData(data, 'year');
    });
  }

  public onBioMaterialClicked() {
    this.router.navigateByUrl(AppUrls.browseBioMaterialStudiesUrl);
  }

  public onTendonClicked() {
    this.router.navigateByUrl(AppUrls.browseTendonStudiesUrl);
  }
}
