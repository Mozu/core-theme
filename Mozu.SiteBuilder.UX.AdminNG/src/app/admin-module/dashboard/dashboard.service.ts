import { Injectable } from '@angular/core';
import { HttpClientService } from '@core/extensions/http-client.service';
import { LoggerService } from '@core';
import { Observable } from 'rxjs';
import {
         AccessTileModel,
         AccessTileLink,
         Constants
} from '@shared/index';
import { SharedDataService } from '@global';

@Injectable()
export class DashbaordService {

    constructor(private _http: HttpClientService,
                private _loggerService: LoggerService,
                private _sharedDataService: SharedDataService) {}

    public fetchAllDashboardTiles(): Observable<any> {
      this._loggerService.info('AdminDashboardComponent : fetchAllDashboardTiles');
        return this._http.get(Constants.JsonResources.dasbhoardTiles);
    }

    public MapDasasboardCategoryToTiles(dashboardCategories: any): AccessTileModel[] {
        this._loggerService.info('AdminDashboardComponent : MapDasasboardCategoryToTiles');
        let allAccessTiles: AccessTileModel[];
        const orderRoutingURLPrefix = this._sharedDataService._sharedData.items.loginUri;

        if (dashboardCategories != null && dashboardCategories !== undefined && dashboardCategories.length > 0) {
          allAccessTiles = [];
          dashboardCategories.forEach(eachDasboardCategory => {
            const accessTileModel = new AccessTileModel();
            accessTileModel.sectionText = eachDasboardCategory.label;
            accessTileModel.sectionImageURL = eachDasboardCategory.imageURL;
            accessTileModel.id = eachDasboardCategory.id;
            accessTileModel.tileIcon = eachDasboardCategory.tileIcon;
            accessTileModel.tileIconColor = eachDasboardCategory.tileIconColor;
            if (eachDasboardCategory.items != null && eachDasboardCategory.items !== undefined && eachDasboardCategory.items.length > 0) {
              accessTileModel.sectionLinks = [];
              eachDasboardCategory.items.forEach(eachDasbhboardCategoryItem => {
                const sectionLink = new AccessTileLink();
                sectionLink.linkDataText = eachDasbhboardCategoryItem.label;
                if (eachDasbhboardCategoryItem.id === Constants.orderRoutingNavigationId) {
                  sectionLink.linkDataURL = this._sharedDataService._sharedData.items.loginUri + this._sharedDataService._sharedData.items.ctTenant.id + eachDasbhboardCategoryItem.url;
                } else {
                  sectionLink.linkDataURL = eachDasbhboardCategoryItem.url;
                }
                accessTileModel.sectionLinks.push(sectionLink);
              });
              }
              if (accessTileModel.id === Constants.orderRoutingNavigationId) {
                  if (this._sharedDataService._sharedData.items.ctTaContext.omsEnabled)
                      allAccessTiles.push(accessTileModel);
              }
              else
                  allAccessTiles.push(accessTileModel);
          });
        }
        return allAccessTiles;
      }
}

