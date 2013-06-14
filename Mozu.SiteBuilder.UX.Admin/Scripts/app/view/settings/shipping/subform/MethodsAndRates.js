/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.subform.MethodsAndRates', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [],
    title: 'Shipping Methods and Rates',
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