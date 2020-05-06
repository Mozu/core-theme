import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';
import { Constants } from '../infrastructure/constants';
import { HttpClientService, IRequestOptions } from '@core/extensions/http-client.service';
import { LoggerService } from '@core';
import { SharedDataService, CtTaContext, MasterCatalog2 } from '@global';

@Injectable()
export class NavigationService {

  constructor(private _http: HttpClientService,
    private _loggerService: LoggerService,
    private _sharedData: SharedDataService) { }

  public fetchTabsName = () => {
    this._loggerService.info('NavigationService : fetchTabsName');
    return this._http.get(Constants.JsonResources.tabsNames);
  }

  public fetchLeftNavigationItems = () => {
    this._loggerService.info('NavigationService : fetchLeftNavigationItems');
    return this._http.get(Constants.JsonResources.leftNavigationItems);
  }

  public fetchCapabilitiesForSecureForm = (appId, jsonData) => {
    this._loggerService.info('NavigationService : fetchCapabilitiesForSecureForm');
    return this._http.post(Constants.webApis.secureFormLink + `${appId}`, jsonData, this.getHttpHeaders());
  }

  public fetchIntegrationResponse = (ImportExportLink) => {
    this._loggerService.info('NavigationService : fetchIntegrationResponse');
    const headers = new HttpHeaders();
    return this._http.post(ImportExportLink, null, { headers: headers });
  }

  public distictImportExportLinks = (loggedInUsersData: any) => {
    const distinctImportExportLinks = _.uniqBy(loggedInUsersData._sharedData.items.ctEntities, function (e: any) {
      return e.location;
    });
    return distinctImportExportLinks;
  }

  public mergeDynamicLinks = (allFilteredLinks: any, ImportExportLinks: any) => {
    for (let i = 0; i < allFilteredLinks.length; i++) {
      _.filter(ImportExportLinks, function (v) {
        if (allFilteredLinks[i].menuid === v.location) {
          allFilteredLinks[i].items.push(v);
          return true;
        }
      });
    }
    return allFilteredLinks;
  }

  private getHttpHeaders(): IRequestOptions {
    this._loggerService.info('NavigationService: getSiteHttpHeaders');
    const taContext: CtTaContext = this._sharedData._sharedData.items.ctTaContext;
    const headers: IRequestOptions = {} as IRequestOptions;
    if (taContext && taContext.masterCatalogs && taContext.masterCatalogs[0]) {
      const masterCatalog: MasterCatalog2 = taContext.masterCatalogs[0];
      headers.headers = new HttpHeaders({
        'X-Requested-With': 'XMLHttpRequest' + '',
        'x-vol-tenant': taContext.id + '',
        'x-vol-master-catalog': masterCatalog.id + '',
        'x-vol-locale': masterCatalog.localeCode + '',
        'x-vol-currency': masterCatalog.currencyCode
      });
    }
    return headers;
  }

}

