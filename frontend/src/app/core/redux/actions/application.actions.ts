import {Action} from '@ngrx/store';
import {LoggedInUser} from '../../authentication/loggedInUser';

export const APPLICATION_LOGIN_ACTION = 'APPLICATION::LOGIN_ACTION';
export const APPLICATION_LOGOUT_ACTION = 'APPLICATION::LOGOUT_ACTION';

export class LoginAction implements Action {
  readonly type = APPLICATION_LOGIN_ACTION;
  constructor(public loggedInUser: LoggedInUser) { }
}

export class LogoutAction implements Action {
  readonly type = APPLICATION_LOGOUT_ACTION;
  constructor() { }
}

export type All = LoginAction | LogoutAction;
