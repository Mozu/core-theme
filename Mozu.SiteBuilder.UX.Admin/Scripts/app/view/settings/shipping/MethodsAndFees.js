/**
 * 
 */
Ext.define('Taco.view.settings.shipping.MethodsAndFees', {
    extend: 'Taco.core.ux.form.FullEditor',
    alias: 'widget.shippingConfiguration',
    requires: [
        'Taco.view.settings.shipping.widget.ShippingInclusionRulesForm',
        'Taco.view.settings.shipping.widget.ProductHandllingFeeRulesForm',
        'Taco.view.settings.shipping.widget.OrderHandlingFeeRulesForm'

    ],
    formCls: 'Taco.core.ux.form.Form',
    //editorName: 'Taco.view.discount.Edit',
    title: 'Shipping Methods and Fees',


    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    formCfg: {
        layout: {
            type: 'vbox',
            align: 'stretch',
        },
        defaults: {
            margin: '10px 10px 10px 10px'
        },
        title: 'Shipping Methods and Fees',
        items: [
            {
                xtype: 'shippinginclusionrulesform'
            },
            {
                xtype: 'producthandllingfeerulesform'
            },
            {
                xtype: 'orderhandlingfeerulesform'
            }
        ]
    }
});