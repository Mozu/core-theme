import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';

import { Constants } from '../infrastructure/constants';

import {
    ErrorCode,
    ErroNotificationType,
    HttpError,
    LoggerService
} from '@core';

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(
        private _router: Router,
        private _logger: LoggerService
    ) {
        this._logger.info('AuthGuard : constructor ');
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const url: string = state.url;

        this._logger.info('AuthGuard : canActivate');

        this.throwBusinessErrors(url);

        return true;
    }

    throwBusinessErrors(url: string): void {

        this._logger.info('AuthGuard : throwBusinessErrors');

        let isError = false;
        let errorCode: any;

        if (url.indexOf(Constants.businessExceptions.SessionExpired) !== -1
        || url.indexOf(Constants.businessExceptions.SessionKilled) !== -1) {
            isError = true;
            errorCode = ErrorCode.UserSessionExpired;
        } else if (url.indexOf(Constants.businessExceptions.ErrorCode) !== -1) {
            isError = true;
            errorCode = url.split('=')[1];
        }

        if (isError && errorCode != null) {
            setTimeout(() => {
                throw new HttpError(errorCode, ErroNotificationType.Toaster);
            }, 1000);
        }
    }
}
