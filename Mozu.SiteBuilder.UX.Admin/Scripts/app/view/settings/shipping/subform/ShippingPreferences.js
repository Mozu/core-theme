/**
 * @class Taco.view.settings.shipping.subform.ShippingPreferences
 *
 */

Ext.define('Taco.view.settings.shipping.subform.ShippingPreferences', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [],
    title: 'Shipping Preferences',
    initComponent: function () {
        var me = this;

        //this.dummyContent = Ext.create('Ext.panel.Panel', {
        //    items: [
        //       { html: '<h2>Not yet implemented</h2>' }
        //    ]
        //});
        me.additinalHandling = Ext.create('Taco.core.ux.form.UnitField' /*'Taco.core.ux.form.CurrencyField'*/, {
            name: 'orderHandlingFee',
            fieldLabel: "Additional Handling Fee",
            labelAlign: 'top',
            width: 600,
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