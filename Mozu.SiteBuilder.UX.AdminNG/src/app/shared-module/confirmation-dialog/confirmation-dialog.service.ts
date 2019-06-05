import { Injectable } from '@angular/core';
import { Observable, 
    Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
    LoggerService,
} from '@core';
import { ConfirmationDialogNotificationType } from '@shared/infrastructure';

@Injectable()
export class ConfirmationDialogService {

    _confirmationDialogTitle: string;
    _confirmationDialogMessage: string;
    _primaryButtton: string;
    _secondaryButton: string;
    _isShowSecondaryButton: boolean;
    private _listners = new Subject<any>();
    
    showConfirmationDialog: (confirmationDialogTitle: string, confirmationDialogMessage: string, primaryButtonText: string, isShowSecondaryButton: boolean, secondaryButtonText: string) => void;

    constructor(private _translate: TranslateService,
        private _loggerService: LoggerService) { }

    public openConfirmationDialog(dialog: any, notificationType: any): void {
        this._loggerService.info("ConfirmationDialogService : openConfirmationDialog ");

        if (notificationType == ConfirmationDialogNotificationType.Dialog) {
            this._translate.get('SHARED.CONFIRMATION.DIALOG.' + dialog)
                .subscribe((successResponse) => {
                    this._confirmationDialogTitle = successResponse.title;
                    this._confirmationDialogMessage = successResponse.message;
                    this._primaryButtton = successResponse.primaryButton;
                    this._secondaryButton = successResponse.secondaryButton;
                    this._isShowSecondaryButton = JSON.parse(successResponse.isShowSecondaryButton);
                }, (errorResponse) => {

                });
        }
        this.showConfirmationDialog(this._confirmationDialogTitle, this._confirmationDialogMessage, this._primaryButtton, this._isShowSecondaryButton, this._secondaryButton);

    }

    listen(): Observable<any> {
        return this._listners.asObservable();
     }

    confirm() {
        this._listners.next("ConfirmationEvent");
     }

}