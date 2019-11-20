import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { NgZone } from '@angular/core';
import { TostrService } from './tostr.service';
import { Constants, ToastrOptions } from '@core/infrastructure';

@Component({
    moduleId: module.id,
    selector: 'unified-admin-tostr',
    template: `<p-toast [style]="{marginTop: '10px'}" position="top-center"></p-toast>`,
})
export class ToastrComponent {
    constructor(
        private _globalToastrService: TostrService,
        private ngZone: NgZone,
        private _messageService: MessageService
    ) {
        _globalToastrService.showErrorMessage = this.showToastrError.bind(this);
        _globalToastrService.showInfoMessage = this.showInfoMessage.bind(this);
        _globalToastrService.showSuccessMessage = this.showSuccessMessage.bind(this) ;
        _globalToastrService.showWarnMessage = this.showWarningMessage.bind(this) ;
    }
    showToastrError(errorMessage: string) {
        this.ngZone.run(() => {
            this._messageService.add({severity: 'error', detail: errorMessage, life: ToastrOptions.toastLife, closable: true});
        });
    }
    showInfoMessage(infoMessage: string) {
        this.ngZone.run(() => {
            this._messageService.add({severity: 'info', summary: 'Info Message', detail: infoMessage, life: ToastrOptions.toastLife, closable: true});
        });
    }
    showWarningMessage(warningMessage: string) {
        this.ngZone.run(() => {
            this._messageService.add({severity: 'warn', summary: 'Warn Message', detail: warningMessage, life: ToastrOptions.toastLife, closable: true});
        });
    }
    showSuccessMessage(successMessage: string) {
        this.ngZone.run(() => {
        this._messageService.add({severity: 'success', summary: 'Success Message', detail: successMessage, life: ToastrOptions.toastLife, closable: true });
        });
    }
 }