/**
 * Created Date - 13-Sep-2019
 * Custom directive to validate to and from date.
 * We can use this directive when to and from dates are used.
 */
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { Directive, Input } from '@angular/core';
import { DateService } from '@shared/datepicker/datepicker.service';
import { TranslateService } from '@ngx-translate/core';

@Directive({
    selector: '[dateCompareValidator]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: DateCompareDirective,
        multi: true
    }]
})

export class DateCompareDirective implements Validator {
    @Input() dateCompareValidator: string;
    @Input() isToDate: boolean;
    toDateValidationMessage: string;
    fromDateValidationMessage: string;

    constructor(private dateService: DateService,
        private _translate: TranslateService) {
            this._translate.get('SHARED.FILTER.FormsErrorMessages')
            .subscribe((successResponse) => {
                this.toDateValidationMessage = successResponse.toDateValid;
                this.fromDateValidationMessage = successResponse.fromDateValid;
            });
    }
    validate(control: AbstractControl): { [key: string]: any; } {
        if (this.isToDate) {
            const toDate = this.dateCompareValidator ? new Date(this.dateCompareValidator) : null,
                fromDate = control.value;
            this.dateService.setToDateField(control);
            if ((toDate !== null && fromDate !== null) && toDate > fromDate) {
                this.dateService.getFromDateField().setErrors(null);
                return { 'isValidDate': true, msg: this.toDateValidationMessage };
            } else if (toDate !== null && fromDate !== null) {
                this.dateService.getFromDateField().setErrors(null);
            }
            return null;
        } else {
            const fromDate = control.value,
                toDate = this.dateCompareValidator ? new Date(this.dateCompareValidator) : null;
            this.dateService.setFromDateField(control);
            if ((toDate !== null && fromDate !== null) && toDate < fromDate) {
                this.dateService.getToDateField().setErrors(null);
                return { 'isValidDate': true, msg: this.fromDateValidationMessage };
            } else if (toDate !== null && fromDate !== null) {
                this.dateService.getToDateField().setErrors(null);
            }
            return null;
        }
    }
}
