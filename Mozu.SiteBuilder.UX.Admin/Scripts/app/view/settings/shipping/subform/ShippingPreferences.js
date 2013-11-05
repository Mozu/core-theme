/**
 * @class Taco.view.settings.shipping.subform.ShippingPreferences
 *
 */

Ext.define('Taco.view.settings.shipping.subform.ShippingPreferences', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'Shipping Preferences',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",
    initComponent: function () {
        var me = this;
        
        me.additinalHandling = Ext.create('Taco.core.ux.form.UnitField' /*'Taco.core.ux.form.CurrencyField'*/, {
            name: 'orderHandlingFee',
            fieldLabel: "Additional Handling Fee",
            labelAlign: 'top',
            width: 200,
            unitString: '$',
            emptyText: '0',
            value:this.record.get('orderHandlingFee'),
            unitAtEnd: false
        });
        this.items = [
            me.additinalHandling
        ];
        

        this.callParent(arguments);
    }
});