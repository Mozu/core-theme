import {
    Injectable,
    Inject
} from '@angular/core';

import 'rxjs/add/operator/toPromise';

import { Constants } from '../infrastructure/constants';

import { SharedData } from './index';

import {
    AuthService,
    HttpService,
    UtilityService,
    LoggerService
} from '@core';

import { environment } from '@env';

@Injectable()
export class SharedDataService {

    public _sharedData: SharedData;
    public isDisableUIElements: boolean;

    constructor(
        private _logger: LoggerService,
        private _authService: AuthService,
        private _https: HttpService,
        private _utilityService: UtilityService
    ) {
        this._logger.info('SharedDataService : constructor ');
    }


    populateCommonData(): Promise<any> {

        this._logger.info('SharedDataService : populateCommonData ');

        if (!this._authService.isUserLoggedIn()) {
            return;
        }

        const promise = this._https.get(`${Constants.webApis.getSharedData}`)
            .toPromise();

        promise.then(
            successResponse => {
                this._logger.info('SharedDataService : populateCommonData : successResponse ' + successResponse);
                this._sharedData = successResponse.json();
                this._sharedData.sessionId = localStorage.getItem(Constants.localStorageKeys.sessionId);
            })
            .catch(
            errorResponse => {
                this._logger.info('SharedDataService : populateCommonData : errorResponse ' + errorResponse);

                const url: string = environment.appUrl + '?' + Constants.queryString.SessionExpired;
                this._utilityService.redirectToURL(url);
            });

        return promise;

    }
}

