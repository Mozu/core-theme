/*
 * Adds optional support to force a numberfield to maintain decimal precision. This will keep extra zero's. This is typically used for display of currency;
 *
*/


Ext.define('Taco.overrides.form.field.Radio', {
    override: 'Ext.form.field.Radio',
    onChange: function (newValue, oldValue) {
        this.callParent(arguments);
        this.fireEvent("afterchange", this, newValue, oldValue);
    }
});
