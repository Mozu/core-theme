import {
    Directive,
    ElementRef,
    HostListener,
    Input
} from '@angular/core';

import {
    Constants
} from '../infrastructure/index';

import {
    ValidationService,
} from '@core';

@Directive({
    selector: '[restrict_input]',
})
export class RestrictInput {

    _regx: RegExp;
    _backSpaceKey: number = 8;
    _tabKey: number = 9;
    _deleteKey: number = 16;
    _leftArrowKey: number = 37;
    _rightArrowKey: number = 39;

    @Input('restrict_input') regExType: string;
    constructor(private el: ElementRef
        , private _validationService: ValidationService
    ) {
    }

    @HostListener('keypress', ['$event']) keypress(event: any) {
        this.setRegExp();
        const charCode = (event.which) ? event.which : event.keyCode;

        // allow alter key, tab, backspace, delete, left arrow & right arrow keys
        if (event.altKey === true || charCode === this._tabKey || charCode === this._backSpaceKey || charCode === this._deleteKey
            || charCode === this._leftArrowKey || charCode === this._rightArrowKey) {
            return true;
        }
        // detect ctrl allow it to proceed further to catch paste event (metaKey is for Mac)
        if (event.ctrlKey || event.metaKey) {
            return;
        }
        const inputValue = this.el.nativeElement.value + String.fromCharCode(charCode);
        return this.validateInput(inputValue, this._regx);
    }

    @HostListener('paste', ['$event']) paste(event: any) {
        this.setRegExp();
        const clipboardData = event.clipboardData;
        const inputValue = clipboardData.getData('text/plain');
        const isValidInput = this.validateInput(inputValue, this._regx);
        return isValidInput;
    }

    setRegExp = () => {
        // Change error messages as per specific RegEx type if needed (it would apply to all fields)
        switch (this.regExType) {
            case 'numeric':
                this._regx = Constants.regExType.numeric;
                break;
            case 'alphanumeric':
                this._regx = Constants.regExType.alphanumeric;
                break;
            case 'alphanumWithSpecial1':
                this._regx = Constants.regExType.alphanumWithSpecial1;
                break;
            case 'decimalPrecisionFour':
                this._regx = Constants.regExType.decimalPrecisionFour;
                break;
            case 'decimalPrecisionTwo':
                this._regx = Constants.regExType.decimalPrecisionTwo;
                break;
            case 'negativedecimalPrecisionFour':
                this._regx = Constants.regExType.negativedecimalPrecisionFour;
                break;
            default:
                this._regx = Constants.regExType.alphanumWithSpecial1;
        }
    }

    validateInput = (inputValue: string, regx: RegExp): boolean => {
        return this._validationService.regExpValidator(regx.source, inputValue);
    }
}
