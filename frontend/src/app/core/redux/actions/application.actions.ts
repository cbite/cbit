import {Action} from '@ngrx/store';

export const APPLICATION_SHOW_LOADER = 'APPLICATION_TOGGLE_LOADER';

export class ShowLoaderAction implements Action {
  readonly type = APPLICATION_SHOW_LOADER;
  constructor(public showLoader: boolean) { }
}

export type All =  ShowLoaderAction ;
