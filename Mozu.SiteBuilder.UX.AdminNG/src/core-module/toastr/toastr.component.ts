import {
    ViewChild,
    Component,
    ViewContainerRef,
} from '@angular/core';

import { TostrManagerService } from './index';
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
import { NgZone } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'tostr',
    template: '<div toastContainer></div>',
})
export class ToastrComponent {

    @ViewChild(ToastContainerDirective) toastContainer: ToastContainerDirective;

    constructor(
        private _globalToastrService: TostrManagerService,
        private _toastrService: ToastrService,
        private _vRef: ViewContainerRef,
        private ngZone: NgZone
    ) {
        this._toastrService.overlayContainer = this.toastContainer;
        _globalToastrService.showToastrError = this.showToastrError.bind(this);
    }

    showToastrError(errorMessage: string) {
        this.ngZone.run(() => {
            this._toastrService.error(errorMessage);
        });
        //this._changeDetectorRef.detectChanges();
    }

}