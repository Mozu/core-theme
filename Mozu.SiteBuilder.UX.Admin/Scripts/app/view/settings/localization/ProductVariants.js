/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.ProductVariants', {
    requires:['Taco.store.ShippingZones'],
    extend: 'Taco.view.settings.shipping.Rules',
    alias :'widget.localizationvariantsgrid',

    createButtonText: "Create New Zone",
    title: "Product Variants",
  

    createRoute: 'localization/zonescreate',
    editorRoute: 'localization/zonesedit',
   
    store: { type: 'Taco.store.ShippingZones' }
});


