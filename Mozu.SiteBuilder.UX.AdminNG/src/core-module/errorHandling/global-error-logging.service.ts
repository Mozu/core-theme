import {
    Injectable,
    EventEmitter
} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';
import { LoggerService } from '../services/logger.service';

import {
    ErroNotificationType,
    HttpError,
    ErrorCode,
    ToastrMessageType
} from '../extensions/http-error.model';

import { ToastrService } from '../services/index';

@Injectable()
export class GlobalErrorLoggingService {

    _errorDialogTitle: string;
    _errorDialogMessage: string;
    _primaryButtton: string;
    _secondaryButton: string;
    _isLogoutonPrimaryButton: boolean;
    _isShowSecondaryButton: boolean;
    _notificationType: ErroNotificationType;
    isHandledError = true;

    showErrorDialog: (errorDialogTitle: string, customErrorMessage: string, primaryButtonText: string
        , isLogoutOnPrimaryButtonEvent: boolean, isShowSecondaryButton: boolean, secondaryButtonText: string) => void;

    constructor(private _logger: LoggerService,
        private _translate: TranslateService,
        private _toastrService: ToastrService
    ) {
        this._logger.info('GlobalErrorLoggingService : constructor ');
    }

    public logError(error: any, isLogToConsole: boolean, isSendToServer: boolean): void {
        this._logger.info('GlobalErrorLoggingService : logError ');

        this._notificationType = ErroNotificationType.Dialog;

        if (error instanceof HttpError) { /// This is handled Exception

            this._notificationType = (<HttpError>error).erroNotificationType;

            if (this._notificationType === ErroNotificationType.Dialog) {
                this._translate.get('MESSAGES.Dialog.' + error.code)
                    .subscribe((successResponse) => {
                        this._errorDialogTitle = successResponse.title;
                        this._errorDialogMessage = successResponse.message;
                        this._primaryButtton = successResponse.primaryButton;
                        this._secondaryButton = successResponse.secondaryButton;
                        this._isShowSecondaryButton = JSON.parse(successResponse.isShowSecondaryButton);
                        this._isLogoutonPrimaryButton = JSON.parse(successResponse.isLogoutOnPrimaryButton);
                    }, (errorResponse) => {

                    });
            } else {
                this._notificationType = ErroNotificationType.Toaster;
            }
        } else { /// This is Un-Handled Exception

            this._notificationType = ErroNotificationType.Toaster;
            this.isHandledError = false;
        }

        if (isLogToConsole) {
            if (this._notificationType === ErroNotificationType.Dialog) {
                this._logger.error(this._errorDialogMessage);
            }

            this._logger.error(error);

            if (error.stack !== undefined) {
                this._logger.error(error.stack);
            }
        }

        if (this._notificationType === ErroNotificationType.Dialog) {
            this.showErrorDialog(this._errorDialogTitle, this._errorDialogMessage, this._primaryButtton
                , this._isLogoutonPrimaryButton, this._isShowSecondaryButton, this._secondaryButton);
        } else if (this._notificationType === ErroNotificationType.Toaster) {
            if (this.isHandledError) {
                this._toastrService.showError(error.code);
            } else {
                this._toastrService.showError(ErrorCode.Fatal);
            }
        }
    }

}
