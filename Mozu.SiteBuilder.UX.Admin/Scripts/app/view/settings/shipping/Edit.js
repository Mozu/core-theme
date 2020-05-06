/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.settings.shipping.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.settings.shipping.Form'
    ],
    cls: 'shipping-links',
    enableSearchBarInHeader: false,
    formCls: 'Taco.view.settings.shipping.Form',
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },
    requiredStores: ['Taco.store.Countries'],

    breadCrumbConfig: [
        {
            title: 'Methods',
            tabIndex: 0,
            route: 'shipping'
        },
        {
            title: 'Carriers',
            tabIndex: 1,
            route: 'shipping/carriers',
            isActive: true
        },
        {
            title: 'Zones',
            tabIndex: 2,
            route: 'shipping/zones',
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

});