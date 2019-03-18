import { Injectable } from '@angular/core';
import { Constants } from '@shared';
import { HttpClient } from '@angular/common/http';

import {
  HttpService
} from '@core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor( private _http: HttpClient ) { }

  public fetchTabsName = () => { 
    return this._http.get(`./assets/json/dashboard-menu.json`);
  }

  public fetchCategories = () => {
    return this._http.get(`./assets/json/dashboard-categories.json`);
  }
}

