/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.subform.MethodsAndRates', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.view.settings.shipping.subform.Custom'],
    title: 'Shipping Methods and Rates',
    initComponent: function () {
        var me = this;


        this.custom = Ext.create('Taco.view.settings.shipping.subform.Custom', {
                record: this.record
            });

        
        //this.dummyContent = Ext.create('Ext.panel.Panel', {
        //    items: [
        //       { html: '<h2>Not yet implemented</h2>' }
        //    ]
        
        this.tabs = Ext.create('Ext.tab.Panel', {
            width: 800,
            height: 400,
            border: 1,
            style: {
                borderColor: 'black',
                borderStyle: 'solid'
            },
            items: [
                //{
                //    title: 'Custom Rates',
                //    items: [
                //        { html: '<h2>fart</h2>' },
                //         this.custom,
                //        { html: '<h2>fart</h2>' }
                //    ]
                //},
                this.custom,
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