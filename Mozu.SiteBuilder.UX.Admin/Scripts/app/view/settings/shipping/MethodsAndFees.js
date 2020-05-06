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
    cls: 'shipping-links',
    formCls: 'Taco.core.ux.form.Form',
    //editorName: 'Taco.view.discount.Edit',

    enableSearchBarInHeader: false,


    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    //showbreadCrumbspacer:false,
    breadCrumbConfig: [
        {
            title: 'Methods',
            tabIndex: 0,
            isActive: true,
            route: 'shipping'
        },
        {
            title: 'Carriers',
            tabIndex: 1,
            route: 'shipping/carriers'
        },
        {
            title: 'Zones',
            tabIndex: 2,
            route: 'shipping/zones'
        },
        {
            title: 'Product Rules',
            tabIndex: 3,
            route: 'shipping/productRules'
        },
        {
            title: 'Carrier Accounts',
            tabIndex: 4,
            route: 'shipping/CarrierAccounts',
            //isActive: true
        }
    ],  

    formCfg: {
        layout: {
            type: 'vbox',
            align: 'stretch',
        },
        defaults: {
            margin: '10px 10px 10px 10px'
        },
        title: 'Shipping',
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