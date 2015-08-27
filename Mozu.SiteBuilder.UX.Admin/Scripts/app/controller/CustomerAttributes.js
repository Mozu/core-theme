/**
 * @class Taco.controller.CustomerAttributes
 * The Customers controller.
 */
Ext.define('Taco.controller.CustomerAttributes', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.customerAttribute.Index', 'Taco.view.customerAttribute.Edit'],
    modelName: 'CustomerAttribute',
    models: ['Taco.model.CustomerAttribute'],
    stores: ['Taco.store.CustomerAttributes'],
    views: ['customerAttribute.Index'],
    indexView: 'Taco.view.customerAttribute.Index',
    editorView:'Taco.view.customerAttribute.Edit'
});
