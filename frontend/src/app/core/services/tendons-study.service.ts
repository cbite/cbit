import {Injectable} from '@angular/core';
import {HttpGatewayService} from './http-gateway.service';
import {Observable, ObservableInput} from 'rxjs/Observable';
import {URLService} from './url.service';
import {TendonsStudy} from '../types/Tendons-study';

@Injectable()
export class TendonsStudyService {
  constructor(private urls: URLService, private httpGatewayService: HttpGatewayService) {
  }

  public getStudies(): Observable<TendonsStudy[]> {
    return this.httpGatewayService.get(this.urls.tendonsStudiesResource());
  }

  public createStudy(study: TendonsStudy, errorHandler: (err: any, caught: Observable<{}>) => ObservableInput<{}>): Observable<any> {
    return this.httpGatewayService.post(this.urls.tendonsStudiesResource(), study, errorHandler);
  }

  public updateStudy(study: TendonsStudy, errorHandler: (err: any, caught: Observable<{}>) => ObservableInput<{}>): Observable<any> {
    return this.httpGatewayService.put(this.urls.tendonsStudyResource(study.uuid), study, errorHandler);
  }

  public getStudy(studyId: string): Observable<any> {
    return this.httpGatewayService.get(this.urls.tendonsStudyResource(studyId));
  }

  public deleteStudy(studyId: string): Observable<any> {
    return this.httpGatewayService.delete(this.urls.tendonsStudyResource(studyId));
  }
}

