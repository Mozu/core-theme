import { Injectable } from '@angular/core';
import { Constants } from '../infrastructure/constants';
import { HttpClientService } from '@core/extensions/http-client.service'
import { LoggerService } from '@core'
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { LeftNavigationModel, SecureForm } from './left/left.model';


@Injectable()
export class NavigationService {
  public secureForm: SecureForm;

  constructor( private _http: HttpClientService, private _loggerService: LoggerService ) { }

  public fetchTabsName = () => { 
    this._loggerService.info("NavigationService : fetchTabsName");
    return this._http.get(Constants.JsonResources.tabsNames);
  }

  public fetchLeftNavigationItems= () => {
    this._loggerService.info("NavigationService : fetchLeftNavigationItems");
    return this._http.get(Constants.JsonResources.leftNavigationItems);
  }

  public fetchCapabilitiesForSecureForm = (appId) => { 
    this._loggerService.info("NavigationService : fetchCapabilitiesForSecureForm");
    const headers = new HttpHeaders();
    // return this._http.post(Constants.webApis.secureFormLink +`${appId}`, null, { headers: headers } );
     return this._http.get(`./assets/json/secureForm.json`);
  }
}

