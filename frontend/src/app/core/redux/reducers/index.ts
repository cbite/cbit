import {ActionReducerMap} from '@ngrx/store';
import * as forApplication from './application.reducer';

export interface ApplicationState {
  application: forApplication.State;
}

export const reducers: ActionReducerMap<ApplicationState> = {
  application: forApplication.Reducer
};
