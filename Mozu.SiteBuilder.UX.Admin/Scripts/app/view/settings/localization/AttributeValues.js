/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.AttributeValues', {
    requires:['Taco.store.LocalizedAttributeValues'],
    extend: 'Taco.view.settings.localization.LocalizationRules',
    alias :'widget.localizedattrvaluesgrid',

    createButtonText: "Create New Zone",
    title: "Attribute Values",
  

    createRoute: 'localization/zonescreate',
    editorRoute: 'localization/zonesedit',
   
    store: { type: 'Taco.store.LocalizedAttributeValues' }
});


