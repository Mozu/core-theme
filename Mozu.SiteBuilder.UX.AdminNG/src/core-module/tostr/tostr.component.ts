import {
    ViewChild,
    Component,
    ViewContainerRef,
} from '@angular/core';

import { MessageService } from 'primeng/api';

import {
    ToastrService,
    ToastContainerDirective
} from 'ngx-toastr';
import { Constants } from '../infrastructure/constants';
import {
    AutoCloseToastrOptions,
    CustomToastrOptions,
    SystemMessageToastrOptions
} from '../infrastructure/configuration-settings';

import { TostrService} from './index';

import { NgZone } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'tostr',
    template: `<p-toast [style]="{marginTop: '10px'}" position="top-center"></p-toast>`,
})
export class ToastrComponent {

    constructor(
        private _globalToastrService: TostrService,
        private ngZone: NgZone,
        private _messageService : MessageService
    ) {
        _globalToastrService.showErrorMessage = this.showToastrError.bind(this);
        _globalToastrService.showInfoMessage = this.showInfoMessage.bind(this);
        _globalToastrService.showSuccessMessage = this.showSuccessMessage.bind(this) ;
        _globalToastrService.showWarnMessage = this.showWarningMessage.bind(this) ;
    }

    showToastrError(errorMessage: string) {
        this.ngZone.run(() => {
            this._messageService.add({severity: 'error', summary: 'Error Message', detail: errorMessage});
        });
    }

    showInfoMessage(infoMessage: string) {
        this.ngZone.run(() => {
            this._messageService.add({severity: 'info', summary: 'Info Message', detail: infoMessage});
        });
    }

    showWarningMessage(warningMessage: string) {
        this.ngZone.run(() => {
            this._messageService.add({severity: 'warn', summary: 'Warn Message', detail: warningMessage});
        });
    }

    showSuccessMessage(successMessage: string) {
        this.ngZone.run(() => {
            this._messageService.add({severity: 'success', summary: 'Success Message', detail: successMessage });
        });
    }
}