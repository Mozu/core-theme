/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.ProductExtras', {
    requires:['Taco.store.ShippingZones'],
    extend: 'Taco.view.settings.shipping.Rules',
    alias :'widget.localizationextrasgrid',

    createButtonText: "Create New Zone",
    title: "Product Extras",
  

    createRoute: 'localization/zonescreate',
    editorRoute: 'localization/zonesedit',
   
    store: { type: 'Taco.store.ShippingZones' }
});


