/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.ProductExtras', {
    requires: ['Taco.store.LocalizedProductExtras'],
    extend: 'Taco.view.settings.localization.LocalizationRules',
    alias :'widget.localizedextrasgrid',

    createButtonText: "Create New Zone",
    title: "Product Extras",
  

    createRoute: 'localization/zonescreate',
    editorRoute: 'localization/zonesedit',
   
    store: { type: 'Taco.store.LocalizedProductExtras' }
});


