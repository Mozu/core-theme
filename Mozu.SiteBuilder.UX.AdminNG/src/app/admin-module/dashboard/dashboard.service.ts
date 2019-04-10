import { Injectable } from '@angular/core';
import { Constants } from '@shared';
import { HttpService } from '@core/extensions/http.service'
import { LoggerService } from '@core'


import { Observable } from 'rxjs';

import { AccessTileModel, AccessTileLink } from '@shared/index';

@Injectable()
export class DashbaordService {

    constructor(private _http: HttpService,   
                private _loggerService: LoggerService) {}

    public fetchAllDashboardTiles(): Observable<any> {
        return this._http.get(Constants.JsonResources.dasbhoardTiles);
    }

    public MapDasasboardCategoryToTiles(dashboardCategories: any): AccessTileModel[] {
      console.log(dashboardCategories);
        this._loggerService.info("AdminDashboardComponent : MapDasasboardCategoryToTiles");
        let allAccessTiles: AccessTileModel[];
        if (dashboardCategories != null && dashboardCategories != undefined && dashboardCategories.length > 0) {
          allAccessTiles = [];
          dashboardCategories.forEach(eachDasboardCategory => {
            let accessTileModel = new AccessTileModel();
            accessTileModel.sectionText = eachDasboardCategory.label;
            accessTileModel.sectionImageURL = eachDasboardCategory.imageURL;
            if (eachDasboardCategory.items != null && eachDasboardCategory.items != undefined && eachDasboardCategory.items.length > 0) {
              accessTileModel.sectionLinks = [];
              eachDasboardCategory.items.forEach(eachDasbhboardCategoryItem => {
                let sectionLink = new AccessTileLink();
                sectionLink.linkDataText = eachDasbhboardCategoryItem.label;
                sectionLink.linkDataURL = eachDasbhboardCategoryItem.navUrl;//Constants.voidNavigationLink; 
                accessTileModel.sectionLinks.push(sectionLink);
              });
            }
            allAccessTiles.push(accessTileModel);
          });
        }
        return allAccessTiles;
      }
}

