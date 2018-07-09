import {Injectable} from '@angular/core';
import {BusyIndicatorService} from './busy-indicator.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AuthenticationService} from '../core/authentication/authentication.service';
import {environment} from '../../environments/environment';

@Injectable()
export class HttpGatewayService {
  private headers: HttpHeaders;

  constructor(private http: HttpClient,
              private authenticationService: AuthenticationService,
              private busyIndicatorService: BusyIndicatorService) {
  }

  public get(url: string, actionKey?: string, headers?: HttpHeaders): Observable<any> {
    this.trySetBusy(actionKey);
    return this.http.get(this.resolveUrl(url), {
      headers: headers ? headers : this.withAuthHeader(),
      withCredentials: true
    })
      .map(this.checkResponseBody.bind(this))
      .catch(this.handleError)
      .finally(() => this.trySetIdle(actionKey));
  }

  public delete(url: string, actionKey?: string, headers?: HttpHeaders): Observable<any> {
    this.trySetBusy(actionKey);
    return this.http.delete(this.resolveUrl(url), {
      headers: headers ? headers : this.withAuthHeader(),
      withCredentials: true
    })
      .map(this.checkResponseBody.bind(this))
      .catch(this.handleError)
      .finally(() => this.trySetIdle(actionKey));
  }

  public post(url: string, body: any, actionKey?: string, headers?: HttpHeaders): Observable<any> {
    this.trySetBusy(actionKey);
    return this.http.post(this.resolveUrl(url), body, {
      headers: headers ? headers : this.withAuthHeader(),
      withCredentials: true
    })
      .map(this.checkResponseBody.bind(this))
      .catch(this.handleError)
      .finally(() => this.trySetIdle(actionKey));
  }

  public put(url: string, body: any, actionKey?: string, headers?: HttpHeaders): Observable<any> {
    this.trySetBusy(actionKey);
    return this.http.put(this.resolveUrl(url), body, {
      headers: headers ? headers : this.withAuthHeader(),
      withCredentials: true
    })
      .map(this.checkResponseBody.bind(this))
      .catch(this.handleError)
      .finally(() => this.trySetIdle(actionKey));
  }

  private withAuthHeader(): HttpHeaders {
    const authHeaderContent = this.authenticationService.getAuthorizationHeader();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': authHeaderContent
    });
  }

  private resolveUrl(url: string) {
    return environment.api_url + url;
  }

  private trySetBusy(actionKey?: string) {
    if (actionKey) {
      this.busyIndicatorService.setBusy(actionKey);
    }
  }

  private trySetIdle(actionKey?: string) {
    if (actionKey) {
      this.busyIndicatorService.setIdle(actionKey);
    }
  }

  private checkResponseBody(body: any): any {
    // throw error when server returned error
    if (body.error) {
      if (body.error.status === 401) {
        this.handleUnauthorized();
      } else {
        throw new Error(body.error.message);
      }
    } else {
      if (body.data) {
        return body.data;
      } else {
        return body;
      }
    }
  }

  private handleUnauthorized() {
    // delete the authorization header
    this.headers.delete('Authorization');
  }

  private handleError<T>(error: any) {
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'An error occurred on the server.';
    return Observable.throw(errMsg);
  }
}
