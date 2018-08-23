import {Injectable} from '@angular/core';
import {URLService} from '../../../core/services/url.service';
import {HttpGatewayService} from '../../../core/services/http-gateway.service';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class DashboardService {
  constructor(private urls: URLService, private httpGatewayService: HttpGatewayService) {
  }

  public getDashboardSamplesData(): Observable<any> {
    return this.httpGatewayService.get(this.urls.dashboardSamplesResource());
  }

  public getDashboardStudiesData(): Observable<any> {
    return this.httpGatewayService.get(this.urls.dashboardStudiesResource());
  }
}
