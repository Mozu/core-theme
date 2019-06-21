import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class TostrManagerService {

    showToastrError: (errorMessage: string) => void;

    constructor(
        private _logger: LoggerService,
        private _translate: TranslateService
        ) {}

    showError(toastrCode) {
        this.showToastrError(this.getMessage(toastrCode));
    }

    getMessage(toastrCode) {
        let message = '';

        this._translate.get('MESSAGES.Toastr.' + toastrCode)
                .subscribe((successResponse) => {
                    this._logger.info('ToastrMessageHelperService : getFormattedToast : Success');
                    message = successResponse;
                }, (errorResponse) => {
                    this._logger.info('ToastrMessageHelperService : getFormattedToastrMessage : Error');
                });

        return message;
    }
}
