/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.shipping.Zones', {
    requires:['Taco.store.ShippingZones'],
    extend: 'Taco.view.settings.shipping.Rules',
    alias :'widget.shippingzoneegrid',

    createButtonText: "Create New Zone",
    title: "Shipping Zones",
  

    createRoute: 'shipping/zonescreate',
    editorRoute: 'shipping/zonesedit',
   
    store: { type: 'Taco.store.ShippingZones' },

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    }
});


