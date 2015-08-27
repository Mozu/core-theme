Ext.define('Taco.controller.SiteSelection', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.siteSelection.Index'],
    //modelName: 'CustomerAttribute',
    //models: ['Taco.model.CustomerAttribute'],
    //stores: ['Taco.store.CustomerAttributes'],
    views: ['siteSelection.Index'],
    indexView: 'Taco.view.siteSelection.Index'
    //editorView:'Taco.view.customerAttribute.Edit'
});
