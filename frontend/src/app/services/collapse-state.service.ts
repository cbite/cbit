/*
  A global service to store collapsed/expanded states of lots of collapsible items,
  so that the states are preserved as users navigate the app
 */

import {Injectable} from "@angular/core";

@Injectable()
export class CollapseStateService {
  private _collapsedStates = {};

  isCollapsed(name: string, defaultValue: boolean = true): boolean {
    if (name in this._collapsedStates) {
      return this._collapsedStates[name];
    } else {
      return defaultValue;
    }
  }

  setCollapsed(name: string, value: boolean) {
    this._collapsedStates[name] = value;
  }
}
