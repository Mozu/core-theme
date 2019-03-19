import { Injectable } from '@angular/core';
import { Constants } from '../infrastructure/constants';
import { HttpClient } from '@angular/common/http';

import {
  HttpService
} from '@core';

@Injectable()
export class NavigationService {

  constructor( private _http: HttpClient ) { }

  public fetchTabsName = () => { 
    return this._http.get(Constants.JsonResources.tabsNames);
  }

  public fetchLeftNavigationItems= () => {
    return this._http.get(Constants.JsonResources.leftNavigationItems);
  }
}

