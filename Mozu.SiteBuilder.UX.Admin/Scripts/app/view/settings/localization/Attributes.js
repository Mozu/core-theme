/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.Attributes', {
    requires:['Taco.store.ShippingZones'],
    extend: 'Taco.view.settings.shipping.Rules',
    alias :'widget.localizationattributesgrid',

    createButtonText: "Create New Zone",
    title: "Attributes",
  

    createRoute: 'localization/zonescreate',
    editorRoute: 'localization/zonesedit',
   
    store: { type: 'Taco.store.ShippingZones' }
});


