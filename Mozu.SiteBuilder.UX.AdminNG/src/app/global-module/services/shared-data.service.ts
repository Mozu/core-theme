import {
    Injectable,
    Inject
} from '@angular/core';

import 'rxjs/add/operator/toPromise';
import {
    UtilityService,
    LoggerService
} from '@core';
import { HttpClientService, IRequestOptions } from '@core/extensions/http-client.service';
import { AuthService } from '@core/extensions/auth.service';
import { Constants as GlobalConstants} from '@global/infrastructure/constants';
import { environment } from '@env';
import { SharedData } from './index';
import { MenuItem } from 'primeng/api';
import { HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';
import { Site } from './shared-data';

@Injectable()
export class SharedDataService {

    public _sharedData: SharedData;
    public isDisableUIElements: boolean;
    private _leftNavigationMenuItems: MenuItem[];
    public get leftNavigationMenuItems(): MenuItem[] {
        return this._leftNavigationMenuItems;
    }
    public set leftNavigationMenuItems(value: MenuItem[]) {
        this._leftNavigationMenuItems = value;
    }

    constructor(
        private _logger: LoggerService,
        private _authService: AuthService,
        private _https: HttpClientService,
        private _utilityService: UtilityService,
    ) {
        this._logger.info('SharedDataService : constructor ');
    }

    populateCommonData(): Promise<any> {

        this._logger.info('SharedDataService : populateCommonData ');

        if (!this._authService.isUserLoggedIn()) {
            return;
        }
        let promise;
        if (environment.isUseMocks) {
            promise = this._https.get(`./assets/json/user-data.json`).toPromise();
        } else {
            promise = this._https.get(`${GlobalConstants.webApis.getSharedData}`).toPromise();
        }

        promise.then(
            successResponse => {
                this._logger.info('SharedDataService : populateCommonData : successResponse ' + successResponse);
                this._sharedData = JSON.parse(JSON.stringify(successResponse));
            })
            .catch(
                errorResponse => {
                    this._logger.info('SharedDataService : populateCommonData : errorResponse ' + errorResponse);
                    // const url: string = environment.appUrl + '?' + Constants.queryString.SessionExpired;
                    // this._utilityService.redirectToURL(url);
                });
        return promise;
    }


    getSiteHttpHeaders(siteId: string): IRequestOptions {
        this._logger.info('SharedDataService: getSiteHttpHeaders');
        const headers: IRequestOptions = {} as IRequestOptions;
        if (this._sharedData.items.ctTenant.sites && this._sharedData.items.ctTenant.sites.length > 0) {
            const sites: Site[] = this._sharedData.items.ctTenant.sites;
            let siteObj: Site;
            if (siteId) {
                siteObj = _.find(sites, {'id': _.parseInt(siteId)});
            } else { // get first site item if siteId is null
                siteObj =  sites[0];
            }

            const paramsObj = {};
            paramsObj[GlobalConstants.HttpHeadersParams.xVolTenant] = siteObj.tenantId + '';
            paramsObj[GlobalConstants.HttpHeadersParams.xVolMasterCatlog] = siteObj.masterCatalogId + '',
            paramsObj[GlobalConstants.HttpHeadersParams.xVolCatalog] = siteObj.catalogId + '',
            paramsObj[GlobalConstants.HttpHeadersParams.xVolSite] = siteObj.id + '',
            paramsObj[GlobalConstants.HttpHeadersParams.xVolLocale] = siteObj.defaultLocaleCode + '',
            paramsObj[GlobalConstants.HttpHeadersParams.xVolCurrency] = siteObj.defaultCurrencyCode + '',

            headers.headers =  new HttpHeaders(paramsObj);
        }
        return headers;
    }

}

