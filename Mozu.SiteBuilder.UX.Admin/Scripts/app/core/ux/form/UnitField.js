/**
 * @class Taco.core.ux.form.UnitField
 * Base class for numeric input fields with a unit.
 */
Ext.define('Taco.core.ux.form.UnitField', {
    extend: 'Ext.form.field.Number',
    mixins: ['Taco.core.util.TextSelection'],
    alias: 'widget.unitfield',
    cls: Taco.baseCSSPrefix + 'unitfield',

    minValue: 0,
    decimalPrecision: 2,
    hideTrigger: true,
    keyNavEnabled: false,
    mouseWheelEnabled: false,
    enableKeyEvents: true,
    selectOnFocus:true,

    unitAtEnd: true,
    unitString: '_',
    // force the field to have two decimal places
    forcePrecision:false,
  

    initEvents: function () {
        var me = this,
            el = me.inputEl;

        me.callParent();

        me.mon(el, 'keypress', me.filterKeysAfterDecimalSeparator, me);
        me.mon(el, 'keypress', me.filterKeysBeforeOrAfterUnitString, me);
    },

    getErrors: function(value) {
        var me = this,
            errors = me.callParent(arguments),
            format = Ext.String.format,
            num;
        // unitfield will always fail numberfield's NaN validation
        errors = Ext.Array.remove(errors, format(me.nanText, value));
        // need to remove the default error for min value when its 0 since we reapply it below
        errors = Ext.Array.remove(errors, format(me.minText, me.minValue));

        value = Ext.isDefined(value) ? value : this.processRawValue(this.getRawValue());
        value = me.stripUnitString(value);

        if (value.length < 1) { // if it's blank and textfield didn't flag it then it's valid
             return errors;
        }

        value = String(value).replace(me.decimalSeparator, '.');

        if (isNaN(value)) {
            errors.push(format(me.nanText, value));
        }

        num = me.parseValue(value);

        if (me.minValue === 0 && num < 0) {
            Ext.Array.include(errors, this.negativeText);
        } 
        else if (num < me.minValue) {
            errors.push(format(me.minText, me.minValue));
        }

        if (num > me.maxValue) {
            errors.push(format(me.maxText, me.maxValue));
        }

        return errors;
    },

    /**
    * Implements an input mask so that no more than two digits after the decimal place can be entered.
    * Also prevents multiple decimal places from being entered.
    */
    filterKeysAfterDecimalSeparator: function (e, element) {
        var me = this,
            key = e.getKey(),
            charCode = String.fromCharCode(e.getCharCode()),
            // for US numbers, the regex looks like this: '\.\d{2}$'
            decimalRegex = new RegExp('\\' + this.decimalSeparator + '\\d{' + this.decimalPrecision + '}$');

        // don't stop the event in case of deletes, backspaces, or control characters
        if (me.isInputFilterKeyBackspaceOrControlCharacter(e))
            return;

        // skip further processing if a decimal place doesn't exist.
        if (this.getRawValue().indexOf(this.decimalSeparator) <= 0)
            return;

        // forbid decimal mark from being entered twice.
        if (charCode === this.decimalSeparator) {
            // but not if the decimal mark is highlighted.
            if (this.isStringHighlighted(this.decimalSeparator))
                return;
            else
                e.stopEvent();
        }

        // do not forbid numbers from being entered if some text is highlighted.
        if (this.isAnyTextHighlighted(element)) {
            return;
        }

        // on supported browsers, only enforce this rule if the caret is AFTER the decimal point.
        if (!this.isCaretAfter(element, this.decimalSeparator))
            return;

        // forbid any keys (except delete/control keys) typed after a period and two numbers (or an international-number-friendly regex).
        if (this.getRawValue().match(decimalRegex)) {
            e.stopEvent();
        }
    },

    /**
     * Implements an input mask so that nothing can be typed on the wrong side of the unit string.
     *
     */
    filterKeysBeforeOrAfterUnitString: function(e, element) {
        var key        = e.getKey(),
            unitString = this.unitString,
            charCode   = String.fromCharCode(e.getCharCode());

        // don't stop the event in case of deletes, backspaces, or control characters
        if (this.isInputFilterKeyBackspaceOrControlCharacter(e))
            return;

        // don't stop the event if the full unit string isn't present
        if (element.value.indexOf(unitString) < 0)
            return;

        // don't stop the event if the full unit string is highlighted
        if (this.isStringHighlighted(unitString))
            return;

        // if the unit is a prefix and they're AFTER the unit, or if the unit is a suffix and they're BEFORE the unit, they're in a good place for editing. 
        var isCaretInGoodPlaceForEditing = this.unitAtEnd ? !this.isCaretAfter(element, unitString, false) : this.isCaretAfter(element, unitString, true);
        if (!isCaretInGoodPlaceForEditing) {
            e.stopEvent();
        }
    },

    /**
     * Tests whether the given 'keydown' event is a backspace/delete or other control character.
     * @param {EventObject} e The keydown event.
     * @return Boolean
     */
    isInputFilterKeyBackspaceOrControlCharacter: function(e) {
        var key = e.getKey(),
            charCode = String.fromCharCode(e.getCharCode());

        if (e.ctrlKey && !e.altKey) {
            return true;
        }

        // don't stop the event in case of deletes, backspaces, or control characters
        if ((Ext.isGecko || Ext.isOpera) && (e.isNavKeyPress() || key === e.BACKSPACE || (key === e.DELETE && e.button === -1))) {
            return true;
        }

        // don't stop the event in case of deletes, backspaces, and other special characters
        if ((!Ext.isGecko && !Ext.isOpera) && e.isSpecialKey() && !charCode) {
            return true;
        }

        return false;
    },

    /**
     * Overridden from Ext.form.field.Number
     * Converts the contents of the text field into a value (number).
     */
    rawToValue: function(rawValue) {
        var value = this.fixPrecision(this.parseValue(this.stripUnitString(rawValue)));
                                      
        if (value === null) {
          value = rawValue || null;
        }

        return value;
    },

    /**
     * Overridden from Ext.form.field.Number
     * Converts a value for representation suitable displaying in the field.
     * @param {Mixed} value The value.
     * @param {Boolean} forcePrecision Whether the output should be padded with .00 (useful for currency).
     * @return {String}
     */
    valueToRaw: function(value) {
        var decimalSeparator = this.decimalSeparator,
            ret;

        if (!value)
            return value;

        value = this.stripUnitString(value.toString());
        value = this.parseValue(value);
        value = this.fixPrecision(value);
        value = Ext.isNumber(value) ? value : parseFloat(String(value).replace(decimalSeparator, '.'));

        
        //if (this.forcePrecision && String(value).indexOf(decimalSeparator) > 0)
        if (this.forcePrecision) {
            value = value.toFixed(this.decimalPrecision); // coerce decimal points.
        }
        

        value = isNaN(value) ? '' : String(value).replace('.', decimalSeparator);
        
        if (Ext.isEmpty(value)) {
            return value;
        } else {
            ret = this.unitAtEnd ? value + this.unitString : this.unitString + value;
            return ret;
        }
    },

    getSubmitValue: function () {
        var value = this.callParent();

        value = this.stripUnitString(value);
        if (!this.submitLocaleSeparator) {
            value = value.replace(this.decimalSeparator, '.');
        }

        return value;
    },

    stripUnitString: function (value) {
        if (!value)
            return value;
        var regex = new RegExp('\\' + this.unitString);

        return value.replace(regex, '');
    },

    /**
     * Overridden from Ext.form.field.Number
     * Base implementation attempts to parseValue() the raw value (which contains a unit).
     * Saves the value when blurring out of the field.
     */
    beforeBlur: function () {
        var me = this,
            v = me.rawToValue(me.getRawValue());

        if (!Ext.isEmpty(v)) {
            me.setValue(v);
        }
    }
});