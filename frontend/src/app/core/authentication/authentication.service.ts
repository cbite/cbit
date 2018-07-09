import {Injectable} from '@angular/core';
import {URLService} from '../../services/url.service';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {BusyIndicatorService} from '../../services/busy-indicator.service';
import {LoggedInUser} from './loggedInUser';

@Injectable()
export class AuthenticationService {

  private loggedInUser: LoggedInUser;

  constructor(private http: HttpClient,
              private busyIndicatorService: BusyIndicatorService,
              private urlService: URLService) {
  }

  public login(username: string, password: string): Observable<boolean> {
    const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
    return this.performLogin(username, authHeader)
      .map(result => {
        if (result.realname) {
          this.loggedInUser = new LoggedInUser(username, result.realname, authHeader);
          return true;
        }else {
          return false;
        }
      });
  }

  public logout() {
    this.loggedInUser = null;
  }

  private performLogin(username: string, authHeader: string): Observable<any> {
    const url = this.urlService.userResource(username);
    const headers = new HttpHeaders({'Authorization': authHeader});
    return this.http
      .get(url, {headers: headers})
      .catch(this.loginFailed);
  }

  protected loginFailed<T>(errorResponse: HttpErrorResponse): Observable<any> {
    const error = errorResponse.error;
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'An error occurred on the server.';
    return Observable.of({Success: false});
  }

  public getAuthorizationHeader(): string {
    return this.loggedInUser.authHeader ? this.loggedInUser.authHeader : '';
  }

  // jQuery `headers` for authentication
  // See http://stackoverflow.com/a/11960692
  headers(): { Authorization?: string } {
    return {};
  }
}
