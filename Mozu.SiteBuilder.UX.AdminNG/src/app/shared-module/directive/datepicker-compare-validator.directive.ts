/**
 * Created Date - 13-Sep-2019
 * Custom directive to validate to and from date.
 * We can use this directive when to and from dates are used.
 */
import { Validator, AbstractControl, NG_VALIDATORS } from "@angular/forms";
import { Directive, Input } from "@angular/core";

@Directive({
    selector: "[dateCompareValidator]",
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: DateCompareDirective,
        multi: true
    }]
})

export class DateCompareDirective implements Validator {
    @Input() dateCompareValidator: string;
    @Input() isThisToDate: boolean;
    dateField: any;
    validate(c: AbstractControl): { [key: string]: any; } {
        if (this.isThisToDate) {
            const toDate = this.dateCompareValidator ? new Date(this.dateCompareValidator) : null,
                fromDate = c.value;
            if ((toDate !== null && fromDate !== null) && toDate > fromDate) {
                c.parent.get("expirationFrom").setErrors(null);
                return { "isValidDate": true, msg: "The to-date can not be before from-date" };
            } else if (toDate !== null && fromDate !== null) {
                c.parent.get("expirationFrom").setErrors(null);
            }
            return null;
        } else {
            const fromDate = c.value,
                toDate = this.dateCompareValidator ? new Date(this.dateCompareValidator) : null;
            if ((toDate !== null && fromDate !== null) && toDate < fromDate) {
                c.parent.get("expirationTo").setErrors(null);
                return { "isValidDate": true, msg: "The from-date can not be after to-date" };
            } else if (toDate !== null && fromDate !== null) {
                c.parent.get("expirationTo").setErrors(null);
            }
            return null;
        }
    }
}