import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';

import { Constants } from '../infrastructure/constants';

import {
    LoggerService
} from '@core';

@Injectable()
export class QuoteLocationGroupRouteGuardService implements CanActivate {
    constructor(
        private _router: Router,
        private _logger: LoggerService
    ) {
        this._logger.info('QuoteLocationGroupRouteGuardService : constructor ');
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        this._logger.info('QuoteLocationGroupRouteGuardService : canActivate');

        if (state !== undefined && state.url.includes(Constants.uiRoutes.quotes)) {
            this._router.navigate([Constants.uiRoutes.quotes]);
        }
        else if (state !== undefined && state.url.includes(Constants.uiRoutes.locationGroups)) {
            this._router.navigate([Constants.uiRoutes.locationGroups]);
        }

        return true;
    }
}
