/**
 * @class Taco.core.ux.form.CurrencyField
 * Numeric input field for currencies.
 */
Ext.define('Taco.core.ux.form.CurrencyField', {
    extend: 'Taco.core.ux.form.UnitField',
    alias: 'widget.currencyfield',
    cls: Taco.baseCSSPrefix + 'currencyfield',

    unitAtEnd: false,
    unitString: '$',
    // force the field to have the same number of decimal places as are defined in decimalPrecision; defualts to two
    forcePrecision:true
});