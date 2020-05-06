import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import {
    LoggerService,
} from '@core';
import { NotificationService } from '@global';
import { ConfirmationDialogNotificationCode, NotificationLGActions } from '@shared/infrastructure';

@Injectable()
export class ConfirmationDialogService {

    confirmationDialogTitle: string;
    confirmationDialogMessage: string;
    primaryButttonText: string;
    secondaryButtonText: string;
    isShowSecondaryButton: boolean;
    notificationCode: any;
    itemName: string;
    confirmationDialogSecondaryMessage: string;

    showConfirmationDialog: (confirmationDialogTitle: string,
                             confirmationDialogMessage: string,
                             primaryButtonText: string,
                             isShowSecondaryButton: boolean,
                             secondaryButtonText: string,
                             itemName: string,
                             confirmationDialogSecondaryMessage: string) => void;

    constructor(private _translate: TranslateService,
        private _notificationService: NotificationService,
        private _loggerService: LoggerService) { }

    public openConfirmationDialog(dialogNotificationCode: any, dialogNotificationType: any, itemName?: any): void {
        this._loggerService.info('ConfirmationDialogService : openConfirmationDialog');

            this._translate.get('SHARED.CONFIRMATIONDIALOG.' + dialogNotificationType + '.' + dialogNotificationCode)
                .subscribe((successResponse) => {
                    this.itemName = itemName;
                    this.confirmationDialogTitle = successResponse.title;
                    this.confirmationDialogMessage = successResponse.message;
                    this.confirmationDialogSecondaryMessage = successResponse.secondaryMessage;
                    this.primaryButttonText = successResponse.primaryButtonText;
                    this.secondaryButtonText = successResponse.secondaryButtonText;
                    this.isShowSecondaryButton = JSON.parse(successResponse.isShowSecondaryButton);
                }, (errorResponse) => {

                });

        this.showConfirmationDialog(this.confirmationDialogTitle,
                                    this.confirmationDialogMessage,
                                    this.primaryButttonText,
                                    this.isShowSecondaryButton,
                                    this.secondaryButtonText, this.itemName,  this.confirmationDialogSecondaryMessage);
        this.notificationCode = dialogNotificationCode;
    }

    confirm() {
        const confirmationDialogNotificationCode: ConfirmationDialogNotificationCode = this.notificationCode;
        switch (confirmationDialogNotificationCode) {
            case ConfirmationDialogNotificationCode.DeleteQuoteItem:
                this._notificationService.notifyQuoteItemDeleted(this.notificationCode);
                break;
            case ConfirmationDialogNotificationCode.DeleteLocationGroup:
                this._notificationService.notifyLocationGroupDeleted(this.notificationCode);
                break;
            case ConfirmationDialogNotificationCode.LGCUnSavedChanges:
                this._notificationService.notifyLGCUnSavedChangesConfirmation({'code': this.notificationCode, 'buttonType': NotificationLGActions.ConfirmationDialogPrimaryBtnAct});
                break;
            default:
                break;
        }
    }

    cancel() {
        const confirmationDialogNotificationCode: ConfirmationDialogNotificationCode = this.notificationCode;
        switch (confirmationDialogNotificationCode) {
            case ConfirmationDialogNotificationCode.LGCUnSavedChanges:
                this._notificationService.notifyLGCUnSavedChangesConfirmation({'code': this.notificationCode, 'buttonType': NotificationLGActions.ConfirmationDialogSecondaryBtnAct});
                break;
            default:
                break;
        }
    }

}
