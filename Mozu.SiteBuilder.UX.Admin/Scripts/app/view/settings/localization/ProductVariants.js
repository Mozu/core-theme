/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.ProductVariants', {
    requires: ['Taco.store.LocalizedProductVariants'],
    extend: 'Taco.view.settings.localization.LocalizationRules',
    alias :'widget.localizedvariantsgrid',

    createButtonText: "Create New Zone",
    title: "Product Variants",
  

    createRoute: 'localization/zonescreate',
    editorRoute: 'localization/zonesedit',
   
    store: { type: 'Taco.store.LocalizedProductVariants' }
});


