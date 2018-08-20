import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, ObservableInput} from 'rxjs/Observable';
import {AuthenticationService} from '../authentication/authentication.service';
import {environment} from '../../../environments/environment';

@Injectable()
export class HttpGatewayService {
  private headers: HttpHeaders;

  constructor(private http: HttpClient,
              private authenticationService: AuthenticationService) {
  }

  public get(url: string, errorHandler?: (err: any, caught: Observable<{}>) => ObservableInput<{}>,
             headers?: HttpHeaders): Observable<any> {
    return this.http.get(this.resolveUrl(url), {
      headers: headers ? headers : this.withAuthHeader(),
      withCredentials: true
    })
      .map(this.checkResponseBody.bind(this))
      .catch(errorHandler ? errorHandler : this.handleError)
      .finally(() => {
      });
  }

  public getFile(url: string, mimeType: string, errorHandler?: (err: any, caught: Observable<{}>) => ObservableInput<{}>): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': mimeType
    });
    return this.http.get(this.resolveUrl(url), {
      headers: headers,
      responseType: 'blob',
      withCredentials: true
    })
      .map((resp) => resp)
      .catch(errorHandler ? errorHandler : this.handleError)
      .finally(() => {
      });
  }

  public delete(url: string, errorHandler?: (err: any, caught: Observable<{}>) => ObservableInput<{}>,
                headers?: HttpHeaders): Observable<any> {
    return this.http.delete(this.resolveUrl(url), {
      headers: headers ? headers : this.withAuthHeader(),
      withCredentials: true
    })
      .map(this.checkResponseBody.bind(this))
      .catch(errorHandler ? errorHandler : this.handleError)
      .finally(() => {
      });
  }

  public post(url: string, body: any, errorHandler?: (err: any, caught: Observable<{}>) => ObservableInput<{}>,
              headers?: HttpHeaders): Observable<any> {
    return this.http.post(this.resolveUrl(url), body, {
      headers: headers ? headers : this.withAuthHeader(),
      withCredentials: true
    })
      .map(this.checkResponseBody.bind(this))
      .catch(errorHandler ? errorHandler : this.handleError)
      .finally(() => {
      });
  }

  public put(url: string, body: any, errorHandler?: (err: any, caught: Observable<{}>) => ObservableInput<{}>,
             headers?: HttpHeaders): Observable<any> {
    return this.http.put(this.resolveUrl(url), body, {
      headers: headers ? headers : this.withAuthHeader(),
      withCredentials: true
    })
      .map(this.checkResponseBody.bind(this))
      .catch(errorHandler ? errorHandler : this.handleError)
      .finally(() => {
      });
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

  // TODO@Sam check what still makes sense here
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
