/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.Attributes', {
    requires:['Taco.store.LocalizedAttributes'],
    extend: 'Taco.view.settings.localization.LocalizationRules',
    alias :'widget.localizedattributesgrid',

    createButtonText: "Create New Zone",
    title: "Attributes",
  

    createRoute: 'localization/zonescreate',
    editorRoute: 'localization/zonesedit',
   
    store: { type: 'Taco.store.LocalizedAttributes' }
});


