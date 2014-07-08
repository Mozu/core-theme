/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.shipping.ProductRules', {
    requires: [
        'Taco.store.ShippingZones',
        'Taco.store.ProductRules'
    ],
    extend: 'Taco.view.settings.shipping.Rules',
    alias: 'widget.productrulegrid',

    createButtonText: "Create New Product Rule",
    title: "Product Rules",


    createRoute: 'shipping/productrulescreate',
    editorRoute: 'shipping/productrulesedit',

    store: { type: 'Taco.store.ProductRules' }

});