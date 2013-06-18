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

        //this.dummyContent = Ext.create('Ext.panel.Panel', {
        //    items: [
        //       { html: '<h2>Not yet implemented</h2>' }
        //    ]
        //});
        this.tabs = Ext.create('Ext.tab.Panel', {
            width: 600,
            height: 400,
            border: 1,
            style: {
                borderColor: 'black',
                borderStyle: 'solid'
            },
            items: [
                {
                    title: 'Custom Rates',
                    items: [
                        { html: '<h2>Not yet implemented</h2>' }
                    ]
                },
                {
                    title: 'Fed Ex',
                    items: [
                        { html: '<h2>Not yet implemented</h2>' }
                    ]
                },
                {
                    title: 'UPS',
                    items: [
                        { html: '<h2>Not yet implemented</h2>' }
                    ]
                },
                {
                    title: 'USPS',
                    items: [
                        { html: '<h2>Not yet implemented</h2>' }
                    ]
                }
            ]
        });


        this.items = [this.tabs];

        this.callParent(arguments);
    }
});