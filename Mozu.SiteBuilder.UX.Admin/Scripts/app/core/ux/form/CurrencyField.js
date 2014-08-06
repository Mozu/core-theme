/**
 * @class Taco.core.ux.form.CurrencyField
 * Numeric input field for currencies.
 */
Ext.define('Taco.core.ux.form.CurrencyField', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.currencyfield',
    cls: Taco.baseCSSPrefix + 'currencyfield',
    hideTrigger:true,
    unitAtEnd: false,
    unitString: ' ',
    significantDecimalDigits: 2,
    // force the field to have the same number of decimal places as are defined in decimalPrecision; defualts to two
    forcePrecision: true,
    currencyCode: null,
    
    initComponent: function () {

        var me = this, currency;

        if (me.currencyCode) {
            currency = Taco.app.context.currencies[me.currencyCode.toLowerCase()];
            me.unitAtEnd = false;
            me.unitString = currency.symbol;
            me.significantDecimalDigits = currency.significantDecimalDigits;
        }
        me.sepperatorRegexp = new RegExp(Ext.util.Format.thousandSeparator, 'gi');
        me.callParent(arguments);
    },




 

    rawToValue: function (rawValue) {
        var value = this.fixPrecision(this.parseValue(rawValue));
        if (value === null) {
            value = rawValue || null;
        }
        return value;
    },

    valueToRaw: function (value) {
        var me = this,
            decimalSeparator = me.decimalSeparator;
        value = me.parseValue(value);
        value = me.fixPrecision(value);
        value = Ext.isNumber(value) ? value : parseFloat(String(value).replace(this.decimalSeparator, '.').replace(this.unitString, '').replace(me.sepperatorRegexp, ''));
        value = isNaN(value) ? '' :  Ext.util.Format.currency(value, this.unitString, this.significantDecimalDigits, this.unitAtEnd);
        

        return value;
    },



    parseValue: function (value) {
        value = parseFloat(String(value).replace(this.decimalSeparator, '.').replace(this.unitString, '').replace(this.sepperatorRegexp, ''));
        return isNaN(value) ? null : value;
    },
    


    getErrors: function (value) {
        var me = this,
            errors =  me.superclass.superclass.getErrors.call(this,arguments),
            format = Ext.String.format,
            num;

        value = Ext.isDefined(value) ? value : this.processRawValue(this.getRawValue());


        value = String(value).replace(this.decimalSeparator, '.').replace(this.unitString, '').replace(me.sepperatorRegexp, '');

        if (isNaN(value)) {
            errors.push(format(me.nanText, value));
        }

        num = me.parseValue(value);

        if (me.minValue === 0 && num < 0) {
            errors.push(this.negativeText);
        }
        else if (num < me.minValue) {
            errors.push(format(me.minText, me.minValue));
        }

        if (num > me.maxValue) {
            errors.push(format(me.maxText, me.maxValue));
        }


        return errors;
    },



});