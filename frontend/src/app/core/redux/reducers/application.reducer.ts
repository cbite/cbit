import * as ApplicationActions from '../actions/application.actions';
export type  Action = ApplicationActions.All;

export interface State {
  showLoader: boolean;
}

export const initialState: State = {
  showLoader: false,
};

export function Reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case ApplicationActions.APPLICATION_SHOW_LOADER:
      return {
        showLoader: action.showLoader
      };
    default:
      return state;
  }
}
