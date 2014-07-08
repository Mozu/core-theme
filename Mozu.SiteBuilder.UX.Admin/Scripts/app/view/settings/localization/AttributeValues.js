/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.AttributeValues', {
    requires:['Taco.store.ShippingZones'],
    extend: 'Taco.view.settings.shipping.Rules',
    alias :'widget.localizationattrvaluesgrid',

    createButtonText: "Create New Zone",
    title: "Attribute Values",
  

    createRoute: 'localization/zonescreate',
    editorRoute: 'localization/zonesedit',
   
    store: { type: 'Taco.store.ShippingZones' }
});


