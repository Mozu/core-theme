/*
 * Adds optional support to force a numberfield to maintain decimal precision. This will keep extra zero's. This is typically used for display of currency;
 *
*/


Ext.define('Taco.overrides.form.field.Number', {
    override: 'Ext.form.field.Number',

    forcePrecision: false,

    valueToRaw: function (value) {
        
        var me = this, decimalSeparator = me.decimalSeparator;
        value = me.parseValue(value);
        value = me.fixPrecision(value);
        value = Ext.isNumber(value) ? value : parseFloat(String(value).replace(decimalSeparator, '.'));
        if (isNaN(value)) {
            value = '';
        }
        else {
            value = me.forcePrecision ? value.toFixed(me.decimalPrecision) : parseFloat(value);
            value = String(value).replace('.', decimalSeparator);
        }
        return value;
    }
});
