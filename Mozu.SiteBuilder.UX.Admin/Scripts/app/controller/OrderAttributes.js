/**
 * @class Taco.controller.CustomerAttributes
 * The Customers controller.
 */
Ext.define('Taco.controller.OrderAttributes', {
    extend: 'Taco.core.Controller',
    alias: 'Taco.controller.Orderattributes',
    requires: ['Taco.view.orderAttribute.Index', 'Taco.view.orderAttribute.Edit'],
    modelName: 'OrderAttribute',
    models: ['Taco.model.OrderAttribute'],
    stores: ['Taco.store.OrderAttributes'],
    views: ['orderAttribute.Index'],
    indexView: 'Taco.view.orderAttribute.Index',
    editorView: 'Taco.view.orderAttribute.Edit'
});