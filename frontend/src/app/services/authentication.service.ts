import {Injectable} from "@angular/core";

@Injectable()
export class AuthenticationService {

  isGuest: boolean;
  username: string;
  password: string;
  realname: string;

  constructor() {
    this.logout();
  }

  // jQuery `headers` for authentication
  // See http://stackoverflow.com/a/11960692
  headers(): { Authorization?: string } {
    if (this.isGuest) {
      return {};
    } else {
      return {
        Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
      };
    }
  }

  login(username: string, password: string, realname: string): void {
    this.isGuest = false;
    this.username = username;
    this.password = password;
    this.realname = realname;
  }

  logout(): void {
    this.isGuest = true;
    this.username = '';
    this.password = '';
    this.realname = 'Guest';
  }
}
