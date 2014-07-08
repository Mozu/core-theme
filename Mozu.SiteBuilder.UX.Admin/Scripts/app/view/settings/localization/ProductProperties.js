/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.ProductProperties', {
    requires:['Taco.store.ShippingZones'],
    extend: 'Taco.view.settings.shipping.Rules',
    alias :'widget.localizationpropertiesgrid',

    createButtonText: "Create New Zone",
    title: "Product Properties",
  

    createRoute: 'localization/zonescreate',
    editorRoute: 'localization/zonesedit',
   
    store: { type: 'Taco.store.ShippingZones' }
});


