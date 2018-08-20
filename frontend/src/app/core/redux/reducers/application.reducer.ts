import * as ApplicationActions from '../actions/application.actions';
import {LoggedInUser} from '../../authentication/loggedInUser';
export type  Action = ApplicationActions.All;

export interface State {
  loggedInUser: LoggedInUser;
}

export const initialState: State = {
  loggedInUser: null,
};

export function Reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case ApplicationActions.APPLICATION_LOGIN_ACTION:
      return {
        loggedInUser: action.loggedInUser
      };
    case ApplicationActions.APPLICATION_LOGOUT_ACTION:
      return {
        loggedInUser: null
      };
    default:
      return state;
  }
}
