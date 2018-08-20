import * as ApplicationActions from '../actions/application.actions';
import {LoggedInUser} from '../../authentication/loggedInUser';

export type  Action = ApplicationActions.All;

export interface State {
  loggedInUser: LoggedInUser;
  showLoader: boolean
}

export const initialState: State = {
  loggedInUser: null,
  showLoader: false
};

export function Reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case ApplicationActions.APPLICATION_LOGIN_ACTION:
      return {
        loggedInUser: action.loggedInUser,
        showLoader: state.showLoader
      };
    case ApplicationActions.APPLICATION_LOGOUT_ACTION:
      return {
        loggedInUser: null,
        showLoader: state.showLoader
      };
    case ApplicationActions.APPLICATION_SHOW_LOADER:
      return {
        showLoader: action.showLoader,
        loggedInUser: state.loggedInUser
      };
    default:
      return state;
  }
}
