import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TostrMessageType } from '../extensions/http-error.model';

@Injectable()
export class TostrService {

    showSuccessMessage: (toastrCode: string) => void;
    showInfoMessage: (toastrCode: string) => void;
    showWarnMessage: (toastrCode: string) => void;
    showErrorMessage: (toastrCode: string) => void;

    constructor(
        private _translateService: TranslateService
    ) { }

    showSuccess(toastrCode: any) {
        this.showSuccessMessage(this.getTostrMessage(toastrCode, TostrMessageType.Success));
    }

    showInfo(toastrCode: any ) {
        this.showInfoMessage(this.getTostrMessage(toastrCode, TostrMessageType.Information));
    }

    showWarn(toastrCode: any) {
        this.showWarnMessage(this.getTostrMessage(toastrCode, TostrMessageType.Warning));
    }

    showError(toastrCode: any) {
        this.showErrorMessage(this.getTostrMessage(toastrCode, TostrMessageType.Error));
    }

    private getTostrMessage(toastrCode: string , toastrMessageType: TostrMessageType) {
        let message = '';
        this._translateService.get('MESSAGES.Toastr.' + toastrMessageType + '.' + toastrCode)
            .subscribe((successResponse) => {
                message = successResponse;
            }, (errorResponse) => {
                message = toastrCode;
            });

        return message;
    }
}
