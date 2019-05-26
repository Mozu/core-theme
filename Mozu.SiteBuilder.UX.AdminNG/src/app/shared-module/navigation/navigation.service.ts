import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Constants } from '../infrastructure/constants';
import { HttpClientService } from '@core/extensions/http-client.service'
import { LoggerService } from '@core'
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class NavigationService {

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
     return this._http.post(Constants.webUrls.secureFormLink +`${appId}`, null, { headers: headers });
  
  }

  public fetchIntegrationResponse = (ImportExportLink) => {
    this._loggerService.info("NavigationService : fetchIntegrationResponse");
    const headers = new HttpHeaders();
    return this._http.post(ImportExportLink, null, { headers: headers } );
  }
  
  public distictImportExportLinks = (loggedInUsersData : any) => {
    let distinctImportExportLinks= _.uniqBy(loggedInUsersData._sharedData.items.ctEntities, function (e : any) {
    return e.location;
  });
  return distinctImportExportLinks;
  }

  public mergeDynamicLinks = (allFilteredLinks  : any, ImportExportLinks : any) => {
    for(var i=0; i<allFilteredLinks.length; i++) {
            _.filter(ImportExportLinks, function(v) {
                            if(allFilteredLinks[i].menuid == v.location) {
                            allFilteredLinks[i].items.push(v);
                            return true;
                            }
                        });
        }
        return allFilteredLinks;
    }
  
}

