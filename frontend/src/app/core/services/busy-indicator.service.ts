import {Injectable} from '@angular/core';
import {ApplicationState} from '../redux/reducers';
import {Store} from '@ngrx/store';
import {ShowLoaderAction} from '../redux/actions/application.actions';

@Injectable()
export class BusyIndicatorService {

  private busyKeys: string[] = [];

  constructor(private store: Store<ApplicationState>
  ) {
  }

  public setBusy(key: string) {
    if (this.busyKeys.indexOf(key) === -1) {
      this.busyKeys.push(key);
      this.store.dispatch(new ShowLoaderAction(true));
    }
  }

  public setIdle(key: string) {
    const keyIndex = this.busyKeys.indexOf(key);
    if (keyIndex !== -1) {
      this.busyKeys.splice(keyIndex, 1);
    }
    if (this.busyKeys.length === 0) {
      this.store.dispatch(new ShowLoaderAction(false));
    }
  }
}
