import { Injectable } from '@angular/core';
import { Constants } from '../infrastructure/constants';
import { HttpService } from '@core/extensions/http.service'
import { LoggerService } from '@core'



@Injectable()
export class NavigationService {

  constructor( private _http: HttpService, private _loggerService: LoggerService ) { }

  public fetchTabsName = () => { 
    this._loggerService.info("NavigationService : fetchTabsName");
    return this._http.get(Constants.JsonResources.tabsNames);
  }

  public fetchLeftNavigationItems= () => {
    this._loggerService.info("NavigationService : fetchLeftNavigationItems");
    return this._http.get(Constants.JsonResources.leftNavigationItems);
  }
}

