import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import {
    LoggerService,
} from '@core';
import { NotificationService } from '@global';
import { ConfirmationDialogNotificationCode } from '@shared/infrastructure';

@Injectable()
export class ConfirmationDialogService {

    confirmationDialogTitle: string;
    confirmationDialogMessage: string;
    primaryButttonText: string;
    secondaryButtonText: string;
    isShowSecondaryButton: boolean;
    notificationCode: any;

    showConfirmationDialog: (confirmationDialogTitle: string, confirmationDialogMessage: string, primaryButtonText: string, isShowSecondaryButton: boolean, secondaryButtonText: string) => void;

    constructor(private _translate: TranslateService,
        private _notificationService: NotificationService,
        private _loggerService: LoggerService) { }

    public openConfirmationDialog(dialogNotificationCode: any, dialogNotificationType: any): void {
        this._loggerService.info("ConfirmationDialogService : openConfirmationDialog ");

            this._translate.get('SHARED.CONFIRMATIONDIALOG.' + dialogNotificationType + '.' + dialogNotificationCode)
                .subscribe((successResponse) => {
                    this.confirmationDialogTitle = successResponse.title;
                    this.confirmationDialogMessage = successResponse.message;
                    this.primaryButttonText = successResponse.primaryButtonText;
                    this.secondaryButtonText = successResponse.secondaryButtonText;
                    this.isShowSecondaryButton = JSON.parse(successResponse.isShowSecondaryButton);
                }, (errorResponse) => {

                });

        this.showConfirmationDialog(this.confirmationDialogTitle, this.confirmationDialogMessage, this.primaryButttonText, this.isShowSecondaryButton, this.secondaryButtonText);
        this.notificationCode = dialogNotificationCode;
    }

    confirm() { 
        let confirmationDialogNotificationCode: ConfirmationDialogNotificationCode = this.notificationCode;
        switch(confirmationDialogNotificationCode){
            case ConfirmationDialogNotificationCode.DeleteQuoteItem:
                this._notificationService.notifyQuoteItemDeleteConfirmation(this.notificationCode);
                break;
            default:
                break;
        }
    }

}