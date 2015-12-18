/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.shipping.Zones', {
    requires:['Taco.store.ShippingZones'],
    extend: 'Taco.view.settings.shipping.Rules',
    alias :'widget.shippingzoneegrid',

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
        }
    ],  

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    }
});


