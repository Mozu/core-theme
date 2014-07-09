/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.ProductProperties', {
    requires: ['Taco.store.LocalizedProductProperties'],
    extend: 'Taco.view.settings.localization.LocalizationRules',
    alias :'widget.localizedpropertiesgrid',

    createButtonText: "Create New Zone",
    title: "Product Properties",
  

    createRoute: 'localization/zonescreate',
    editorRoute: 'localization/zonesedit',
   
    store: { type: 'Taco.store.LocalizedProductProperties' }
});


