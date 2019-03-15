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
        <div class="page-title with-subtitle">All Studies</div>
        <div class="page-subtitle">
          <span class="link" (click)="onBioMaterialClicked()">
            <i class="fas fa-list-alt" style="margin-right: 3px"></i> Biomaterial Studies</span>
          <span class="divider"> | </span>
          <span class="link" (click)="onTendonClicked()">
            <i class="fas fa-list-alt" style="margin-right: 3px"></i> Tendon Studies</span>
        </div>
        <div>
          <cbit-bar-chart [title]="'Studies by Gene Expression Type'"
                          [chartId]="'geneExpressionChart'"
                          [chartData]="geneExpressionData"
                          (barClick)="onGeneExpressionBarClick($event)"></cbit-bar-chart>
          <cbit-bar-chart [title]="'Studies by Publication Year'"
                          [chartId]="'publicationYearChart'"
                          [stacked]="true"
                          [chartData]="publicationYearData" style="margin-left: 30px;"></cbit-bar-chart>
        </div>
        <div class="page-title">Biomaterial Studies</div>
        <div>
          <cbit-pie-chart [chartId]="'materialClassChart'"
                          [comparisonText]="'by Material Class'"
                          [chartData]="materialClassData"
                          (sliceClick)="onSliceClick('Material Class',$event)"></cbit-pie-chart>
          <cbit-pie-chart [chartId]="'materialChart'"
                          [comparisonText]="'by Material'"
                          [chartData]="materialData"
                          (sliceClick)="onMaterialSliceClick($event)"
                          style="margin-left: 30px;"></cbit-pie-chart>
        </div>
        <div style="margin-top: 30px;">
          <cbit-pie-chart [chartId]="'organismChart'"
                          [comparisonText]="'by Organism'"
                          [chartData]="organismData"
                          (sliceClick)="onSliceClick('Organism',$event)"></cbit-pie-chart>
          <cbit-pie-chart [chartId]="'cellStrainChart'"
                          [comparisonText]="'by Cell Strain'"
                          [chartData]="cellStrainData"
                          (sliceClick)="onCellStrainAbbreviationSliceClick($event)"
                          style="margin-left: 30px;"></cbit-pie-chart>
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
  public materialFullNameLookup: any;
  public cellStrainFullNameLookup: any;

  constructor(private router: Router,
              private dashboardService: DashboardService) {
  }

  public ngOnInit(): void {
    this.dashboardService.getDashboardSamplesData().subscribe((data) => {
      this.materialClassData = preparePieChartData(data, 'materialClass');
      this.organismData = preparePieChartData(data, 'organism');
      this.cellStrainData = preparePieChartData(data, 'cellStrainAbbreviation');
      this.materialData = preparePieChartData(data, 'materialName');
      this.materialFullNameLookup = data.materialFullNameLookup;
      this.cellStrainFullNameLookup = data.cellStrainFullNameLookup;
    });

    this.dashboardService.getDashboardStudiesData().subscribe((data) => {
      this.geneExpressionData = prepareBarChartData(data, 'geneExpressionType');
      this.publicationYearData = prepareBarChartData(data, 'year',true);
    });
  }

  public onBioMaterialClicked() {
    this.router.navigateByUrl(AppUrls.browseBioMaterialStudiesUrl);
  }

  public onTendonClicked() {
    this.router.navigateByUrl(AppUrls.browseTendonStudiesUrl);
  }

  public onSliceClick(category: string, value: string) {
    this.router.navigate([AppUrls.browseBioMaterialStudiesUrl], {
      queryParams: {
        category: category,
        value: value,
      }
    });
  }

  public onMaterialSliceClick(value: string) {
    this.router.navigate([AppUrls.browseBioMaterialStudiesUrl], {
      queryParams: {
        category: '*Material',
        value: this.materialFullNameLookup[value][0],
      }
    });
  }

  public onCellStrainAbbreviationSliceClick(value: string) {
    this.router.navigate([AppUrls.browseBioMaterialStudiesUrl], {
      queryParams: {
        category: '*Cell strain',
        value: this.cellStrainFullNameLookup[value][0],
      }
    });
  }

  public onGeneExpressionBarClick(value: string) {
    const split = value.split('.');
    const type = split[0];
    const geneExpressionType = split[1];

    if (type === 'Tendon') {
      this.router.navigate([AppUrls.browseTendonStudiesUrl]);
    } else if (type === 'Biomaterial') {
      this.router.navigate([AppUrls.browseBioMaterialStudiesUrl], {
        queryParams: {
          category: 'Gene expression type',
          value: geneExpressionType,
        }
      });
    }
  }
}
