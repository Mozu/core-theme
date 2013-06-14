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

        this.dummyContent = Ext.create('Ext.panel.Panel', {
            items: [
               { html: '<h2>Not yet implemented</h2>' }
            ]
        });

        this.items = [this.dummyContent];

        this.callParent(arguments);
    }
});