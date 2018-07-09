import {Injectable} from '@angular/core';
import {URLService} from '../../services/url.service';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {BusyIndicatorService} from '../../services/busy-indicator.service';
import {LoggedInUser} from './loggedInUser';
import {environment} from '../../../environments/environment';
import {Store} from '@ngrx/store';
import {ApplicationState} from '../redux/reducers/index';
import {LoginAction, LogoutAction} from '../redux/actions/application.actions';

@Injectable()
export class AuthenticationService {

  private loggedInUser: LoggedInUser;

  constructor(private http: HttpClient,
              private store: Store<ApplicationState>,
              private busyIndicatorService: BusyIndicatorService,
              private urlService: URLService) {
  }

  public login(username: string, password: string): Observable<boolean> {
    const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
    return this.performLogin(username, authHeader)
      .map(result => {
        if (result.realname) {
          // todo@Sam replaced by redux
          this.loggedInUser = new LoggedInUser(username, result.realname, authHeader);
          this.store.dispatch(new LoginAction(this.loggedInUser));
          return true;
        } else {
          return false;
        }
      });
  }

  public logout() {
    // todo@Sam replaced by redux
    this.loggedInUser = null;
    this.store.dispatch(new LogoutAction());
  }

  public isLoggedIn(): boolean {
    return this.loggedInUser === null;
  }

  public getAdminName(): string {
    return this.loggedInUser.displayName;
  }

  public getLoggedInUserName(): string {
    return this.loggedInUser.username;
  }

  private performLogin(username: string, authHeader: string): Observable<any> {
    const url = this.resolveUrl(this.urlService.userResource(username));
    const headers = new HttpHeaders({'Authorization': authHeader});
    return this.http
      .get(url, {headers: headers})
      .catch(this.loginFailed);
  }

  private resolveUrl(url: string) {
    return environment.api_url + url;
  }

  protected loginFailed<T>(errorResponse: HttpErrorResponse): Observable<any> {
    const error = errorResponse.error;
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'An error occurred on the server.';
    return Observable.of({Success: false});
  }

  public getAuthorizationHeader(): string {
    return this.loggedInUser && this.loggedInUser.authHeader ? this.loggedInUser.authHeader : '';
  }
}
