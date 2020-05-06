/**
 * @class Taco.view.settings.shipping.ProductRules
*/
Ext.define('Taco.view.settings.shipping.ProductRules', {
    requires: [
        'Taco.store.ProductRules'
    ],
    extend: 'Taco.view.settings.shipping.Rules',
    alias: 'widget.productrulegrid',
    cls: 'shipping-links',

    createButtonText: "Create New Product Rule",
    title: "Shipping",

    createRoute: 'shipping/productrulescreate',
    editorRoute: 'shipping/productrulesedit',

    stateful: true,
    stateId: "statefulProductRulesGrid",

    store: { type: 'Taco.store.ProductRules' },

    breadCrumbConfig: [
        {
            title: 'Methods',
            tabIndex: 0,
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
            route: 'shipping/productRules',
            isActive: true
        },

        {
            title: 'Carrier accounts',
            tabIndex: 4,
            route: 'shipping/CarrierAccounts',
            //isActive: true
        }
    ]

});