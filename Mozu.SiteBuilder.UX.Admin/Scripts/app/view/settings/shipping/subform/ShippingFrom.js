/**
 * @class Taco.view.settings.shipping.subform.ShippingFrom
 *
 */

Ext.define('Taco.view.settings.shipping.subform.ShippingFrom', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [],
    title: 'Shipping From',
    initComponent: function () {
        var me = this;
        
        this.dummyContent = Ext.create('Ext.panel.Panel', {
            items: [
               { html: '<h2>Not yet implemented</h2>' + Ext.JSON.encode(this.record.get('siteShippingOriginAddress')) }
            ]
        });

        this.items = [this.dummyContent];

        this.callParent(arguments);
    }
});