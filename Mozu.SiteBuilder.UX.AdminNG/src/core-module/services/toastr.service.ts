import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

import { LoggerService } from './logger.service';

@Injectable()
export class ToastrService {

    constructor(
        private _logger: LoggerService,
        private _translate: TranslateService,
        private _messageService: MessageService
        ) {}

    showSuccess(toastrCode) {
        this._messageService.add({severity: 'success', summary: 'Success Message', detail: this.getMessage(toastrCode) });
    }

    showInfo(toastrCode) {
        this._messageService.add({severity: 'info', summary: 'Info Message', detail: this.getMessage(toastrCode)});
    }

    showWarn(toastrCode) {
        this._messageService.add({severity: 'warn', summary: 'Warn Message', detail: this.getMessage(toastrCode)});
    }

    showError(toastrCode) {
        this._messageService.add({severity: 'error', summary: 'Error Message', detail: this.getMessage(toastrCode)});
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
