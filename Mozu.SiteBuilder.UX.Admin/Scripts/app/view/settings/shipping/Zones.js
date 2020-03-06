/**
 * @class Taco.view.settings.shipping.Zones
*/
Ext.define('Taco.view.settings.shipping.Zones', {
    requires:['Taco.store.ShippingZones'],
    extend: 'Taco.view.settings.shipping.Rules',
    alias: 'widget.shippingzoneegrid',
    cls: 'shipping-links',

    createButtonText: "Create New Zone",
    title: "Shipping",
    enableSearchBarInHeader: false,

    createRoute: 'shipping/zonescreate',
    editorRoute: 'shipping/zonesedit',
   
    store: { type: 'Taco.store.ShippingZones' },

    stateful: true,
    stateId:"statefulShippingZonesGrid",

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
            route: 'shipping/zones',
            isActive: true
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

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    }
});
