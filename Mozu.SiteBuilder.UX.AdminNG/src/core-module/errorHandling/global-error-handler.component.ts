import {
    ErrorHandler,
    Injectable,
    Inject
} from '@angular/core';

import { LoggerService } from '../services/logger.service';

import {
    AuthService
} from '../extensions/index';

import {
    Constants,
    ConfigurationSettings,
    UtilityService,
    EnvironmentConfig
} from '../infrastructure/index';

import { SpinnerService } from '../spinner/spinner.service';

import { GlobalErrorLoggingService } from './global-error-logging.service';

export class LoggingErrorHandlerOptions {
    isRethrowError: boolean;
    isUnwrapError: boolean;
    isLogErrorToConsole: boolean;
    isSendErrorToServer: boolean;
    isShowErrorDialog: boolean;
}

@Injectable()
export class GlobalErrorHandlerComponent implements ErrorHandler {

    private options: LoggingErrorHandlerOptions;

    constructor(
        private _globalErrorLoggingService: GlobalErrorLoggingService,
        _options: LoggingErrorHandlerOptions,
        private _logger: LoggerService,
        private _spinner: SpinnerService,
        private _utilityService: UtilityService,
        private _authService: AuthService,
        private _config: EnvironmentConfig
    ) {
        this._logger.info('ErrorHandler : constructor');
        this.options = _options;
    }

    public handleError(error: any): void {

        const url: string = this._config.appUrl + '?' + Constants.queryString.SessionExpired;

        try {
            this._logger.info('ErrorHandler : handleError()');

            const sessionId = localStorage.getItem(Constants.localStorageKeys.sessionId);

            if (this._authService.isUserLoggedIn() &&  (sessionId == null || sessionId === undefined || sessionId === '') ) {
                this._utilityService.redirectToURL(url);
                return;
            }

            if (error && error.error && error.error.status === 0) {
                 return;
            }

            if (error && error.error && error.error.status === 405) {
                this._utilityService.redirectToURL(url);
                return;
            }

            this._spinner.stop();

            this._logger.error(error);

        } catch (loggingError) {
            this._logger.error('Error in global error handler service.');
            this._utilityService.redirectToURL(url);
            return;
        }

        if (this.options.isRethrowError) {
            throw (error);
        }
    }

    private findOriginalError(error: any): any {
        this._logger.info('ErrorHandler : findOriginalError()');

        while (error && error.originalError) {
            error = error.originalError;
        }

        return (error);
    }
}
