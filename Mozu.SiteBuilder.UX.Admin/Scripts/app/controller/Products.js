/**
 * @class Taco.controller.Products
 * @author Jason Cochran
 * The Products controller
 */

Ext.define('Taco.controller.Products', {
    extend: 'Taco.core.Controller',
    requires:['Taco.view.product.Edit'],
    editorView: 'Taco.view.product.Edit',
    listView: null,
    models: ['Taco.model.Product'],
    stores: ['Taco.store.Products'],
    views: ['product.Index'],
    modelName: 'Product'
});