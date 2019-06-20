import {
    Injectable,
    Inject
} from '@angular/core';

import 'rxjs/add/operator/toPromise';
import {
    UtilityService,
    LoggerService
} from '@core';
import { HttpClientService } from '@core/extensions/http-client.service';
import { AuthService } from '@core/extensions/auth.service';
import { Constants as GlobalConstants} from '@global/infrastructure/constants';
import { environment } from '@env';
import { SharedData } from './index';
import { MenuItem } from 'primeng/api';

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
        private _utilityService: UtilityService
    ) {
        this._logger.info('SharedDataService : constructor ');
    }

    populateCommonData(): Promise<any> {

        this._logger.info('SharedDataService : populateCommonData ');

        if (!this._authService.isUserLoggedIn()) {
            return;
        }
        let promise;
        if (environment.debug) {
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
}

